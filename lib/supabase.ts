import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    const hint =
      process.env.NODE_ENV === 'production'
        ? 'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your deployment platform.'
        : 'Define NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local';
    throw new Error(hint);
  }

  if (!supabase) {
    supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  }

  return supabase;
}

export default getSupabase;
