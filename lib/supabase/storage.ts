'use client';

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function uploadPhoto(file: File): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const bucket = "request-photos";
  const path = `${crypto.randomUUID()}-${file.name}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });
  if (error) {
    console.warn("Upload failed", error);
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data.publicUrl) {
    throw new Error("photo_public_url_missing");
  }
  return data.publicUrl;
}
