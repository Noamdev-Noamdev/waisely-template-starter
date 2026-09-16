/**
 * ---------------------------------------------------------------------------
 * News.tsx — News & press section
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { NewsItem } from "@/lib/types";

export default function News({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="nieuws" className="scroll-mt-24 bg-surface py-20 md:py-28">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Nieuws & pers
          </p>
          <h2 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Recent nieuws en persvermeldingen
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((item, i) => (
            <Reveal key={item.id} delay={i * 100}>
              <article className="card-hover flex h-full flex-col rounded-[var(--radius)] bg-background p-6 shadow-[var(--shadow-md)]">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={item.type === "press" ? "warning" : "accent"}>
                    {item.type === "press" ? "Pers" : "Artikel"}
                  </Badge>
                  <time
                    dateTime={item.date}
                    className="text-xs text-muted-foreground"
                  >
                    {formatDate(item.date)}
                  </time>
                </div>

                <h3 className="mt-3 text-lg font-medium leading-snug text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {item.excerpt}
                </p>

                {item.type === "press" && item.externalUrl ? (
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
                  >
                    Lees het artikel
                    <Icon name="external" size={15} />
                  </a>
                ) : (
                  <Link
                    href={`/nieuws/${item.id}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
                  >
                    Lees verder
                    <Icon name="arrow-right" size={15} />
                  </Link>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
