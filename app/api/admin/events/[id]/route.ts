import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminIdentity } from "@/lib/admin-guard";
import { safeUrl } from "@/lib/sanitize";

function unauthorized() {
  return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
}

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s === "" ? null : s;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};

    if ("name" in body) {
      const name = str(body.name);
      if (!name) return NextResponse.json({ ok: false, message: "Name cannot be blank." }, { status: 400 });
      patch.name = name;
    }
    if ("registration_link" in body) patch.registration_link = safeUrl(body.registration_link);
    if ("description" in body) patch.description = str(body.description);
    if ("youtube_link" in body) patch.youtube_link = safeUrl(body.youtube_link);
    if ("start_time" in body) patch.start_time = str(body.start_time);
    if ("end_time" in body) patch.end_time = str(body.end_time);
    if ("image" in body) patch.image = str(body.image);

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, message: "Nothing to update." }, { status: 400 });
    }

    const { error } = await supabaseAdmin().from("events").update(patch).eq("id", params.id);
    if (error) throw error;

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to update event." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const { error } = await supabaseAdmin().from("events").delete().eq("id", params.id);
    if (error) throw error;
    
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to delete event." },
      { status: 500 }
    );
  }
}
