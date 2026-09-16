/**
 * ---------------------------------------------------------------------------
 * NewsDetailPage (/nieuws/[id])
 * ---------------------------------------------------------------------------
 * Toont één artikel (of persvermelding) uit de store. Persvermeldingen met
 * externe URL linken direct door; artikelen krijgen een leesbare layout.
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { get } from "@/lib/db";
import { formatDate } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const items = await get("news");
  const item = items.find((n) => n.id === id);
  if (!item) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
      {/* Terug-link */}
      <Link
        href="/#nieuws"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
      >
        <Icon name="arrow-left" size={15} />
        Terug naar nieuws
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <Badge tone={item.type === "press" ? "warning" : "accent"}>
          {item.type === "press" ? "Pers" : "Artikel"}
        </Badge>
        <time dateTime={item.date} className="text-sm text-muted-foreground">
          {formatDate(item.date)}
        </time>
      </div>

      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
        {item.title}
      </h1>
      <p className="prose-muted mt-4">{item.excerpt}</p>

      <div className="mt-8 rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] sm:p-8">
        {/* whitespace-pre-line zodat de admin paragraaf-einden kan gebruiken */}
        <div className="prose-muted whitespace-pre-line">{item.body}</div>

        {item.type === "press" && item.externalUrl ? (
          <ButtonLink
            href={item.externalUrl}
            variant="secondary"
            className="mt-6"
          >
            Lees het externe artikel
            <Icon name="external" size={15} />
          </ButtonLink>
        ) : null}
      </div>
    </article>
  );
}
