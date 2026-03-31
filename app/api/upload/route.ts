import { NextRequest, NextResponse } from 'next/server';
import { uploadToSupabaseStorage, hasSupabaseStorageConfig } from '@/lib/supabase-storage';
import { extractEXIFMetadata } from '@/lib/exifExtractor';

// Ensure Node.js runtime for file uploads
export const runtime = 'nodejs';
export const maxDuration = 300; // large video uploads (up to 200MB) may need several minutes
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
  
  try {
    const hasStorage = hasSupabaseStorageConfig();
    if (!hasStorage) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Create a public Storage bucket named "inspections" in Supabase Dashboard.' 
        },
        { status: 500, headers: corsHeaders }
      );
    }
    if (request.method !== 'POST') {
      return NextResponse.json(
        { success: false, error: `Method ${request.method} not allowed. Only POST is supported.` },
        { status: 405, headers: corsHeaders }
      );
    }
    
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (formDataError: any) {
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
    
    const contentType = file.type || 'application/octet-stream';
    const isVideo = contentType.startsWith('video/');
    const maxSize = isVideo ? 200 * 1024 * 1024 : 10 * 1024 * 1024; // 200MB video, 10MB images
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: isVideo
            ? 'Video file size exceeds maximum allowed size of 200MB'
            : 'File size exceeds maximum allowed size of 10MB',
        },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const fileName = `inspections/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Convert file to buffer first (can only read once)
    let bytes: ArrayBuffer;
    let buffer: Buffer;
    
    try {
      bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    } catch (bufferError: any) {
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
          // EXIF extraction failed; upload continues without metadata
          metadata = null;
        }
      }
    } catch (exifError: any) {
      // If EXIF extraction fails, continue without metadata - this is non-critical
          // EXIF extraction failed; upload continues
      metadata = null;
    }
    
    // Upload to Supabase Storage
    let uploadedFileName: string | undefined;
    let fileUrl: string | undefined;
    
    try {
      const result = await uploadToSupabaseStorage(buffer, fileName, contentType);
      uploadedFileName = result.path;
      fileUrl = result.url;
    } catch (storageError: any) {
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
    
    return NextResponse.json(responseData, { 
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
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



