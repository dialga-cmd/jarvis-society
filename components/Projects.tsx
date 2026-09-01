"use client";

import { useRef, useEffect, useState } from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  GithubLogo,
  Fingerprint,
  GameController,
  Circuitry,
  Dna,
  Cpu,
  Cube,
  Code,
} from "@phosphor-icons/react/dist/ssr";
import gsap from "gsap";

export type SiteProject = {
  id: string;
  name: string;
  domain: string | null;
  blurb: string | null;
  status: string | null;
  tags: string[] | null;
  github: string | null;
};

// Constant slow marquee speed in px/second.
const SPEED = 44;

// Pick a card icon from the project's department label. The projects table
// has no icon column, so the accent glyph is derived from the domain.
function domainIcon(domain: string | null): Icon {
  const d = (domain ?? "").toLowerCase();
  if (d.includes("forensic") || d.includes("blockchain")) return Fingerprint;
  if (d.includes("game")) return GameController;
  if (d.includes("electron") || d.includes("iot") || d.includes("embedded"))
    return Circuitry;
  if (d.includes("infor") || d.includes("bio")) return Dna;
  if (d.includes("linux") || d.includes("kernel")) return Cpu;
  if (d.includes("immersive") || d.includes("vr") || d.includes("3d")) return Cube;
  return Code;
}

function ProjectCard({ p, i }: { p: SiteProject; i: number }) {
  const Icon = domainIcon(p.domain);

  return (
    <article className="proj-card group relative flex h-[340px] w-[280px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-hairline bg-surface sm:w-[320px] lg:w-[360px]">
      {/* Expanding corner flaps — they start as small tiles and fill the card
          on hover (translated from Uiverse by eslam-hany). */}
      <span className="proj-corner proj-corner-a" aria-hidden="true" />
      <span className="proj-corner proj-corner-b" aria-hidden="true" />

      {/* Rest state: the project name, centered. */}
      <div className="proj-rest relative z-10 px-6 text-center">
        <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight text-ink">
          {p.name}
        </h3>
      </div>

      {/* Revealed details — absolutely fills the card, laid out top to bottom
          like the original project card (no centering, nothing cropped). */}
      <div className="proj-reveal absolute inset-x-0 top-0 z-20 flex h-full w-full flex-col p-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.7rem] tracking-widest text-white/60">
            PROJ-{String(i + 1).padStart(2, "0")}
          </span>
          {p.github ? (
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.name} on GitHub`}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/5 text-white transition-colors duration-300 hover:bg-white hover:text-ink"
            >
              <GithubLogo size={16} weight="duotone" />
            </a>
          ) : (
            <span
              title="Repo not public yet"
              aria-disabled="true"
              className="grid h-9 w-9 cursor-not-allowed place-items-center rounded-full border border-white/15 bg-white/5 text-white/50"
            >
              <GithubLogo size={16} weight="duotone" />
            </span>
          )}
        </div>

        <div className="mt-6">
          <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/20 bg-white/10 text-white">
            <Icon size={20} weight="duotone" />
          </span>
          <h3 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-white">
            {p.name}
          </h3>
          <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-wider text-white/60">
            {p.domain ?? "—"}
          </p>
          <p className="mt-3 text-[0.82rem] leading-relaxed text-white/85">{p.blurb}</p>
        </div>

        <ul className="mt-auto flex flex-wrap gap-2 pt-5">
          {(p.tags ?? []).map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/20 bg-white/5 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-white/80"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function ProjectRow({ items }: { items: SiteProject[] }) {
  return (
    <div className="flex shrink-0 items-stretch gap-5 pr-5">
      {items.map((p, i) => (
        <ProjectCard key={p.id} p={p} i={i} />
      ))}
    </div>
  );
}

export function Projects({ projects }: { projects: SiteProject[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  // How many repeats of the pattern fill (then overflow) the viewport. Starts
  // at a sane default and is re-measured on mount/resize.
  const [copies, setCopies] = useState(4);

  // Measure the single-pattern width and compute enough repeats to span the
  // full viewport so the marquee never has gaps, no matter how few cards.
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setReduced(reduce);
    if (reduce) return;

    const measure = () => {
      const track = trackRef.current;
      const row = rowRef.current;
      const viewport = track?.parentElement;
      if (!track || !row || !viewport) return;
      const pattern = row.offsetWidth;
      if (!pattern) return;
      const vw = viewport.offsetWidth;
      setCopies(Math.max(2, Math.ceil(vw / pattern) + 2));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Seamless loop: the pattern is repeated `copies` times, so translating by
  // exactly one pattern width restarts on identical content.
  useEffect(() => {
    if (reduced || copies === 0) return;
    const track = trackRef.current;
    const row = rowRef.current;
    if (!track || !row) return;

    const pattern = row.offsetWidth;
    if (!pattern) return;

    let tween: gsap.core.Tween = gsap.to(track, {
      x: -pattern,
      duration: pattern / SPEED,
      ease: "none",
      repeat: -1,
      force3D: true,
    });

    const pause = () => tween.pause();
    const resume = () => tween.play();
    const wrapper = track.parentElement;
    if (wrapper) {
      wrapper.addEventListener("pointerenter", pause);
      wrapper.addEventListener("pointerleave", resume);
      wrapper.addEventListener("touchstart", pause, { passive: true });
      wrapper.addEventListener("touchend", resume, { passive: true });
    }

    return () => {
      tween.kill();
      if (wrapper) {
        wrapper.removeEventListener("pointerenter", pause);
        wrapper.removeEventListener("pointerleave", resume);
        wrapper.removeEventListener("touchstart", pause);
        wrapper.removeEventListener("touchend", resume);
      }
    };
  }, [reduced, copies]);

  return (
    <section id="projects" className="relative overflow-hidden bg-surface/40 py-28">
      <div className="container-shell mb-14">
        <p className="eyebrow mb-5">
          <span className="text-ink-tertiary">//</span> Live investigations
        </p>
        <h2 className="text-balance max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
          Projects in the <span className="text-accent-lit">workshop</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary">
          A slow-moving feed of what members are building across the four
          domains. Hover or tap to pause and dig in.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="container-shell">
          <p className="max-w-md font-mono text-xs uppercase tracking-[0.2em] text-ink-tertiary">
            The workshop is quiet… no projects in the database yet.
          </p>
        </div>
      ) : (
        <div
          className={`relative ${
            reduced
              ? "overflow-x-auto pb-4"
              : "overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
          }`}
        >
          <div ref={trackRef} className="flex w-max">
            {Array.from({ length: reduced ? 1 : copies }, (_, i) => (
              <div
                key={i}
                ref={i === 0 ? rowRef : undefined}
                className="flex shrink-0"
              >
                <ProjectRow items={projects} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}