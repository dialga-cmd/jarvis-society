"use client";

import { useRef, useEffect, useState } from "react";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import gsap from "gsap";
import { projects } from "@/lib/site";

// Constant slow marquee speed in px/second.
const SPEED = 44;

function ProjectCard({ p, i }: { p: (typeof projects)[number]; i: number }) {
  const Icon = p.icon;

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
            PROJ-0{i + 1}
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
            {p.domain}
          </p>
          <p className="mt-3 text-[0.82rem] leading-relaxed text-white/85">{p.blurb}</p>
        </div>

        <ul className="mt-auto flex flex-wrap gap-2 pt-5">
          {p.tags.map((tag) => (
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

function ProjectRow({ items }: { items: (typeof projects)[number][] }) {
  return (
    <div className="flex shrink-0 items-stretch gap-5 pr-5">
      {items.map((p, i) => (
        <ProjectCard key={p.id} p={p} i={i} />
      ))}
    </div>
  );
}

export function Projects() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setReduced(reduce);
    if (reduce) return;

    const track = trackRef.current;
    if (!track) return;

    let tween: gsap.core.Tween | null = null;
    let wrapper: HTMLElement | null = null;

    const setup = () => {
      tween?.kill();
      const half = track.scrollWidth / 2;
      if (!half) return;
      tween = gsap.to(track, {
        x: -half,
        duration: half / SPEED,
        ease: "none",
        repeat: -1,
        force3D: true,
      });
    };

    setup();

    const pause = () => tween?.pause();
    const resume = () => tween?.play();

    wrapper = track.parentElement;
    if (wrapper) {
      wrapper.addEventListener("pointerenter", pause);
      wrapper.addEventListener("pointerleave", resume);
      wrapper.addEventListener("touchstart", pause, { passive: true });
      wrapper.addEventListener("touchend", resume, { passive: true });
    }

    const onResize = () => setup();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (wrapper) {
        wrapper.removeEventListener("pointerenter", pause);
        wrapper.removeEventListener("pointerleave", resume);
        wrapper.removeEventListener("touchstart", pause);
        wrapper.removeEventListener("touchend", resume);
      }
      tween?.kill();
    };
  }, []);

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

      <div
        className={`relative ${
          reduced
            ? "overflow-x-auto pb-4"
            : "overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
        }`}
      >
        <div ref={trackRef} className="flex w-max">
          {reduced ? (
            <ProjectRow items={projects} />
          ) : (
            <>
              <ProjectRow items={projects} />
              <ProjectRow items={projects} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}