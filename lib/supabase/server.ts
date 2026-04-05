// lib/supabase/server.ts — Server-side Supabase client (Server Components + API routes only)
import { createClient } from "@supabase/supabase-js";

export function getSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
