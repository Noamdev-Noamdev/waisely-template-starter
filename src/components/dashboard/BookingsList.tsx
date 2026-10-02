/**
 * ---------------------------------------------------------------------------
 * BookingsList.tsx — Klikbare aanvragenlijst in het gebruikersdashboard
 * ---------------------------------------------------------------------------
 * Toont de bookings van de ingelogde gebruiker als uitklapbare kaarten.
 * Bij klikken op een aanvraag verschijnt een detailpaneel met alle
 * ingevulde gegevens. Consistent met het expand/collapse-patroon dat
 * de admin-panels (BookingsManager, IntakeSubmissionsViewer) al gebruiken.
 * ---------------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Badge, {
  bookingStatusLabel,
  bookingStatusTone,
} from "@/components/ui/Badge";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Booking } from "@/lib/types";

export default function BookingsList({ bookings }: { bookings: Booking[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (bookings.length === 0) {
    return null; // empty state is handled by the parent page
  }

  return (
    <div className="mt-4 space-y-3">
      {bookings.map((b) => {
        const isExpanded = expandedId === b.id;
        return (
          <div
            key={b.id}
            className="rounded-[var(--radius)] border border-border bg-surface shadow-[var(--shadow-sm)]"
          >
            {/* Header row — always visible, clickable to toggle detail */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : b.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-muted sm:gap-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent">
                <Icon
                  name={b.type === "webinar" ? "video" : "users"}
                  size={18}
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{b.topic}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {b.type === "webinar" ? "Webinar" : "Workshop"} ·{" "}
                  {formatDate(b.date)} · {b.audience}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge tone={bookingStatusTone(b.status)}>
                  {bookingStatusLabel(b.status)}
                </Badge>
                <Icon
                  name={isExpanded ? "close" : "eye"}
                  size={16}
                  className="text-muted-foreground"
                />
              </div>
            </button>

            {/* Expanded detail panel */}
            {isExpanded ? (
              <div className="border-t border-border px-5 pb-5 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailRow
                    label="Type sessie"
                    value={b.type === "webinar" ? "Webinar (online)" : "Workshop (op locatie)"}
                  />
                  <DetailRow label="Onderwerp" value={b.topic} />
                  <DetailRow label="Doelgroep" value={b.audience} />
                  <DetailRow
                    label="Gewenste datum"
                    value={formatDate(b.date)}
                  />
                  <DetailRow
                    label="Aantal deelnemers"
                    value={b.participants || "—"}
                  />
                  <DetailRow
                    label="Status"
                    value={bookingStatusLabel(b.status)}
                  />
                  <DetailRow
                    label="Aangevraagd op"
                    value={formatDateTime(b.createdAt)}
                  />
                </div>

                {b.notes ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Extra wensen of context
                    </p>
                    <p className="mt-1 rounded-[var(--radius)] bg-surface-muted p-4 text-sm leading-relaxed text-foreground">
                      {b.notes}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** Herbruikbaar label/waarde-paar voor de detailweergave. */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}
