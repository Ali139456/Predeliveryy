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
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
      console.error('Upload API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
    } catch (e) {
      // If response is not JSON, try to get text
      try {
        const text = await response.text();
        errorMessage = text || errorMessage;
        console.error('Upload API error (non-JSON):', {
          status: response.status,
          statusText: response.statusText,
          body: text,
        });
      } catch (textError) {
        console.error('Upload API error (could not read response):', {
          status: response.status,
          statusText: response.statusText,
        });
      }
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Upload failed');
  }

  return {
    fileName: data.fileName,
    url: data.url,
    metadata: data.metadata || null,
  };
}
