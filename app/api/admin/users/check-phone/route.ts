import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const phoneParam = z.string().trim().min(5).max(32);

export async function GET(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:admin:check-phone', {
      windowSeconds: 60,
      limit: 80,
      scope: 'ip+user',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    await requireAuth(['admin', 'manager'])(request);

    const { searchParams } = new URL(request.url);
    const phoneRaw = searchParams.get('phone');
    const phoneResult = phoneParam.safeParse(phoneRaw ?? '');
    if (!phoneResult.success) {
      return NextResponse.json({ success: false, error: 'Valid phone number is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', phoneResult.data)
      .single();
    return NextResponse.json({ success: true, exists: !!data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check phone number';
    if (message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: message }, { status: 401 });
    }
    if (message === 'Forbidden') {
      return NextResponse.json({ success: false, error: message }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
