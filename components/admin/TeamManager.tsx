"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, PencilSimple, Trash, UploadSimple, X } from "@phosphor-icons/react/dist/ssr";
import type { CoreMember } from "@/lib/core";
import { formatRoles, normalizeRoles } from "@/lib/core";
import { Modal } from "./Modal";

export type MemberInput = {
  name: string;
  position?: string;
  team?: string[];
  tenure?: string;
  region?: string;
  email?: string;
  linkedin?: string;
  image?: string;
};

type ModalState = { mode: "create" } | { mode: "edit"; member: CoreMember };

// Position groups. Everything else in the form branches off the chosen one.
const POSITIONS = [
  "Heads",
  "IoT & Electronics",
  "Game Development",
  "Immersive Technology",
  "Linux Team",
] as const;

// Roles available per position. Heads get the secretary roles; the domains get
// their focus areas. Values are stored verbatim in the `team` column.
const ROLE_OPTIONS: Record<string, string[]> = {
  Heads: ["Secretary", "Deputy Secretary"],
  "IoT & Electronics": [
    "Internet of Things (IoT)",
    "Electronics",
    "Embedded Systems",
    "Sensors & Microcontrollers",
    "Automation",
    "Hardware Projects",
  ],
  "Game Development": [
    "Game Programming",
    "Game Design",
    "2D & 3D Game Development",
    "Game Engines",
    "Game Physics",
    "Interactive Systems",
  ],
  "Immersive Technology": [
    "Virtual Reality (VR)",
    "Augmented Reality (AR)",
    "Mixed Reality (MR)",
    "3D Experiences",
    "Spatial Interaction",
    "XR Development",
  ],
  "Linux Team": [
    "Linux",
    "Command Line",
    "Shell Scripting",
    "System Administration",
    "Networking",
    "Open Source",
    "Servers & Infrastructure",
  ],
};

