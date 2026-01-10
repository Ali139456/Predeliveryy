import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, hasCloudinaryConfig } from '@/lib/cloudinary';
import { uploadToS3 } from '@/lib/s3';
import { extractEXIFMetadata } from '@/lib/exifExtractor';

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
    
    const fileName = `inspections/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const contentType = file.type || 'application/octet-stream';
    
    let uploadedFileName: string;
    let fileUrl: string;
    
    // Upload to Cloudinary if configured, otherwise try S3, then local storage
    if (hasCloudinaryConfig) {
      try {
        const publicId = await uploadToCloudinary(buffer, fileName, 'inspections');
        uploadedFileName = publicId;
        fileUrl = `/api/files/${publicId}`;
      } catch (cloudinaryError: any) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return NextResponse.json(
          { 
            success: false, 
            error: cloudinaryError.message || 'Failed to upload to Cloudinary. Please check your configuration.' 
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
    
    // Extract EXIF metadata
    let metadata = null;
    try {
      metadata = await extractEXIFMetadata(file);
    } catch (exifError) {
      // If EXIF extraction fails, continue without metadata
      console.warn('EXIF extraction failed:', exifError);
    }
    
    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error('Unexpected upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred during upload' },
      { status: 500 }
    );
  }
}


