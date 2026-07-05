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

function isRateLimitBypassed(): boolean {
  if (process.env.DISABLE_RATE_LIMIT === '1' || process.env.DISABLE_RATE_LIMIT === 'true') {
    return true;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return url.includes('ci-placeholder') || url.includes('placeholder.supabase');
}

export async function enforceRateLimit(
  request: NextRequest,
  routeKey: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; key: string }> {
  if (isRateLimitBypassed()) {
    return { allowed: true, key: `bypass:${routeKey}` };
  }

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
    console.error('[rateLimit] check_rate_limit RPC failed:', error.message);
    // Fail closed in production — do not allow unlimited traffic if limiter is down.
    if (process.env.NODE_ENV === 'production') {
      return { allowed: false, key };
    }
    return { allowed: true, key };
  }
  return { allowed: !!data, key };
}

