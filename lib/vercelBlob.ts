import { put, list, del } from '@vercel/blob';

/**
 * Upload a file to Vercel Blob Storage
 * @param file - File buffer or File object
 * @param fileName - Name for the file in blob storage
 * @param folder - Optional folder path (e.g., 'inspections')
 * @returns Object with url and pathname
 */
export async function uploadToVercelBlob(
  file: Buffer | File,
  fileName: string,
  folder: string = 'inspections'
): Promise<{ url: string; pathname: string }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is not set. Please add it to your Vercel environment variables.'
    );
  }

  // Construct the full path with folder
  const fullPath = folder ? `${folder}/${fileName}` : fileName;

  // Convert File to Buffer if needed
  let buffer: Buffer;
  let contentType: string | undefined;

  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    contentType = file.type || undefined;
  } else {
    buffer = file;
  }

  try {
    const blob = await put(fullPath, buffer, {
      access: 'public',
      token,
      contentType,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
    };
  } catch (error: any) {
    console.error('Vercel Blob upload error:', error);
    throw new Error(
      `Failed to upload to Vercel Blob: ${error.message || 'Unknown error'}`
    );
  }
}

/**
 * Delete a file from Vercel Blob Storage
 * @param url - The URL of the blob to delete
 */
export async function deleteFromVercelBlob(url: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is not set. Please add it to your Vercel environment variables.'
    );
  }

  try {
    await del(url, { token });
  } catch (error: any) {
    console.error('Vercel Blob delete error:', error);
    throw new Error(
      `Failed to delete from Vercel Blob: ${error.message || 'Unknown error'}`
    );
  }
}

/**
 * List files in Vercel Blob Storage
 * @param prefix - Optional prefix to filter files (e.g., 'inspections/')
 */
export async function listVercelBlobs(prefix?: string): Promise<any[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is not set. Please add it to your Vercel environment variables.'
    );
  }

  try {
    const { blobs } = await list({ prefix, token });
    return blobs;
  } catch (error: any) {
    console.error('Vercel Blob list error:', error);
    throw new Error(
      `Failed to list Vercel Blobs: ${error.message || 'Unknown error'}`
    );
  }
}

/**
 * Check if Vercel Blob is configured
 */
export function hasVercelBlobConfig(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}
