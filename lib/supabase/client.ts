// lib/supabase/client.ts — Browser-side Supabase singleton (use in Client Components + hooks)
import { createClient } from "@supabase/supabase-js";
import { getSupabaseBrowserEnv } from "./browser-env";

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    const { url, anonKey } = getSupabaseBrowserEnv();

    client = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return client;
}
