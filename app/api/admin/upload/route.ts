import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminIdentity } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
}

// Only WebP. Enforced on MIME type, extension, and the actual bytes
// (RIFF....WEBP container header) so a renamed file can't slip through.
const MAX_BYTES = 5 * 1024 * 1024;

function isWebp(buf: Buffer): boolean {
  return (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("latin1") === "RIFF" &&
    buf.subarray(8, 12).toString("latin1") === "WEBP"
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function POST(req: NextRequest) {
  if (!(await getAdminIdentity())) return unauthorized();
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "No file provided." }, { status: 400 });
    }

    const isWebpMime = file.type === "image/webp";
    const isWebpName = file.name.toLowerCase().endsWith(".webp");
    if (!isWebpMime || !isWebpName) {
      return NextResponse.json(
        { ok: false, message: "Only WebP (.webp) images are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, message: "Image is too large. Keep it under 5 MB." },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    if (!isWebp(buf)) {
      return NextResponse.json(
        { ok: false, message: "File content is not a valid WebP image." },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();
    const stem = slugify(file.name.replace(/\.webp$/i, "")) || "image";
    const path = `cores/${stem}-${Date.now()}.webp`;

    const { error } = await sb.storage
      .from("public-data")
      .upload(path, buf, { contentType: "image/webp", cacheControl: "31536000" });
    if (error) throw error;

    const { data } = sb.storage.from("public-data").getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data.publicUrl });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 }
    );
  }
}