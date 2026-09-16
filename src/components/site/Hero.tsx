/**
 * ---------------------------------------------------------------------------
 * Hero.tsx — Warm minimal hero with serif headline
 * ---------------------------------------------------------------------------
 * "Rust in de chaos" headline with Fraunces serif, soft glow background,
 * and ghost-style CTAs. Stats strip shows real figures.
 * ---------------------------------------------------------------------------
 */

import { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import type { SiteContent } from "@/lib/types";

export default function Hero({ content }: { content: SiteContent }) {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle warm glow */}
      <div className="hero-glow absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-[1000px] px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <Reveal>
            <p className="pulse-dot inline-flex items-center rounded-full bg-surface px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {content.hero.eyebrow}
            </p>
          </Reveal>

          {/* Title — large serif */}
          <Reveal delay={100}>
            <h1 className="mt-6 text-4xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {content.hero.title}
            </h1>
          </Reveal>

          {/* Subtitle */}
          <Reveal delay={200}>
            <p className="prose-muted mt-6 max-w-xl">{content.hero.subtitle}</p>
          </Reveal>

          {/* CTAs — ghost style */}
          <Reveal delay={300}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/modules">
                {content.hero.primaryCtaLabel}
                <Icon name="arrow-right" size={16} />
              </ButtonLink>
              <ButtonLink href="/over" variant="secondary">
                {content.hero.secondaryCtaLabel}
                <Icon name="chevron-right" size={16} />
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        {/* Stats strip */}
        <Reveal delay={400}>
          <div className="mt-16 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { value: "20+", label: "Jaar onderwijservaring" },
              { value: "8", label: "Modulaire thema's" },
              { value: "Op maat", label: "Elke workshop uniek" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card-hover rounded-[var(--radius)] bg-surface p-5 shadow-[var(--shadow-md)]"
              >
                <p className="text-2xl font-medium text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
