import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }
    const supabase = getSupabase();
    const { data } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).single();
    return NextResponse.json({ success: true, exists: !!data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check email';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
