import { NextRequest, NextResponse } from "next/server";
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

function tags(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof v === "string") {
    return v.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function sortOrder(v: unknown): number {
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : 0;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const id = params.id;
    const body = (await req.json()) as Record<string, unknown>;

    if ("name" in body && !str(body.name)) {
      return NextResponse.json({ ok: false, message: "Name cannot be blank." }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    if ("name" in body) patch.name = str(body.name);
    if ("domain" in body) patch.domain = str(body.domain);
    if ("blurb" in body) patch.blurb = str(body.blurb);
    if ("status" in body) patch.status = str(body.status);
    if ("tags" in body) patch.tags = tags(body.tags);
    if ("github" in body) patch.github = safeUrl(body.github);
    if ("sort_order" in body) patch.sort_order = sortOrder(body.sort_order);

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, message: "Nothing to update." }, { status: 400 });
    }

    const { error } = await supabaseAdmin().from("projects").update(patch).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to update project." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const { error } = await supabaseAdmin().from("projects").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to delete project." },
      { status: 500 }
    );
  }
}