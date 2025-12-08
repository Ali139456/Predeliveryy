import { NextRequest, NextResponse } from 'next/server';
import { getS3Url } from '@/lib/s3';
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


