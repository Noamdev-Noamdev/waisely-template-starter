/**
 * ---------------------------------------------------------------------------
 * InstagramEmbeds.tsx — Geconditioneerde Instagram-embeds (client component)
 * ---------------------------------------------------------------------------
 * Voldoet aan de Belgische GBA / AVG-richtlijnen:
 *  - Laadt het externe script (https://www.instagram.com/embed.js) pas NA
 *    actieve toestemming voor social media cookies.
 *  - Toont zolang er geen toestemming is een rustige placeholder-kaart
 *    in de Quiet Warm Minimal stijl, inclusief directe link naar de post
 *    en een knop om de toestemming te activeren.
 * ---------------------------------------------------------------------------
 */

"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import Icon from "@/components/ui/Icon";
import {
  getStoredConsent,
  saveConsent,
  openCookieSettings,
  subscribeConsent,
} from "@/lib/consent";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

/** Minimale HTML-escape voor attribuutwaarden. */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** HTML van één embed (fallback-link zichtbaar tot embed.js geladen is). */
function embedHtml(url: string): string {
  const safe = escapeAttr(url);
  return `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${safe}?utm_source=ig_embed" data-instgrm-version="14" style="background:#fff;border:0;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.12);margin:0;max-width:540px;min-width:280px;padding:0;width:100%;"><a href="${safe}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;min-height:320px;padding:16px;color:#3897f0;font:600 14px/1.4 system-ui,sans-serif;text-decoration:none;">Bekijk deze post op Instagram</a></blockquote>`;
}

export default function InstagramEmbeds({ urls }: { urls: string[] }) {
  const cookieString = useSyncExternalStore(
    subscribeConsent,
    () => document.cookie,
    () => ""
  );

  const isClient = cookieString !== "";
  const consent = isClient ? getStoredConsent() : null;
  const hasSocialConsent = consent?.social === true;

  const key = urls.join("|");
  useEffect(() => {
    if (hasSocialConsent) {
      window.instgrm?.Embeds.process();
    }
  }, [key, hasSocialConsent]);

  if (urls.length === 0) return null;

  // Placeholder wanneer nog geen social media cookies aanvaard zijn
  if (!isClient || !hasSocialConsent) {
    return (
      <div className="grid items-start gap-6 md:grid-cols-2">
        {urls.map((url) => (
          <div
            key={url}
            className="flex min-h-[300px] flex-col items-center justify-center rounded-[var(--radius)] border border-border/80 bg-surface p-8 text-center shadow-[var(--shadow-sm)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-accent">
              <Icon name="quote" size={20} />
            </div>
            <h4
              className="mt-4 text-base font-medium text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Instagram-bericht
            </h4>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
              Om ingebedde Instagram-posts interactief te bekijken, hebben we je
              toestemming nodig voor externe social media cookies. Je kunt de
              post ook direct bekijken op Instagram.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-surface-muted"
              >
                <span>Bekijk op Instagram</span>
                <span aria-hidden>↗</span>
              </a>
              <button
                type="button"
                onClick={() => saveConsent(true, "custom")}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-accent-foreground shadow-[var(--shadow-accent)] transition-all hover:bg-accent-strong"
              >
                Cookies toestaan
              </button>
            </div>
            <button
              type="button"
              onClick={openCookieSettings}
              className="mt-3 text-[11px] text-muted-foreground underline hover:text-foreground"
            >
              Cookie-instellingen aanpassen
            </button>
          </div>
        ))}
      </div>
    );
  }

  // Actieve weergave na toestemming
  return (
    <>
      <div className="grid items-start gap-6 md:grid-cols-2">
        {urls.map((url) => (
          <div
            key={url}
            className="flex justify-center [&_iframe]:!min-w-0"
            dangerouslySetInnerHTML={{ __html: embedHtml(url) }}
          />
        ))}
      </div>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onReady={() => window.instgrm?.Embeds.process()}
      />
    </>
  );
}
