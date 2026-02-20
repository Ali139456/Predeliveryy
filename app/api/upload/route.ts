import { NextRequest, NextResponse } from 'next/server';
import { uploadToSupabaseStorage, hasSupabaseStorageConfig } from '@/lib/supabase-storage';
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
    // Check storage configuration
    const hasStorage = hasSupabaseStorageConfig();
    console.log('Upload request received:', { hasSupabaseStorage: hasStorage });
    
    if (!hasStorage) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Create a public Storage bucket named "inspections" in Supabase Dashboard.' 
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
    
    // Upload to Supabase Storage
    let uploadedFileName: string | undefined;
    let fileUrl: string | undefined;
    
    try {
      console.log('Uploading to Supabase Storage:', { fileName, contentType, size: buffer.length });
      const result = await uploadToSupabaseStorage(buffer, fileName, contentType);
      uploadedFileName = result.path;
      fileUrl = result.url;
      console.log('Supabase Storage upload successful:', { path: uploadedFileName, url: fileUrl });
    } catch (storageError: any) {
      console.error('Supabase Storage upload failed:', storageError?.message || storageError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Upload failed: ${storageError?.message || 'Storage error'}. Ensure the "inspections" bucket exists in Supabase Dashboard (Storage) and is set to Public.`
        },
        { status: 500, headers: corsHeaders }
      );
    }
    
    if (!uploadedFileName || !fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Failed to upload file. Please try again.' },
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



