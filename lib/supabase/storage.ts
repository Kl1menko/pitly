'use client';

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function uploadPhoto(file: File): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const bucket = "request-photos";
  const path = `${crypto.randomUUID()}-${file.name}`;

  try {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.warn("Upload failed, using local preview", err);
    return URL.createObjectURL(file);
  }
}
