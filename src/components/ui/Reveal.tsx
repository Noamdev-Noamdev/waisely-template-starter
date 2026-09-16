/**
 * ---------------------------------------------------------------------------
 * Reveal.tsx — Scroll-reveal wrapper voor subtiele sectie-animaties
 * ---------------------------------------------------------------------------
 * Wikkelt elk blok dat "in beeld moet schuiven" tijdens het scrollen.
 * Gebruik <Reveal delay={100}> rond secties/cards. De animatie draait één
 * keer (niet bij elke scroll) en respecteert prefers-reduced-motion (via
 * de CSS in globals.css).
 * ---------------------------------------------------------------------------
 */

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** Vertraging in ms; gebruik voor gestaffelde animaties in een grid. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect(); // maar één keer animeren
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${visible ? "reveal-visible" : "reveal-init"} ${className}`}
      style={visible ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
