import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { fetchAnalyticsDashboard } from '@/lib/analytics-query';

function parseDateParam(raw: string | null): string {
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(['admin', 'manager'])(request);
    const { searchParams } = new URL(request.url);
    const date = parseDateParam(searchParams.get('date'));
    const location = searchParams.get('location')?.trim() || 'all';

    const supabase = getSupabase();
    const data = await fetchAnalyticsDashboard(supabase, authUser.tenantId, date, location);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load analytics';
    if (message === 'Unauthorized' || message === 'Forbidden') {
      return NextResponse.json({ success: false, error: message }, { status: message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[admin/analytics]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
