import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';
import {
  assertTenantScopedStorageKey,
  detectVehicleDamageFromBuffer,
  isVisionDamageEnabled,
  loadInspectionImageBuffer,
} from '@/lib/vision-damage';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:vision:damage', {
      windowSeconds: 60,
      limit: 20,
      scope: 'ip+user',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!isVisionDamageEnabled()) {
      return NextResponse.json(
        {
          success: false,
          disabled: true,
          error: 'AI damage detection is not configured. Set OPENAI_API_KEY on the server.',
        },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const storageKey =
      typeof body.storageKey === 'string' ? body.storageKey.trim() : '';
    if (!storageKey) {
      return NextResponse.json({ success: false, error: 'storageKey is required' }, { status: 400 });
    }

    try {
      assertTenantScopedStorageKey(storageKey, user.tenantId);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid file reference' }, { status: 403 });
    }

    const itemName = typeof body.itemName === 'string' ? body.itemName.slice(0, 120) : undefined;
    const panelHint = typeof body.panelHint === 'string' ? body.panelHint.slice(0, 120) : undefined;
    const context = typeof body.context === 'string' ? body.context.slice(0, 200) : undefined;

    const buffer = await loadInspectionImageBuffer(storageKey);
    if (!buffer || buffer.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Could not load image from storage' },
        { status: 404 }
      );
    }

    if (buffer.length > 8 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Image too large for analysis' }, { status: 400 });
    }

    const result = await detectVehicleDamageFromBuffer(buffer, {
      itemName,
      panelHint,
      context,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Vision analysis failed';
    console.error('[vision/damage-detect]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
