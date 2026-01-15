import { NextRequest, NextResponse } from 'next/server';
import { uploadToVercelBlob, hasVercelBlobConfig } from '@/lib/vercelBlob';
import { extractEXIFMetadata } from '@/lib/exifExtractor';

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
    
    console.log('Upload request received:', {
      isVercel,
      hasBlob,
      blobTokenSet: !!process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    // Check if Vercel Blob is configured
    if (!hasBlob) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vercel Blob Storage is not configured. Please set BLOB_READ_WRITE_TOKEN environment variable in Vercel.' 
        },
        { status: 500, headers: corsHeaders }
      );
    }
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
    
    // Upload to Vercel Blob Storage
    let uploadedFileName: string | undefined;
    let fileUrl: string | undefined;
    
    try {
      console.log('=== ATTEMPTING VERCEL BLOB UPLOAD ===');
      console.log('Uploading to Vercel Blob:', { fileName, contentType, size: buffer.length });
      const blobResult = await uploadToVercelBlob(buffer, fileName, 'inspections');
      uploadedFileName = blobResult.pathname;
      fileUrl = blobResult.url; // Use the direct Vercel Blob URL
      console.log('=== VERCEL BLOB UPLOAD SUCCESSFUL ===', { pathname: uploadedFileName, url: fileUrl });
    } catch (blobError: any) {
      console.error('=== VERCEL BLOB UPLOAD FAILED ===');
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
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Vercel Blob upload failed: ${blobError.message || 'Please check: 1) BLOB_READ_WRITE_TOKEN is valid, 2) Blob store is active, 3) Token has write permissions.'}`
        },
        { status: 500, headers: corsHeaders }
      );
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



