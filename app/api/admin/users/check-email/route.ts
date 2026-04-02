import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const emailParam = z.string().email().max(320);

export async function GET(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:admin:check-email', {
      windowSeconds: 60,
      limit: 80,
      scope: 'ip+user',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    await requireAuth(['admin', 'manager'])(request);

    const { searchParams } = new URL(request.url);
    const emailRaw = searchParams.get('email');
    const emailResult = emailParam.safeParse(emailRaw ?? '');
    if (!emailResult.success) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data } = await supabase.from('users').select('id').eq('email', emailResult.data.toLowerCase()).single();
    return NextResponse.json({ success: true, exists: !!data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check email';
    if (message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: message }, { status: 401 });
    }
    if (message === 'Forbidden') {
      return NextResponse.json({ success: false, error: message }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
