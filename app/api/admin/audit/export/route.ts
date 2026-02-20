import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import type { AuditLogRow } from '@/types/db';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(['admin'])(request);
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const action = searchParams.get('action');
    const resourceType = searchParams.get('resourceType');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const supabase = getSupabase();
    let query = supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });

    if (action) query = query.eq('action', action);
    if (resourceType) query = query.eq('resource_type', resourceType);
    if (userId) query = query.eq('user_id', userId);
    if (startDate) query = query.gte('timestamp', startDate);
    if (endDate) query = query.lte('timestamp', endDate);

    const { data: logs, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    const rows = (logs || []) as AuditLogRow[];

    if (format === 'csv') {
      const headers = ['Timestamp', 'User', 'Email', 'Action', 'Resource Type', 'Resource ID', 'Details', 'IP Address'];
      const csvRows = rows.map((log) => [
        new Date(log.timestamp).toISOString(),
        log.user_name,
        log.user_email,
        log.action,
        log.resource_type,
        log.resource_id || '',
        JSON.stringify(log.details || {}),
        log.ip_address || '',
      ]);
      const csv = [
        headers.join(','),
        ...csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-logs-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, data: rows, count: rows.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to export audit logs';
    if (msg === 'Unauthorized' || msg === 'Forbidden') {
      return NextResponse.json({ success: false, error: msg }, { status: msg === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
