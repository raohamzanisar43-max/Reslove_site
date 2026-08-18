/**
 * Vercel Serverless Function: GET /api/clio/callback
 */

export default async function handler(req, res) {
  try {
    const reqUrl = req.url || '';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'resolvoanjouan.com';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const parsedUrl = new URL(reqUrl, `${proto}://${host}`);

    const code = parsedUrl.searchParams.get('code');
    const error = parsedUrl.searchParams.get('error');
    const errorDescription = parsedUrl.searchParams.get('error_description');

    if (error) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(renderErrorPage(String(error), String(errorDescription || '')));
      return;
    }

    if (!code) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(
        renderInfoPage(
          'Clio OAuth Callback Ready',
          `This endpoint is configured to receive Clio authorization codes.<br><br>
          To connect your Clio account, click the button below:`,
          `${proto}://${host}/api/clio/auth`
        )
      );
      return;
    }

    const baseUrl = (process.env.CLIO_BASE_URL || 'https://app.clio.com/api/v4').replace(/\/+$/, '');
    const clientId = process.env.CLIO_CLIENT_ID;
    const clientSecret = process.env.CLIO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(
        renderErrorPage(
          'Server Configuration Missing',
          '<code>CLIO_CLIENT_ID</code> or <code>CLIO_CLIENT_SECRET</code> is not set in Vercel Environment Variables.'
        )
      );
      return;
    }

    const redirectUri = process.env.CLIO_REDIRECT_URI || `${proto}://${host}/api/clio/callback`;
    const oauthDomain = baseUrl.replace(/\/api\/v4\/?$/, '');
    const tokenUrl = `${oauthDomain}/oauth/token`;

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(
        renderErrorPage(
          tokenData.error || 'Token Exchange Failed',
          tokenData.error_description || 'Clio rejected the authorization code. Authorization codes expire quickly; please try authorizing again.'
        )
      );
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(
      renderSuccessPage({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || '',
        expiresIn: tokenData.expires_in || 0,
      })
    );
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(
      renderErrorPage('Server Error', `An error occurred: ${err.message}`)
    );
  }
}

function renderSuccessPage(tokens) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clio Authorization Successful</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; display: flex; justify-content: center; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 680px; width: 100%; padding: 32px; border: 1px solid #e2e8f0; }
    .badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 14px; display: inline-block; margin-bottom: 12px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0 0 8px 0; color: #0f172a; }
    p { color: #64748b; font-size: 15px; margin-top: 0; line-height: 1.5; }
    .box { margin-top: 24px; }
    .label { font-weight: 600; font-size: 13px; color: #475569; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
    .token-input { width: 100%; box-sizing: border-box; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 13px; word-break: break-all; margin-bottom: 16px; }
    .instructions { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin-top: 24px; font-size: 14px; color: #1e40af; }
    .instructions ol { margin: 8px 0 0 0; padding-left: 20px; }
    .instructions li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">✓ Connected</span>
    <h1>Clio Authorization Successful!</h1>
    <p>Your Clio authorization code was successfully exchanged. Copy these tokens into your Vercel Environment Variables.</p>

    <div class="box">
      <div class="label">CLIO_ACCESS_TOKEN</div>
      <textarea class="token-input" rows="3" readonly onclick="this.select()">${tokens.accessToken}</textarea>

      <div class="label">CLIO_REFRESH_TOKEN</div>
      <textarea class="token-input" rows="3" readonly onclick="this.select()">${tokens.refreshToken}</textarea>
    </div>

    <div class="instructions">
      <strong>Next Step in Vercel:</strong>
      <ol>
        <li>Go to your <strong>Vercel Dashboard → Project Settings → Environment Variables</strong>.</li>
        <li>Set <code>CLIO_ACCESS_TOKEN</code> and <code>CLIO_REFRESH_TOKEN</code> to the values above.</li>
        <li>Redeploy your project for the changes to take effect.</li>
      </ol>
    </div>
  </div>
</body>
</html>
  `;
}

function renderInfoPage(title, detail, authUrl) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; display: flex; justify-content: center; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 600px; width: 100%; padding: 32px; border: 1px solid #e2e8f0; }
    .badge { background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 14px; display: inline-block; margin-bottom: 12px; }
    h1 { font-size: 22px; color: #0f172a; margin: 0 0 12px 0; }
    p { color: #64748b; font-size: 15px; line-height: 1.6; }
    .btn { display: inline-block; background: #1d4ed8; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 16px; }
    .btn:hover { background: #1e40af; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Clio OAuth</span>
    <h1>${title}</h1>
    <p>${detail}</p>
    <a href="${authUrl}" class="btn">Connect with Clio Manage →</a>
  </div>
</body>
</html>
  `;
}

function renderErrorPage(title, detail) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clio Authorization Error</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; display: flex; justify-content: center; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 600px; width: 100%; padding: 32px; border: 1px solid #fee2e2; }
    .badge { background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 14px; display: inline-block; margin-bottom: 12px; }
    h1 { font-size: 22px; color: #991b1b; margin: 0 0 12px 0; }
    p { color: #64748b; font-size: 15px; line-height: 1.6; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .btn { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; font-weight: 600; text-decoration: none; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">OAuth Notice</span>
    <h1>${title}</h1>
    <p>${detail}</p>
    <a href="/api/clio/auth" class="btn">Try Connecting with Clio</a>
  </div>
</body>
</html>
  `;
}
