import { supabaseAdmin } from "@/lib/supabase";

export interface CoreMember {
  id: string | number;
  name: string;
  position?: string | null;
  team?: string[];
  tenure?: string | null;
  region?: string | null;
  email?: string | null;
  image?: string | null;
  linkedin?: string | null;
}

// A member can hold several roles; `cores.team` is a text[] array (or a single
// comma-able string for legacy rows). Normalizes any shape into a clean,
// deduped list.
export function normalizeRoles(v: unknown): string[] {
  if (Array.isArray(v)) {
    return [
      ...new Set(
        v
          .filter((x): x is string => typeof x === "string")
          .map((x) => x.trim())
          .filter(Boolean)
      ),
    ];
  }
  if (typeof v === "string") {
    return [
      ...new Set(
        v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      ),
    ];
  }
  return [];
}

// Display form of a role list:
//   ["A"]            -> "A"
//   ["A", "B"]       -> "A & B"
//   ["A", "B", "C"]  -> "A, B, C"
export function formatRoles(v: string[] | string | null | undefined): string {
  const list = normalizeRoles(v);
  if (list.length === 0) return "";
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} & ${list[1]}`;
  return list.join(", ");
}

// Fetches the core team via the service-role key (bypasses RLS). Server-side
// only — never call this from a client component.
export async function getCoreMembers(): Promise<CoreMember[]> {
  const { data, error } = await supabaseAdmin()
    .from("cores")
    .select("id, name, position, team, tenure, region, email, image, linkedin")
    .order("name", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    ...r,
    team: normalizeRoles(r.team),
  })) as CoreMember[];
}