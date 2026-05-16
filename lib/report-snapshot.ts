import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { IInspection, InspectionRow } from '@/types/db';
import { buildInspectionReportHtml } from '@/app/api/inspections/report-pdf/build-html';
import { pdfBufferFromHtml } from '@/app/api/inspections/report-pdf/generate';
import { normalizeStoredReportHtml, wrapReportHtmlDocument } from '@/lib/report-html-document';

export function resolveAppOrigin(requestOrigin?: string | null): string {
  if (requestOrigin && requestOrigin !== 'null') {
    return requestOrigin.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    const v = process.env.VERCEL_URL;
    return v.startsWith('http') ? v : `https://${v}`;
  }
  return 'http://localhost:3000';
}

export async function saveInspectionReportHtml(
  supabase: SupabaseClient,
  inspectionId: string,
  tenantId: string,
  html: string
): Promise<void> {
  const { error } = await supabase
    .from('inspections')
    .update({
      report_html: html,
      report_html_at: new Date().toISOString(),
    })
    .eq('id', inspectionId)
    .eq('tenant_id', tenantId);

  if (error) {
    throw new Error(`Failed to save report snapshot: ${error.message}`);
  }
}

/** Build HTML from inspection data (server) and persist. */
export async function generateAndSaveReportHtml(
  supabase: SupabaseClient,
  inspection: IInspection,
  origin: string,
  options?: { maxPhotos?: number }
): Promise<string> {
  const fullHtml = await buildInspectionReportHtml(inspection, {
    origin,
    maxPhotos: options?.maxPhotos,
  });
  await saveInspectionReportHtml(supabase, inspection.id, inspection.tenantId, fullHtml);
  return fullHtml;
}

/** Save browser-captured report markup (same as print preview). */
export async function saveClientReportHtml(
  supabase: SupabaseClient,
  inspection: IInspection,
  fragmentHtml: string
): Promise<string> {
  const fullHtml = wrapReportHtmlDocument(
    fragmentHtml,
    `Inspection ${inspection.inspectionNumber || inspection.id}`
  );
  await saveInspectionReportHtml(supabase, inspection.id, inspection.tenantId, fullHtml);
  return fullHtml;
}

export function isReportSnapshotStale(row: InspectionRow): boolean {
  if (!row.report_html?.trim() || !row.report_html_at) return true;
  const snap = new Date(row.report_html_at).getTime();
  const updated = new Date(row.updated_at).getTime();
  return updated > snap + 1000;
}

/** Ensure DB has fresh report HTML; returns full document HTML. */
export async function ensureInspectionReportHtml(
  supabase: SupabaseClient,
  row: InspectionRow,
  inspection: IInspection,
  origin: string,
  options?: { force?: boolean; maxPhotos?: number }
): Promise<string> {
  if (
    !options?.force &&
    row.report_html &&
    row.report_html_at &&
    !isReportSnapshotStale(row)
  ) {
    return normalizeStoredReportHtml(
      row.report_html,
      `Inspection ${inspection.inspectionNumber || inspection.id}`
    );
  }
  return generateAndSaveReportHtml(supabase, inspection, origin, {
    maxPhotos: options?.maxPhotos,
  });
}

export async function pdfFromReportHtml(html: string): Promise<Buffer> {
  return pdfBufferFromHtml(html);
}
