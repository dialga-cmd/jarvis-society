import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminIdentity } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
}

import sharp from "sharp";

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

    let buf = Buffer.from(await file.arrayBuffer());
    
    // Convert to webp using sharp
    try {
      buf = await sharp(buf).webp({ quality: 80 }).toBuffer();
    } catch (e) {
      return NextResponse.json(
        { ok: false, message: "Could not process the image." },
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