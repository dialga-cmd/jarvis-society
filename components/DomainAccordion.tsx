"use client";

import { useState } from "react";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { domains } from "@/lib/site";

// Icon/glow colours anchor to the single brand indigo (--brand-indigo). Since
// the raw #0C0C30 is near-invisible against the dark core, the visible icon and
// glow use the slightly lighter tint (--brand-indigo-lite) from the same family.
// `pattern` is a low-opacity SVG data-URI texture unique to each card (kept
// barely-visible as a surface detail, not a brand-coloured element).
const ACCENTS: Record<
  string,
  {
    accent: string;
    ring: string;
    glow: string;
    pattern: string;
  }
> = {
  ["Cyber Forensics & Blockchain"]: {
    accent: "var(--brand-indigo-lite)",
    ring: "var(--brand-indigo-lite)",
    glow: "rgba(110,120,220,0.45)",
    pattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M10 0v40M30 0v40' stroke='%2352529c' stroke-width='1' stroke-opacity='0.35'/%3E%3C/svg%3E")`,
  },
  ["Electronics and IoT"]: {
    accent: "var(--brand-indigo-lite)",
    ring: "var(--brand-indigo-lite)",
    glow: "rgba(110,120,220,0.45)",
    pattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Cpath d='M0 18h36M18 0v36M0 0l8 8M28 28l8 8M28 0l8-8M0 28l8-4' stroke='%2352529c' stroke-width='1' stroke-opacity='0.3'/%3E%3C/svg%3E")`,
  },
  ["Game Development & Designing"]: {
    accent: "var(--brand-indigo-lite)",
    ring: "var(--brand-indigo-lite)",
    glow: "rgba(110,120,220,0.45)",
    pattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect width='3' height='3' fill='%2352529c' fill-opacity='0.4'/%3E%3C/svg%3E")`,
  },
  ["Informatics"]: {
    accent: "var(--brand-indigo-lite)",
    ring: "var(--brand-indigo-lite)",
    glow: "rgba(110,120,220,0.45)",
    pattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='1.2' fill='%2352529c' fill-opacity='0.5'/%3E%3C/svg%3E")`,
  },
};

// Shared expand/collapse animation (grid-template-rows technique from the
// previous fix) — kept identical on every button so expand and collapse mirror
// each other at the exact same speed with no snapping.
const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";
const DUR = "duration-[300ms]";

export function DomainAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (i: number) => setOpen((cur) => (cur === i ? null : i));

  return (
    <ul className="flex w-full flex-col gap-4" aria-label="Four disciplines">
      {domains.map((d, i) => {
        const Icon = d.icon;
        const a = ACCENTS[d.name] ?? ACCENTS["Informatics"];
        const isOpen = open === i;

        return (
          <li key={d.id}>
            {/* Outer shell: subtle bg + hairline ring + clearance + big radius.
                The `group` here drives the non-layout hover affordances (core
                brighten, glow) so those never move or resize anything. */}
            <div
              className={`group overflow-hidden rounded-3xl p-1.5 ring-1 transition-[box-shadow,ring-color] ${DUR} ${EASE} ${
                isOpen
                  ? "bg-white/[0.06] ring-[#52529c]/40"
                  : "bg-white/[0.03] ring-white/10 hover:bg-white/[0.05]"
              } ${
                isOpen
                  ? "shadow-[0_0_28px_rgba(110,120,220,0.28)]"
                  : "hover:shadow-[0_0_28px_rgba(110,120,220,0.20)]"
              }`}
            >
              {/* Inner core: content + top accent line + micro-pattern.
                  `group-hover` from the outer shell brightens the core/micro-
                  pattern on hover (visual only — never changes size or layout).
                  NOTE: the `group` is declared on the outer shell above, and the
                  core must NOT redeclare `group` (that would shadow the shell's
                  group-hover) — it uses group-hover/… variants instead. */}
              <div
                className="relative overflow-hidden rounded-[calc(1.5rem-6px)] bg-[#0F0F12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] transition-[background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#121216]"
                style={{
                  backgroundImage: a.pattern,
                  backgroundSize: "auto",
                  backgroundBlendMode: "overlay",
                }}
              >
                {/* Per-domain top-edge accent line */}
                <span
                  className="absolute inset-x-0 top-0 h-[2px] opacity-60"
                  style={{ background: `linear-gradient(90deg, ${a.accent}, transparent)` }}
                />

                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-controls={`domain-panel-${d.id}`}
                  className="relative flex w-full cursor-pointer items-center gap-x-4 px-6 py-6 text-left"
                >
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border bg-void transition-[color,box-shadow,border-color] ${DUR} ${EASE}`}
                    style={{
                      borderColor: "rgba(255,255,255,0.1)",
                      color: isOpen ? a.accent : a.accent,
                      boxShadow: isOpen ? `0 0 18px ${a.glow}` : "none",
                    }}
                  >
                    <Icon size={30} weight="duotone" />
                  </span>

                  <span className="shrink-0 font-display text-xl font-semibold tracking-tight text-ink">
                    {d.name}
                  </span>

                  <span
                    className={`ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-[transform,color,border-color] ${DUR} ${EASE} ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    style={{
                      borderColor: isOpen
                        ? a.ring
                        : "rgba(255,255,255,0.1)",
                      color: isOpen ? a.accent : "#5A5A62",
                    }}
                  >
                    <CaretRight size={16} weight="bold" />
                  </span>
                </button>

                {/* Expandable content — grid-template-rows 0fr->1fr for smooth auto-height */}
                <div
                  id={`domain-panel-${d.id}`}
                  className={`grid transition-[grid-template-rows] ${DUR} ${EASE} ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6">
                      <p className="mb-4 text-[0.95rem] leading-relaxed text-ink-secondary">
                        {d.description}
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {d.subAreas.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full border px-3.5 py-1.5 font-mono text-[0.72rem] tracking-wide text-ink-secondary"
                            style={{
                              borderColor: "rgba(255,255,255,0.12)",
                              background: "rgba(0,0,0,0.25)",
                            }}
                          >
                            <span className="text-white">{tag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}