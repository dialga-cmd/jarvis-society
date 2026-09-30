import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminIdentity } from "@/lib/admin-guard";
import { safeUrl } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
}

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s === "" ? null : s;
}

export async function GET() {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const { data, error } = await supabaseAdmin()
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ ok: true, events: data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to load events." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const name = str(body.name);
    
    if (!name) {
      return NextResponse.json({ ok: false, message: "Name is required." }, { status: 400 });
    }

    const registration_link = safeUrl(body.registration_link);
    const youtube_link = safeUrl(body.youtube_link);
    
    const { error } = await supabaseAdmin().from("events").insert({
      name,
      registration_link,
      description: str(body.description),
      youtube_link,
      start_time: str(body.start_time),
      end_time: str(body.end_time),
      image: str(body.image),
    });
    
    if (error) throw error;

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to add event." },
      { status: 500 }
    );
  }
}
