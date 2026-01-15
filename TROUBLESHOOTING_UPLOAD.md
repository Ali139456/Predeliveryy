# Troubleshooting Upload 403 Error

If you're getting a **403 Forbidden** error on `/api/upload`, here are the steps to fix it:

## Quick Fix Checklist

### 1. Check Vercel Blob Storage Setup

**If you want to use Vercel Blob Storage (Recommended):**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project
2. Go to **Storage** tab
3. Create a **Blob** storage instance if you haven't already
4. Copy the **Read/Write Token** (starts with `vercel_blob_rw_`)
5. Go to **Settings** → **Environment Variables**
6. Add: `BLOB_READ_WRITE_TOKEN` = `your_token_here`
7. **Redeploy** your application

### 2. Check Cloudinary Setup (Alternative/Fallback)

**If you prefer Cloudinary or want it as a fallback:**

1. Make sure you have Cloudinary environment variables set:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (for client-side)
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (for client-side)

2. **Redeploy** after adding environment variables

### 3. Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on the latest deployment
3. Go to **Functions** tab
4. Click on `/api/upload`
5. Check the **Logs** for error messages

Look for messages like:
- "BLOB_READ_WRITE_TOKEN is not set"
- "Vercel Blob upload error"
- "Permission denied"
- "403"

### 4. Verify Environment Variables

Make sure environment variables are set for the correct environment:
- **Production**: For production deployments
- **Preview**: For preview deployments (PR deployments)
- **Development**: For local development (not needed on Vercel)

**Important**: After adding environment variables, you **MUST redeploy** for them to take effect.

## Common Issues

### Issue: "403 Forbidden" immediately

**Possible causes:**
1. Vercel Blob token is invalid or expired
2. Vercel Blob storage instance was deleted
3. Token doesn't have write permissions

**Solution:**
- Regenerate the token in Vercel Dashboard → Storage → Your Blob → Settings
- Update the `BLOB_READ_WRITE_TOKEN` environment variable
- Redeploy

### Issue: "Upload failed" with no specific error

**Possible causes:**
1. No storage service is configured
2. All storage services failed

**Solution:**
- Check Vercel function logs for detailed error messages
- Ensure at least one storage service (Vercel Blob or Cloudinary) is configured
- Verify environment variables are set correctly

### Issue: Works locally but fails on Vercel

**Possible causes:**
1. Environment variables not set in Vercel
2. Using local file storage (which doesn't work on Vercel)

**Solution:**
- Set up Vercel Blob Storage or Cloudinary
- Make sure environment variables are added in Vercel Dashboard
- Redeploy after adding variables

## Testing Your Setup

After configuring storage, test by:

1. Going to your inspection form
2. Trying to upload an image
3. Checking browser console (F12) for errors
4. Checking Vercel function logs for detailed errors

## Still Having Issues?

1. **Check the exact error message** in:
   - Browser console (F12 → Console)
   - Vercel function logs

2. **Verify your token format**:
   - Vercel Blob token should start with `vercel_blob_rw_`
   - Should be about 40+ characters long

3. **Try Cloudinary as a temporary solution**:
   - Set up Cloudinary (see CLOUDINARY_SETUP.md)
   - The system will automatically use Cloudinary if Vercel Blob fails

4. **Contact support** with:
   - Error message from logs
   - Screenshot of environment variables (hide sensitive values)
   - Deployment URL
