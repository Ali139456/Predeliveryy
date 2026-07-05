import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/audit';
import {
  assertTenantScopedStorageKey,
  contentTypeFromStorageKey,
  parseByteRange,
} from '@/lib/file-access';
import {
  downloadSupabaseStorageObject,
  getSupabaseStorageSignedOrPublicUrl,
  hasSupabaseStorageConfig,
} from '@/lib/supabase-storage';
import { getS3Url } from '@/lib/s3';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function serveBuffer(
  buffer: Buffer,
  key: string,
  request: NextRequest
): NextResponse {
  const size = buffer.length;
  const contentType = contentTypeFromStorageKey(key);
  const range = request.headers.get('range');
  const parsed = parseByteRange(range, size);

  if (parsed) {
    const chunk = buffer.subarray(parsed.start, parsed.end + 1);
    return new NextResponse(new Uint8Array(chunk), {
      status: 206,
      headers: {
        'Content-Type': contentType,
        'Content-Range': `bytes ${parsed.start}-${parsed.end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunk.length),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(size),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=3600',
    },
  });
}

async function proxySignedUrl(
  signedUrl: string,
  key: string,
  request: NextRequest
): Promise<NextResponse | null> {
  const range = request.headers.get('range');
  const headers: HeadersInit = {};
  if (range) headers['Range'] = range;

  const upstream = await fetch(signedUrl, { headers });
  if (!upstream.ok && upstream.status !== 206) return null;

  const outHeaders = new Headers();
  outHeaders.set(
    'Content-Type',
    upstream.headers.get('Content-Type') || contentTypeFromStorageKey(key)
  );
  outHeaders.set('Accept-Ranges', upstream.headers.get('Accept-Ranges') || 'bytes');
  outHeaders.set('Cache-Control', 'private, max-age=3600');

  const contentLength = upstream.headers.get('Content-Length');
  const contentRange = upstream.headers.get('Content-Range');
  if (contentLength) outHeaders.set('Content-Length', contentLength);
  if (contentRange) outHeaders.set('Content-Range', contentRange);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { allowed } = await enforceRateLimit(request, 'api:files:stream', {
      windowSeconds: 60,
      limit: 120,
      scope: 'ip+user',
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const key = new URL(request.url).searchParams.get('key')?.trim() ?? '';
    if (!key) {
      return NextResponse.json({ success: false, error: 'Missing key' }, { status: 400 });
    }

    try {
      assertTenantScopedStorageKey(key, user.tenantId);
    } catch {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (hasSupabaseStorageConfig()) {
      const signed = await getSupabaseStorageSignedOrPublicUrl(key, 3600);
      if (signed) {
        const proxied = await proxySignedUrl(signed, key, request);
        if (proxied) {
          await logAuditEvent(request, {
            action: 'file.streamed',
            resourceType: 'file',
            resourceId: key,
            details: { key, via: 'supabase-proxy' },
          });
          return proxied;
        }
      }

      const buffer = await downloadSupabaseStorageObject(key);
      if (buffer?.length) {
        await logAuditEvent(request, {
          action: 'file.streamed',
          resourceType: 'file',
          resourceId: key,
          details: { key, via: 'supabase-download' },
        });
        return serveBuffer(buffer, key, request);
      }
    }

    if (key.startsWith('tenants/')) {
      try {
        const signed = await getS3Url(key);
        if (signed.startsWith('http')) {
          const proxied = await proxySignedUrl(signed, key, request);
          if (proxied) {
            await logAuditEvent(request, {
              action: 'file.streamed',
              resourceType: 'file',
              resourceId: key,
              details: { key, via: 's3-proxy' },
            });
            return proxied;
          }
        }
      } catch {
        /* fall through */
      }
    }

    const localPath = path.join(UPLOAD_DIR, key);
    if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
      const buffer = fs.readFileSync(localPath);
      if (buffer.length) {
        await logAuditEvent(request, {
          action: 'file.streamed',
          resourceType: 'file',
          resourceId: key,
          details: { key, via: 'local' },
        });
        return serveBuffer(buffer, key, request);
      }
    }

    return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to stream file';
    if (msg === 'Unauthorized' || msg === 'Forbidden') {
      return NextResponse.json({ success: false, error: msg }, { status: msg === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
