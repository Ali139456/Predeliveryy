import { NextResponse } from 'next/server';
import { ravinPublicConfig } from '@/lib/ravin/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Public Ravin integration modes for the UI (no secrets). */
export async function GET() {
  return NextResponse.json({ success: true, config: ravinPublicConfig() });
}
