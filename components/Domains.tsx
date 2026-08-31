"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { domains } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

// Interactive (hover-reveal) cards only apply on desktop (lg+). Below that —
// mobile & tablet — cards render fully static with all details visible, and
// tapping does nothing.
const INTERACTIVE_QUERY = "(min-width: 1024px)";

export function Domains() {
  const sectionRef = useRef<HTMLElement>(null);
  // Cards the user has tapped/pinned open. Once pinned, that card ignores all
  // hover/animate logic and stays fully expanded & static. Pin all four to
  // stop every card.
  const [pinned, setPinned] = useState<Record<string, boolean>>({});

  const pinCard = (id: string) => {
    if (typeof window !== "undefined" && !window.matchMedia(INTERACTIVE_QUERY).matches) {
      return; // no hover logic on mobile/tablet — ignore taps
    }
    setPinned((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

          <div className="domain-grid grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {domains.map((d) => {
              const Icon = d.icon;
              const isPinned = !!pinned[d.id];
              return (
                <article
                  key={d.id}
                  data-pinned={isPinned ? "true" : undefined}
                  onClick={() => pinCard(d.id)}
                  className="domain-card group relative flex overflow-hidden rounded-2xl border border-hairline bg-surface p-7 md:p-9"
                >
                  {/* Card top accent line */}
                  <span className="absolute inset-x-0 top-0 h-px bg-accent-gradient opacity-40" />

                  {/* Translated Uiverse animation layers */}
                  <span className="dc-frame" aria-hidden="true" />
                  <span className="dc-trail" aria-hidden="true" />

                  {/* Collapsed hero: icon + title float centered. On hover it
                      slides/fades away as the expanded stack settles in. Both
                      layers use only transform + opacity, so the transition is
                      GPU-smooth and the card footprint never changes. */}
                  <div className="dc-hero absolute inset-0 grid content-center" aria-hidden="true">
                    <div className="px-4 text-center">
                      <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-white/10 bg-void text-accent-soft">
                        <Icon size={26} weight="duotone" />
                      </span>
                      <h3 className="dc-hero-title mx-auto mt-8 max-w-[18ch] font-display text-2xl font-semibold leading-tight tracking-tight text-ink">
                        {d.name}
                      </h3>
                    </div>
                    <span className="dc-hero-index absolute right-6 top-6 font-mono text-sm tracking-widest text-ink-tertiary">
                      {d.index}
                    </span>
                  </div>

                  {/* Expanded stack: icon + title settle to their spots, then
                      the details reveal below — all inside the fixed card. */}
                  <div className="dc-stack relative flex h-full w-full flex-col">
                    <div className="flex items-start justify-between">
                      <span className="dc-icon grid h-14 w-14 place-items-center rounded-xl border border-white/10 bg-void text-accent-soft">
                        <Icon size={26} weight="duotone" />
                      </span>
                      <span className="flex items-center gap-3">
                        {isPinned && (
                          <span className="dc-pinned font-mono text-[0.65rem] uppercase tracking-widest text-accent-soft">
                            Pinned
                          </span>
                        )}
                        <span className="dc-index font-mono text-sm tracking-widest text-ink-tertiary">
                          {d.index}
                        </span>
                      </span>
                    </div>

                    <h3 className="dc-title mt-8 font-display text-2xl font-semibold tracking-tight text-ink">
                      {d.name}
                    </h3>

                    <div className="dc-details">
                      <p className="dc-tagline mt-2 text-sm italic text-ink-secondary">
                        {d.tagline}
                      </p>
                      <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-secondary">
                        {d.description}
                      </p>
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
                    </div>
                  </div>

                  {/* Hover hint — a footer that shows before the reveal and
                      fades away once the animation is triggered. Hidden for
                      pinned cards and on mobile/tablet (no hover). */}
                  <span className="dc-hoverhint absolute bottom-5 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 whitespace-nowrap font-mono text-[0.7rem] uppercase tracking-widest text-ink-tertiary">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-soft" aria-hidden="true" />
                    Hover to reveal
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
