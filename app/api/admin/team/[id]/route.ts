import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { normalizeRoles } from "@/lib/core";
import { getAdminIdentity } from "@/lib/admin-guard";
import { safeUrl } from "@/lib/sanitize";

function unauthorized() {
  return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
}

const FIELDS = [
  "name",
  "position",
  "team",
  "tenure",
  "region",
  "email",
  "linkedin",
  "image",
] as const;

// Via the REST probe: the cores table enforces NOT NULL on these.
const TEXT_REQUIRED = new Set(["name", "position", "tenure", "region", "email"]);

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s === "" ? null : s;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const id = params.id;
    const body = (await req.json()) as Record<string, unknown>;

    for (const field of FIELDS) {
      if (TEXT_REQUIRED.has(field) && field in body && !str(body[field])) {
        return NextResponse.json(
          { ok: false, message: `${field} cannot be blank.` },
          { status: 400 }
        );
      }
    }

    const patch: Record<string, unknown> = {};
    for (const field of FIELDS) {
      if (field in body) patch[field] = str(body[field]);
    }

    if ("team" in body) {
      const roles = normalizeRoles(body.team);
      if (roles.length === 0) {
        return NextResponse.json(
          { ok: false, message: "Role cannot be blank." },
          { status: 400 }
        );
      }
      patch.team = roles;
    }

    for (const field of ["linkedin", "image"] as const) {
      if (field in body) patch[field] = safeUrl(body[field]);
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, message: "Nothing to update." }, { status: 400 });
    }

    const { error } = await supabaseAdmin().from("cores").update(patch).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to update member." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const { error } = await supabaseAdmin().from("cores").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to delete member." },
      { status: 500 }
    );
  }
}