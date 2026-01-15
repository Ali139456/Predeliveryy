import { NextRequest, NextResponse } from 'next/server';

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
    
    // Vercel Blob URLs are returned directly from upload, so we shouldn't need to reconstruct them
    // If we get here with a pathname, it means the file wasn't found or the URL is invalid
    return NextResponse.json(
      { success: false, error: 'File not found. Vercel Blob URLs should be used directly.' },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


