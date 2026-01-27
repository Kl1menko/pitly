import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase env variables are missing. Falling back to demo data.");
  }
  return createClient(supabaseUrl ?? "https://example.supabase.co", supabaseKey ?? "public-anon-key", {
    auth: {
      persistSession: false
    }
  });
}

export const supabaseReady = Boolean(supabaseUrl && supabaseKey);
