import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db-users';
import { inspectionRowToInspection } from '@/types/db';
import type { InspectionRow } from '@/types/db';
import {
  ensureInspectionReportHtml,
  generateAndSaveReportHtml,
  resolveAppOrigin,
  saveClientReportHtml,
} from '@/lib/report-snapshot';
import { z } from 'zod';

export const maxDuration = 60;

const bodySchema = z.object({
  html: z.string().min(50).max(6_000_000).optional(),
  force: z.boolean().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userDoc = await getUserById(user.userId);
    if (!userDoc) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', params.id)
      .eq('tenant_id', user.tenantId)
      .single();

    if (error || !row) {
      return NextResponse.json({ success: false, error: 'Inspection not found' }, { status: 404 });
    }

    const inspection = inspectionRowToInspection(row as InspectionRow);
    if (
      userDoc.role !== 'admin' &&
      inspection.inspectorEmail?.toLowerCase() !== userDoc.email.toLowerCase()
    ) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (inspection.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Report snapshot is only available for completed inspections' },
        { status: 400 }
      );
    }

    const raw = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const origin = resolveAppOrigin(request.nextUrl.origin);
    let savedAt: string;

    if (parsed.data.html) {
      await saveClientReportHtml(supabase, inspection, parsed.data.html);
      savedAt = new Date().toISOString();
    } else if (parsed.data.force) {
      await generateAndSaveReportHtml(supabase, inspection, origin);
      savedAt = new Date().toISOString();
    } else {
      await ensureInspectionReportHtml(supabase, row as InspectionRow, inspection, origin, {
        force: false,
      });
      savedAt = new Date().toISOString();
    }

    return NextResponse.json({
      success: true,
      message: 'Report snapshot saved',
      savedAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save report snapshot';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
