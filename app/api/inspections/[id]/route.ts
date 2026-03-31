import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { logAuditEventWithUser } from '@/lib/audit';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db-users';
import { inspectionBodyToRow, inspectionRowToInspection } from '@/types/db';
import type { InspectionRow } from '@/types/db';
import { enforceRateLimit } from '@/lib/rateLimit';

async function getInspectionAndUser(request: NextRequest, id: string) {
  const user = await getCurrentUser(request);
  if (!user) return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  const userDoc = await getUserById(user.userId);
  if (!userDoc) return { error: NextResponse.json({ success: false, error: 'User not found' }, { status: 404 }) };
  const supabase = getSupabase();
  const { data: row, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', user.tenantId)
    .single();
  if (error || !row) return { error: NextResponse.json({ success: false, error: 'Inspection not found' }, { status: 404 }) };
  const inspection = inspectionRowToInspection(row as InspectionRow);
  if (userDoc.role !== 'admin' && inspection.inspectorEmail?.toLowerCase() !== userDoc.email.toLowerCase()) {
    return { error: NextResponse.json({ success: false, error: 'Forbidden: You can only view your own inspections' }, { status: 403 }) };
  }
  return { user, userDoc, inspection, supabase };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rl = await enforceRateLimit(request, 'api:inspections:id:get', { windowSeconds: 60, limit: 120, scope: 'ip+user' });
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    const result = await getInspectionAndUser(request, params.id);
    if ('error' in result) return result.error;

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';
    logAuditEventWithUser(
      result.user.tenantId,
      result.user.userId,
      result.userDoc.email ?? '',
      result.userDoc.name ?? result.userDoc.email ?? '',
      { action: 'inspection.viewed', resourceType: 'inspection', resourceId: params.id, details: { inspectionNumber: result.inspection.inspectionNumber } },
      ip,
      ua
    ).catch(() => {});

    const response = NextResponse.json({ success: true, data: result.inspection });
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rl = await enforceRateLimit(request, 'api:inspections:id:put', { windowSeconds: 60, limit: 60, scope: 'ip+user' });
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    const result = await getInspectionAndUser(request, params.id);
    if ('error' in result) return result.error;
    const { user, userDoc, inspection, supabase } = result;
    if (userDoc.role !== 'admin') {
      const inspectorMatches =
        !inspection.inspectorEmail ||
        inspection.inspectorEmail.toLowerCase() === userDoc.email?.toLowerCase();
      if (inspection.status !== 'draft' || !inspectorMatches) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You can only edit your own draft inspections' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    if (userDoc.role !== 'admin') body.inspectorEmail = userDoc.email.toLowerCase();
    else if (body.inspectorEmail) body.inspectorEmail = body.inspectorEmail.toLowerCase();
    if (body.status !== 'completed') body.status = 'draft';

    const row = inspectionBodyToRow(body) as Record<string, unknown>;
    const { data: updated, error } = await supabase
      .from('inspections')
      .update(row)
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    if (!updated) return NextResponse.json({ success: false, error: 'Inspection not found' }, { status: 404 });

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';
    logAuditEventWithUser(
      user.tenantId,
      user.userId,
      userDoc.email ?? '',
      userDoc.name ?? userDoc.email ?? '',
      { action: 'inspection.updated', resourceType: 'inspection', resourceId: params.id, details: { inspectionNumber: updated.inspection_number, status: updated.status } },
      ip,
      ua
    ).catch(() => {});

    return NextResponse.json({ success: true, data: inspectionRowToInspection(updated as InspectionRow) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rl = await enforceRateLimit(request, 'api:inspections:id:delete', { windowSeconds: 60, limit: 30, scope: 'ip+user' });
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const userDoc = await getUserById(user.userId);
    if (!userDoc) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    if (userDoc.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden: Only admins can delete inspections' }, { status: 403 });
    }

    const supabase = getSupabase();
    const { data: row } = await supabase
      .from('inspections')
      .select('id,inspection_number,inspector_name')
      .eq('id', params.id)
      .eq('tenant_id', user.tenantId)
      .single();
    if (!row) {
      return NextResponse.json({ success: false, error: 'Inspection not found' }, { status: 404 });
    }

    const { error } = await supabase.from('inspections').delete().eq('id', params.id).eq('tenant_id', user.tenantId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';
    logAuditEventWithUser(
      user.tenantId,
      user.userId,
      userDoc.email ?? '',
      userDoc.name ?? userDoc.email ?? 'Admin',
      { action: 'inspection.deleted', resourceType: 'inspection', resourceId: params.id, details: { inspectionNumber: row.inspection_number, inspectorName: row.inspector_name } },
      ip,
      ua
    ).catch(() => {});

    return NextResponse.json({ success: true, data: {} });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
