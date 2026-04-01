/**
 * Returns the display URL for a photo (for <img src>).
 * - Private Supabase buckets: `getPublicUrl`-style URLs in `url` are not usable in the browser; always use
 *   `/api/files/signed?key=…` when `fileName` is `tenants/…` (server issues a short-lived signed URL).
 * - Local dev: `url` like `/uploads/tenants/...` — static file under public/.
 * - Other https `url` values (e.g. legacy presigned S3) used only when there is no tenant path.
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
