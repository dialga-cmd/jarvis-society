"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr";
import type { ProjectRecord } from "@/lib/project";
import { Modal } from "./Modal";

export type ProjectInput = {
  name: string;
  id?: string;
  domain?: string;
  blurb?: string;
  status?: string;
  tags?: string;
  github?: string;
  sort_order?: string;
};

const STATUSES = ["In development", "Prototype", "Research", "Complete"];

type ModalState = { mode: "create" } | { mode: "edit"; project: ProjectRecord };

function ProjectForm({
  initial,
  saving,
  error,
  onSave,
}: {
  initial: ProjectInput;
  saving: boolean;
  error: string | null;
  onSave: (input: ProjectInput) => void;
}) {
  const [form, setForm] = useState<ProjectInput>(initial);
  const set = (key: keyof ProjectInput) =>
    (e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="project-name" className="admin-label">
            Name *
          </label>
          <input
            id="project-name"
            className="admin-input"
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Sentinel-E"
            required
          />
        </div>
        <div>
          <label htmlFor="project-id" className="admin-label">
            ID / slug
          </label>
          <input
            id="project-id"
            className="admin-input"
            value={form.id ?? ""}
            onChange={set("id")}
            placeholder="auto from name if blank"
            disabled={initial.id !== undefined}
          />
        </div>
      </div>

      <div>
        <label htmlFor="project-domain" className="admin-label">
          Domain
        </label>
        <input
          id="project-domain"
          className="admin-input"
          value={form.domain ?? ""}
          onChange={set("domain")}
          placeholder="e.g. Game Development & Designing"
        />
      </div>

      <div>
        <label htmlFor="project-blurb" className="admin-label">
          Blurb
        </label>
        <textarea
          id="project-blurb"
          className="admin-input min-h-24 resize-y"
          value={form.blurb ?? ""}
          onChange={set("blurb")}
          placeholder="One-line description shown on the project card."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="project-status" className="admin-label">
            Status
          </label>
          <select
            id="project-status"
            className="admin-select"
            value={form.status ?? ""}
            onChange={set("status")}
          >
            <option value="">—</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="project-sort" className="admin-label">
            Sort order
          </label>
          <input
            id="project-sort"
            type="number"
            className="admin-input"
            value={form.sort_order ?? ""}
            onChange={set("sort_order")}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label htmlFor="project-tags" className="admin-label">
          Tags
        </label>
        <input
          id="project-tags"
          className="admin-input"
          value={form.tags ?? ""}
          onChange={set("tags")}
          placeholder="comma separated, e.g. AI, Unity, Sound Design"
        />
      </div>

      <div>
        <label htmlFor="project-github" className="admin-label">
          GitHub URL
        </label>
        <input
          id="project-github"
          className="admin-input"
          value={form.github ?? ""}
          onChange={set("github")}
          placeholder="https://github.com/jarvis-society/…"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center justify-end gap-3 pt-2">
        <span className="mr-auto font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-tertiary">
          * required
        </span>
        <button
          type="submit"
          disabled={saving}
          className="admin-btn bg-accent-gradient px-5 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

export function ProjectsManager() {
  const [projects, setProjects] = useState<ProjectRecord[] | null>(null);
  const [loadMsg, setLoadMsg] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/projects");
      const data = await res.json();
      if (res.ok && data.ok) {
        setProjects(data.projects);
        setLoadMsg(null);
      } else {
        setLoadMsg(data.message ?? "Failed to load projects.");
      }
    } catch (err) {
      setLoadMsg(err instanceof Error ? err.message : "Failed to load projects.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (input: ProjectInput) => {
    if (!modal) return;
    setSaving(true);
    setError(null);
    try {
      const url =
        modal.mode === "create"
          ? "/api/admin/projects"
          : `/api/admin/projects/${modal.project.id}`;
      const res = await fetch(url, {
        method: modal.mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "Save failed.");
        setSaving(false);
        return;
      }
      setModal(null);
      setSaving(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setSaving(false);
    }
  };

  const handleDelete = async (project: ProjectRecord) => {
    if (!window.confirm(`Delete ${project.name}? This cannot be undone.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "Delete failed.");
        return;
      }
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Projects
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Society projects.{" "}
            <span className="font-mono text-ink-tertiary">projects</span> table.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="admin-btn gap-1.5 bg-brand-indigo px-4 text-void hover:brightness-95"
        >
          <Plus size={16} weight="bold" />
          Add project
        </button>
      </div>

      {error && (
        <p className="mt-5 rounded-lg border border-red-400/20 bg-red-400/[0.06] p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-hairline bg-surface">
        {loadMsg ? (
          <div className="p-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Could not reach the database
            </p>
            <p className="mt-2 break-all text-sm text-ink-secondary">{loadMsg}</p>
          </div>
        ) : !projects ? (
          <div className="p-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-tertiary">
              Loading…
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-tertiary">
              No projects yet
            </p>
            <p className="mt-2 max-w-xs text-sm text-ink-secondary">
              Use &ldquo;Add project&rdquo; to create the first entry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-tertiary">
                  <th className="px-5 py-3.5 font-medium">Name</th>
                  <th className="px-5 py-3.5 font-medium">Domain</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Tags</th>
                  <th className="px-5 py-3.5 font-medium">Repo</th>
                  <th className="px-5 py-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5 font-display text-sm font-medium text-ink">
                      {p.name}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-secondary">
                      {p.domain ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-ink-secondary">
                        {p.status ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-secondary">
                      {(p.tags ?? []).join(" · ") || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      {p.github ? (
                        <a
                          href={p.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink-secondary transition-colors hover:text-brand-indigo"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-ink-tertiary">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setModal({ mode: "edit", project: p })}
                          aria-label={`Edit ${p.name}`}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-ink-tertiary transition-colors hover:border-white/25 hover:text-ink"
                        >
                          <PencilSimple size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          aria-label={`Delete ${p.name}`}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-ink-tertiary transition-colors hover:border-red-400/40 hover:text-red-400"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal
          title={
            modal.mode === "create"
              ? "Add project"
              : `Edit ${modal.project.name}`
          }
          onClose={() => setModal(null)}
        >
          <ProjectForm
            initial={
              modal.mode === "edit"
                ? {
                    name: modal.project.name,
                    id: modal.project.id,
                    domain: modal.project.domain ?? "",
                    blurb: modal.project.blurb ?? "",
                    status: modal.project.status ?? "",
                    tags: (modal.project.tags ?? []).join(", "),
                    github: modal.project.github ?? "",
                    sort_order: modal.project.sort_order?.toString() ?? "",
                  }
                : { name: "", sort_order: "0" }
            }
            saving={saving}
            error={error}
            onSave={handleSave}
          />
        </Modal>
      )}
    </section>
  );
}