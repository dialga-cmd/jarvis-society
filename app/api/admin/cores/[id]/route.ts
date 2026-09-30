import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { parseLinks } from "@/lib/core";
import { getAdminIdentity } from "@/lib/admin-guard";
import { badUrl, safeUrl } from "@/lib/sanitize";

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
      if (!name) {
        return NextResponse.json({ ok: false, message: "Name cannot be blank." }, { status: 400 });
      }
      patch.name = name;
    }
    if ("tenure" in body) {
      const tenure = str(body.tenure);
      if (!tenure) {
        return NextResponse.json({ ok: false, message: "Tenure cannot be blank." }, { status: 400 });
      }
      patch.tenure = tenure;
    }
    if ("department" in body) {
      const department = str(body.department);
      if (!department) {
        return NextResponse.json(
          { ok: false, message: "Department cannot be blank." },
          { status: 400 }
        );
      }
      patch.department = department;
    }
    if ("linkedin" in body) {
      const msg = badUrl(body.linkedin, "LinkedIn");
      if (msg) return NextResponse.json({ ok: false, message: msg }, { status: 400 });
      patch.linkedin = safeUrl(body.linkedin);
    }
    if ("image" in body) {
      const msg = badUrl(body.image, "Image");
      if (msg && str(body.image)) {
        return NextResponse.json({ ok: false, message: msg }, { status: 400 });
      }
      patch.image = str(body.image);
    }
    if ("links" in body) {
      const links = parseLinks(body.links);
      for (const link of links) {
        const msg = badUrl(link.url, link.label);
        if (msg) return NextResponse.json({ ok: false, message: msg }, { status: 400 });
        const safe = safeUrl(link.url);
        if (!safe) {
          return NextResponse.json(
            { ok: false, message: `${link.label} must be a valid http(s) URL.` },
            { status: 400 }
          );
        }
        link.url = safe;
      }
      patch.links = links;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, message: "Nothing to update." }, { status: 400 });
    }

    const { error } = await supabaseAdmin().from("cores").update(patch).eq("id", params.id);
    if (error) throw error;

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to update core member." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const { error } = await supabaseAdmin().from("cores").delete().eq("id", params.id);
    if (error) throw error;
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to delete core member." },
      { status: 500 }
    );
  }
}
