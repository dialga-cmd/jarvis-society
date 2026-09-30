"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, PencilSimple, Trash, UploadSimple, X } from "@phosphor-icons/react/dist/ssr";
import { Modal } from "./Modal";

export type EventRecord = {
  id: string;
  name: string;
  registration_link: string | null;
  description: string | null;
  youtube_link: string | null;
  start_time: string | null;
  end_time: string | null;
  image: string | null;
};

export type EventInput = Omit<EventRecord, "id">;

type ModalState = { mode: "create" } | { mode: "edit"; event: EventRecord };

const EMPTY: EventInput = {
  name: "",
  registration_link: "",
  description: "",
  youtube_link: "",
  start_time: "",
  end_time: "",
  image: "",
};

function EventForm({
  initial,
  saving,
  error,
  onSave,
}: {
  initial: EventInput;
  saving: boolean;
  error: string | null;
  onSave: (input: EventInput) => void;
}) {
  const [form, setForm] = useState<EventInput>(initial);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const set =
    (key: keyof EventInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const uploadImage = async (file: File | null | undefined) => {
    if (!file) return;
    setUploadErr(null);

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

  const formatDatetimeForInput = (isoStr: string | null) => {
    if (!isoStr) return "";
    return new Date(isoStr).toISOString().slice(0, 16);
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
        <label htmlFor="event-name" className="admin-label">
          Name *
        </label>
        <input
          id="event-name"
          className="admin-input"
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Intro to Cybersecurity"
          required
        />
      </div>

      <div>
        <label htmlFor="event-description" className="admin-label">
          Details / Description
        </label>
        <textarea
          id="event-description"
          className="admin-input min-h-[80px]"
          value={form.description || ""}
          onChange={set("description")}
          placeholder="Detailed description of the event..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="event-start" className="admin-label">
            Start Time
          </label>
          <input
            id="event-start"
            type="datetime-local"
            className="admin-input"
            value={formatDatetimeForInput(form.start_time)}
            onChange={(e) => setForm(f => ({ ...f, start_time: e.target.value ? new Date(e.target.value).toISOString() : null }))}
          />
        </div>
        <div>
          <label htmlFor="event-end" className="admin-label">
            End Time
          </label>
          <input
            id="event-end"
            type="datetime-local"
            className="admin-input"
            value={formatDatetimeForInput(form.end_time)}
            onChange={(e) => setForm(f => ({ ...f, end_time: e.target.value ? new Date(e.target.value).toISOString() : null }))}
          />
        </div>
      </div>

      <div>
        <label htmlFor="event-registration" className="admin-label">
          Registration Link (Form)
        </label>
        <input
          id="event-registration"
          className="admin-input"
          value={form.registration_link || ""}
          onChange={set("registration_link")}
          placeholder="https://forms.gle/..."
        />
      </div>

      <div>
        <label htmlFor="event-youtube" className="admin-label">
          YouTube Link
        </label>
        <input
          id="event-youtube"
          className="admin-input"
          value={form.youtube_link || ""}
          onChange={set("youtube_link")}
          placeholder="https://youtube.com/..."
        />
      </div>

      <div>
        <label className="admin-label">Image (Will be converted to WebP)</label>
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
            accept="image/*"
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
            <span className="truncate font-mono text-xs text-ink-secondary">Uploading and converting…</span>
          ) : fileLabel ? (
            <span className="truncate font-mono text-xs text-ink">{fileLabel}</span>
          ) : form.image ? (
            <span className="truncate font-mono text-xs text-ink-tertiary">
              Image set — pick a new file to replace
            </span>
          ) : (
            <span className="truncate font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-tertiary">
              Choose an image
            </span>
          )}
        </label>
        {uploadErr && <p className="mt-2 text-sm text-red-400">{uploadErr}</p>}
        {form.image && !uploading && (
          <button
            type="button"
            onClick={() => {
              setForm((f) => ({ ...f, image: null }));
              setFileLabel(null);
            }}
            className="mt-2 inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-tertiary transition-colors hover:text-red-400"
          >
            <X size={12} />
            Remove image
          </button>
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

export function EventsManager() {
  const [events, setEvents] = useState<EventRecord[] | null>(null);
  const [loadMsg, setLoadMsg] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      if (res.ok && data.ok) {
        setEvents(data.events);
        setLoadMsg(null);
      } else {
        setLoadMsg(data.message ?? "Failed to load events.");
      }
    } catch (err) {
      setLoadMsg(err instanceof Error ? err.message : "Failed to load events.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (input: EventInput) => {
    if (!modal) return;
    setSaving(true);
    setError(null);
    try {
      const url =
        modal.mode === "create"
          ? "/api/admin/events"
          : `/api/admin/events/${modal.event.id}`;
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

  const handleDelete = async (event: EventRecord) => {
    if (!window.confirm(`Remove ${event.name} from events? This cannot be undone.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
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
            Events & Sessions
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Manage events and sessions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="admin-btn gap-1.5 bg-brand-indigo px-4 text-void hover:brightness-95"
        >
          <Plus size={16} weight="bold" />
          Add Event
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
              Ensure you have created the `events` table in the Supabase SQL editor.
            </p>
          </div>
        ) : !events ? (
          <div className="p-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-tertiary">
              Loading…
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-tertiary">
              No events yet
            </p>
            <p className="mt-2 max-w-xs text-sm text-ink-secondary">
              Use &ldquo;Add Event&rdquo; to create the first one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-tertiary">
                  <th className="px-5 py-3.5 font-medium">Name</th>
                  <th className="px-5 py-3.5 font-medium">Start</th>
                  <th className="px-5 py-3.5 font-medium">End</th>
                  <th className="px-5 py-3.5 font-medium">Registration</th>
                  <th className="px-5 py-3.5 font-medium">YouTube</th>
                  <th className="px-5 py-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {e.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={e.image}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 font-mono text-[0.65rem] text-ink-tertiary">
                            {e.name.slice(0, 1)}
                          </span>
                        )}
                        <span className="font-display text-sm font-medium text-ink">
                          {e.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-secondary">
                      {e.start_time ? new Date(e.start_time).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-secondary">
                      {e.end_time ? new Date(e.end_time).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      {e.registration_link ? (
                        <a
                          href={e.registration_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink-secondary transition-colors hover:text-brand-indigo"
                        >
                          Link
                        </a>
                      ) : (
                        <span className="text-ink-tertiary">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      {e.youtube_link ? (
                        <a
                          href={e.youtube_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink-secondary transition-colors hover:text-brand-indigo"
                        >
                          YouTube
                        </a>
                      ) : (
                        <span className="text-ink-tertiary">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setModal({ mode: "edit", event: e })}
                          aria-label={`Edit ${e.name}`}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-ink-tertiary transition-colors hover:border-white/25 hover:text-ink"
                        >
                          <PencilSimple size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(e)}
                          aria-label={`Remove ${e.name}`}
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
          title={modal.mode === "create" ? "Add Event" : `Edit ${modal.event.name}`}
          onClose={() => setModal(null)}
        >
          <EventForm
            initial={
              modal.mode === "edit"
                ? modal.event
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
