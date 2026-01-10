import { NextRequest, NextResponse } from 'next/server';

// Ensure Node.js runtime for OCR
export const runtime = 'nodejs';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// Check which OCR provider is configured
const hasGoogleCloudVision = 
  process.env.GOOGLE_CLOUD_VISION_API_KEY && 
  process.env.GOOGLE_CLOUD_VISION_API_KEY !== '';

const hasAzureVision = 
  process.env.AZURE_VISION_KEY && 
  process.env.AZURE_VISION_ENDPOINT &&
  process.env.AZURE_VISION_KEY !== '' &&
  process.env.AZURE_VISION_ENDPOINT !== '';

// Google Cloud Vision OCR
async function extractTextWithGoogleCloudVision(imageBase64: string): Promise<string> {
  if (!hasGoogleCloudVision) {
    throw new Error('Google Cloud Vision API key is not configured');
  }

  // Remove data URL prefix if present (data:image/jpeg;base64,)
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          image: {
            content: base64Data,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 10,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(errorData.error?.message || `Google Cloud Vision API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.responses && data.responses[0] && data.responses[0].textAnnotations) {
    // Return the full text annotation (first one contains all text)
    const fullTextAnnotation = data.responses[0].textAnnotations[0];
    return fullTextAnnotation?.description || '';
  }

  return '';
}

// Azure Vision OCR
async function extractTextWithAzureVision(imageBase64: string): Promise<string> {
  if (!hasAzureVision) {
    throw new Error('Azure Vision credentials are not configured');
  }

  const endpoint = process.env.AZURE_VISION_ENDPOINT;
  const key = process.env.AZURE_VISION_KEY;
  
  // Remove data URL prefix if present
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  
  const apiUrl = `${endpoint}/vision/v3.2/read/analyze`;

  // Start the read operation
  const readResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key!,
      'Content-Type': 'application/octet-stream',
    },
    body: Buffer.from(base64Data, 'base64'),
  });

  if (!readResponse.ok) {
    const errorText = await readResponse.text();
    throw new Error(`Azure Vision API error: ${readResponse.status} ${errorText}`);
  }

  // Get the operation location
  const operationLocation = readResponse.headers.get('Operation-Location');
  if (!operationLocation) {
    throw new Error('Azure Vision API did not return operation location');
  }

  // Poll for results (Azure Vision is async)
  let resultResponse;
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds max

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

    resultResponse = await fetch(operationLocation, {
      headers: {
        'Ocp-Apim-Subscription-Key': key!,
      },
    });

    if (!resultResponse.ok) {
      throw new Error(`Azure Vision API error: ${resultResponse.status}`);
    }

    const result = await resultResponse.json();
    
    if (result.status === 'succeeded') {
      // Extract text from all lines
      const textLines: string[] = [];
      if (result.analyzeResult && result.analyzeResult.readResults) {
        for (const readResult of result.analyzeResult.readResults) {
          if (readResult.lines) {
            for (const line of readResult.lines) {
              if (line.text) {
                textLines.push(line.text);
              }
            }
          }
        }
      }
      return textLines.join(' ');
    }

    if (result.status === 'failed') {
      throw new Error(result.error?.message || 'Azure Vision OCR failed');
    }

    attempts++;
  }

  throw new Error('Azure Vision OCR timeout - operation took too long');
}

export async function POST(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    const body = await request.json();
    const { imageBase64, provider } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Image data is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Determine which provider to use
    let ocrProvider = provider || 'auto';
    
    if (ocrProvider === 'auto') {
      // Auto-select based on what's configured
      if (hasGoogleCloudVision) {
        ocrProvider = 'google';
      } else if (hasAzureVision) {
        ocrProvider = 'azure';
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: 'No OCR provider configured. Please configure Google Cloud Vision (GOOGLE_CLOUD_VISION_API_KEY) or Azure Vision (AZURE_VISION_KEY and AZURE_VISION_ENDPOINT).' 
          },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    let extractedText = '';

    try {
      if (ocrProvider === 'google') {
        extractedText = await extractTextWithGoogleCloudVision(imageBase64);
      } else if (ocrProvider === 'azure') {
        extractedText = await extractTextWithAzureVision(imageBase64);
      } else {
        return NextResponse.json(
          { success: false, error: `Invalid OCR provider: ${ocrProvider}. Use 'google', 'azure', or 'auto'.` },
          { status: 400, headers: corsHeaders }
        );
      }

      // Clean up the extracted text
      extractedText = extractedText.trim().replace(/\s+/g, ' ');

      return NextResponse.json({
        success: true,
        text: extractedText,
        provider: ocrProvider,
      }, { headers: corsHeaders });
    } catch (ocrError: any) {
      console.error('OCR extraction error:', ocrError);
      return NextResponse.json(
        { 
          success: false, 
          error: `OCR extraction failed: ${ocrError.message}` 
        },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error: any) {
    console.error('OCR API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred during OCR' },
      { status: 500, headers: corsHeaders }
    );
  }
}

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

