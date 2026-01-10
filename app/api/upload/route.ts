import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, hasCloudinaryConfig } from '@/lib/cloudinary';
import { uploadToS3 } from '@/lib/s3';
import { extractEXIFMetadata } from '@/lib/exifExtractor';

// Ensure Node.js runtime for file uploads
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds max for uploads

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowed size of 10MB' },
        { status: 400 }
      );
    }
    
    const fileName = `inspections/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const contentType = file.type || 'application/octet-stream';
    
    // Convert file to buffer first (can only read once)
    let bytes: ArrayBuffer;
    let buffer: Buffer;
    
    try {
      bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    } catch (bufferError: any) {
      console.error('Error converting file to buffer:', bufferError);
      return NextResponse.json(
        { success: false, error: 'Failed to process file. Please try again.' },
        { status: 500 }
      );
    }
    
    // Extract EXIF metadata using the buffer (non-blocking - don't fail upload if this fails)
    let metadata = null;
    try {
      // Only extract EXIF if file is an image
      if (contentType && contentType.startsWith('image/')) {
        try {
          // Use buffer directly for EXIF extraction
          metadata = await extractEXIFMetadata(buffer, file.name, file.size, contentType);
        } catch (exifError: any) {
          // If EXIF extraction fails, skip it (non-critical)
          console.warn('EXIF extraction failed (non-critical, upload continues):', exifError.message || exifError);
          metadata = null;
        }
      }
    } catch (exifError: any) {
      // If EXIF extraction fails, continue without metadata - this is non-critical
      console.warn('EXIF extraction failed (non-critical, upload continues):', exifError.message || exifError);
      metadata = null;
    }
    
    let uploadedFileName: string;
    let fileUrl: string;
    
    // Upload to Cloudinary if configured, otherwise try S3, then local storage
    if (hasCloudinaryConfig) {
      try {
        console.log('Uploading to Cloudinary:', { fileName, contentType, size: buffer.length });
        const publicId = await uploadToCloudinary(buffer, fileName, 'inspections');
        uploadedFileName = publicId;
        fileUrl = `/api/files/${publicId}`;
        console.log('Cloudinary upload successful:', { publicId, fileUrl });
      } catch (cloudinaryError: any) {
        console.error('Cloudinary upload error:', {
          message: cloudinaryError.message,
          error: cloudinaryError,
          stack: cloudinaryError.stack
        });
        
        // Return a proper error response
        const errorMessage = cloudinaryError.message || 
          cloudinaryError.error?.message || 
          'Failed to upload to Cloudinary. Please check your configuration and try again.';
        
        return NextResponse.json(
          { 
            success: false, 
            error: errorMessage
          },
          { status: 500 }
        );
      }
    } else {
      // Fallback to S3 or local storage
      try {
        await uploadToS3(buffer, fileName, contentType);
        uploadedFileName = fileName;
        fileUrl = `/api/files/${fileName}`;
      } catch (uploadError: any) {
        console.error('Upload error:', uploadError);
        
        // On Vercel, local file storage is not available
        const isVercel = process.env.VERCEL === '1';
        
        if (isVercel || uploadError.message?.includes('AWS') || uploadError.message?.includes('Access Key') || uploadError.message?.includes('ENOENT') || uploadError.message?.includes('read-only') || uploadError.message?.includes('not configured')) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'File storage is not properly configured. Please configure Cloudinary (recommended) or AWS S3 for file uploads on Vercel.' 
            },
            { status: 500 }
          );
        }
        
        // Return proper JSON error for any other upload errors
        return NextResponse.json(
          { 
            success: false, 
            error: uploadError.message || 'File upload failed. Please try again or contact support.' 
          },
          { status: 500 }
        );
      }
    }
    
    // Always return a proper JSON response
    const responseData = {
      success: true,
      fileName: uploadedFileName,
      url: fileUrl,
      metadata: metadata ? {
        width: metadata.width,
        height: metadata.height,
        make: metadata.make,
        model: metadata.model,
        dateTime: metadata.dateTime,
        latitude: metadata.latitude,
        longitude: metadata.longitude,
      } : null,
    };
    
    console.log('Upload successful, returning response:', { fileName: uploadedFileName, hasMetadata: !!metadata });
    
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error('Unexpected upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred during upload' },
      { status: 500 }
    );
  }
}



