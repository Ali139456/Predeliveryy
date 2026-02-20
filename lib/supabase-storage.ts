import getSupabase from '@/lib/supabase';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'inspections';

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
 * Upload a file to Supabase Storage (inspections bucket).
 * Bucket must be created in Supabase Dashboard and set to Public for getPublicUrl to work.
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
