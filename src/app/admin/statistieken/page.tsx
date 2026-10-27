/**
 * ---------------------------------------------------------------------------
 * AdminStatistiekenPage (/admin/statistieken)
 * ---------------------------------------------------------------------------
 * Native, cookieloze bezoekersstatistieken: unieke bezoekers, paginaweergaven,
 * populairste pagina's en verwijzers over 7, 30 of 90 dagen.
 * Toegang wordt bewaakt door src/app/admin/layout.tsx (alle admins).
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import { getStats, type RankedItem } from "@/lib/analytics";
import Icon from "@/components/ui/Icon";
import VisitsChart from "@/components/admin/stats/VisitsChart";

export const metadata = { title: "Statistieken" };

const PERIODS = [7, 30, 90] as const;

function RankedList({ title, items, empty }: { title: string; items: RankedItem[]; empty: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <section className="rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {items.map((item) => (
            <li key={item.label} className="relative flex items-center justify-between gap-3 px-2 py-1.5 text-sm">
              <span
                className="absolute inset-y-0 left-0 rounded-sm bg-accent-soft"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
              <span className="relative truncate text-foreground">{item.label}</span>
              <span className="relative font-semibold text-foreground">{item.count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function AdminStatistiekenPage({ searchParams }: PageProps<"/admin/statistieken">) {
  const requested = Number((await searchParams).periode);
  const period = PERIODS.find((p) => p === requested) ?? 30;
  const stats = await getStats(period);

  const today = stats.days[stats.days.length - 1];
  const perVisitor = stats.totalVisitors ? stats.totalPageviews / stats.totalVisitors : 0;

  const kpis = [
    { icon: "users" as const, label: "Unieke bezoekers", value: stats.totalVisitors.toLocaleString("nl-BE") },
    { icon: "eye" as const, label: "Paginaweergaven", value: stats.totalPageviews.toLocaleString("nl-BE") },
    { icon: "layers" as const, label: "Pagina's per bezoeker", value: perVisitor.toLocaleString("nl-BE", { maximumFractionDigits: 1 }) },
    { icon: "clock" as const, label: "Bezoekers vandaag", value: (today?.visitors ?? 0).toLocaleString("nl-BE") },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Statistieken</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Anonieme bezoekersstatistieken, zonder cookies. Je eigen bezoeken als admin tellen niet mee.
          </p>
        </div>
        <div className="inline-flex rounded-[var(--radius)] border border-border bg-surface p-1">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/admin/statistieken?periode=${p}`}
              className={`rounded-[calc(var(--radius)-2px)] px-3 py-1.5 text-xs font-medium transition-colors ${
                p === period
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p} dagen
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent">
                <Icon name={kpi.icon} size={18} />
              </span>
              <span className="text-2xl font-bold text-foreground">{kpi.value}</span>
            </div>
            <p className="mt-3.5 text-sm font-semibold text-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Bezoek per dag</h2>
        <VisitsChart days={stats.days} />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <RankedList title="Populairste pagina's" items={stats.topPages} empty="Nog geen bezoeken in deze periode." />
        <RankedList title="Verwijzers" items={stats.topReferrers} empty="Nog geen verwijzers in deze periode." />
      </div>
    </div>
  );
}
