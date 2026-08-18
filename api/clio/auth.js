/**
 * Vercel Serverless Function: GET /api/clio/auth
 */

export default function handler(req, res) {
  try {
    const baseUrl = (process.env.CLIO_BASE_URL || 'https://app.clio.com/api/v4').replace(/\/+$/, '');
    const clientId = process.env.CLIO_CLIENT_ID;

    if (!clientId) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Configuration Required</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; display: flex; justify-content: center; padding: 40px 20px; }
            .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 580px; width: 100%; padding: 32px; border: 1px solid #fee2e2; }
            h2 { color: #dc2626; margin-top: 0; }
            p { color: #475569; line-height: 1.6; }
            code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
            ol { color: #334155; padding-left: 20px; line-height: 1.8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>⚠️ CLIO_CLIENT_ID is Missing</h2>
            <p>Vercel does not have your Clio credentials yet.</p>
            <strong>To fix this in 1 minute:</strong>
            <ol>
              <li>Go to <a href="https://vercel.com/dashboard" target="_blank">Vercel Dashboard</a> &rarr; Your Project &rarr; <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>.</li>
              <li>Add <code>CLIO_CLIENT_ID</code> (your Clio App Key).</li>
              <li>Add <code>CLIO_CLIENT_SECRET</code> (your Clio App Secret).</li>
              <li>Go to <strong>Deployments</strong> tab and click <strong>Redeploy</strong>.</li>
            </ol>
          </div>
        </body>
        </html>
      `);
      return;
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.resolvokunaisa.com';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const redirectUri = process.env.CLIO_REDIRECT_URI || `${proto}://${host}/api/clio/callback`;

    const oauthDomain = baseUrl.replace(/\/api\/v4\/?$/, '');
    const authorizeUrl = new URL(`${oauthDomain}/oauth/authorize`);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('client_id', clientId);
    authorizeUrl.searchParams.set('redirect_uri', redirectUri);

    res.writeHead(302, {
      Location: authorizeUrl.toString(),
    });
    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`OAuth redirect error: ${err.message}`);
  }
}
