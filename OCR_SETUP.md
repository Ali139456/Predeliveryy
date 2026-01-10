# OCR Setup Guide for Compliance Plate Scanning

This guide explains how to set up OCR (Optical Character Recognition) for scanning compliance plates/stickers using either Google Cloud Vision API or Azure Vision API.

## Overview

The application supports OCR scanning for compliance plates through two providers:
- **Google Cloud Vision API** (Recommended)
- **Azure Vision API**

OCR allows you to scan compliance plates/stickers by taking a photo, which extracts text from the image automatically.

## Option 1: Google Cloud Vision API (Recommended)

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Cloud Vision API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

### Step 2: Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to Cloud Vision API for security

### Step 3: Add to Environment Variables

Add the following to your `.env.local` file (for local development) or Vercel Environment Variables:

```env
GOOGLE_CLOUD_VISION_API_KEY=your_api_key_here
```

### Pricing

- First 1,000 requests per month: **FREE**
- 1,001 - 5,000,000 requests: **$1.50 per 1,000 requests**
- See [Google Cloud Vision Pricing](https://cloud.google.com/vision/pricing) for details

## Option 2: Azure Vision API

### Step 1: Create Azure Resource

1. Go to [Azure Portal](https://portal.azure.com/)
2. Create a new **Computer Vision** resource:
   - Search for "Computer Vision" in the marketplace
   - Click "Create"
   - Choose your subscription and resource group
   - Select pricing tier (F0 for free tier, S1 for production)
   - Create the resource

### Step 2: Get Credentials

1. After creation, go to your Computer Vision resource
2. Navigate to "Keys and Endpoint"
3. Copy:
   - **Key 1** (or Key 2)
   - **Endpoint** URL

### Step 3: Add to Environment Variables

Add the following to your `.env.local` file (for local development) or Vercel Environment Variables:

```env
AZURE_VISION_KEY=your_key_here
AZURE_VISION_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
```

### Pricing

- **Free Tier (F0)**: 20 calls per minute, 5,000 calls per month
- **Standard Tier (S1)**: $1 per 1,000 transactions
- See [Azure Vision Pricing](https://azure.microsoft.com/pricing/details/cognitive-services/computer-vision/) for details

## How It Works

1. **Barcode/QR Code Scanning**: Uses the camera to scan barcodes and QR codes (existing functionality)
2. **OCR Scanning**: 
   - Click "OCR Scan" button to capture a photo with camera
   - Or click "Upload Image" to select an image file
   - The image is sent to the OCR API (Google or Azure)
   - Text is extracted from the image
   - Compliance plate numbers are automatically detected and extracted
   - The extracted text is populated in the Vehicle Identification field

## Usage

1. In the inspection form, go to **Step 2: Vehicle & Identification**
2. You'll see three options:
   - **Scan Vehicle ID**: Traditional barcode/QR code scanning
   - **OCR Scan**: Capture photo with camera for OCR
   - **Upload Image**: Upload an image file for OCR
3. For compliance plates, use **OCR Scan** or **Upload Image**
4. The extracted text will automatically populate the Vehicle Identification field

## Troubleshooting

### "No OCR provider configured" Error

- Make sure you've added the required environment variables
- For Google: `GOOGLE_CLOUD_VISION_API_KEY`
- For Azure: `AZURE_VISION_KEY` and `AZURE_VISION_ENDPOINT`
- Restart your development server after adding environment variables
- On Vercel, redeploy after adding environment variables

### OCR Not Detecting Text

- Ensure the image is clear and well-lit
- Make sure the compliance plate/sticker is in focus
- Try different angles or lighting conditions
- Check that the image size is under 10MB

### API Quota Exceeded

- Check your API usage in the provider's console
- Upgrade your plan if needed
- Wait for quota reset (usually monthly)

## Security Notes

- Never commit API keys to version control
- Use environment variables for all API keys
- Restrict API keys to specific APIs/IPs when possible
- Rotate API keys regularly
- Monitor API usage for unexpected activity

## Testing

To test OCR functionality:

1. Take a clear photo of a compliance plate or sticker
2. Use the "OCR Scan" or "Upload Image" button
3. Wait for processing (usually 1-3 seconds)
4. Verify the extracted text appears in the Vehicle Identification field

## Support

For issues with:
- **Google Cloud Vision**: Check [Google Cloud Vision Documentation](https://cloud.google.com/vision/docs)
- **Azure Vision**: Check [Azure Vision Documentation](https://docs.microsoft.com/azure/cognitive-services/computer-vision/)

