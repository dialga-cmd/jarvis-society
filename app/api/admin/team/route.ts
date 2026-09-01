import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCoreMembers, normalizeRoles } from "@/lib/core";
import { getAdminIdentity } from "@/lib/admin-guard";
import { badUrl } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

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
const TEXT_REQUIRED: Record<string, string> = {
  name: "Name",
  position: "Position",
  tenure: "Tenure",
  region: "Region",
  email: "Email",
};

// Trim a value into a string, or null when absent/blank (for nullable columns).
function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s === "" ? null : s;
}

export async function GET() {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const members = await getCoreMembers();
    return NextResponse.json({ ok: true, members });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to load team." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const body = (await req.json()) as Record<string, unknown>;

    for (const [field, label] of Object.entries(TEXT_REQUIRED)) {
      if (!str(body[field])) {
        return NextResponse.json(
          { ok: false, message: `${label} is required.` },
          { status: 400 }
        );
      }
    }

    for (const field of ["linkedin", "image"] as const) {
      const msg = badUrl(body[field], field === "linkedin" ? "LinkedIn" : "Image");
      if (msg) {
        return NextResponse.json({ ok: false, message: msg }, { status: 400 });
      }
    }

    // Roles are a text[] column — accept an array, or a legacy comma string.
    const roles = normalizeRoles(body.team);
    if (roles.length === 0) {
      return NextResponse.json(
        { ok: false, message: "At least one role is required." },
        { status: 400 }
      );
    }

    const row: Record<string, unknown> = {};
    for (const field of FIELDS) {
      row[field] = str(body[field]);
    }
    row.team = roles;

    const { error } = await supabaseAdmin().from("cores").insert(row);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to add member." },
      { status: 500 }
    );
  }
}