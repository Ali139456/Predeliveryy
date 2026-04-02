/**
 * Returns the display URL for a photo (for <img src>).
 * - Supabase: prefer `fileName` `tenants/…` → `/api/files/signed?key=…` (auth + expiring redirect). New uploads
 *   store that pattern; avoid persisting durable public storage URLs.
 * - Local dev: `url` like `/uploads/tenants/...` — static file under public/.
 * - Legacy https URLs (S3 presign, old public Supabase links) used only when there is no `tenants/` fileName.
 */
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

  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    return url;
  }

  if (!fileName) {
    return url.startsWith('/') ? url : '';
  }

  if (fileName.startsWith('http://') || fileName.startsWith('https://')) return fileName;
  return `/api/files/${fileName}`;
}
