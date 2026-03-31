import type { NextRequest } from 'next/server';
import getSupabase from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export type RateLimitConfig = {
  windowSeconds: number;
  limit: number;
  scope?: 'ip' | 'user' | 'ip+user';
};

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function enforceRateLimit(
  request: NextRequest,
  routeKey: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; key: string }> {
  const scope = config.scope ?? 'ip';
  const ip = getClientIP(request);
  const user = await getCurrentUser(request);

  const parts: string[] = [];
  if (scope === 'ip' || scope === 'ip+user') parts.push(`ip:${ip}`);
  if ((scope === 'user' || scope === 'ip+user') && user?.userId) parts.push(`user:${user.userId}`);
  if (parts.length === 0) parts.push(`ip:${ip}`);

  const key = `${parts.join('|')}:${routeKey}`;

  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_key: key,
    p_limit: config.limit,
    p_window_seconds: config.windowSeconds,
  });

  if (error) {
    // Fail-open: don't block requests if limiter is misconfigured.
    return { allowed: true, key };
  }
  return { allowed: !!data, key };
}

