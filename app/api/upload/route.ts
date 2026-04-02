import { NextRequest, NextResponse } from 'next/server';
import { extractEXIFMetadata } from '@/lib/exifExtractor';
import { uploadToS3, getS3Url } from '@/lib/s3';
import { hasSupabaseStorageConfig, uploadToSupabaseStorage } from '@/lib/supabase-storage';
import { requireAuth } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/audit';
import { validateUploadBuffer } from '@/lib/secureUpload';

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
    const { allowed } = await enforceRateLimit(request, 'api:upload', { windowSeconds: 60, limit: 30, scope: 'ip+user' });
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429, headers: corsHeaders });
    }

    const user = await requireAuth()(request);
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
    
    // Tenant-scoped key prefix (prevents cross-tenant guessing)
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = safeName.includes('.') ? safeName.split('.').pop() : '';
    const kind = isVideo ? 'videos' : 'images';
    const key = `tenants/${user.tenantId}/inspections/${kind}/${Date.now()}-${safeName}`;
    
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

    const uploadCheck = validateUploadBuffer(contentType, buffer);
    if (!uploadCheck.ok) {
      return NextResponse.json({ success: false, error: uploadCheck.error }, { status: 400, headers: corsHeaders });
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
    
    let storedPath = key;
    let previewUrl: string;

    try {
      if (hasSupabaseStorageConfig()) {
        const up = await uploadToSupabaseStorage(buffer, key, contentType);
        storedPath = up.path;
        previewUrl = up.url;
      } else {
        await uploadToS3(buffer, key, contentType);
        previewUrl = await getS3Url(key);
      }
    } catch (storageError: unknown) {
      const message = storageError instanceof Error ? storageError.message : 'Storage error';
      return NextResponse.json(
        { success: false, error: `Upload failed: ${message}` },
        { status: 500, headers: corsHeaders }
      );
    }
    await logAuditEvent(request, {
      action: 'file.uploaded',
      resourceType: 'file',
      resourceId: storedPath,
      details: { key: storedPath, contentType, bytes: file.size, ext, storage: hasSupabaseStorageConfig() ? 'supabase' : 's3_or_local' },
    });
    
    // Always return a proper JSON response
    const responseData = {
      success: true,
      fileName: storedPath,
      url: previewUrl,
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



