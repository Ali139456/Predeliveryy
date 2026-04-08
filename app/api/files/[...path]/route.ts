import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';
import { getS3Url } from '@/lib/s3';
import { hasSupabaseStorageConfig, getSupabaseStorageSignedOrPublicUrl } from '@/lib/supabase-storage';
import { enforceRateLimit } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Legacy DB values often store `inspections/{file}` while uploads use
 * `tenants/{tenantId}/inspections/images/{file}` (or `.../videos/...`).
 * This route resolves those paths and redirects to a short-lived signed URL.
 */
function storageKeyCandidates(rel: string, tenantId: string): string[] {
  const requiredPrefix = `tenants/${tenantId}/`;
  const out: string[] = [];

  if (rel.startsWith('tenants/')) {
    if (rel.startsWith(requiredPrefix)) out.push(rel);
    return out;
  }

  if (rel.startsWith('inspections/videos/')) {
    out.push(`${requiredPrefix}${rel}`);
    return out;
  }

  if (rel.startsWith('inspections/')) {
    const rest = rel.slice('inspections/'.length);
    out.push(`${requiredPrefix}inspections/images/${rest}`);
    out.push(`${requiredPrefix}inspections/${rest}`);
    return out;
  }

  out.push(`${requiredPrefix}${rel}`);
  return out;
}

async function firstExistingKey(candidates: string[], requiredPrefix: string): Promise<string | null> {
  for (const key of candidates) {
    if (!key.startsWith(requiredPrefix)) continue;
    try {
      let probeUrl: string | null = null;
      if (hasSupabaseStorageConfig()) {
        probeUrl = await getSupabaseStorageSignedOrPublicUrl(key, 600);
      } else {
        probeUrl = await getS3Url(key);
      }
      if (!probeUrl) continue;
      const head = await fetch(probeUrl, { method: 'HEAD' });
      if (head.ok) return key;
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:files:path', {
      windowSeconds: 60,
      limit: 120,
      scope: 'ip+user',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const rel = params.path.join('/');
    if (rel.includes('..')) {
      return NextResponse.json({ success: false, error: 'Invalid path' }, { status: 400 });
    }

    if (rel.startsWith('http://') || rel.startsWith('https://')) {
      return NextResponse.redirect(rel);
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const requiredPrefix = `tenants/${user.tenantId}/`;

    if (rel.startsWith('uploads/') || rel.startsWith('/uploads/')) {
      const clean = rel.replace(/^\/?/, '');
      const disk = path.normalize(path.join(process.cwd(), 'public', clean));
      const publicRoot = path.join(process.cwd(), 'public');
      if (!disk.startsWith(publicRoot)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      if (fs.existsSync(disk) && fs.statSync(disk).isFile()) {
        const buf = fs.readFileSync(disk);
        const ext = path.extname(disk).toLowerCase();
        const type =
          ext === '.png'
            ? 'image/png'
            : ext === '.webp'
              ? 'image/webp'
              : ext === '.gif'
                ? 'image/gif'
                : 'image/jpeg';
        return new NextResponse(buf, {
          headers: {
            'Content-Type': type,
            'Cache-Control': 'private, no-store',
          },
        });
      }
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const candidates = storageKeyCandidates(rel, user.tenantId);
    if (candidates.length === 0) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const key = await firstExistingKey(candidates, requiredPrefix);
    if (!key) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
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
      details: { key, via: 'api/files/[...path]', legacyPath: rel },
    });

    return NextResponse.redirect(targetUrl);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to resolve file';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
