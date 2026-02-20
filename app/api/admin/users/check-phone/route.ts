import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }
    const supabase = getSupabase();
    const { data } = await supabase.from('users').select('id').eq('phone_number', phone.trim()).single();
    return NextResponse.json({ success: true, exists: !!data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check phone number';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
