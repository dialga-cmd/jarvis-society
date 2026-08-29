"use client";

import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { contactMeta, navLinks, socialLinks } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative border-t border-hairline bg-void">
      <div className="container-shell py-16">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label="JARVIS Society home">
              <span className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-surface text-accent-soft">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
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
              <span className="font-display text-lg font-semibold tracking-tight text-ink">
                JARVIS Society
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-ink-secondary">
              A student tech collective building across security, hardware,
              games, and applied computing. Learn in the open, ship in
              public.
            </p>
            <ul className="mt-7 flex items-center gap-3">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.label}>
                    <Link
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-surface text-ink-secondary transition-all duration-300 hover:border-accent-soft hover:text-ink"
                      aria-label={s.label}
                    >
                      <Icon size={16} weight="duotone" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Page links */}
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-tertiary">
              Index
            </p>
            <ul className="mt-5 grid gap-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-1.5 text-[0.95rem] text-ink-secondary transition-colors hover:text-ink"
                  >
                    {l.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Signal / contact */}
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-tertiary">
              Signal
            </p>
            <ul className="mt-5 grid gap-3 text-[0.95rem]">
              <li>
                <a
                  href={`mailto:${contactMeta.email}`}
                  className="text-ink-secondary transition-colors hover:text-ink"
                >
                  {contactMeta.email}
                </a>
              </li>
              <li className="flex items-center gap-2 font-mono text-sm text-ink-tertiary">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
                all systems nominal
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-hairline pt-8 sm:flex-row sm:items-center">
          <p className="font-mono text-sm text-ink-tertiary">
            © {new Date().getFullYear()} JARVIS Society. Built by members.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-5 py-2.5 font-mono text-sm text-ink-secondary transition-all duration-300 hover:border-accent-soft hover:text-ink"
          >
            Back to top
            <ArrowUp
              size={14}
              className="transition-transform duration-300 group-hover:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </footer>
  );
}