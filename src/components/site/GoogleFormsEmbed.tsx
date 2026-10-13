/**
 * ---------------------------------------------------------------------------
 * GoogleFormsEmbed.tsx — Ingesloten Google Forms intake formulier
 * ---------------------------------------------------------------------------
 * Vervangt het eerdere native formulier met een responsive Google Forms iframe.
 * Bevat een fallback-knop om het formulier desgewenst direct in een nieuw tabblad
 * te openen.
 * ---------------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

interface GoogleFormsEmbedProps {
  formUrl?: string;
  title?: string;
}

export const DEFAULT_GOOGLE_FORMS_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSexX1M69K8oX1HkrpEFjYukhIkWcOmFdf1UBz7Sdi2Vlr1F_g/viewform?usp=sharing&ouid=117354812120361052316";

/**
 * Zorgt ervoor dat Google Forms URL's de embedded=true parameter hebben
 * zodat overbodige Google-marges en navigatieknoppen verborgen worden in het iframe.
 */
export function getEmbedUrl(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname.includes("docs.google.com") &&
      parsed.pathname.includes("/forms/")
    ) {
      parsed.searchParams.set("embedded", "true");
      return parsed.toString();
    }
    return url;
  } catch {
    return url;
  }
}

export default function GoogleFormsEmbed({
  formUrl = DEFAULT_GOOGLE_FORMS_URL,
  title = "Intake-vragenlijst WAIsely",
}: GoogleFormsEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const directUrl = formUrl || DEFAULT_GOOGLE_FORMS_URL;
  const embedUrl = getEmbedUrl(directUrl);

  return (
    <div className="w-full space-y-4">
      {/* Informatiebalk met doorklik-knop */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-border/70 bg-surface-muted/50 px-4 py-3 text-xs sm:text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Icon name="check" size={16} className="shrink-0 text-accent" />
          <span>
            Vul het formulier hieronder in of open het in een apart venster.
          </span>
        </div>
        <a
          href={directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-accent underline-offset-2 hover:underline shrink-0"
        >
          <span>Open in nieuw tabblad</span>
          <Icon name="external" size={14} />
        </a>
      </div>

      {/* Responsive iframe container */}
      <div className="relative w-full overflow-hidden rounded-[var(--radius)] border border-border bg-white shadow-inner min-h-[750px] sm:min-h-[850px]">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface p-6 text-center text-muted-foreground">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm">Intake-formulier laden…</p>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title}
          width="100%"
          height="850"
          className="w-full h-[750px] sm:h-[850px] border-0"
          onLoad={() => setLoaded(true)}
          loading="lazy"
        >
          Laden…
        </iframe>
      </div>
    </div>
  );
}
