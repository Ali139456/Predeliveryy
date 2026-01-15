# Vercel Blob Storage Setup Guide

This application now uses **Vercel Blob Storage** for file uploads on Vercel. This is Vercel's native storage solution, so no external services are required.

## Setup Instructions

### 1. Get Your Blob Storage Token

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project
3. Go to **Settings** → **Storage**
4. Click **Create Database** or **Create Storage** (if you haven't created Blob Storage yet)
5. Select **Blob** as the storage type
6. Create the storage instance
7. Go to **Settings** → **Storage** → Your Blob Storage → **Settings**
8. Copy the **Read/Write Token** (it starts with `vercel_blob_rw_`)

### 2. Add Environment Variable to Vercel

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add a new environment variable:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Paste the token you copied (starts with `vercel_blob_rw_`)
   - **Environment**: Select all environments (Production, Preview, Development)
3. Click **Save**

### 3. Redeploy Your Application

After adding the environment variable, you need to redeploy:
- Go to **Deployments** tab
- Click the **⋯** menu on your latest deployment
- Select **Redeploy**

Or simply push a new commit to trigger a new deployment.

## How It Works

- **Priority Order**: The upload system tries storage options in this order:
  1. **Vercel Blob Storage** (if `BLOB_READ_WRITE_TOKEN` is set) - **Recommended for Vercel**
  2. Cloudinary (if configured)
  3. AWS S3 (if configured)
  4. Local storage (development only)

- **File URLs**: Files uploaded to Vercel Blob Storage return direct public URLs that can be used immediately. No proxying needed.

- **Client-Side Uploads**: All uploads go through the `/api/upload` route, which ensures your token is never exposed to the client.

## Troubleshooting

### Uploads Not Working

1. **Check Environment Variable**: Ensure `BLOB_READ_WRITE_TOKEN` is set in Vercel
2. **Check Token Format**: The token should start with `vercel_blob_rw_`
3. **Redeploy**: After adding the environment variable, you must redeploy
4. **Check Logs**: Check Vercel function logs for error messages

### Error: "BLOB_READ_WRITE_TOKEN is not set"

- Make sure you've added the environment variable in Vercel
- Make sure you've redeployed after adding the variable
- Check that the variable name is exactly `BLOB_READ_WRITE_TOKEN` (case-sensitive)

## Local Development

For local development, you can:
1. Use Vercel Blob Storage (set `BLOB_READ_WRITE_TOKEN` in your `.env.local`)
2. Use Cloudinary (configure Cloudinary environment variables)
3. Use AWS S3 (configure AWS credentials)
4. Use local file storage (default fallback)

The system will automatically use the first available option.

## Migration from Cloudinary

If you were previously using Cloudinary:
- Your existing files in Cloudinary will continue to work
- New uploads will use Vercel Blob Storage
- The system supports both storage backends simultaneously
- Old file URLs will continue to work through the `/api/files/[...path]` route
