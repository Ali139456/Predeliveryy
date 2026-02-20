import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { auditRowToLog } from '@/types/db';
import type { AuditLogRow } from '@/types/db';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(['admin', 'manager'])(request);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const action = searchParams.get('action');
    const resourceType = searchParams.get('resourceType');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const resourceId = searchParams.get('resourceId');

    const supabase = getSupabase();
    let query = supabase.from('audit_logs').select('*', { count: 'exact' }).order('timestamp', { ascending: false });

    if (action) query = query.eq('action', action);
    if (resourceType) query = query.eq('resource_type', resourceType);
    if (userId) query = query.eq('user_id', userId);
    if (resourceId) query = query.eq('resource_id', resourceId);
    if (startDate) query = query.gte('timestamp', startDate);
    if (endDate) query = query.lte('timestamp', endDate);

    const from = (page - 1) * limit;
    const { data: rows, error, count } = await query.range(from, from + limit - 1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const logs = (rows || []).map((r) => auditRowToLog(r as AuditLogRow));
    const total = count ?? 0;

    const { data: actionRows } = await supabase.from('audit_logs').select('action');
    const actionTypes = Array.from(new Set((actionRows || []).map((r: { action: string }) => r.action)));
    const { data: resourceRows } = await supabase.from('audit_logs').select('resource_type');
    const resourceTypes = Array.from(new Set((resourceRows || []).map((r: { resource_type: string }) => r.resource_type)));

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      filters: { actionTypes, resourceTypes },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch audit logs';
    if (msg === 'Unauthorized' || msg === 'Forbidden') {
      return NextResponse.json({ success: false, error: msg }, { status: msg === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
