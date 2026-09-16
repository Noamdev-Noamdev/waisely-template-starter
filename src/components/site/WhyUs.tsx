/**
 * ---------------------------------------------------------------------------
 * WhyUs.tsx — "Waarom WAIsely" section (warm dark variant)
 * ---------------------------------------------------------------------------
 * Uses the warm charcoal accent as background for visual contrast.
 * Cards are frosted glass effect on dark.
 * ---------------------------------------------------------------------------
 */

import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import type { SiteContent } from "@/lib/types";

export default function WhyUs({ content }: { content: SiteContent }) {
  const { why } = content;

  return (
    <section
      id="waarom"
      className="section-warm-dark scroll-mt-24 py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-foreground/60">
            Waarom WAIsely
          </p>
          <h2 className="mt-2 max-w-2xl text-3xl font-medium tracking-tight text-accent-foreground sm:text-4xl">
            {why.title}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {why.items.map((item, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="card-hover h-full rounded-[var(--radius)] bg-white/10 p-6 shadow-[var(--shadow-md)] backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-accent-foreground/80">
                  <Icon name="check" size={20} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
