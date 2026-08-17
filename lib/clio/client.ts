/**
 * Clio Manage API HTTP client.
 * Features:
 * - Bearer authentication
 * - Regional Base URL support
 * - Automatic OAuth token refresh on 401
 * - Safe error handling (never exposes tokens or stack traces)
 */

export class ClioApiError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = 'ClioApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export interface ClioConfig {
  baseUrl: string;
  accessToken: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
}

export function getClioConfig(): ClioConfig {
  const baseUrl = (process.env.CLIO_BASE_URL || 'https://app.clio.com/api/v4').replace(/\/+$/, '');
  const accessToken = process.env.CLIO_ACCESS_TOKEN || '';
  const refreshToken = process.env.CLIO_REFRESH_TOKEN;
  const clientId = process.env.CLIO_CLIENT_ID;
  const clientSecret = process.env.CLIO_CLIENT_SECRET;

  return {
    baseUrl,
    accessToken,
    refreshToken,
    clientId,
    clientSecret,
  };
}

let cachedAccessToken: string | null = null;

export function getActiveAccessToken(): string {
  if (cachedAccessToken) return cachedAccessToken;
  return process.env.CLIO_ACCESS_TOKEN || '';
}

export function setActiveAccessToken(token: string): void {
  cachedAccessToken = token;
}

/**
 * Attempts to refresh the Clio OAuth access token using the refresh token.
 */
async function refreshClioToken(): Promise<string | null> {
  const config = getClioConfig();
  if (!config.refreshToken || !config.clientId || !config.clientSecret) {
    return null;
  }

  // Derive oauth token url from base url
  // e.g. https://app.clio.com/api/v4 -> https://app.clio.com/oauth/token
  const oauthDomain = config.baseUrl.replace(/\/api\/v4\/?$/, '');
  const tokenUrl = `${oauthDomain}/oauth/token`;

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      console.error('[Clio Auth] Token refresh failed with status:', response.status);
      return null;
    }

    const data = (await response.json()) as { access_token?: string; refresh_token?: string };
    if (data.access_token) {
      setActiveAccessToken(data.access_token);
      console.log('[Clio Auth] Access token successfully refreshed.');
      return data.access_token;
    }
  } catch (err) {
    console.error('[Clio Auth] Exception during token refresh:', (err as Error).message);
  }

  return null;
}

/**
 * Makes an authenticated request to the Clio API with retry on 401.
 */
export async function clioRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    retryOnAuthFailure?: boolean;
  } = {}
): Promise<T> {
  const config = getClioConfig();
  const token = getActiveAccessToken();

  if (!token) {
    throw new ClioApiError('Clio access token is not configured on the server.', 401);
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${config.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  let body: string | undefined = undefined;
  if (options.body !== undefined) {
    if (typeof options.body === 'string') {
      body = options.body;
    } else {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      body = JSON.stringify(options.body);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body,
    });
  } catch (fetchErr) {
    throw new ClioApiError(
      `Network error connecting to Clio API: ${(fetchErr as Error).message}`,
      502
    );
  }

  // Handle 401 Unauthorized with single token refresh retry
  if (response.status === 401 && options.retryOnAuthFailure !== false) {
    const newToken = await refreshClioToken();
    if (newToken) {
      return clioRequest<T>(endpoint, {
        ...options,
        retryOnAuthFailure: false, // Prevent infinite retry loops
      });
    }
    throw new ClioApiError('Clio authentication failed (401 Unauthorized).', 401);
  }

  if (!response.ok) {
    let errorDetails: unknown;
    try {
      errorDetails = await response.json();
    } catch {
      errorDetails = await response.text();
    }

    if (response.status === 403) {
      throw new ClioApiError('Clio permission denied (403 Forbidden).', 403, errorDetails);
    }
    if (response.status === 404) {
      throw new ClioApiError('Clio resource not found (404 Not Found).', 404, errorDetails);
    }
    if (response.status === 429) {
      throw new ClioApiError('Clio API rate limit exceeded (429). Please retry later.', 429, errorDetails);
    }
    if (response.status >= 500) {
      throw new ClioApiError('Clio Manage service error (5xx).', 502, errorDetails);
    }

    throw new ClioApiError(
      `Clio API request failed with status ${response.status}`,
      response.status,
      errorDetails
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}
