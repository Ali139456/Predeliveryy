import { NextRequest, NextResponse } from 'next/server';
import { getCloudinaryUrl, hasCloudinaryConfig } from '@/lib/cloudinary';
import { getS3Url } from '@/lib/s3';
import { hasVercelBlobConfig } from '@/lib/vercelBlob';
import fs from 'fs';
import path from 'path';

const hasAWSCredentials = 
  process.env.AWS_ACCESS_KEY_ID && 
  process.env.AWS_ACCESS_KEY_ID !== '' &&
  process.env.AWS_SECRET_ACCESS_KEY && 
  process.env.AWS_SECRET_ACCESS_KEY !== '';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const fileName = params.path.join('/');
    
    // If the fileName is already a full URL (Vercel Blob URL), redirect to it
    if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
      return NextResponse.redirect(fileName);
    }
    
    // If Vercel Blob is configured and this looks like a blob pathname, 
    // we can't reconstruct the URL here, so we'll try other options
    // (Vercel Blob URLs are returned directly from upload, so this shouldn't be needed)
    
    // If Cloudinary is configured, redirect to Cloudinary URL
    if (hasCloudinaryConfig) {
      const url = getCloudinaryUrl(fileName);
      return NextResponse.redirect(url);
    }
    
    // If AWS is configured, redirect to S3 signed URL
    if (hasAWSCredentials) {
      const url = await getS3Url(fileName);
      return NextResponse.redirect(url);
    }
    
    // Otherwise, serve from local storage
    const localPath = path.join(process.cwd(), 'public', 'uploads', fileName);
    
    if (!fs.existsSync(localPath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
    
    const fileBuffer = fs.readFileSync(localPath);
    const ext = path.extname(fileName).toLowerCase();
    
    // Determine content type
    const contentTypeMap: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


