"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function HeroMedia() {
  const [phase, setPhase] = useState<"intro" | "loop">("intro");
  const [reduce, setReduce] = useState(false);

  const introRef = useRef<HTMLVideoElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduce(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  // Crossfade to the looping video when the intro ends.
  const handleIntroEnded = () => {
    const dur = 0.28;
    const ease = "power2.inOut";
    if (loopRef.current) {
      loopRef.current.play().catch(() => {});
      gsap.to(loopRef.current, { opacity: 1, duration: dur, ease });
    }
    gsap.to(introRef.current, {
      opacity: 0,
      duration: dur,
      ease,
      onComplete: () => {
        introRef.current?.pause();
        setPhase("loop");
      },
    });
  };

  if (reduce) {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-2-poster.jpg"
          alt=""
          className="absolute left-0 right-0 top-[10%] bottom-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute left-0 right-0 top-[10%] bottom-0 overflow-hidden">
        <video
          ref={introRef}
          src="/logo.mp4"
          muted
          playsInline
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          onEnded={handleIntroEnded}
        />
        <video
          ref={loopRef}
          src="/logo-2.mp4"
          muted
          playsInline
          loop
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0 }}
        />
      </div>
    </div>
  );
}
