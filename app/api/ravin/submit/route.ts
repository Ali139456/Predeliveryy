import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db-users';
import { enforceRateLimit } from '@/lib/rateLimit';
import { canMutateInspections } from '@/lib/roles';
import { getRavinConfig } from '@/lib/ravin/config';
import { collectInspectionPhotoKeys } from '@/lib/ravin/apply-report';
import { updateInspectionRavinState } from '@/lib/ravin/inspection-store';
import { uploadInspectionPhotosToRavin } from '@/lib/ravin/s3-ingest';
import getSupabase from '@/lib/supabase';
import { inspectionRowToInspection } from '@/types/db';
import type { InspectionRow } from '@/types/db';
import type { RavinIntegrationState } from '@/types/ravin';

export const runtime = 'nodejs';
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

/** Submit in-app photos to Ravin via S3 direct upload (Appendix C). */
export async function POST(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:ravin:submit', {
      windowSeconds: 60,
      limit: 10,
      scope: 'ip+user',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const config = getRavinConfig();
    if (!config?.enabled || config.inboundMode !== 's3') {
      return NextResponse.json(
        {
          success: false,
          error: 'Ravin S3 inbound is not enabled. Set RAVIN_INBOUND_MODE=s3 and required credentials.',
        },
        { status: 503 }
      );
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userDoc = await getUserById(user.userId);
    if (!userDoc || !canMutateInspections(userDoc.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const inspectionId = typeof body.inspectionId === 'string' ? body.inspectionId.trim() : '';
    if (!inspectionId) {
      return NextResponse.json({ success: false, error: 'inspectionId is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', inspectionId)
      .eq('tenant_id', user.tenantId)
      .single();

    if (error || !row) {
      return NextResponse.json({ success: false, error: 'Inspection not found' }, { status: 404 });
    }

    const inspection = inspectionRowToInspection(row as InspectionRow);
    const photoKeys = collectInspectionPhotoKeys(inspection);
    if (!photoKeys.length) {
      return NextResponse.json(
        { success: false, error: 'Add at least one inspection photo before submitting to Ravin.' },
        { status: 400 }
      );
    }

    await updateInspectionRavinState(inspection.id, user.tenantId, {
      status: 'submitted',
      inboundMode: 's3',
      invitationId: inspection.id,
      submittedAt: new Date().toISOString(),
    });

    const vehicleId = inspection.vehicleInfo?.vin?.trim() || inspection.id;
    const uploadResult = await uploadInspectionPhotosToRavin(config, {
      inspectionId: inspection.id,
      vehicleId,
      photos: photoKeys,
    });

    const nextStatus: RavinIntegrationState['status'] =
      uploadResult.uploaded > 0 ? 'processing' : 'failed';

    const ravinPatch: Partial<RavinIntegrationState> = {
      status: nextStatus,
      uploadedPhotoCount: uploadResult.uploaded,
      submittedAt: new Date().toISOString(),
    };
    if (uploadResult.failed.length) {
      ravinPatch.error = uploadResult.failed.slice(0, 5).join('; ');
    }
    if (uploadResult.uploaded === 0) {
      ravinPatch.status = 'failed';
    }

    await updateInspectionRavinState(inspection.id, user.tenantId, ravinPatch);

    return NextResponse.json({
      success: uploadResult.uploaded > 0,
      uploaded: uploadResult.uploaded,
      failed: uploadResult.failed,
      status: ravinPatch.status,
      message:
        uploadResult.uploaded > 0
          ? 'Photos submitted to Ravin AI. Results will arrive via webhook or S3 when processing completes.'
          : 'All photo uploads to Ravin failed. Check RAVIN_S3_PRESIGN_URL and credentials.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ravin submit failed';
    console.error('[ravin/submit]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
