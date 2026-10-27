/**
 * ---------------------------------------------------------------------------
 * VisitsChart.tsx — Staafgrafiek bezoekers & paginaweergaven per dag
 * ---------------------------------------------------------------------------
 * Pure HTML/Tailwind (geen chart-library). Per dag een lichte staaf voor
 * paginaweergaven met daarin een accent-staaf voor unieke bezoekers.
 * Hover toont de exacte waarden via de title-tooltip.
 * ---------------------------------------------------------------------------
 */

import type { DailyStat } from "@/lib/analytics";

const dayLabel = new Intl.DateTimeFormat("nl-BE", { day: "numeric", month: "short" });

function formatDay(day: string) {
  return dayLabel.format(new Date(`${day}T12:00:00Z`));
}

export default function VisitsChart({ days }: { days: DailyStat[] }) {
  const max = Math.max(1, ...days.map((d) => d.pageviews));
  const labelEvery = Math.max(1, Math.ceil(days.length / 7));

  return (
    <div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent" /> Bezoekers
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent-soft" /> Paginaweergaven
        </span>
        <span className="ml-auto">max {max}</span>
      </div>

      <div className="mt-3 flex h-48 items-end gap-[2px] border-b border-border sm:gap-1">
        {days.map((d) => (
          <div
            key={d.day}
            title={`${formatDay(d.day)}: ${d.visitors} bezoekers, ${d.pageviews} weergaven`}
            className="group relative flex h-full flex-1 items-end"
          >
            <div
              className="relative w-full rounded-t-sm bg-accent-soft transition-opacity group-hover:opacity-80"
              style={{ height: `${(d.pageviews / max) * 100}%` }}
            >
              <div
                className="absolute inset-x-0 bottom-0 rounded-t-sm bg-accent"
                style={{ height: d.pageviews ? `${(d.visitors / d.pageviews) * 100}%` : 0 }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1.5 flex gap-[2px] text-[10px] text-muted-foreground sm:gap-1">
        {days.map((d, i) => (
          <span key={d.day} className="flex-1 overflow-visible whitespace-nowrap">
            {i % labelEvery === 0 ? formatDay(d.day) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
