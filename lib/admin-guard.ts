import { getSessionUser } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export interface AdminIdentity {
  email: string;
  userId: string;
}

// The single authorization gate for the admin surface. Succeeds only when:
//   1. there is a valid, JWT-verified session in the cookies, AND
//   2. that session's email is allow-listed in the `admins` table.
// The email comes from the verified session — never from a client-supplied
// param. Fails closed (null on any error), so callers turn it into a 401/403
// or a redirect.
export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  try {
    const user = await getSessionUser();
    const email = user?.email?.trim().toLowerCase();
    if (!user || !email) return null;

    const { data, error } = await supabaseAdmin()
      .from("admins")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (error || !data) return null;
    return { email, userId: user.id };
  } catch (err) {
    console.error("[admin-guard] check failed:", err);
    return null;
  }
}