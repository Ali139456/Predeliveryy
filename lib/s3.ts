import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

// Check if AWS credentials are configured
const hasAWSCredentials = 
  process.env.AWS_ACCESS_KEY_ID && 
  process.env.AWS_ACCESS_KEY_ID !== '' &&
  process.env.AWS_SECRET_ACCESS_KEY && 
  process.env.AWS_SECRET_ACCESS_KEY !== '';

// Initialize S3 client only if credentials are available
let s3Client: S3Client | null = null;
if (hasAWSCredentials) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'pre-delivery-inspections';

// Local storage directory for fallback
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!hasAWSCredentials) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

export async function uploadToS3(file: Buffer, fileName: string, contentType: string): Promise<string> {
  // Check if we're on Vercel (serverless environment)
  const isVercel = process.env.VERCEL === '1';
  
  // Use local storage if AWS is not configured, but not on Vercel
  if (!hasAWSCredentials || !s3Client) {
    if (isVercel) {
      throw new Error('File storage not configured. AWS S3 or Cloudinary must be configured for Vercel deployments.');
    }
    
    // Only use local storage in non-serverless environments
    try {
      const localPath = path.join(UPLOAD_DIR, fileName);
      const dir = path.dirname(localPath);
      
      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file to local storage
      fs.writeFileSync(localPath, file);
      return fileName;
    } catch (error: any) {
      throw new Error(`Local file storage failed: ${error.message}. Please configure AWS S3 or Cloudinary.`);
    }
  }

  // Use S3 if configured - with error handling
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return fileName;
  } catch (error: any) {
    // Check if we're on Vercel
    const isVercel = process.env.VERCEL === '1';
    
    // If S3 upload fails and we're on Vercel, don't try local storage
    if (isVercel) {
      throw new Error(`S3 upload failed: ${error.message}. Please check your AWS credentials.`);
    }
    
    // Only fall back to local storage in non-serverless environments
    try {
      console.warn('S3 upload failed, falling back to local storage:', error.message);
      const localPath = path.join(UPLOAD_DIR, fileName);
      const dir = path.dirname(localPath);
      
      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file to local storage
      fs.writeFileSync(localPath, file);
      return fileName;
    } catch (localError: any) {
      throw new Error(`S3 upload failed and local storage unavailable: ${error.message}`);
    }
  }
}

export async function getS3Url(fileName: string): Promise<string> {
  // For local storage, return the public URL
  if (!hasAWSCredentials || !s3Client) {
    return `/uploads/${fileName}`;
  }

  // Use S3 signed URL if configured
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function deleteFromS3(fileName: string): Promise<void> {
  // Delete from local storage if AWS is not configured
  if (!hasAWSCredentials || !s3Client) {
    const localPath = path.join(UPLOAD_DIR, fileName);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    return;
  }

  // Delete from S3 if configured
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  });

  await s3Client.send(command);
}


