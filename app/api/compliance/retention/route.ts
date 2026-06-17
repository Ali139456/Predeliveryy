import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { shouldDeleteData } from '@/lib/compliance';
import { verifyCronSecret } from '@/lib/security';
import { enforceRateLimit } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:compliance:retention', {
      windowSeconds: 3600,
      limit: 4,
      scope: 'ip',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    if (!verifyCronSecret(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();
    const { data: inspections } = await supabase
      .from('inspections')
      .select('id, inspection_date, data_retention_days')
      .eq('status', 'completed');
    const toDelete: string[] = [];

    (inspections || []).forEach((row: { id: string; inspection_date: string; data_retention_days: number | null }) => {
      const retentionDays = row.data_retention_days ?? 365;
      if (shouldDeleteData(new Date(row.inspection_date), retentionDays)) {
        toDelete.push(row.id);
      }
    });

    if (toDelete.length > 0) {
      await supabase.from('inspections').delete().in('id', toDelete);
    }

    await logAuditEvent(request, {
      action: 'compliance.retention_purge',
      resourceType: 'inspection',
      resourceId: undefined,
      details: { deletedCount: toDelete.length },
    });

    return NextResponse.json({
      success: true,
      deletedCount: toDelete.length,
      message: `Deleted ${toDelete.length} inspections based on retention policy`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
