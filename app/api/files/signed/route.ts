import { NextRequest, NextResponse } from 'next/server';
import { getS3Url } from '@/lib/s3';
import { hasSupabaseStorageConfig, getSupabaseStorageSignedOrPublicUrl } from '@/lib/supabase-storage';
import { requireAuth } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/audit';

// Node runtime: Supabase Storage signing and/or S3 presign
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:files:signed', { windowSeconds: 60, limit: 120, scope: 'ip+user' });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const user = await requireAuth()(request);
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key') || '';
    if (!key) {
      return NextResponse.json({ success: false, error: 'Missing key' }, { status: 400 });
    }

    // Tenant prefix enforcement: prevents cross-tenant key guessing.
    const requiredPrefix = `tenants/${user.tenantId}/`;
    if (!key.startsWith(requiredPrefix)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    let targetUrl: string;
    if (hasSupabaseStorageConfig()) {
      const supa = await getSupabaseStorageSignedOrPublicUrl(key, 3600);
      if (!supa) {
        return NextResponse.json(
          { success: false, error: 'Could not create signed URL for this object' },
          { status: 503 }
        );
      }
      targetUrl = supa;
    } else {
      targetUrl = await getS3Url(key);
    }

    await logAuditEvent(request, {
      action: 'file.accessed',
      resourceType: 'file',
      resourceId: key,
      details: { key },
    });

    return NextResponse.redirect(targetUrl);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to sign URL';
    if (msg === 'Unauthorized' || msg === 'Forbidden') {
      return NextResponse.json({ success: false, error: msg }, { status: msg === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

