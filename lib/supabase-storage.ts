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
  // Do not expose long-lived public object URLs; UI uses cookie-auth `/api/files/signed` → short-lived Supabase signed URL.
  const url = `/api/files/signed?key=${encodeURIComponent(path)}`;

  return { path, url };
}

/**
 * Short-lived signed URL only (no public object URL). Prefer `/api/files/signed` from the browser.
 */
export async function getSupabaseStoragePublicUrl(
  path: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  return getSupabaseStorageSignedOrPublicUrl(path, expiresInSeconds);
}

/**
 * Expiring signed URL for private buckets only (no getPublicUrl fallback — avoids durable public links).
 * Used by /api/files/signed and PDF image fetch.
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
    return null;
  } catch {
    return null;
  }
}

/** Server-side binary read (e.g. PDF generation). Avoids signed-URL HTTP redirects and fetch edge cases. */
export async function downloadSupabaseStorageObject(objectPath: string): Promise<Buffer | null> {
  try {
    const supabase = getSupabase();
    const bucket = await resolveStorageBucket(supabase);
    const { data, error } = await supabase.storage.from(bucket).download(objectPath);
    if (error || !data) return null;
    const ab = await data.arrayBuffer();
    const buf = Buffer.from(ab);
    return buf.length > 0 ? buf : null;
  } catch {
    return null;
  }
}
