import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { logAuditEvent } from '@/lib/audit';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db-users';
import { inspectionBodyToRow, inspectionRowToInspection } from '@/types/db';
import type { InspectionRow } from '@/types/db';

async function getInspectionAndUser(request: NextRequest, id: string) {
  const user = await getCurrentUser(request);
  if (!user) return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  const userDoc = await getUserById(user.userId);
  if (!userDoc) return { error: NextResponse.json({ success: false, error: 'User not found' }, { status: 404 }) };
  const supabase = getSupabase();
  const { data: row, error } = await supabase.from('inspections').select('*').eq('id', id).single();
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
    const result = await getInspectionAndUser(request, params.id);
    if ('error' in result) return result.error;
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
    const result = await getInspectionAndUser(request, params.id);
    if ('error' in result) return result.error;
    const { userDoc, inspection, supabase } = result;
    if (userDoc.role !== 'admin') {
      if (inspection.status !== 'draft' || inspection.inspectorEmail?.toLowerCase() !== userDoc.email.toLowerCase()) {
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

    await logAuditEvent(request, {
      action: 'inspection.updated',
      resourceType: 'inspection',
      resourceId: params.id,
      details: { inspectionNumber: updated.inspection_number, status: updated.status },
    });

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
    const supabase = getSupabase();
    const { data: row } = await supabase.from('inspections').select('id,inspection_number,inspector_name').eq('id', params.id).single();
    if (!row) {
      return NextResponse.json({ success: false, error: 'Inspection not found' }, { status: 404 });
    }

    await logAuditEvent(request, {
      action: 'inspection.deleted',
      resourceType: 'inspection',
      resourceId: params.id,
      details: { inspectionNumber: row.inspection_number, inspectorName: row.inspector_name },
    });

    const { error } = await supabase.from('inspections').delete().eq('id', params.id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
