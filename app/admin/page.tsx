import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const ROLE_RE = /president|vice|lead|head/i;

export default async function AdminDashboard() {
  let members: string = "—";
  let projects: string = "—";
  let leads: string = "—";
  let domains: string = "—";
  let msg: string | null = null;

  try {
    const sb = supabaseAdmin();
    const [membersRes, projectsRes, positions, teams] = await Promise.all([
      sb.from("cores").select("id", { count: "exact", head: true }),
      sb.from("projects").select("id", { count: "exact", head: true }),
      sb.from("cores").select("position"),
      sb.from("cores").select("team").not("team", "is", null),
    ]);

    const leadCount = (positions.data ?? []).filter((r) =>
      ROLE_RE.test(r.position ?? "")
    ).length;
    const domainCount = new Set(
      (teams.data ?? []).map((r) => r.team).filter(Boolean)
    ).size;

    members = String(membersRes.count ?? 0).padStart(2, "0");
    projects = String(projectsRes.count ?? 0).padStart(2, "0");
    leads = String(leadCount).padStart(2, "0");
    domains = domainCount ? String(domainCount).padStart(2, "0") : "—";
  } catch (err) {
    msg = err instanceof Error ? err.message : "Failed to load data.";
  }

  const stats = [
    { label: "Members", value: members },
    { label: "Projects", value: projects },
    { label: "Team leads", value: leads },
    { label: "Domains", value: domains },
  ];

  return (
    <section>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Overview of the society, fetched live from the database.
      </p>

      {msg ? (
        <div className="mt-8 rounded-2xl border border-hairline bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Could not reach the database
          </p>
          <p className="mt-2 break-all text-sm text-ink-secondary">{msg}</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-hairline bg-surface p-5"
            >
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-tertiary">
                {stat.label}
              </p>
              <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}