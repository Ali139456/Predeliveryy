/**
 * Returns the display URL for a photo (for <img src> or Next/Image).
 * For private storage, uses a signed URL redirect endpoint.
 */
export function getPhotoDisplayUrl(photo: string | { fileName: string; url?: string }): string {
  if (typeof photo === 'string') {
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    // Private object key
    if (photo.startsWith('tenants/')) return `/api/files/signed?key=${encodeURIComponent(photo)}`;
    return `/api/files/${photo}`;
  }
  // Stored url is only for immediate previews; prefer key-based signed access where possible
  const fileName = photo.fileName;
  if (!fileName) return '';
  if (fileName.startsWith('http://') || fileName.startsWith('https://')) return fileName;
  if (fileName.startsWith('tenants/')) return `/api/files/signed?key=${encodeURIComponent(fileName)}`;
  return `/api/files/${fileName}`;
}
