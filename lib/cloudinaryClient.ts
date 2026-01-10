/**
 * Client-side Cloudinary helper functions
 * For direct browser-to-Cloudinary uploads (unsigned upload preset)
 */

/**
 * Get Cloudinary image URL from public_id
 * Works on both client and server side
 */
export function getCloudinaryImageUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: string | number;
  format?: string;
}): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    // Fallback to old API route if Cloudinary not configured
    return `/api/files/${publicId}`;
  }

  // If publicId is already a full URL, return it
  if (publicId.startsWith('http')) {
    return publicId;
  }

  // Build Cloudinary URL
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  if (!options || Object.keys(options).length === 0) {
    return `${baseUrl}/${publicId}`;
  }

  // Build transformation string
  const transformations: string[] = [];
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);

  const transformString = transformations.join(',');
  return `${baseUrl}/${transformString}/${publicId}`;
}

/**
 * Upload file directly to Cloudinary using unsigned upload preset
 * This should be called from client-side only
 */
export async function uploadToCloudinaryDirect(
  file: File,
  folder: string = 'inspections'
): Promise<{
  public_id: string;
  secure_url: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variables.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  if (folder) {
    formData.append('folder', folder);
  }

  // DO NOT set Content-Type manually - browser will set it with boundary
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
      // Do not set Content-Type header - browser will set it with boundary
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Upload failed';
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      errorMessage = errorText || `Upload failed: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  if (!data.secure_url || !data.public_id) {
    throw new Error('Invalid response from Cloudinary');
  }

  return {
    public_id: data.public_id,
    secure_url: data.secure_url,
    url: data.secure_url,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
  };
}
