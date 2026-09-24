/**
 * ---------------------------------------------------------------------------
 * Services.tsx — Module overview (warm minimal cards)
 * ---------------------------------------------------------------------------
 * Shows the modules that can be combined into a custom 2-hour workshop.
 * Elevated cards with warm shadows, no borders.
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import type { Service } from "@/lib/types";

export default function Services({ services }: { services: Service[] }) {
  return (
    <section id="diensten" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Modules
          </p>
          <h2 className="mt-2 max-w-2xl text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Stel je workshop samen
          </h2>
          <p className="prose-muted mt-4 max-w-2xl">
            Kies maximaal drie modules die je combineert tot een workshop van 2
            uur. Elke module bevat concrete lesvoorbeelden die je meteen kunt
            inzetten.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services
            .sort((a, b) => a.order - b.order)
            .slice(0, 6)
            .map((service, i) => (
              <Reveal key={service.id} delay={i * 100}>
                <article className="card-hover group flex h-full flex-col rounded-[var(--radius)] bg-surface p-6 shadow-[var(--shadow-md)]">
                  {/* Icon badge */}
                  <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius)] bg-background text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <Icon name={service.icon} size={22} />
                  </div>

                  <h3 className="mt-4 text-lg font-medium leading-snug text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>

                  {/* Meta */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1">
                      <Icon name="clock" size={12} />
                      {service.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1">
                      <Icon name="users" size={12} />
                      {service.audience}
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
        </div>

        <Reveal delay={200}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="/boek-een-training">
              Boek een training
              <Icon name="arrow-right" size={16} />
            </ButtonLink>
            <Link
              href="/contact"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Of neem vrijblijvend contact op
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
