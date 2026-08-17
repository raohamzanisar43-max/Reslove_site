/**
 * Vercel Serverless Function: GET /api/clio/auth
 *
 * Initiates the Clio OAuth 2.0 authorization flow by redirecting the user
 * to Clio's official authorization screen.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClioConfig } from '../../lib/clio/client';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
): void {
  const config = getClioConfig();
  const clientId = config.clientId || process.env.CLIO_CLIENT_ID;

  if (!clientId) {
    res.status(500).json({
      success: false,
      error: 'CLIO_CLIENT_ID environment variable is missing on Vercel.',
    });
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

  res.redirect(302, authorizeUrl.toString());
}
