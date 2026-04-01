import getSupabase from '@/lib/supabase';

/** Must match an existing bucket in Supabase Dashboard (override with SUPABASE_STORAGE_BUCKET). */
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'inspection';

export function hasSupabaseStorageConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export interface SupabaseUploadResult {
  path: string;
  url: string;
}

/**
 * Upload a file to Supabase Storage (default bucket `inspections` or SUPABASE_STORAGE_BUCKET).
 * Private buckets: uploads work with the service role; reads in the app use signed URLs from /api/files/signed or PDF via createSignedUrl.
 */
export async function uploadToSupabaseStorage(
  buffer: Buffer,
  filePath: string,
  contentType: string
): Promise<SupabaseUploadResult> {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const path = data.path;
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const url = urlData.publicUrl;

  return { path, url };
}

/**
 * Get public URL for a file in Supabase Storage (for existing paths stored as path only).
 */
export function getSupabaseStoragePublicUrl(path: string): string {
  const supabase = getSupabase();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Signed URL for private buckets; falls back to public URL if signing is not available.
 * Used by /api/files/signed for tenant-scoped paths.
 */
export async function getSupabaseStorageSignedOrPublicUrl(
  objectPath: string,
  expiresInSeconds: number
): Promise<string | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(objectPath, expiresInSeconds);
    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    return pub?.publicUrl ?? null;
  } catch {
    return null;
  }
}
