/**
 * Client-side helper for uploading files to Vercel Blob via the server API route
 * This ensures the BLOB_READ_WRITE_TOKEN is never exposed to the client
 */

export interface UploadResult {
  fileName: string;
  url: string;
  metadata?: {
    width?: number;
    height?: number;
    make?: string;
    model?: string;
    dateTime?: string;
    latitude?: number;
    longitude?: number;
    format?: string;
    bytes?: number;
  } | null;
}

/**
 * Upload a file to Vercel Blob Storage via the server API route
 * @param file - File object to upload
 * @returns Upload result with fileName, url, and metadata
 */
export async function uploadToVercelBlobViaAPI(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
    const raw = await response.text();
    if (raw) {
      const trimmed = raw.trimStart();
      if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
        errorMessage =
          'Server error while uploading (check Vercel logs). If you use Supabase only, ensure storage env vars and bucket exist.';
      } else {
        try {
          const errorData = JSON.parse(raw) as { error?: string; message?: string };
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = raw.length > 200 ? `${raw.slice(0, 200)}…` : raw;
        }
      }
    }
    console.error('Upload API error:', { status: response.status, statusText: response.statusText, body: raw?.slice(0, 500) });
    throw new Error(errorMessage);
  }

  let data: { success?: boolean; error?: string; fileName?: string; url?: string; metadata?: UploadResult['metadata'] };
  try {
    data = JSON.parse(await response.text()) as typeof data;
  } catch {
    throw new Error('Invalid response from upload server');
  }

  if (!data.success) {
    throw new Error(data.error || 'Upload failed');
  }

  const fileName = data.fileName;
  const url = data.url;
  if (!fileName || !url) {
    throw new Error('Upload response missing file URL');
  }

  return {
    fileName,
    url,
    metadata: data.metadata || null,
  };
}
