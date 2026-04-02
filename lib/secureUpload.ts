/**
 * Server-side upload checks: magic bytes vs declared type, block SVG/script-like payloads.
 * Full antivirus scanning needs an external service (not available on typical serverless).
 */

const IMAGE_ALLOW = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

function sniffImageMagic(buffer: Buffer): 'jpeg' | 'png' | 'gif' | 'webp' | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpeg';
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return 'gif';
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}

function sniffVideoMagic(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  if (buffer.toString('ascii', 4, 8) === 'ftyp') return true;
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) return true;
  return false;
}

/** Reject obvious text/script payloads masquerading as binary images. */
function hasSuspiciousAsciiPrefix(buffer: Buffer, maxScan = 4096): boolean {
  const n = Math.min(buffer.length, maxScan);
  const head = buffer.subarray(0, n).toString('utf8').toLowerCase();
  if (head.includes('<script')) return true;
  if (head.includes('<?php')) return true;
  if (head.trimStart().startsWith('<svg')) return true;
  if (head.trimStart().startsWith('<?xml') && head.includes('<svg')) return true;
  return false;
}

export type UploadValidationResult = { ok: true } | { ok: false; error: string };

/**
 * Validates buffer matches a safe image or video. Declared `contentType` from the client is untrusted.
 */
export function validateUploadBuffer(contentType: string, buffer: Buffer): UploadValidationResult {
  const ct = (contentType || 'application/octet-stream').split(';')[0].trim().toLowerCase();

  if (ct === 'image/svg+xml') {
    return { ok: false, error: 'SVG uploads are not allowed (executable vector content).' };
  }

  if (ct.startsWith('image/')) {
    if (!IMAGE_ALLOW.has(ct) && ct !== 'application/octet-stream') {
      return { ok: false, error: `Image type not allowed: ${ct}` };
    }
    if (hasSuspiciousAsciiPrefix(buffer)) {
      return { ok: false, error: 'Image file failed security checks (invalid content).' };
    }
    const magic = sniffImageMagic(buffer);
    if (!magic) {
      return { ok: false, error: 'File content does not match a supported image (JPEG, PNG, GIF, or WebP).' };
    }
    return { ok: true };
  }

  if (ct.startsWith('video/')) {
    if (!sniffVideoMagic(buffer)) {
      return { ok: false, error: 'Video file content could not be verified (expected MP4/MOV or WebM family).' };
    }
    return { ok: true };
  }

  return { ok: false, error: 'Only image (JPEG, PNG, GIF, WebP) or video uploads are allowed.' };
}