function MemberForm({
  initial,
  saving,
  error,
  onSave,
}: {
  initial: MemberInput;
  saving: boolean;
  error: string | null;
  onSave: (input: MemberInput) => void;
}) {
  const [form, setForm] = useState<MemberInput>(initial);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const set =
    (key: keyof MemberInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  // Upload a WebP to the public-data bucket and stash the public URL in the
  // image field (which is what gets written to the image column on save).
  const uploadImage = async (file: File | null | undefined) => {
    if (!file) return;
    setUploadErr(null);

    if (file.type !== "image/webp" || !file.name.toLowerCase().endsWith(".webp")) {
      setFileLabel(null);
      setUploadErr("Only WebP (.webp) images are allowed.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFileLabel(null);
        setUploadErr(data.message ?? "Upload failed.");
        return;
      }
      setForm((f) => ({ ...f, image: data.url }));
    } catch (err) {
      setFileLabel(null);
      setUploadErr(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="member-name" className="admin-label">
          Name *
        </label>
        <input
          id="member-name"
          className="admin-input"
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Ada Lovelace"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="member-position" className="admin-label">
            Position *
          </label>
          <select
            id="member-position"
            className="admin-select"
            value={form.position ?? ""}
            onChange={(e) => {
              const next = e.target.value;
              // Changing the position resets the role so stale options can't
              // survive a switch.
              setForm((f) => ({ ...f, position: next, team: "" }));
            }}
            required
          >
            <option value="" disabled>
              Select position…
            </option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            {form.position &&
              !POSITIONS.includes(form.position as (typeof POSITIONS)[number]) && (
                <option value={form.position}>{form.position}</option>
              )}
          </select>
        </div>
        <div>
          <label htmlFor="member-role" className="admin-label">
            Role(s) *
          </label>
          {(() => {
            const options = ROLE_OPTIONS[form.position ?? ""] ?? [];
            const roles = form.team ?? [];
            const toggle = (r: string) =>
              setForm((f) => {
                const cur = f.team ?? [];
                return {
                  ...f,
                  team: cur.includes(r)
                    ? cur.filter((x) => x !== r)
                    : [...cur, r],
                };
              });
            return (
              <>
                <div
                  id="member-role"
                  className="mt-1.5 flex w-full min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-void px-3 py-2 text-sm text-ink transition-colors focus-within:border-brand-indigo"
                >
                  {roles.length === 0 ? (
                    <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-tertiary">
                      {form.position ? "No roles yet" : "Pick a position first"}
                    </span>
                  ) : (
                    roles.map((r) => (
                      <span
                        key={r}
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-ink"
                      >
                        {r}
                        <button
                          type="button"
                          onClick={() => toggle(r)}
                          aria-label={`Remove ${r}`}
                          className="text-ink-tertiary transition-colors hover:text-red-400"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
                {form.position && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {options.map((r) => {
                      const on = roles.includes(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggle(r)}
                          aria-pressed={on}
                          className={`rounded-md border px-2 py-0.5 font-mono text-[0.7rem] transition-colors ${
                            on
                              ? "border-brand-indigo text-brand-indigo"
                              : "border-white/10 text-ink-tertiary hover:border-white/25 hover:text-ink"
                          }`}
                        >
                          {on ? "✓ " : "+ "}
                          {r}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>
        <div>
          <label htmlFor="member-tenure" className="admin-label">
            Tenure *
          </label>
          <input
            id="member-tenure"
            className="admin-input"
            value={form.tenure ?? ""}
            onChange={set("tenure")}
            placeholder="e.g. 2024–26"
            required
          />
        </div>
        <div>
          <label htmlFor="member-region" className="admin-label">
            Region *
          </label>
          <input
            id="member-region"
            className="admin-input"
            value={form.region ?? ""}
            onChange={set("region")}
            placeholder="e.g. Chennai"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="member-email" className="admin-label">
            Email *
          </label>
          <input
            id="member-email"
            type="email"
            className="admin-input"
            value={form.email ?? ""}
            onChange={set("email")}
            placeholder="name@study.iitm.ac.in"
            required
          />
        </div>
        <div>
        <label className="admin-label">Image (WebP)</label>
        <label
          className={`mt-1.5 flex h-10 w-full cursor-pointer items-center gap-2.5 overflow-hidden rounded-lg border bg-void px-3.5 text-sm transition-colors focus-within:border-brand-indigo ${
            uploading
              ? "border-brand-indigo-lite"
              : "border-white/10 hover:border-brand-indigo-lite/60"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) setFileLabel(file.name);
            uploadImage(file);
          }}
        >
          <input
            type="file"
            accept="image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setFileLabel(file.name);
              uploadImage(file);
              e.target.value = "";
            }}
          />
          <UploadSimple
            size={16}
            className={`shrink-0 ${
              uploading ? "animate-pulse text-brand-indigo" : "text-ink-tertiary"
            }`}
          />
          {uploading ? (
            <span className="truncate font-mono text-xs text-ink-secondary">
              Uploading…
            </span>
          ) : fileLabel ? (
            <span className="truncate font-mono text-xs text-ink">{fileLabel}</span>
          ) : form.image ? (
            <span className="truncate font-mono text-xs text-ink-tertiary">
              Image set — pick a new file to replace
            </span>
          ) : (
            <span className="truncate font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-tertiary">
              Choose .webp image
            </span>
          )}
        </label>

        {uploadErr && <p className="mt-2 text-sm text-red-400">{uploadErr}</p>}

        {form.image && !uploading && (
          <button
            type="button"
            onClick={() => {
              setForm((f) => ({ ...f, image: "" }));
              setFileLabel(null);
            }}
            className="mt-2 inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-tertiary transition-colors hover:text-red-400"
          >
            <X size={12} />
            Remove image
          </button>
        )}
      </div>
      </div>

      <div>
        <label htmlFor="member-linkedin" className="admin-label">
          LinkedIn
        </label>
        <input
          id="member-linkedin"
          className="admin-input"
          value={form.linkedin ?? ""}
          onChange={set("linkedin")}
          placeholder="https://linkedin.com/in/…"
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

export function TeamManager() {
  const [members, setMembers] = useState<CoreMember[] | null>(null);
  const [loadMsg, setLoadMsg] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/team");
      const data = await res.json();
      if (res.ok && data.ok) {
        setMembers(data.members);
        setLoadMsg(null);
      } else {
        setLoadMsg(data.message ?? "Failed to load team.");
      }
    } catch (err) {
      setLoadMsg(err instanceof Error ? err.message : "Failed to load team.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (input: MemberInput) => {
    if (!modal) return;
    setSaving(true);
    setError(null);
    try {
      const url =
        modal.mode === "create"
          ? "/api/admin/team"
          : `/api/admin/team/${modal.member.id}`;
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

  const handleDelete = async (member: CoreMember) => {
    if (!window.confirm(`Delete ${member.name}? This cannot be undone.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/team/${member.id}`, { method: "DELETE" });
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
            Team
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Core team and members.{" "}
            <span className="font-mono text-ink-tertiary">cores</span> table.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="admin-btn gap-1.5 bg-brand-indigo px-4 text-void hover:brightness-95"
        >
          <Plus size={16} weight="bold" />
          Add member
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
        ) : !members ? (
          <div className="p-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-tertiary">
              Loading…
            </p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-tertiary">
              No members yet
            </p>
            <p className="mt-2 max-w-xs text-sm text-ink-secondary">
              Use &ldquo;Add member&rdquo; to create the first entry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-tertiary">
                  <th className="px-5 py-3.5 font-medium">Name</th>
                  <th className="px-5 py-3.5 font-medium">Position</th>
                  <th className="px-5 py-3.5 font-medium">Role</th>
                  <th className="px-5 py-3.5 font-medium">Tenure</th>
                  <th className="px-5 py-3.5 font-medium">Region</th>
                  <th className="px-5 py-3.5 font-medium">Email</th>
                  <th className="px-5 py-3.5 font-medium">LinkedIn</th>
                  <th className="px-5 py-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={String(m.id)}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5 font-display text-sm font-medium text-ink">
                      {m.name}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-secondary">
                      {m.position ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-secondary">
                      {formatRoles(m.team) || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-secondary">
                      {m.tenure ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-secondary">
                      {m.region ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-tertiary">
                      {m.email ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      {m.linkedin ? (
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink-secondary transition-colors hover:text-brand-indigo"
                        >
                          Profile
                        </a>
                      ) : (
                        <span className="text-ink-tertiary">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setModal({ mode: "edit", member: m })}
                          aria-label={`Edit ${m.name}`}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-ink-tertiary transition-colors hover:border-white/25 hover:text-ink"
                        >
                          <PencilSimple size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m)}
                          aria-label={`Delete ${m.name}`}
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
          title={modal.mode === "create" ? "Add member" : `Edit ${modal.member.name}`}
          onClose={() => setModal(null)}
        >
          <MemberForm
initial={
                modal.mode === "edit"
                  ? {
                      name: modal.member.name,
                      position: modal.member.position ?? "",
                      team: normalizeRoles(modal.member.team),
                      tenure: modal.member.tenure ?? "",
                      region: modal.member.region ?? "",
                      email: modal.member.email ?? "",
                      linkedin: modal.member.linkedin ?? "",
                      image: modal.member.image ?? "",
                    }
                  : { name: "", team: [] }
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