import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { logAuditEventWithUser } from '@/lib/audit';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db-users';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const userDoc = await getUserById(user.userId);
    if (!userDoc) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    if (userDoc.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden: Only admins can delete inspections' }, { status: 403 });
    }

    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown) => typeof id === 'string') : [];
    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No inspection IDs provided' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('inspections').delete().in('id', ids).eq('tenant_id', user.tenantId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';
    logAuditEventWithUser(
      user.tenantId,
      user.userId,
      userDoc.email ?? '',
      userDoc.name ?? userDoc.email ?? 'Admin',
      { action: 'inspection.bulk_deleted', resourceType: 'inspection', details: { count: ids.length, ids } },
      ip,
      ua
    ).catch(() => {});

    return NextResponse.json({ success: true, data: { deleted: ids.length } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
