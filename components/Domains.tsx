"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { domains } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

// Asymmetric bento spans: offsets create a staggered, editorial rhythm.
// They must apply at the same breakpoint as the 12-col grid (md+) so the
// second row (cards 3/4) never collapses to 1-column cells.
const SPANS = [
  "md:col-span-7",
  "md:col-span-5",
  "md:col-span-5",
  "md:col-span-7",
];

export function Domains() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce || !sectionRef.current) {
      gsap.set(".domain-heading, .domain-card", { clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      // Heading fades up on its own; it scrolls normally with the page (no pin).
      gsap.fromTo(
        ".domain-heading",
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );

      // Cards reveal in place as the grid enters the viewport: fade-up,
      // staggered, same expo easing. No pinning, so the full grid (all four
      // cards at every breakpoint) stays reachable by normal scrolling.
      gsap.fromTo(
        ".domain-card",
        { autoAlpha: 0, y: 56, scale: 0.98 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          stagger: 0.15,
          ease: "expo.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: ".domain-grid",
            start: "top 80%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="domains" ref={sectionRef} className="relative bg-void">
      <div className="py-28 lg:py-32">
        <div className="container-shell w-full">
          <div className="domain-heading mb-14 max-w-3xl md:mb-20">
            <p className="eyebrow mb-5">
              <span className="text-ink-tertiary">//</span> Four disciplines
            </p>
            <h2 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
              Where the society <span className="text-accent-lit">specializes</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary">
              Four domains, one standard. Each workshop, event, and project
              lives inside one of these disciplines.
            </p>
          </div>

          <div className="domain-grid grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
            {domains.map((d, i) => {
              const Icon = d.icon;
              return (
                <article
                  key={d.id}
                  className={`domain-card group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-hairline bg-surface p-7 transition-colors duration-500 hover:border-white/15 md:p-9 ${
                    SPANS[i % SPANS.length]
                  }`}
                >
                  {/* Card top accent line */}
                  <span className="absolute inset-x-0 top-0 h-px bg-accent-gradient opacity-40 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="flex items-start justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-xl border border-white/10 bg-void text-accent-soft">
                      <Icon size={26} weight="duotone" />
                    </span>
                    <span className="font-mono text-sm tracking-widest text-ink-tertiary">
                      {d.index}
                    </span>
                  </div>

                  <div className="mt-10">
                    <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
                      {d.name}
                    </h3>
                    <p className="mt-2 text-sm italic text-ink-secondary">
                      {d.tagline}
                    </p>
                    <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-secondary">
                      {d.description}
                    </p>
                  </div>

                  <ul className="mt-8 flex flex-wrap gap-2">
                    {d.subAreas.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-white/10 bg-void/40 px-3.5 py-1.5 font-mono text-[0.72rem] tracking-wide text-ink-secondary"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
