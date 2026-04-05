/**
 * Returns the display URL for a photo (for <img src>).
 * - Supabase: `fileName` `tenants/…` → `/api/files/signed?key=…` (auth + expiring redirect).
 * - If `url` is already `/api/files/signed?…` or an absolute signed URL, use it (avoids `/api/files/{fileName}` 404
 *   when `fileName` is a display label or legacy basename).
 * - Local dev: `url` like `/uploads/tenants/...` — static file under public/.
 * - Legacy https URLs (S3 presign, Blob, old public links).
 */
function isSignedFilesUrl(u: string): boolean {
  if (u.startsWith('/api/files/signed')) return true;
  try {
    const parsed = new URL(u);
    const p = parsed.pathname.replace(/\/$/, '');
    return p.endsWith('/api/files/signed') && !!parsed.searchParams.get('key');
  } catch {
    return false;
  }
}

export function getPhotoDisplayUrl(photo: string | { fileName?: string; url?: string }): string {
  if (typeof photo === 'string') {
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    if (photo.startsWith('tenants/')) return `/api/files/signed?key=${encodeURIComponent(photo)}`;
    return `/api/files/${photo}`;
  }

  const fileName = photo.fileName?.trim() ?? '';
  const url = photo.url?.trim() ?? '';

  if (url.startsWith('/uploads/')) {
    return url;
  }

  if (fileName.startsWith('tenants/')) {
    return `/api/files/signed?key=${encodeURIComponent(fileName)}`;
  }

  if (url && isSignedFilesUrl(url)) {
    return url;
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
