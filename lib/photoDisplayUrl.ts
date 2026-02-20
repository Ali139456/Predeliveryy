/**
 * Returns the display URL for a photo (for <img src> or Next/Image).
 * Uses full Supabase Storage URL when we only have a path, so images don't 404.
 */
export function getPhotoDisplayUrl(photo: string | { fileName: string; url?: string }): string {
  if (typeof photo === 'string') {
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    if (photo.startsWith('inspections/')) return buildSupabaseStorageUrl(photo);
    return `/api/files/${photo}`;
  }
  if (photo.url) return photo.url;
  const fileName = photo.fileName;
  if (!fileName) return '';
  if (fileName.startsWith('http://') || fileName.startsWith('https://')) return fileName;
  if (fileName.startsWith('inspections/')) return buildSupabaseStorageUrl(fileName);
  return `/api/files/${fileName}`;
}

function buildSupabaseStorageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return `/api/files/${path}`;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'inspections';
  return `${base.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${path}`;
}
