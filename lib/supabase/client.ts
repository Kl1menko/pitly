import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || undefined;

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase env variables are missing. Using mock mode.");
  }
  return createClient(supabaseUrl || "https://example.supabase.co", supabaseKey || "public-anon-key");
}
