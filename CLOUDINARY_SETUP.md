# Cloudinary Setup Guide (Direct Browser Upload)

This application uses **direct browser-to-Cloudinary uploads** using **unsigned upload presets**. This avoids needing any backend code for file uploads and works perfectly on Vercel.

## Why Direct Browser Upload?

- ✅ **No backend needed** - Files upload directly from browser to Cloudinary
- ✅ **Works on Vercel** - Avoids serverless function limitations
- ✅ **Faster uploads** - Direct connection to Cloudinary CDN
- ✅ **Simple configuration** - Just 2 environment variables

## Step 1: Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up for a free account
2. Log in to your Cloudinary dashboard

## Step 2: Get Your Cloud Name

1. In your Cloudinary dashboard, go to **Settings** → **General**
2. Copy your **Cloud Name** (e.g., `your-cloud-name`)

## Step 3: Create an Unsigned Upload Preset

1. Go to **Settings** → **Upload** → **Upload presets**
2. Click **Add upload preset**
3. Configure the preset:
   - **Preset name**: `inspections-upload` (or any name you prefer)
   - **Signing Mode**: Select **Unsigned** (this is critical!)
   - **Folder**: `inspections` (optional, but recommended for organization)
   - **Format**: `auto` (to accept all image formats)
   - **Resource type**: `image`
4. Scroll down and click **Save**

## Step 4: Set Environment Variables

### For Local Development (.env.local)

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=inspections-upload
```

**Important Notes:**
- Use `NEXT_PUBLIC_` prefix (not `REACT_APP_` or `VITE_`) - this is required for Next.js
- The `NEXT_PUBLIC_` prefix makes these variables available in the browser
- Never commit `.env.local` to Git (it should be in `.gitignore`)

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | Production, Preview, Development |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `inspections-upload` | Production, Preview, Development |

4. After adding variables, **redeploy** your application for changes to take effect

## Step 5: Test the Upload

1. Restart your development server (if running locally)
2. Try uploading an image in the application
3. Check your Cloudinary dashboard → **Media Library** to verify the upload

## Troubleshooting

### "Cloudinary is not configured" Error

- **Check environment variables**: Make sure both `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` are set
- **Restart dev server**: Environment variables are only loaded on server start
- **Redeploy on Vercel**: After adding environment variables, trigger a new deployment

### "Upload failed" Error

- **Check upload preset**: Make sure the preset name matches exactly (case-sensitive)
- **Verify preset is unsigned**: Go to Settings → Upload presets and ensure "Signing Mode" is set to "Unsigned"
- **Check browser console**: Look for detailed error messages
- **Verify Cloudinary account**: Make sure your Cloudinary account is active

### Images Not Displaying

- **Check image URLs**: Old images may still use `/api/files/` route (this is handled automatically)
- **Verify Cloudinary domain**: Make sure `res.cloudinary.com` is allowed in your Next.js config (already configured)
- **Check public_id format**: Images stored as `public_id` will be automatically converted to Cloudinary URLs

## How It Works

1. **User selects image** in the browser
2. **Component calls** `uploadToCloudinaryDirect()` from `lib/cloudinaryClient.ts`
3. **FormData is created** with the file and upload preset
4. **POST request sent directly** to `https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`
5. **Cloudinary responds** with `public_id` and `secure_url`
6. **Component stores** both `public_id` (for flexibility) and `secure_url` (for immediate display)

## Security Notes

- ✅ **Unsigned upload presets** are safe for client-side use (they're limited to the preset's settings)
- ✅ **Folder organization** keeps uploads organized in your Cloudinary account
- ✅ **No API keys exposed** - only cloud name and preset name are in the browser (both are safe to expose)
- ⚠️ **Upload preset settings** control what can be uploaded (format, size, etc.) - configure carefully

## Migration from Old Upload Method

If you have existing images using the old `/api/upload` route:

- **Old images** will continue to work (the code handles both formats)
- **New uploads** will use direct Cloudinary uploads
- **Image URLs** are automatically converted to Cloudinary URLs when possible
- No database migration needed - the code handles both formats seamlessly

## Additional Resources

- [Cloudinary Upload API Documentation](https://cloudinary.com/documentation/upload_images)
- [Unsigned Upload Presets](https://cloudinary.com/documentation/upload_presets#unsigned_upload_presets)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

