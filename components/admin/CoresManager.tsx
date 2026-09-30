"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, PencilSimple, Trash, UploadSimple, X } from "@phosphor-icons/react/dist/ssr";
import { DEPARTMENTS, type CoreLink, type CoreMember } from "@/lib/core";
import { Modal } from "./Modal";

export type MemberInput = {
  name: string;
  tenure: string;
  department: string;
  linkedin: string;
  image: string;
  links: CoreLink[];
};

type ModalState = { mode: "create" } | { mode: "edit"; member: CoreMember };

const EMPTY: MemberInput = {
  name: "",
  tenure: "",
  department: "",
  linkedin: "",
  image: "",
  links: [],
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
    (key: keyof Omit<MemberInput, "links">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

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

  const setLink = (index: number, key: keyof CoreLink, value: string) => {
    setForm((f) => ({
      ...f,
      links: f.links.map((link, i) => (i === index ? { ...link, [key]: value } : link)),
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...form,
          links: form.links.filter((l) => l.url.trim()),
        });
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
          <label htmlFor="member-department" className="admin-label">
            Department *
          </label>
          <input
            id="member-department"
            className="admin-input"
            list="department-options"
            value={form.department}
            onChange={set("department")}
            placeholder="e.g. Linux Team"
            required
          />
          <datalist id="department-options">
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d} />
            ))}
            {form.department &&
              !DEPARTMENTS.includes(form.department as (typeof DEPARTMENTS)[number]) && (
                <option value={form.department} />
              )}
          </datalist>
        </div>
        <div>
          <label htmlFor="member-tenure" className="admin-label">
            Tenure *
          </label>
          <input
            id="member-tenure"
            className="admin-input"
            value={form.tenure}
            onChange={set("tenure")}
            placeholder="e.g. 2024–26"
            required
          />
        </div>
      </div>

      <div>
        <label className="admin-label">Image (WebP)</label>
        <label
          className={`mt-1.5 flex h-10 w-full cursor-pointer items-center gap-2.5 overflow-hidden rounded-lg border bg-void px-3.5 text-sm transition-colors focus-within:border-brand-indigo ${
            uploading
              ? "border-brand-indigo-lite"
              : "border-white/10 hover:border-brand-indigo-lite/60"
          }`}
          onDragOver={(e) => e.preventDefault()}
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
            <span className="truncate font-mono text-xs text-ink-secondary">Uploading…</span>
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

      <div>
        <label htmlFor="member-linkedin" className="admin-label">
          LinkedIn
        </label>
        <input
          id="member-linkedin"
          className="admin-input"
          value={form.linkedin}
          onChange={set("linkedin")}
          placeholder="https://linkedin.com/in/…"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <label className="admin-label">Other links</label>
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({ ...f, links: [...f.links, { label: "", url: "" }] }))
            }
            className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brand-indigo transition-colors hover:text-ink"
          >
            + Add link
          </button>
        </div>
        {form.links.length === 0 ? (
          <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-tertiary">
            GitHub, portfolio, Instagram, etc.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {form.links.map((link, i) => (
              <div key={i} className="flex items-start gap-2">
                <input
                  className="admin-input mt-0 w-32 shrink-0"
                  value={link.label}
                  onChange={(e) => setLink(i, "label", e.target.value)}
                  placeholder="Label"
                />
                <input
                  className="admin-input mt-0 flex-1"
                  value={link.url}
                  onChange={(e) => setLink(i, "url", e.target.value)}
                  placeholder="https://…"
                />
                <button
                  type="button"
                  aria-label="Remove link"
                  onClick={() =>
                    setForm((f) => ({ ...f, links: f.links.filter((_, j) => j !== i) }))
                  }
                  className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-ink-tertiary transition-colors hover:border-red-400/40 hover:text-red-400"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
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

export function CoresManager() {
  const [members, setMembers] = useState<CoreMember[] | null>(null);
  const [loadMsg, setLoadMsg] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cores");
      const data = await res.json();
      if (res.ok && data.ok) {
        setMembers(data.members);
        setLoadMsg(null);
      } else {
        setLoadMsg(data.message ?? "Failed to load cores.");
      }
    } catch (err) {
      setLoadMsg(err instanceof Error ? err.message : "Failed to load cores.");
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
          ? "/api/admin/cores"
          : `/api/admin/cores/${modal.member.id}`;
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
    if (!window.confirm(`Remove ${member.name} from cores? This cannot be undone.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/cores/${member.id}`, { method: "DELETE" });
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
            Cores
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Add or remove core members. Changes show on the public teams page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="admin-btn gap-1.5 bg-brand-indigo px-4 text-void hover:brightness-95"
        >
          <Plus size={16} weight="bold" />
          Add core
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
            <p className="mt-3 text-sm text-ink-tertiary">
              If you have not created the table yet, run{" "}
              <span className="font-mono text-ink-secondary">schema-cores.sql</span> in the
              Supabase SQL editor.
            </p>
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
              No cores yet
            </p>
            <p className="mt-2 max-w-xs text-sm text-ink-secondary">
              Use &ldquo;Add core&rdquo; to create the first member.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-tertiary">
                  <th className="px-5 py-3.5 font-medium">Name</th>
                  <th className="px-5 py-3.5 font-medium">Department</th>
                  <th className="px-5 py-3.5 font-medium">Tenure</th>
                  <th className="px-5 py-3.5 font-medium">LinkedIn</th>
                  <th className="px-5 py-3.5 font-medium">Other links</th>
                  <th className="px-5 py-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {m.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.image}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 font-mono text-[0.65rem] text-ink-tertiary">
                            {m.name.slice(0, 1)}
                          </span>
                        )}
                        <span className="font-display text-sm font-medium text-ink">
                          {m.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-secondary">
                      {m.department ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-secondary">
                      {m.tenure ?? "—"}
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
                    <td className="px-5 py-3.5 text-sm text-ink-secondary">
                      {m.links.length === 0
                        ? "—"
                        : m.links.map((l) => l.label).join(", ")}
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
                          aria-label={`Remove ${m.name}`}
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
          title={modal.mode === "create" ? "Add core" : `Edit ${modal.member.name}`}
          onClose={() => setModal(null)}
        >
          <MemberForm
            initial={
              modal.mode === "edit"
                ? {
                    name: modal.member.name,
                    tenure: modal.member.tenure ?? "",
                    department: modal.member.department ?? "",
                    linkedin: modal.member.linkedin ?? "",
                    image: modal.member.image ?? "",
                    links: modal.member.links.length
                      ? modal.member.links
                      : [],
                  }
                : EMPTY
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
