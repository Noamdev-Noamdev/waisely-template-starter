/**
 * ---------------------------------------------------------------------------
 * Hero.tsx — Warm minimal hero with serif headline
 * ---------------------------------------------------------------------------
 * "Rust in de chaos" headline with Fraunces serif, soft glow background,
 * ghost-style CTAs, optional portrait photo, and stats strip.
 * ---------------------------------------------------------------------------
 */

import { ButtonLink } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import type { SiteContent } from "@/lib/types";

export default function Hero({ content }: { content: SiteContent }) {
  const hasImage = Boolean(content.hero.imageUrl && content.hero.imageUrl.trim());

  return (
    <section className="relative overflow-hidden">
      {/* Subtle warm glow */}
      <div className="hero-glow absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-[1000px] px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24">
        <div
          className={
            hasImage
              ? "grid items-center gap-12 lg:grid-cols-[1.25fr_0.75fr]"
              : "max-w-2xl"
          }
        >
          {/* Main content column */}
          <div>
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
                <ButtonLink href="/boek-een-training">
                  {content.hero.primaryCtaLabel}
                  <Icon name="arrow-right" size={16} />
                </ButtonLink>
                <ButtonLink href="/over" variant="secondary">
                  {content.hero.secondaryCtaLabel}
                  <Icon name="chevron-right" size={16} />
                </ButtonLink>
              </div>
            </Reveal>

            {/* Stats strip */}
            <Reveal delay={400}>
              <div
                className={`mt-14 grid gap-4 ${
                  hasImage
                    ? "grid-cols-1 sm:grid-cols-3"
                    : "max-w-2xl grid-cols-1 sm:grid-cols-3"
                }`}
              >
                {(content.hero.stats && content.hero.stats.length > 0
                  ? content.hero.stats
                  : [
                      { value: "20+", label: "Jaar onderwijservaring" },
                      { value: "7", label: "Modulaire thema's" },
                      { value: "Op maat", label: "Elke workshop uniek" },
                    ]
                ).map((stat, i) => (
                  <div
                    key={i}
                    className="card-hover rounded-[var(--radius)] bg-surface p-5 shadow-[var(--shadow-md)]"
                  >
                    <p className="text-2xl font-medium text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Optional Hero photo */}
          {hasImage ? (
            <Reveal delay={200}>
              <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
                {/* Offset decorative warm layer */}
                <div
                  className="absolute -right-3 -top-3 h-full w-full rounded-[var(--radius)] bg-surface"
                  aria-hidden
                />
                <div className="card-hover relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[var(--radius)] bg-surface-muted shadow-[var(--shadow-lg)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.hero.imageUrl}
                    alt={content.about?.name || "Sabrina Carota"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="relative z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 text-white">
                    <p className="text-base font-semibold">
                      {content.about?.name || "Sabrina Carota"}
                    </p>
                    <p className="mt-0.5 text-xs text-white/80">
                      {content.about?.role || "Leerkracht & AI-trainer"}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
