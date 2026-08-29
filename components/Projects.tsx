"use client";

import { useRef, useEffect, useState } from "react";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import gsap from "gsap";
import { projects } from "@/lib/site";

// Constant slow marquee speed in px/second.
const SPEED = 44;

function ProjectCard({ p, i }: { p: (typeof projects)[number]; i: number }) {
  const Icon = p.icon;

  const statusTone = "text-ink";

  return (
    <article className="group relative flex w-[300px] shrink-0 flex-col justify-between overflow-hidden rounded-xl border border-hairline bg-surface p-6 transition-[transform,border-color,box-shadow,background-color] duration-300 ease-out-expo hover:-translate-y-1.5 hover:border-accent-soft/50 hover:bg-[#16161A] hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)] sm:w-[340px] lg:w-[360px]">
      <span className="absolute inset-y-0 left-0 w-px bg-accent-gradient opacity-30 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.7rem] tracking-widest text-ink-tertiary">
          PROJ-0{i + 1}
        </span>
        <span className="flex items-center gap-2">
          {p.github ? (
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.name} on GitHub`}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-void/60 text-ink-secondary transition-colors duration-300 hover:border-accent-soft/60 hover:text-ink"
            >
              <GithubLogo size={15} weight="duotone" />
            </a>
          ) : (
            <span
              title="Repo not public yet"
              aria-disabled="true"
              className="grid h-8 w-8 cursor-not-allowed place-items-center rounded-full border border-white/5 bg-void/40 text-ink-tertiary/60"
            >
              <GithubLogo size={15} weight="duotone" />
            </span>
          )}
          <span
            className={`rounded-full border border-white/10 bg-void/40 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-wider ${statusTone}`}
          >
            {p.status}
          </span>
        </span>
      </div>

      <div className="mt-6">
        <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-void/60 text-accent-soft">
          <Icon size={20} weight="duotone" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">
          {p.name}
        </h3>
        <p className="mt-1.5 font-mono text-[0.62rem] uppercase tracking-wider text-ink-tertiary">
          {p.domain}
        </p>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-ink-secondary">{p.blurb}</p>
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