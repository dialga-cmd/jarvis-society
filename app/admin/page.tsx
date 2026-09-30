import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import type { CoreMember } from "@/lib/core";
import { parseLinks } from "@/lib/core";

export const dynamic = "force-dynamic";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default async function AdminDashboard() {
  let members: CoreMember[] = [];
  let msg: string | null = null;

  try {
    const { data, error } = await supabaseAdmin()
      .from("cores")
      .select("id, name, tenure, department, image, linkedin, links")
      .order("department", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    members = ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ""),
      tenure: typeof r.tenure === "string" ? r.tenure : null,
      department: typeof r.department === "string" ? r.department : null,
      image: typeof r.image === "string" ? r.image : null,
      linkedin: typeof r.linkedin === "string" ? r.linkedin : null,
      links: parseLinks(r.links),
    }));
  } catch (err) {
    msg = err instanceof Error ? err.message : "Failed to load data.";
  }

  const departments = new Set(members.map((m) => m.department).filter(Boolean));
  const tenures = new Set(members.map((m) => m.tenure).filter(Boolean));
  const withPhoto = members.filter((m) => m.image).length;

  const stats = [
    { label: "Core members", value: pad(members.length) },
    { label: "Departments", value: departments.size ? pad(departments.size) : "00" },
    { label: "Tenures", value: tenures.size ? pad(tenures.size) : "00" },
    { label: "With photos", value: pad(withPhoto) },
  ];

  return (
    <section>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Live snapshot of the society, pulled from the cores table.
      </p>

      {msg ? (
        <div className="mt-8 rounded-2xl border border-hairline bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Could not reach the database
          </p>
          <p className="mt-2 break-all text-sm text-ink-secondary">{msg}</p>
          <p className="mt-3 text-sm text-ink-tertiary">
            Create the tables by running{" "}
            <span className="font-mono text-ink-secondary">schema-cores.sql</span> in the
            Supabase SQL editor, then refresh this page.
          </p>
        </div>
      ) : (
        <>
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

          <div className="mt-8 overflow-hidden rounded-2xl border border-hairline bg-surface">
            <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-tertiary">
                Cores by department
              </p>
              <Link
                href="/admin/cores"
                className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brand-indigo transition-colors hover:text-ink"
              >
                Manage cores
              </Link>
            </div>
            {members.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-ink-secondary">
                  No core members yet. Open Cores in the sidebar to add the first one.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.04]">
                {members.slice(0, 8).map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <div>
                      <p className="font-display text-sm font-medium text-ink">{m.name}</p>
                      <p className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-tertiary">
                        {m.department ?? "Unassigned"}
                        {m.tenure ? ` · ${m.tenure}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {members.length > 8 && (
              <p className="border-t border-hairline px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-tertiary">
                +{members.length - 8} more
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
