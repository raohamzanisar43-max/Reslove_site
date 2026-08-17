/**
 * Vercel Serverless Function: GET /api/clio/auth
 *
 * Initiates the Clio OAuth 2.0 authorization flow by redirecting the user
 * to Clio's official authorization screen.
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { getClioConfig } from '../../lib/clio/client';

export default function handler(
  req: IncomingMessage,
  res: ServerResponse
): void {
  try {
    const config = getClioConfig();
    const clientId = config.clientId || process.env.CLIO_CLIENT_ID;

    if (!clientId) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>Configuration Missing</title></head>
        <body style="font-family: sans-serif; padding: 40px; background: #f8fafc; text-align: center;">
          <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 8px; border: 1px solid #fee2e2;">
            <h2 style="color: #dc2626;">CLIO_CLIENT_ID Missing</h2>
            <p>Please add <code>CLIO_CLIENT_ID</code> and <code>CLIO_CLIENT_SECRET</code> to your Vercel Project Environment Variables, then redeploy.</p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'resolvoanjouan.com';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const redirectUri = `${proto}://${host}/api/clio/callback`;

    const oauthDomain = config.baseUrl.replace(/\/api\/v4\/?$/, '');
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
    res.end(`OAuth redirect error: ${(err as Error).message}`);
  }
}
