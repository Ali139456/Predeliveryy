import { NextRequest, NextResponse } from 'next/server';
import { getRavinConfig } from '@/lib/ravin/config';
import { applyRavinReportToInspection } from '@/lib/ravin/apply-report';
import {
  findInspectionByInvitationId,
  saveInspectionAfterRavinReport,
} from '@/lib/ravin/inspection-store';
import { listPendingRavinResultKeys, loadRavinResultFromS3 } from '@/lib/ravin/s3-outbound';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function authorizeCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || secret.length < 16) return false;
  const auth = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return auth === secret;
}

/** Poll S3 for Ravin JSON results (outbound S3 push). Call via cron with CRON_SECRET. */
export async function POST(request: NextRequest) {
  try {
    if (!authorizeCron(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const config = getRavinConfig();
    if (!config) {
      return NextResponse.json({ success: false, error: 'Ravin not configured' }, { status: 503 });
    }

    if (config.outboundMode === 'webhook') {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: 'S3 outbound polling disabled (RAVIN_OUTBOUND_MODE=webhook)',
      });
    }

    const processed = new Set<string>();
    const keys = await listPendingRavinResultKeys(config, processed);
    const results: { key: string; inspectionId?: string; damageCount?: number; error?: string }[] =
      [];

    for (const key of keys) {
      try {
        const report = await loadRavinResultFromS3(key);
        if (!report?.invitationId) {
          results.push({ key, error: 'missing invitationId' });
          continue;
        }

        const inspection = await findInspectionByInvitationId(report.invitationId);
        if (!inspection) {
          results.push({ key, error: 'inspection not found' });
          continue;
        }

        const { inspection: updated, ravin } = applyRavinReportToInspection(inspection, report);
        ravin.status = 'completed';
        ravin.inboundMode = inspection.ravinIntegration?.inboundMode || config.inboundMode;
        await saveInspectionAfterRavinReport(updated, ravin);

        results.push({
          key,
          inspectionId: inspection.id,
          damageCount: report.findings.length,
        });
      } catch (err) {
        results.push({
          key,
          error: err instanceof Error ? err.message : 'ingest failed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.filter((r) => r.inspectionId).length,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'S3 ingest failed';
    console.error('[ravin/ingest-s3]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
