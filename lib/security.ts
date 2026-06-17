import type { NextRequest } from 'next/server';

/** Escape user-controlled strings before inserting into HTML email/templates. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitize free-text search before PostgREST `.or()` ilike filters.
 * Strips characters that could alter filter syntax (`,`, `.`, parens).
 */
export function sanitizePostgrestSearchTerm(raw: string, maxLen = 80): string {
  return raw
    .replace(/[%_,.()\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

/** Verify Vercel cron / scheduled job bearer token (`CRON_SECRET`). */
export function verifyCronSecret(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || secret.length < 16) return false;
  const auth = request.headers.get('authorization')?.trim();
  if (!auth?.startsWith('Bearer ')) return false;
  const token = auth.slice('Bearer '.length).trim();
  if (token.length !== secret.length) return false;
  let match = 0;
  for (let i = 0; i < secret.length; i++) {
    match |= token.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return match === 0;
}

export function getAppOrigin(): string | null {
  const url =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  return url ? url.replace(/\/$/, '') : null;
}

/** CORS headers restricted to the configured app origin (no wildcard). */
export function appCorsHeaders(): Record<string, string> {
  const origin = getAppOrigin();
  return {
    'Access-Control-Allow-Origin': origin ?? 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  };
}
