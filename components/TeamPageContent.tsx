"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TeamCard } from "@/components/TeamCard";
import type { CoreMember } from "@/lib/core";
import { normalizeRoles } from "@/lib/core";

gsap.registerPlugin(ScrollTrigger);

// Category tabs: leadership first, then the domains. These match the
// `position` values the admin sets (legacy rows fall back to keyword search
// on the `team`/role column).
const CATEGORIES = [
  "Heads",
  "IoT & Electronics",
  "Game Development",
  "Immersive Technology",
  "Linux Team",
] as const;

// Old seed data used free-text positions/teams. Keyword map lets those still
// land in the right tab while the DB is migrated to the structured values.
const LEGACY_TERMS: Record<string, string[]> = {
  Heads: ["leadership", "president", "secretary"],
  "IoT & Electronics": ["electronics", "iot", "sensor", "embedded"],
  "Game Development": ["game", "unity", "unreal"],
  "Immersive Technology": ["immersive", "vr", "ar", "software"],
  "Linux Team": ["linux", "shell", "server", "infrastructure"],
};

function leaderRank(position?: string | null): number {
  const s = (position || "").toLowerCase();
  if (s.includes("vice president")) return 1;
  if (s.includes("president")) return 0;
  if (s.includes("lead") || s.includes("secretary")) return 2;
  if (s.includes("core member")) return 3;
  return 4;
}

function sortByLeadership(a: CoreMember, b: CoreMember): number {
  const byRank = leaderRank(a.position) - leaderRank(b.position);
  return byRank !== 0 ? byRank : a.name.localeCompare(b.name);
}

export function TeamPageContent({
  members,
  error,
}: {
  members: CoreMember[];
  error: string | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  const [selectedTeam, setSelectedTeam] = useState<string>(CATEGORIES[0]);

  const visibleMembers = useMemo(() => {
    // Primary: exact match against the new `position` value.
    const exact = members.filter((m) => (m.position || "") === selectedTeam);
    if (exact.length > 0) return exact.sort(sortByLeadership);
    // Fallback for legacy rows: keyword search against position/role.
    const terms = LEGACY_TERMS[selectedTeam] ?? [];
    return members
      .filter((m) =>
        terms.some(
          (t) =>
            (m.position || "").toLowerCase().includes(t) ||
            normalizeRoles(m.team)
              .join(" ")
              .toLowerCase()
              .includes(t)
        )
      )
      .sort(sortByLeadership);
  }, [members, selectedTeam]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".team-heading",
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

      if (visibleMembers.length > 0) {
        gsap.fromTo(
          ".team-card",
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "expo.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: ".team-grid",
              start: "top 88%",
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
    // Run exactly once when the data lands (stable `members` prop). Switching
    // categories must NOT replay the heading/card reveal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.length]);

  return (
    <main className="relative bg-void">
      <section id="teams" ref={sectionRef} className="relative bg-void">
        <div className="py-28 lg:py-32">
          <div className="container-shell w-full">
            <div className="team-heading mb-14 max-w-3xl md:mb-16">
              <p className="eyebrow mb-5">
                <span className="text-ink-tertiary">//</span> Core team
              </p>
              <h1 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
                The people behind{" "}
                <span className="text-accent-lit">JARVIS</span>
              </h1>
            </div>

            {members.length > 0 && (
              <div className="category-bar" role="tablist" aria-label="Teams">
                {CATEGORIES.map((team) => (
                  <button
                    key={team}
                    role="tab"
                    aria-selected={selectedTeam === team}
                    className={`category-btn ${selectedTeam === team ? "active" : ""
                      }`}
                    onClick={() => setSelectedTeam(team)}
                  >
                    {team}
                  </button>
                ))}
              </div>
            )}

            {visibleMembers.length > 0 ? (
              <div className="team-grid flex flex-wrap justify-center gap-10">
                {visibleMembers.map((m) => (
                  <div key={String(m.id)} className="team-card">
                    <TeamCard member={m} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-hairline bg-surface px-8 py-16 text-center">
                <p className="font-display text-2xl font-semibold text-ink">
                  {error ? "Could not load the team" : "No members yet"}
                </p>
                <p className="mx-auto mt-4 max-w-md text-ink-secondary">
                  {error
                    ? `We hit an issue reaching the board: ${error}`
                    : "The core team table is empty. Come back later to see the people behind the working of Jarvis."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}