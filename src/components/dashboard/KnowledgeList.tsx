/**
 * ---------------------------------------------------------------------------
 * KnowledgeList.tsx — Kennisbank-grid (server component)
 * ---------------------------------------------------------------------------
 * Rendert de materialen uit de store als download-kaarten. De lijst zelf is
 * alleen vóór ingelogde gebruikers getoond; de beveiliging zit in de
 * dashboard-page (redirect indien niet ingelogd) en in de API.
 * ---------------------------------------------------------------------------
 */

import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import type { KnowledgeItem } from "@/lib/types";

/** Nederlandstalige labels per soort materiaal. */
const KIND_LABELS: Record<KnowledgeItem["kind"], string> = {
  pdf: "PDF",
  doc: "Document",
  link: "Link",
  slides: "Slides",
  video: "Video",
  template: "Template",
};

export default function KnowledgeList({
  items,
}: {
  items: KnowledgeItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="mt-4 rounded-[var(--radius)] border border-dashed border-border bg-surface-muted p-8 text-center text-sm text-muted-foreground">
        [Nog geen materialen — de admin voegt deze toe via het admin-paneel.]
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url || "#"}
          target={item.url && item.url !== "#" ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="card-hover group flex h-full flex-col rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
              <Icon name={item.kind} size={18} />
            </span>
            <Badge tone="accent">{KIND_LABELS[item.kind] ?? item.kind}</Badge>
          </div>
          <h3 className="mt-3.5 text-sm font-semibold leading-snug text-foreground">
            {item.title}
          </h3>
          <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">
            {item.description}
          </p>
          <span className="mt-3.5 inline-flex items-center gap-1 text-xs font-semibold text-accent">
            <Icon name="download" size={13} />
            {item.url && item.url !== "#" ? "Openen" : "[Link volgt]"}
          </span>
        </a>
      ))}
    </div>
  );
}
