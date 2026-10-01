/**
 * ---------------------------------------------------------------------------
 * About.tsx — "Over WAIsely" section with bio and highlights
 * ---------------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import type { SiteContent } from "@/lib/types";

export default function About({ content }: { content: SiteContent }) {
  const { about } = content;
  const [isExpanded, setIsExpanded] = useState(false);

  // Splits de hoofdtekst in alinea's (gescheiden door witregels)
  const paragraphs = (about.body || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const hasMore = paragraphs.length > 2;
  const visibleParagraphs = hasMore && !isExpanded
    ? paragraphs.slice(0, 2)
    : paragraphs;

  return (
    <section id="over" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* Text block */}
          <Reveal>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Over
              </p>
              <h2 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                {about.title}
              </h2>

              <div className="prose-muted mt-5 space-y-4 text-base leading-relaxed">
                {visibleParagraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Uitklapknop voor lange tekst */}
              {hasMore ? (
                <div className="mt-4 flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold text-accent transition-colors hover:border-accent hover:bg-accent-soft"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? (
                      <>
                        Minder tonen
                        <Icon
                          name="chevron-down"
                          size={13}
                          className="rotate-180 transition-transform duration-200"
                        />
                      </>
                    ) : (
                      <>
                        Lees het hele verhaal
                        <Icon
                          name="chevron-down"
                          size={13}
                          className="transition-transform duration-200"
                        />
                      </>
                    )}
                  </button>
                  <Link
                    href="/over"
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    of open de bio-pagina
                    <Icon name="arrow-right" size={12} />
                  </Link>
                </div>
              ) : null}

              {/* Highlights */}
              <ul className="mt-8 space-y-4">
                {about.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-accent">
                      <Icon name="check" size={13} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {h.title}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {h.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Visual block — Portret of placeholder */}
          <Reveal delay={150}>
            <div className="lg:sticky lg:top-28">
              <div className="relative">
                {/* Offset accent layer */}
                <div
                  className="absolute -right-3 -top-3 h-full w-full rounded-[var(--radius)] bg-surface"
                  aria-hidden
                />
                {about.imageUrl ? (
                  <div className="card-hover relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[var(--radius)] bg-surface-muted shadow-[var(--shadow-lg)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={about.imageUrl}
                      alt={about.name || "Sabrina Carota"}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="relative z-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-5 text-white">
                      <p className="text-base font-semibold">
                        {about.name || "Sabrina Carota"}
                      </p>
                      <p className="mt-0.5 text-xs text-white/80">
                        {about.role || "Leerkracht, taalwetenschapper & AI-trainer"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="card-hover relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-[var(--radius)] bg-surface-muted shadow-[var(--shadow-lg)]">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background text-accent shadow-[var(--shadow-md)]">
                      <Icon name="user" size={30} />
                    </span>
                    <p className="mt-4 text-sm font-medium text-foreground">
                      {about.name || "Sabrina Carota"}
                    </p>
                    <p className="mt-1 max-w-56 text-center text-xs text-muted-foreground">
                      {about.role || "Leerkracht, taalwetenschapper & AI-trainer"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
