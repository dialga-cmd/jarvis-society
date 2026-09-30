import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { getCoreMembers, parseLinks } from "@/lib/core";
import { getAdminIdentity } from "@/lib/admin-guard";
import { badUrl, safeUrl } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
}

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s === "" ? null : s;
}

function linksFromBody(body: Record<string, unknown>) {
  const links = parseLinks(body.links);
  for (const link of links) {
    const msg = badUrl(link.url, link.label);
    if (msg) return { error: msg };
    const safe = safeUrl(link.url);
    if (!safe) return { error: `${link.label} must be a valid http(s) URL.` };
    link.url = safe;
  }
  return { links };
}

export async function GET() {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const members = await getCoreMembers();
    return NextResponse.json({ ok: true, members });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to load cores." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const body = (await req.json()) as Record<string, unknown>;

    const name = str(body.name);
    const tenure = str(body.tenure);
    const department = str(body.department);
    if (!name) {
      return NextResponse.json({ ok: false, message: "Name is required." }, { status: 400 });
    }
    if (!tenure) {
      return NextResponse.json({ ok: false, message: "Tenure is required." }, { status: 400 });
    }
    if (!department) {
      return NextResponse.json({ ok: false, message: "Department is required." }, { status: 400 });
    }

    for (const field of ["linkedin", "image"] as const) {
      const msg = badUrl(body[field], field === "linkedin" ? "LinkedIn" : "Image");
      if (msg) {
        return NextResponse.json({ ok: false, message: msg }, { status: 400 });
      }
    }

    const parsed = linksFromBody(body);
    if ("error" in parsed) {
      return NextResponse.json({ ok: false, message: parsed.error }, { status: 400 });
    }

    const { error } = await supabaseAdmin().from("cores").insert({
      name,
      tenure,
      department,
      linkedin: safeUrl(body.linkedin),
      image: str(body.image),
      links: parsed.links,
    });
    if (error) throw error;

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to add core member." },
      { status: 500 }
    );
  }
}
