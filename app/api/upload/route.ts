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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
  
  // Log that the route was hit
  console.log('=== UPLOAD ROUTE HIT ===');
  console.log('Request method:', request.method);
  console.log('Request URL:', request.url);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Log storage configuration for debugging
    const isVercel = process.env.VERCEL === '1';
    const hasBlob = hasVercelBlobConfig();
    const hasCloudinary = hasCloudinaryConfig;
    const hasAWS = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    
    console.log('Upload request received:', {
      isVercel,
      hasBlob,
      hasCloudinary,
      hasAWS,
      blobTokenSet: !!process.env.BLOB_READ_WRITE_TOKEN,
      cloudinaryConfigured: !!(
        process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET
      ),
    });
    // Check request method explicitly (shouldn't be needed but helps with debugging)
    if (request.method !== 'POST') {
      console.error('Invalid method:', request.method);
      return NextResponse.json(
        { success: false, error: `Method ${request.method} not allowed. Only POST is supported.` },
        { status: 405, headers: corsHeaders }
      );
    }
    
    console.log('Reading form data...');
    let formData: FormData;
    try {
      formData = await request.formData();
      console.log('Form data read successfully');
    } catch (formDataError: any) {
      console.error('Error reading form data:', formDataError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to read form data: ${formDataError.message || 'Unknown error'}` 
        },
        { status: 400, headers: corsHeaders }
      );
    }
    
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
    
    // Try Cloudinary first if configured (more reliable)
    // Then try Vercel Blob as fallback
    if (hasCloudinaryConfig) {
      try {
        console.log('=== ATTEMPTING CLOUDINARY UPLOAD ===');
        console.log('Cloudinary config check:', {
          cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
          apiKey: !!process.env.CLOUDINARY_API_KEY,
          apiSecret: !!process.env.CLOUDINARY_API_SECRET,
        });
        console.log('Uploading to Cloudinary:', { fileName, contentType, size: buffer.length });
        const publicId = await uploadToCloudinary(buffer, fileName, 'inspections');
        uploadedFileName = publicId;
        fileUrl = `/api/files/${publicId}`;
        console.log('=== CLOUDINARY UPLOAD SUCCESSFUL ===', { publicId, fileUrl });
      } catch (cloudinaryError: any) {
        console.error('=== CLOUDINARY UPLOAD FAILED ===');
        console.error('Cloudinary upload error:', {
          message: cloudinaryError.message,
          error: cloudinaryError,
          stack: cloudinaryError.stack,
          name: cloudinaryError.name,
        });
        
        // On Vercel, if Cloudinary fails, try Vercel Blob as fallback
        if (isVercel && hasVercelBlobConfig()) {
          console.warn('Cloudinary upload failed, trying Vercel Blob as fallback');
        } else if (isVercel) {
          // On Vercel without Vercel Blob, return error immediately
          console.error('Cloudinary failed on Vercel and no Vercel Blob fallback available');
          return NextResponse.json(
            { 
              success: false, 
              error: `Cloudinary upload failed: ${cloudinaryError.message || 'Please check your Cloudinary configuration on Vercel.'}` 
            },
            { status: 500, headers: corsHeaders }
          );
        } else {
          // For local dev, fallback to local storage
          console.warn('Cloudinary upload failed, will try local storage (dev only)');
        }
      }
    } else {
      console.warn('Cloudinary is not configured. hasCloudinaryConfig =', hasCloudinaryConfig);
    }
    
    // If Cloudinary not configured or failed, try Vercel Blob Storage
    if (!uploadedFileName && hasVercelBlobConfig()) {
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
          status: blobError.status || blobError.statusCode,
          stack: blobError.stack
        });
        
        // Check if it's a 403 or permission error
        const isPermissionError = 
          blobError.status === 403 || 
          blobError.statusCode === 403 ||
          blobError.message?.includes('403') ||
          blobError.message?.includes('Forbidden') ||
          blobError.message?.includes('permission') ||
          blobError.message?.includes('unauthorized');
        
        // If it's a permission error, provide helpful message
        if (isPermissionError) {
          console.error('Vercel Blob returned 403/Forbidden. This usually means:');
          console.error('1. The BLOB_READ_WRITE_TOKEN is invalid or expired');
          console.error('2. The Blob store is paused or deleted');
          console.error('3. The token does not have write permissions');
        }
        
        // On Vercel without Cloudinary fallback, return error
        if (isVercel && !hasCloudinaryConfig) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Vercel Blob upload failed: ${blobError.message || 'Permission denied (403). Please check: 1) BLOB_READ_WRITE_TOKEN is valid, 2) Blob store is active, 3) Token has write permissions. Or configure Cloudinary as an alternative.'}`
            },
            { status: 500, headers: corsHeaders }
          );
        } else {
          // For local dev or if Cloudinary is available, fallback to other storage options
          console.warn('Vercel Blob upload failed, falling back to other storage options');
        }
      }
    }
    
    // If not using Cloudinary or Vercel Blob, try S3 (local dev only)
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
      
      // If S3 not configured or failed, check if we should use local storage
      if (!uploadedFileName) {
        // NEVER use local storage on Vercel - it's read-only
        if (isVercel) {
          console.error('All storage options failed on Vercel. Cloudinary, Vercel Blob, and S3 all failed or are not configured.');
          return NextResponse.json(
            { 
              success: false, 
              error: 'File storage failed. Please check: 1) Cloudinary configuration is correct, 2) Vercel Blob token is valid (if using), 3) AWS credentials are correct (if using S3). Local file storage is not available on Vercel.' 
            },
            { status: 500, headers: corsHeaders }
          );
        }
        
        // Only use local storage for local development
        console.log('Attempting local file storage (development only)');
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
    console.error('=== UNEXPECTED UPLOAD ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error:', error);
    
    const errorMessage = error?.message || 'An unexpected error occurred during upload';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500, headers: corsHeaders }
    );
  }
}



