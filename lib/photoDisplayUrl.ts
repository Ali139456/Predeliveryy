/**
 * Returns the display URL for a photo (for <img src>).
 * - Local dev: API often returns `url` like `/uploads/tenants/...` — use it directly (static file, no cookie).
 * - Tenant S3 keys: prefer signed redirect only when no usable direct URL (avoids Next/Image + auth edge cases).
 * - Absolute `url` (e.g. fresh presigned S3) used when key-based path is not tenant-scoped.
 */
export function getPhotoDisplayUrl(photo: string | { fileName?: string; url?: string }): string {
  if (typeof photo === 'string') {
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    if (photo.startsWith('tenants/')) return `/api/files/signed?key=${encodeURIComponent(photo)}`;
    return `/api/files/${photo}`;
  }

  const fileName = photo.fileName?.trim() ?? '';
  const url = photo.url?.trim() ?? '';

  // Same-origin static files from local upload (no auth cookie needed)
  if (url.startsWith('/uploads/')) {
    return url;
  }

  if (fileName.startsWith('tenants/')) {
    return `/api/files/signed?key=${encodeURIComponent(fileName)}`;
  }

  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    return url;
  }

  if (!fileName) {
    return url.startsWith('/') ? url : '';
  }

  if (fileName.startsWith('http://') || fileName.startsWith('https://')) return fileName;
  return `/api/files/${fileName}`;
}
