import getSupabase from '@/lib/supabase';

type SupabaseClient = ReturnType<typeof getSupabase>;

/** Resolved once per process so upload and signed URLs use the same bucket. */
let cachedBucketName: string | null = null;

/**
 * Picks a bucket: env (if valid), else first of inspection / inspections, else sole bucket if only one.
 */
async function resolveStorageBucket(supabase: SupabaseClient): Promise<string> {
  if (cachedBucketName) return cachedBucketName;

  const envBucket = process.env.SUPABASE_STORAGE_BUCKET?.trim();
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new Error(
      `Supabase Storage: cannot list buckets (${error.message}). Check SUPABASE_SERVICE_ROLE_KEY and project Storage settings.`
    );
  }
  const names = new Set((buckets ?? []).map((b) => b.name));

  if (envBucket) {
    if (names.has(envBucket)) {
      cachedBucketName = envBucket;
      return envBucket;
    }
    const available = Array.from(names).join(', ') || 'none';
    throw new Error(
      `SUPABASE_STORAGE_BUCKET="${envBucket}" not found. Available buckets: ${available}.`
    );
  }

  for (const candidate of ['inspection', 'inspections']) {
    if (names.has(candidate)) {
      cachedBucketName = candidate;
      return candidate;
    }
  }

  if (names.size === 1) {
    const only = Array.from(names)[0];
    cachedBucketName = only;
    return only;
  }

  const available = Array.from(names).join(', ') || 'none';
  throw new Error(
    `No storage bucket configured. Create "inspection" or "inspections" in Supabase → Storage, or set SUPABASE_STORAGE_BUCKET to an existing bucket. Available: ${available}.`
  );
}

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
 * Upload a file to Supabase Storage (bucket from env, or auto: inspection / inspections / sole bucket).
 * Private buckets: uploads work with the service role; reads in the app use signed URLs from /api/files/signed or PDF via createSignedUrl.
 */
export async function uploadToSupabaseStorage(
  buffer: Buffer,
  filePath: string,
  contentType: string
): Promise<SupabaseUploadResult> {
  const supabase = getSupabase();
  const bucket = await resolveStorageBucket(supabase);
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed (${bucket}): ${error.message}`);
  }

  const path = data.path;
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  const url = urlData.publicUrl;

  return { path, url };
}

/**
 * Get public URL for a file in Supabase Storage (for existing paths stored as path only).
 */
export async function getSupabaseStoragePublicUrl(path: string): Promise<string> {
  const supabase = getSupabase();
  const bucket = await resolveStorageBucket(supabase);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
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
    const bucket = await resolveStorageBucket(supabase);
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(objectPath, expiresInSeconds);
    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    return pub?.publicUrl ?? null;
  } catch {
    return null;
  }
}
