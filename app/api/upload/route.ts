import { NextRequest, NextResponse } from 'next/server';
import { uploadToVercelBlob, hasVercelBlobConfig } from '@/lib/vercelBlob';
import { uploadToCloudinary, hasCloudinaryConfig } from '@/lib/cloudinary';
import { uploadToS3 } from '@/lib/s3';
import { extractEXIFMetadata } from '@/lib/exifExtractor';
import fs from 'fs';
import path from 'path';

// Ensure Node.js runtime for file uploads
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds max for uploads
export const dynamic = 'force-dynamic'; // Force dynamic rendering on Vercel

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

export async function POST(request: NextRequest) {
  // Add CORS headers and cache control immediately
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
  
  try {
    // Check request method explicitly (shouldn't be needed but helps with debugging)
    if (request.method !== 'POST') {
      return NextResponse.json(
        { success: false, error: `Method ${request.method} not allowed. Only POST is supported.` },
        { status: 405, headers: corsHeaders }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowed size of 10MB' },
        { status: 400, headers: corsHeaders }
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
        { status: 500, headers: corsHeaders }
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
    
    // Upload to Vercel Blob Storage if configured (recommended for Vercel)
    if (hasVercelBlobConfig()) {
      try {
        console.log('Uploading to Vercel Blob:', { fileName, contentType, size: buffer.length });
        const blobResult = await uploadToVercelBlob(buffer, fileName, 'inspections');
        uploadedFileName = blobResult.pathname;
        fileUrl = blobResult.url; // Use the direct Vercel Blob URL
        console.log('Vercel Blob upload successful:', { pathname: uploadedFileName, url: fileUrl });
      } catch (blobError: any) {
        console.error('Vercel Blob upload error:', {
          message: blobError.message,
          error: blobError,
          stack: blobError.stack
        });
        
        // On Vercel, Vercel Blob is required - don't fallback
        if (isVercel) {
          return NextResponse.json(
            { 
              success: false, 
              error: blobError.message || 'Failed to upload to Vercel Blob. Please check your BLOB_READ_WRITE_TOKEN environment variable on Vercel.' 
            },
            { status: 500, headers: corsHeaders }
          );
        }
        
        // For local dev, fallback to other storage options
        console.warn('Vercel Blob upload failed, falling back to other storage options');
      }
    }
    
    // If not using Vercel Blob or it failed (local dev only), try Cloudinary
    if (!uploadedFileName && hasCloudinaryConfig) {
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
        
        // On Vercel, don't fallback to local storage
        if (isVercel) {
          return NextResponse.json(
            { 
              success: false, 
              error: cloudinaryError.message || 'Failed to upload to Cloudinary. Please check your Cloudinary configuration on Vercel.' 
            },
            { status: 500, headers: corsHeaders }
          );
        }
        
        // For local dev, fallback to local storage
        console.warn('Cloudinary upload failed, falling back to local storage');
      }
    }
    
    // If not using Vercel Blob or Cloudinary, try S3 (local dev only)
    if (!uploadedFileName) {
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
              { status: 500, headers: corsHeaders }
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
              error: 'File storage is not properly configured. Please configure Vercel Blob Storage (BLOB_READ_WRITE_TOKEN) for file uploads on Vercel.' 
            },
            { status: 500, headers: corsHeaders }
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
            { status: 500, headers: corsHeaders }
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
        { status: 500, headers: corsHeaders }
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
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error('Unexpected upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred during upload' },
      { status: 500, headers: corsHeaders }
    );
  }
}



