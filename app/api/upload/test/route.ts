import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint to verify the route is accessible
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Upload API route is accessible',
    timestamp: new Date().toISOString(),
    environment: {
      isVercel: process.env.VERCEL === '1',
      nodeEnv: process.env.NODE_ENV,
    },
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Upload API route accepts POST requests',
    timestamp: new Date().toISOString(),
  });
}
