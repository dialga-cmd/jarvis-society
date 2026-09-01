import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// Browser-safe Supabase client (anon key) storing the session in cookies, so
// the server (via lib/supabase-server.ts) sees the exact same session and can
// authorize /admin pages and /api/admin routes with it. The NEXT_PUBLIC_ env
// vars are meant for the client bundle.
export function supabaseBrowser(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        "Browser Supabase env vars missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env."
      );
    }
    client = createBrowserClient(url, key);
  }
  return client;
}