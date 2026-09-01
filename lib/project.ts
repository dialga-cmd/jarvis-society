import { supabaseAdmin } from "@/lib/supabase";

export interface ProjectRecord {
  id: string;
  name: string;
  domain: string | null;
  blurb: string | null;
  status: string | null;
  tags: string[] | null;
  github: string | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// Fetches projects via the service-role key (bypasses RLS). Server-side only —
// never call this from a client component.
export async function getProjects(): Promise<ProjectRecord[]> {
  const { data, error } = await supabaseAdmin()
    .from("projects")
    .select(
      "id, name, domain, blurb, status, tags, github, sort_order, created_at, updated_at"
    )
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data as ProjectRecord[]) ?? [];
}