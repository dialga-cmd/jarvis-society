"use client";

import { useRef, useEffect, type ReactNode, type CSSProperties } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 28,
  align,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  align?: "left" | "center";
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }
    el.style.opacity = "0";
    el.style.transform = `translateY(${y}px)`;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.style.transition = `opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`;
            el.style.opacity = "1";
            el.style.transform = "none";
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, y]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...(align === "center" ? { textAlign: "center" as const } : null),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
