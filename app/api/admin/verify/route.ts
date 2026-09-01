import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

// Reports whether the *session's* email is allow-listed in admins. The email
// is resolved server-side from the signed cookies — the client never gets to
// choose who is verified. No auth here: callers just need to know how to
// render the login state.
export async function GET() {
  try {
    const user = await getSessionUser();
    const email = user?.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ ok: true, isAdmin: false });
    }

    const { data, error } = await supabaseAdmin()
      .from("admins")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ ok: true, isAdmin: !!data });
  } catch (err) {
    console.error("Admin verification failed:", err);
    return NextResponse.json({ ok: false, error: "could not verify admin" });
  }
}