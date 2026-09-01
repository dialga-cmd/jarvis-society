"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { CoreMember } from "@/lib/core";
import { formatRoles } from "@/lib/core";

const MAX_TILT = 17.5;

// Portrait team card with mouse-tracking 3D tilt — ported from the Nilgiri
// House website's CouncilCard (framer-motion there, GSAP quickTo here).
// Tilt is desktop-only (hover gating) and disabled under reduced motion.
export function TeamCard({ member }: { member: CoreMember }) {
  const cardRef = useRef<HTMLElement>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.set(card, { transformPerspective: 800 });
    const rotX = gsap.quickTo(card, "rotationX", {
      duration: 0.5,
      ease: "power3.out",
    });
    const rotY = gsap.quickTo(card, "rotationY", {
      duration: 0.5,
      ease: "power3.out",
    });

    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotY(px * MAX_TILT * 2);
      rotX(py * -MAX_TILT * 2);
    };
    const onLeave = () => {
      rotX(0);
      rotY(0);
    };

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <article
      ref={cardRef}
      className="council-member-card"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="portrait-container">
        <div className="portrait-bg" />
        {member.image && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.image}
            alt={member.name}
            className="portrait-img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="portrait-placeholder" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
        <div className="portrait-overlay" />
      </div>
      <div className="member-info">
        <h3>{member.name}</h3>
        {member.position && <p className="member-role">{member.position}</p>}
        {formatRoles(member.team) && (
          <p className="member-tags">{formatRoles(member.team)}</p>
        )}
      </div>
    </article>
  );
}