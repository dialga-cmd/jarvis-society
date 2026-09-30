import { supabaseAdmin } from "@/lib/supabase";

export interface CoreLink {
  label: string;
  url: string;
}

export interface CoreMember {
  id: string;
  name: string;
  tenure: string | null;
  department: string | null;
  image: string | null;
  linkedin: string | null;
  links: CoreLink[];
}

export const DEPARTMENTS = [
  "Heads",
  "IoT & Electronics",
  "Game Development",
  "Immersive Technology",
  "Linux Team",
] as const;

export function parseLinks(value: unknown): CoreLink[] {
  if (!Array.isArray(value)) return [];
  const out: CoreLink[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const label =
      typeof rec.label === "string" ? rec.label.trim() : "";
    const url = typeof rec.url === "string" ? rec.url.trim() : "";
    if (!url) continue;
    const key = `${label.toLowerCase()}|${url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label: label || "Link", url });
  }
  return out;
}

export async function getCoreMembers(): Promise<CoreMember[]> {
  const { data, error } = await supabaseAdmin()
    .from("cores")
    .select("id, name, tenure, department, image, linkedin, links")
    .order("department", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: String(r.id),
    name: String(r.name ?? ""),
    tenure: typeof r.tenure === "string" ? r.tenure : null,
    department: typeof r.department === "string" ? r.department : null,
    image: typeof r.image === "string" ? r.image : null,
    linkedin: typeof r.linkedin === "string" ? r.linkedin : null,
    links: parseLinks(r.links),
  }));
}
