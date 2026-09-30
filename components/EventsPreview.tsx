"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarBlank,
  YoutubeLogo,
  CaretRight,
  Clock,
  X,
  LinkSimple,
} from "@phosphor-icons/react/dist/ssr";
import type { EventRecord } from "@/lib/events";

/* ------------------------------------------------------------------ */
/*  Event Detail Modal                                                 */
/* ------------------------------------------------------------------ */

function EventDetailModal({
  event,
  onClose,
}: {
  event: EventRecord;
  onClose: () => void;
}) {
  const isPast = event.end_time
    ? new Date(event.end_time).getTime() < Date.now()
    : event.start_time
      ? new Date(event.start_time).getTime() < Date.now()
      : false;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-void/80 backdrop-blur-md" />

      {/* Content */}
      <div
        className="relative z-10 flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#14151A] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white/70 backdrop-blur transition-colors hover:bg-black/80 hover:text-white"
          aria-label="Close"
        >
          <X size={18} weight="bold" />
        </button>

        {/* Banner image */}
        {event.image && (
          <div className="relative w-full shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.image}
              alt={event.name}
              className="h-auto max-h-72 w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#14151A] to-transparent" />
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {/* Badge */}
          <span
            className={`font-mono text-[0.65rem] uppercase tracking-wider ${
              isPast ? "text-ink-tertiary" : "text-brand-indigo-lite"
            }`}
          >
            {isPast ? "Past Event" : "Upcoming"}
          </span>

          {/* Title */}
          <h2 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">
            {event.name}
          </h2>

          {/* Date / Time */}
          {(event.start_time || event.end_time) && (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-secondary">
              {event.start_time && (
                <span className="inline-flex items-center gap-2">
                  <CalendarBlank size={16} className="text-brand-indigo" />
                  {new Date(event.start_time).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              {event.start_time && (
                <span className="inline-flex items-center gap-2">
                  <Clock size={16} className="text-brand-indigo" />
                  {new Date(event.start_time).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {event.end_time && (
                    <>
                      {" — "}
                      {new Date(event.end_time).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </>
                  )}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {event.description && (
            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-ink-secondary">
              {event.description}
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {event.registration_link && !isPast && (
              <a
                href={event.registration_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-indigo px-6 py-3 text-sm font-semibold text-void transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <CaretRight size={14} weight="bold" />
                Register Now
              </a>
            )}
            {event.youtube_link && (
              <a
                href={event.youtube_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-white/10"
              >
                <YoutubeLogo size={18} className="text-red-500" weight="fill" />
                Watch on YouTube
              </a>
            )}
            {event.registration_link && isPast && (
              <a
                href={event.registration_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-ink-secondary transition-colors hover:bg-white/10 hover:text-ink"
              >
                <LinkSimple size={16} />
                View Form
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Event Card (shared between preview + full page)                    */
/* ------------------------------------------------------------------ */

export function EventCard({ event }: { event: EventRecord }) {
  const [open, setOpen] = useState(false);

  const isPast = event.end_time
    ? new Date(event.end_time).getTime() < Date.now()
    : event.start_time
      ? new Date(event.start_time).getTime() < Date.now()
      : false;

  return (
    <>
      <article
        onClick={() => setOpen(true)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-hairline bg-surface transition-all duration-300 hover:border-white/15 hover:shadow-[0_8px_40px_-12px_rgba(100,80,255,0.15)]"
      >
        {/* Banner image — full width, no crop */}
        {event.image ? (
          <div className="relative w-full overflow-hidden border-b border-hairline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.image}
              alt={event.name}
              className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
              style={{ maxHeight: "240px", objectFit: "cover" }}
            />
            {isPast && (
              <div className="absolute inset-0 bg-void/40 backdrop-blur-[1px]" />
            )}
            {/* Gradient fade at the bottom */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface to-transparent" />
          </div>
        ) : (
          <div className="relative flex h-40 w-full items-center justify-center border-b border-hairline bg-white/[0.02]">
            <CalendarBlank size={48} className="text-white/10" weight="duotone" />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <span
              className={`font-mono text-[0.6rem] uppercase tracking-wider ${
                isPast ? "text-ink-tertiary" : "text-brand-indigo-lite"
              }`}
            >
              {isPast ? "Past" : "Upcoming"}
            </span>
            {event.start_time && (
              <span className="font-mono text-[0.65rem] text-ink-tertiary">
                {new Date(event.start_time).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          <h3 className="mt-3 font-display text-lg font-semibold leading-tight tracking-tight text-ink">
            {event.name}
          </h3>

          {event.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-secondary">
              {event.description}
            </p>
          )}

          <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brand-indigo-lite opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Click for details →
          </p>
        </div>
      </article>

      {/* Detail Modal */}
      {open && <EventDetailModal event={event} onClose={() => setOpen(false)} />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Events Preview (landing page section)                              */
/* ------------------------------------------------------------------ */

export function EventsPreview({ events }: { events: EventRecord[] }) {
  const previewEvents = events.slice(0, 3);

  return (
    <section
      id="events"
      className="relative overflow-hidden bg-surface/40 py-28"
    >
      <div className="container-shell mb-14">
        <p className="eyebrow mb-5">
          <span className="text-ink-tertiary">//</span> Upcoming
        </p>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="text-balance max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
            Events and <span className="text-accent-lit">Sessions</span>
          </h2>
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-mono text-sm tracking-wide text-ink transition-colors hover:bg-white/10 hover:text-brand-indigo-lite"
          >
            View all
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary">
          Join our latest workshops, tech talks, and meetups. Here&apos;s
          what&apos;s coming up next in the society.
        </p>
      </div>

      <div className="container-shell">
        {previewEvents.length === 0 ? (
          <p className="max-w-md font-mono text-xs uppercase tracking-[0.2em] text-ink-tertiary">
            No events scheduled yet. Check back later!
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {previewEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
