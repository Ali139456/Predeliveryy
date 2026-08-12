import type { RavinConfig } from '@/lib/ravin/config';
import type { RavinSignInTokenResponse } from '@/types/ravin';
import crypto from 'crypto';

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

/** Flow 2 (ART): exchange clientKey for a short-lived Ravin session token. */
export async function getRavinSignInToken(config: RavinConfig): Promise<string> {
  const cacheKey = config.clientKey.slice(0, 8);
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  const res = await fetch(`${config.apiBaseUrl}/getSignInToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ clientKey: config.clientKey }),
  });

  const data = (await res.json().catch(() => ({}))) as RavinSignInTokenResponse;
  if (!res.ok || !data.token) {
    throw new Error(data.error || `Ravin getSignInToken failed (${res.status})`);
  }

  const expiresInMs =
    typeof data.expiresIn === 'number'
      ? data.expiresIn * 1000
      : Number(data.expiresIn) * 1000 || 3_600_000;

  tokenCache.set(cacheKey, {
    token: data.token,
    expiresAt: Date.now() + expiresInMs,
  });

  return data.token;
}

/** Flow 1 (APT): partner-generated token for Ravin to validate via our callback. */
export function generatePartnerToken(config: RavinConfig, invitationId: string): string {
  const secret = config.partnerTokenSecret || config.clientKey;
  return crypto.createHmac('sha256', secret).update(invitationId).digest('hex');
}

export function validatePartnerToken(
  config: RavinConfig,
  token: string,
  invitationId?: string
): boolean {
  if (!token?.trim()) return false;
  if (invitationId) {
    const expected = generatePartnerToken(config, invitationId);
    if (token.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  }
  return token.length >= 32;
}

export async function resolvePartnerToken(
  config: RavinConfig,
  invitationId: string
): Promise<string> {
  if (config.authMode === 'apt') {
    return generatePartnerToken(config, invitationId);
  }
  return getRavinSignInToken(config);
}
