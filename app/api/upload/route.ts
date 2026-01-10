import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, hasCloudinaryConfig } from '@/lib/cloudinary';
import { uploadToS3 } from '@/lib/s3';
import { extractEXIFMetadata } from '@/lib/exifExtractor';
import fs from 'fs';
import path from 'path';

// Ensure Node.js runtime for file uploads
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds max for uploads

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

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
    
    let uploadedFileName: string | undefined;
    let fileUrl: string | undefined;
    
    // Check if we're on Vercel
    const isVercel = process.env.VERCEL === '1';
    
    // Upload to Cloudinary if configured (recommended for Vercel)
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
        
        // On Vercel, Cloudinary is required - don't fallback
        if (isVercel) {
          return NextResponse.json(
            { 
              success: false, 
              error: cloudinaryError.message || 'Failed to upload to Cloudinary. Please check your Cloudinary configuration on Vercel.' 
            },
            { status: 500 }
          );
        }
        
        // For local dev, fallback to local storage
        console.warn('Cloudinary upload failed, falling back to local storage');
      }
    }
    
    // If not using Cloudinary or Cloudinary failed (local dev only), use local storage or S3
    if (!uploadedFileName) {
      // Try S3 first if configured
      const hasAWS = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
      
      if (hasAWS) {
        try {
          await uploadToS3(buffer, fileName, contentType);
          uploadedFileName = fileName;
          fileUrl = `/uploads/${fileName}`;
        } catch (uploadError: any) {
          console.error('S3 upload error:', uploadError);
          
          // On Vercel, don't fallback to local storage
          if (isVercel) {
            return NextResponse.json(
              { 
                success: false, 
                error: 'S3 upload failed. Please check your AWS credentials.' 
              },
              { status: 500 }
            );
          }
          
          // For local dev, fallback to local storage
          console.warn('S3 upload failed, falling back to local storage');
        }
      }
      
      // If S3 not configured or failed (local dev only), use local storage
      if (!uploadedFileName) {
        if (isVercel) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'File storage is not properly configured. Please configure Cloudinary or AWS S3 for file uploads on Vercel.' 
            },
            { status: 500 }
          );
        }
        
        // Save to public/uploads for local development
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          const fullPath = path.join(uploadDir, fileName);
          const dir = path.dirname(fullPath);
          
          // Ensure directory exists
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          // Write file to public/uploads
          fs.writeFileSync(fullPath, buffer);
          uploadedFileName = fileName;
          fileUrl = `/uploads/${fileName}`;
          console.log('File saved to local storage:', { fileName, path: fullPath, url: fileUrl });
        } catch (localError: any) {
          console.error('Local file storage error:', localError);
          return NextResponse.json(
            { 
              success: false, 
              error: `Failed to save file to local storage: ${localError.message}` 
            },
            { status: 500 }
          );
        }
      }
    }
    
    // Ensure we have both fileName and URL
    if (!uploadedFileName || !fileUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to upload file. Please try again.' 
        },
        { status: 500 }
      );
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
    
    return NextResponse.json(responseData, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    console.error('Unexpected upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred during upload' },
      { status: 500 }
    );
  }
}



