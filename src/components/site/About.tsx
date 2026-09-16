/**
 * ---------------------------------------------------------------------------
 * About.tsx — "Over WAIsely" section with bio and highlights
 * ---------------------------------------------------------------------------
 */

import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import type { SiteContent } from "@/lib/types";

export default function About({ content }: { content: SiteContent }) {
  const { about } = content;

  return (
    <section id="over" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text block */}
          <Reveal>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Over
              </p>
              <h2 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                {about.title}
              </h2>
              <p className="prose-muted mt-5 whitespace-pre-line">
                {about.body}
              </p>

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

          {/* Visual block — warm abstract portrait placeholder */}
          <Reveal delay={150}>
            <div className="relative">
              {/* Offset accent layer */}
              <div
                className="absolute -right-3 -top-3 h-full w-full rounded-[var(--radius)] bg-surface"
                aria-hidden
              />
              <div className="card-hover relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-[var(--radius)] bg-surface-muted shadow-[var(--shadow-lg)]">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background text-accent shadow-[var(--shadow-md)]">
                  <Icon name="user" size={30} />
                </span>
                <p className="mt-4 text-sm font-medium text-foreground">
                  Sabrina Carota
                </p>
                <p className="mt-1 max-w-56 text-center text-xs text-muted-foreground">
                  Leerkracht, taalwetenschapper & AI-trainer
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
