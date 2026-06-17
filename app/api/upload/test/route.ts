import { NextRequest, NextResponse } from 'next/server';

/** Dev-only upload route probe — disabled in production. */
export async function GET(_request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    message: 'Upload API route is accessible (development only)',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(_request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    message: 'Upload API route accepts POST requests (development only)',
    timestamp: new Date().toISOString(),
  });
}
