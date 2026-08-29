"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";

const NAV_LINKS = [
  { label: "Domains", href: "/#domains" },
  { label: "Projects", href: "/#projects" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

function Monogram() {
  return (
    <span
      className="grid h-8 w-8 place-items-center rounded-md border border-hairline bg-surface text-accent"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19c0-8 3-14 8-14s8 6 8 14" />
        <path d="M6 19c0-5 2-8 6-8s6 3 6 8" />
        <circle cx="12" cy="7" r="1.5" />
      </svg>
    </span>
  );
}

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Track scroll to subtly tighten the pill once the page moves.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the overlay on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Overlay reveal / hide animation.
  useEffect(() => {
    const tl = gsap.timeline({ paused: false });
    if (open) {
      gsap.set(overlayRef.current, { display: "flex", autoAlpha: 0 });
      tl.to(overlayRef.current, { autoAlpha: 1, duration: 0.4, ease: "power2.out" })
        .fromTo(
          linkRefs.current.filter(Boolean),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.07,
            ease: "expo.out",
          },
          0.15
        );
      // Prevent background scroll while open.
      document.body.style.overflow = "hidden";
    } else {
      tl.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => gsap.set(overlayRef.current, { display: "none" }),
      });
      document.body.style.overflow = "";
    }
    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-nav">
        <div className="container-shell">
          <nav
            aria-label="Primary"
            className={`mt-6 flex items-center justify-between gap-4 rounded-full border border-white/10 bg-[rgba(13,14,20,0.5)] px-4 py-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-500 ease-out-expo sm:px-5 ${
              scrolled ? "shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]" : ""
            }`}
          >
            <Link
              href="/"
              className="group flex items-center gap-3"
              aria-label="JARVIS Society home"
            >
              <Monogram />
              <span className="font-display text-sm font-semibold tracking-tight text-ink md:text-base">
                JARVIS{" "}
                <span className="hidden font-normal text-ink-secondary sm:inline">
                  Society
                </span>
              </span>
            </Link>

            {/* Desktop links */}
            <ul className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="rounded-full px-4 py-2 text-sm text-ink-secondary transition-colors duration-300 hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <Link
                href="/#contact"
                className="hidden rounded-full bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-[#0c0c30] transition-all duration-300 ease-out-expo hover:brightness-125 active:scale-[0.98] md:inline-block"
              >
                Join Us
              </Link>

              {/* Hamburger morph (mobile) */}
              <button
                type="button"
                className="relative grid h-11 w-11 place-items-center rounded-full border border-hairline bg-surface text-ink md:hidden"
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((v) => !v)}
              >
                <span className="relative block h-3 w-5">
                  <span
                    className={`absolute left-0 top-0 block h-px w-5 bg-current transition-all duration-300 ease-out-expo ${
                      open ? "top-1.5 rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-1/2 block h-px w-5 -translate-y-1/2 bg-current transition-all duration-300 ease-out-expo ${
                      open ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`absolute left-0 bottom-0 block h-px w-5 bg-current transition-all duration-300 ease-out-expo ${
                      open ? "bottom-1.5 -rotate-45" : ""
                    }`}
                  />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Full-screen mobile overlay */}
      <div
        ref={overlayRef}
        id="mobile-menu"
        className="fixed inset-0 z-overlay hidden items-center bg-void/90 px-8 backdrop-blur-2xl"
        style={{ display: "none" }}
      >
        <div className="container-shell w-full">
          <ul className="grid gap-2">
            {NAV_LINKS.map((l, i) => (
              <li key={l.href}>
                <div
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
                >
                  <Link
                    href={l.href}
                    className="group flex items-baseline gap-4 py-4 font-display text-3xl font-semibold tracking-tight text-ink transition-colors hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    <span className="font-mono text-sm text-ink-tertiary">
                      0{i + 1}
                    </span>
                    {l.label}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <div
            ref={(el) => {
              linkRefs.current[NAV_LINKS.length] = el;
            }}
            className="mt-8"
          >
            <Link
              href="/#contact"
              className="inline-block rounded-full bg-brand-indigo px-8 py-4 text-base font-semibold text-[#0c0c30] active:scale-[0.98]"
            >
              Join the Society
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
