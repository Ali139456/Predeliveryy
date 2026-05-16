import { NextResponse } from 'next/server';
import { oauthProvidersEnabled } from '@/lib/oauth';

export async function GET() {
  return NextResponse.json({ success: true, providers: oauthProvidersEnabled() });
}
