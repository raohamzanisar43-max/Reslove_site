/**
 * Vercel Serverless Function: GET /api/clio/callback
 *
 * Handles the OAuth 2.0 redirect from Clio Manage.
 * Exchanges authorization `code` for `access_token` and `refresh_token`
 * and renders a secure helper page to copy tokens directly into Vercel environment variables.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClioConfig } from '../../lib/clio/client';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const { code, error, error_description } = req.query;

  if (error) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(400).send(renderErrorPage(String(error), String(error_description || '')));
    return;
  }

  if (!code || typeof code !== 'string') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(400).send(
      renderErrorPage(
        'Missing authorization code',
        'No "code" query parameter received from Clio. Please initiate login from /api/clio/auth.'
      )
    );
    return;
  }

  const config = getClioConfig();
  const clientId = config.clientId || process.env.CLIO_CLIENT_ID;
  const clientSecret = config.clientSecret || process.env.CLIO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(500).send(
      renderErrorPage(
        'Server Configuration Missing',
        'CLIO_CLIENT_ID or CLIO_CLIENT_SECRET is not set in Vercel Environment Variables.'
      )
    );
    return;
  }

  // Determine Redirect URI dynamically from the request headers
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'resolvoanjouan.com';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${proto}://${host}/api/clio/callback`;

  // Base OAuth URL
  const oauthDomain = config.baseUrl.replace(/\/api\/v4\/?$/, '');
  const tokenUrl = `${oauthDomain}/oauth/token`;

  try {
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

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      token_type?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenResponse.ok || !tokenData.access_token) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(400).send(
        renderErrorPage(
          tokenData.error || 'Token Exchange Failed',
          tokenData.error_description || 'Clio rejected the authorization code.'
        )
      );
      return;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(
      renderSuccessPage({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || '',
        expiresIn: tokenData.expires_in || 0,
      })
    );
  } catch (err) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(500).send(
      renderErrorPage('Network Error', `Could not reach Clio OAuth server: ${(err as Error).message}`)
    );
  }
}

function renderSuccessPage(tokens: { accessToken: string; refreshToken: string; expiresIn: number }) {
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

function renderErrorPage(title: string, detail: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Clio Authorization Error</title>
  <style>
    body { font-family: sans-serif; background: #f8fafc; color: #1e293b; display: flex; justify-content: center; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 600px; width: 100%; padding: 32px; border: 1px solid #fee2e2; }
    .badge { background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 14px; display: inline-block; margin-bottom: 12px; }
    h1 { font-size: 22px; color: #991b1b; margin: 0 0 12px 0; }
    p { color: #64748b; font-size: 15px; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">OAuth Error</span>
    <h1>${title}</h1>
    <p>${detail}</p>
    <p>Please check that <code>CLIO_CLIENT_ID</code> and <code>CLIO_CLIENT_SECRET</code> are set in Vercel, and that the Redirect URI matches in your Clio Developer App settings.</p>
  </div>
</body>
</html>
  `;
}
