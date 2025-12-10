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
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileName = `inspections/${Date.now()}-${file.name}`;
    const contentType = file.type;
    
    let uploadedFileName: string;
    let fileUrl: string;
    
    // Upload to Cloudinary if configured, otherwise try S3, then local storage
    if (hasCloudinaryConfig) {
      try {
        const publicId = await uploadToCloudinary(buffer, fileName, 'inspections');
        uploadedFileName = publicId;
        fileUrl = `/api/files/${publicId}`;
      } catch (cloudinaryError: any) {
        return NextResponse.json(
          { 
            success: false, 
            error: cloudinaryError.message || 'Failed to upload to Cloudinary' 
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
        // If upload fails, return a more user-friendly error
        if (uploadError.message?.includes('AWS') || uploadError.message?.includes('Access Key')) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'File storage is not properly configured. Please contact the administrator.' 
            },
            { status: 500 }
          );
        }
        throw uploadError;
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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


