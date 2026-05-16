import { createHash, randomBytes } from 'crypto';

export type OAuthProvider = 'google' | 'microsoft';

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === 'google' || value === 'microsoft';
}

export function appOrigin(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, '') ||
    'http://localhost:3000';
  return base;
}

export function oauthRedirectUri(provider: OAuthProvider): string {
  return `${appOrigin()}/api/auth/oauth/${provider}/callback`;
}

export function createOAuthState(): string {
  return randomBytes(24).toString('hex');
}

export function buildAuthorizeUrl(provider: OAuthProvider, state: string): string {
  const redirectUri = encodeURIComponent(oauthRedirectUri(provider));
  const encodedState = encodeURIComponent(state);

  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not configured');
    const scope = encodeURIComponent('openid email profile');
    return (
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&state=${encodedState}` +
      `&access_type=online&prompt=select_account`
    );
  }

  const clientId = process.env.AZURE_AD_CLIENT_ID;
  if (!clientId) throw new Error('AZURE_AD_CLIENT_ID is not configured');
  const tenant = process.env.AZURE_AD_TENANT_ID || 'common';
  const scope = encodeURIComponent('openid email profile User.Read');
  return (
    `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/authorize?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&state=${encodedState}` +
    `&prompt=select_account`
  );
}

type TokenResponse = {
  access_token: string;
  id_token?: string;
  token_type?: string;
};

async function exchangeCode(provider: OAuthProvider, code: string): Promise<TokenResponse> {
  const redirectUri = oauthRedirectUri(provider);
  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  let tokenUrl: string;
  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    body.set('client_id', clientId);
    body.set('client_secret', clientSecret);
    tokenUrl = 'https://oauth2.googleapis.com/token';
  } else {
    const clientId = process.env.AZURE_AD_CLIENT_ID!;
    const clientSecret = process.env.AZURE_AD_CLIENT_SECRET!;
    const tenant = process.env.AZURE_AD_TENANT_ID || 'common';
    body.set('client_id', clientId);
    body.set('client_secret', clientSecret);
    tokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
  }

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<TokenResponse>;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = Buffer.from(part, 'base64url').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function profileFromGoogle(accessToken: string): Promise<{ email: string; name?: string }> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to load Google profile');
  const data = (await res.json()) as { email?: string; name?: string };
  if (!data.email) throw new Error('Google account has no email');
  return { email: data.email.toLowerCase(), name: data.name };
}

async function profileFromMicrosoft(accessToken: string, idToken?: string): Promise<{ email: string; name?: string }> {
  if (idToken) {
    const claims = decodeJwtPayload(idToken);
    const email = (claims?.email || claims?.preferred_username) as string | undefined;
    const name = claims?.name as string | undefined;
    if (email) return { email: email.toLowerCase(), name };
  }
  const res = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to load Microsoft profile');
  const data = (await res.json()) as { mail?: string; userPrincipalName?: string; displayName?: string };
  const email = (data.mail || data.userPrincipalName)?.toLowerCase();
  if (!email) throw new Error('Microsoft account has no email');
  return { email, name: data.displayName };
}

export async function profileFromOAuthCode(
  provider: OAuthProvider,
  code: string
): Promise<{ email: string; name?: string; provider: OAuthProvider }> {
  const tokens = await exchangeCode(provider, code);
  const profile =
    provider === 'google'
      ? await profileFromGoogle(tokens.access_token)
      : await profileFromMicrosoft(tokens.access_token, tokens.id_token);
  return { ...profile, provider };
}

export function oauthProvidersEnabled(): { google: boolean; microsoft: boolean } {
  return {
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    microsoft: Boolean(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET),
  };
}

/** Stable hash for audit (never log raw codes). */
export function hashForAudit(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}
