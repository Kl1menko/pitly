import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || undefined;
const isProduction = process.env.NODE_ENV === "production";
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseKey) {
    if (isProduction) {
      throw new Error("Supabase public env variables are missing");
    }
    console.warn("Supabase env variables are missing. Using mock mode.");
  }
  if (!browserClient) {
    browserClient = createClient(supabaseUrl || "https://example.supabase.co", supabaseKey || "public-anon-key");
  }
  return browserClient;
}
