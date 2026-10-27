/**
 * ---------------------------------------------------------------------------
 * PageviewTracker.tsx — Stuurt een anonieme paginaweergave naar /api/track
 * ---------------------------------------------------------------------------
 * Rendert niets. Registreert ook client-side navigatie via usePathname().
 * De verwijzer wordt enkel bij de eerste pagina van het bezoek meegestuurd.
 * Zet geen cookies en gebruikt geen browseropslag.
 * ---------------------------------------------------------------------------
 */

"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function PageviewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    // Voorkomt dubbele telling (React StrictMode draait effects 2x in dev).
    if (!pathname || lastTracked.current === pathname) return;
    const isFirst = lastTracked.current === null;
    lastTracked.current = pathname;

    const payload = JSON.stringify({
      path: pathname,
      referrer: isFirst ? document.referrer : "",
    });

    const sent =
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));

    if (!sent) {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
