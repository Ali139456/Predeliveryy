import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
const hasCloudinaryConfig = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== '' &&
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_KEY !== '' &&
  process.env.CLOUDINARY_API_SECRET && 
  process.env.CLOUDINARY_API_SECRET !== '';

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Convert buffer to stream
function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

export async function uploadToCloudinary(
  file: Buffer,
  fileName: string,
  folder: string = 'inspections'
): Promise<string> {
  if (!hasCloudinaryConfig) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        public_id: fileName.replace(/\.[^/.]+$/, ''), // Remove extension for public_id
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          // Return the public_id with folder path
          resolve(result.public_id);
        } else {
          reject(new Error('Upload failed: No result returned'));
        }
      }
    );

    bufferToStream(file).pipe(stream);
  });
}

export function getCloudinaryUrl(publicId: string, options: {
  width?: number;
  height?: number;
  quality?: string | number;
  format?: string;
} = {}): string {
  if (!hasCloudinaryConfig) {
    return `/uploads/${publicId}`;
  }

  const transformations: string[] = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);

  const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';
  
  return cloudinary.url(publicId, {
    secure: true,
    transformation: transformations.length > 0 ? [{ 
      width: options.width,
      height: options.height,
      quality: options.quality,
      format: options.format,
    }] : undefined,
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!hasCloudinaryConfig) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    // Don't throw - allow deletion to fail silently
  }
}

export { hasCloudinaryConfig };

