"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { AmbientNetwork } from "./AmbientNetwork";
import { HeroMedia } from "./HeroMedia";

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce || !rootRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      // Wordmark lines lift in with a mask-style fade.
      tl.fromTo(
        ".hero-word",
        { opacity: 0, y: 60, rotateX: 28 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: 0.12 },
        0.1
      );

      tl.fromTo(
        ".hero-cta",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.75
      );

      tl.fromTo(
        ".hero-corner",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.8 },
        1.05
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100dvh] flex-col justify-between overflow-hidden bg-black"
    >
      {/* Solid black base so no tint/old background shows through */}
      <div className="absolute inset-0 bg-black" />

      {/* Center beam accent for HUD feel */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-hairline to-transparent opacity-60" />

      {/* Logo: mp4 draw-on reveal -> looping video. Full-bleed, under the navbar. */}
      <HeroMedia />

      {/* Orbs on top of the video (transparent bg so they blend into the video's black) */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <AmbientNetwork />
      </div>

      {/* Wordmark + CTAs */}
      <div className="container-shell pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-center py-24 text-center">
        <h1 className="font-display text-ink">
          <span className="hero-word block text-[clamp(4.5rem,16vw,11rem)] font-bold leading-[0.95] tracking-[-0.02em]">
            JARVIS
          </span>
          <span className="hero-word mt-5 block font-mono text-[clamp(0.85rem,2vmin,1.25rem)] uppercase tracking-[0.5em] text-accent-lit sm:mt-7">
            Society
          </span>
        </h1>

        <div className="hero-cta mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/#contact"
            className="pointer-events-auto inline-block rounded-full bg-brand-indigo px-8 py-4 text-base font-semibold text-[#0c0c30] shadow-[0_8px_30px_rgba(11,27,63,0.5)] transition-all duration-300 ease-out-expo hover:brightness-125 active:scale-[0.98]"
          >
            Join the Society
          </Link>
          <Link
            href="/#domains"
            className="btn-ghost pointer-events-auto inline-block rounded-full px-8 py-4 text-base font-semibold"
          >
            Explore the domains
          </Link>
        </div>
      </div>

      {/* Bottom-left / bottom-right corner captions */}
      <div className="hero-corner container-shell pointer-events-none relative z-10 flex w-full items-end justify-between gap-6 pt-16 font-mono text-[0.6rem] uppercase leading-relaxed tracking-[0.18em] text-ink-secondary sm:text-[0.7rem]">
        <div className="w-1/2">
          <p className="text-ink">Student Tech Collective</p>
          <p className="mt-1.5 text-ink-secondary">IIT Madras BS Program</p>
        </div>
        <div className="w-1/2 text-right">
          <p className="text-ink">Four domains · one standard</p>
          <p className="mt-1.5 text-ink-secondary">
            Security · Hardware · Games · Informatics
          </p>
        </div>
      </div>
    </section>
  );
}