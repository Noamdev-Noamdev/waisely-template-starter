/**
 * ---------------------------------------------------------------------------
 * Intro.tsx — Positioning block below the hero
 * ---------------------------------------------------------------------------
 */

import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import type { SiteContent } from "@/lib/types";

export default function Intro({ content }: { content: SiteContent }) {
  return (
    <section className="bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <Reveal>
            <div className="max-w-2xl">
              <h2 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                {content.intro.title}
              </h2>
              <p className="prose-muted mt-4">{content.intro.body}</p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="flex items-center gap-3 rounded-[var(--radius)] bg-background p-5 shadow-[var(--shadow-md)]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius)] bg-surface text-accent shadow-[var(--shadow-sm)]">
                <Icon name="target" size={20} />
              </span>
              <p className="max-w-56 text-sm leading-relaxed text-muted-foreground">
                Alle trainingen zijn praktisch en direct inzetbaar in de klas.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
