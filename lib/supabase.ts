import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | null = null;

// Server-only Supabase client using the service-role key (bypasses RLS).
// Never import this module from a "use client" component — the service-role
// key must stay out of the browser bundle. Prefix-free env vars are NOT
// inlined by Next.js, so this is safe to read here.
export function supabaseAdmin(): SupabaseClient {
  if (!admin) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Server Supabase env vars missing. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env."
      );
    }
    admin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return admin;
}