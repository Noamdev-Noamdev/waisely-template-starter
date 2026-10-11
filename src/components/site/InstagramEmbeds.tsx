/**
 * ---------------------------------------------------------------------------
 * InstagramEmbeds.tsx — Officiële Instagram-embeds (client component)
 * ---------------------------------------------------------------------------
 * Toont Instagram-posts via de officiële embed-methode van Instagram:
 *   1. Per post een <blockquote class="instagram-media"> met de permalink.
 *   2. Het script https://www.instagram.com/embed.js vervangt die blockquotes
 *      door een iframe met foto/video, caption en likes.
 * Geen API-key of Meta-app nodig; de admin plakt enkel de post-link.
 *
 * Waarom dangerouslySetInnerHTML? embed.js vervangt de blockquote in de DOM
 * door een iframe. Zou React die blockquote zelf beheren, dan botst dat bij
 * een re-render ("removeChild"-fouten). Door de blockquote als innerHTML in
 * een wrapper te zetten, raakt React de inhoud daarna niet meer aan.
 * De URL's zijn server-side genormaliseerd (enkel [A-Za-z0-9_-]), maar we
 * escapen ze voor de zekerheid toch.
 * ---------------------------------------------------------------------------
 */

"use client";

import Script from "next/script";
import { useEffect } from "react";

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
  // Bij (her)mount of gewijzigde lijst: nieuwe blockquotes laten verwerken.
  // Is het script nog niet geladen, dan doet onReady dit straks.
  const key = urls.join("|");
  useEffect(() => {
    window.instgrm?.Embeds.process();
  }, [key]);

  if (urls.length === 0) return null;

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
