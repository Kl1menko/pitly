import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase env variables are missing. Using mock mode.");
  }
  return createClient(supabaseUrl ?? "https://example.supabase.co", supabaseKey ?? "public-anon-key");
}
