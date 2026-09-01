import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getProjects } from "@/lib/project";
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

// Accept either an array of tags or a comma-separated string.
function tags(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof v === "string") {
    return v.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sortOrder(v: unknown): number {
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : 0;
}

export async function GET() {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const projects = await getProjects();
    return NextResponse.json({ ok: true, projects });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to load projects." },
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

    const githubErr = badUrl(body.github, "GitHub link");
    if (githubErr) {
      return NextResponse.json({ ok: false, message: githubErr }, { status: 400 });
    }

    const id = str(body.id) || slugify(name);

    const existing = await supabaseAdmin().from("projects").select("id").eq("id", id).maybeSingle();
    if (existing.data) {
      return NextResponse.json(
        { ok: false, message: `A project with id "${id}" already exists.` },
        { status: 409 }
      );
    }

    const { error } = await supabaseAdmin().from("projects").insert({
      id,
      name,
      domain: str(body.domain),
      blurb: str(body.blurb),
      status: str(body.status),
      tags: tags(body.tags),
      github: safeUrl(body.github),
      sort_order: sortOrder(body.sort_order),
    });
    if (error) throw error;

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to add project." },
      { status: 500 }
    );
  }
}