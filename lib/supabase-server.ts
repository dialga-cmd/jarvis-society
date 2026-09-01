import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client tied to the browser session via cookies. This is
// what makes server components / route handlers able to see the signed-in user
// (the browser client stores its session in the same cookies). Uses the anon
// key + auth flow only — never privilege-escapes RLS the way supabaseAdmin() does.
export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Server Supabase env vars missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const cookieStore = cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component that can't set cookies — safe to
          // ignore; the client sets them during its own requests.
        }
      },
    },
  });
}

// Resolves the current user from the signed cookies, or null when signed out.
// `auth.getUser()` validates the JWT with Supabase Auth rather than trusting
// the cookie's claims, which is the correct server-side check.
export async function getSessionUser() {
  try {
    const {
      data: { user },
    } = await createServerSupabase().auth.getUser();
    return user ?? null;
  } catch (err) {
    console.error("[supabase-server] getSessionUser failed:", err);
    return null;
  }
}