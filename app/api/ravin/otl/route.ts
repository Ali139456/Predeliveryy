import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db-users';
import { enforceRateLimit } from '@/lib/rateLimit';
import { canMutateInspections } from '@/lib/roles';
import { getRavinConfig } from '@/lib/ravin/config';
import { createRavinOtl } from '@/lib/ravin/otl';
import { updateInspectionRavinState } from '@/lib/ravin/inspection-store';
import getSupabase from '@/lib/supabase';
import { inspectionRowToInspection } from '@/types/db';
import type { InspectionRow } from '@/types/db';
import type { RavinIntegrationState } from '@/types/ravin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:ravin:otl', {
      windowSeconds: 60,
      limit: 10,
      scope: 'ip+user',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const config = getRavinConfig();
    if (!config?.enabled || config.inboundMode !== 'otl') {
      return NextResponse.json(
        {
          success: false,
          error: 'Ravin OTL is not enabled. Set RAVIN_INBOUND_MODE=otl and required credentials.',
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
    const result = await createRavinOtl(inspection, config);

    const ravinState: RavinIntegrationState = {
      status: 'otl_created',
      inboundMode: 'otl',
      invitationId: inspection.id,
      otlUrl: result.url,
      otlExpiresAt: result.expirationTimestamp,
      traceId: result.traceId,
    };

    await updateInspectionRavinState(inspection.id, user.tenantId, ravinState);

    return NextResponse.json({
      success: true,
      otlUrl: result.url,
      expirationTimestamp: result.expirationTimestamp,
      traceId: result.traceId,
      ravin: ravinState,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create Ravin OTL';
    console.error('[ravin/otl]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
