// lib/supabase/server.ts — Server-side Supabase client (Server Components + API routes only)
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerEnv } from "./server-env";

export function getSupabaseServer() {
  const { url, serviceRoleKey } = getSupabaseServerEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
