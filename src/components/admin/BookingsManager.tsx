/**
 * ---------------------------------------------------------------------------
 * BookingsManager.tsx — Aanvragen beheren (client component)
 * ---------------------------------------------------------------------------
 * Lijst met alle aanvragen; per rij een status-dropdown (direct opslaan via
 * PATCH /api/bookings) en een verwijderknop (DELETE /api/bookings).
 * ---------------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Badge, {
  bookingStatusTone,
  bookingStatusLabel,
} from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";

/** Uitgebreide rij met de naam van de aanvrager erbij. */
export type EnrichedBooking = Booking & { userName: string };

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: "new", label: "Nieuw" },
  { value: "confirmed", label: "Bevestigd" },
  { value: "done", label: "Afgelopen" },
  { value: "cancelled", label: "Geannuleerd" },
];

export default function BookingsManager({
  initialBookings,
}: {
  initialBookings: EnrichedBooking[];
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /** Status wijzigen en direct opslaan. */
  async function updateStatus(id: string, status: BookingStatus) {
    setBusyId(id);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
      router.refresh();
    } catch {
      alert("Kon status niet bijwerken.");
    } finally {
      setBusyId(null);
    }
  }

  /** Aanvraag verwijderen na bevestiging. */
  async function remove(id: string) {
    if (!window.confirm("Deze aanvraag verwijderen?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setBookings((prev) => prev.filter((b) => b.id !== id));
      router.refresh();
    } catch {
      alert("Kon aanvraag niet verwijderen.");
    } finally {
      setBusyId(null);
    }
  }

  const visible =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div>
      {/* Filter-tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", ...STATUS_OPTIONS.map((s) => s.value)] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === f
                ? "bg-accent text-accent-foreground"
                : "border border-border bg-surface text-muted-foreground hover:bg-surface-muted"
            }`}
          >
            {f === "all" ? "Alles" : bookingStatusLabel(f)}
            <span className="ml-1.5 opacity-70">
              {f === "all"
                ? bookings.length
                : bookings.filter((b) => b.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Lijst */}
      <div className="mt-5 space-y-3">
        {visible.map((b) => (
          <div
            key={b.id}
            className="rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Basisinfo */}
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] ${
                    b.type === "contact"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-accent-soft text-accent"
                  }`}
                >
                  <Icon
                    name={
                      b.type === "contact"
                        ? "mail"
                        : b.type === "webinar"
                          ? "video"
                          : "users"
                    }
                    size={18}
                  />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    {b.topic}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {b.userName} · {b.audience}
                    {b.participants ? ` · ${b.participants} deelnemers` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Aangevraagd op {formatDateTime(b.createdAt)}
                    {b.type !== "contact" ? ` · Gewenste datum: ${b.date}` : ""}
                  </p>
                </div>
              </div>

              {/* Acties */}
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Badge tone={bookingStatusTone(b.status)}>
                  {bookingStatusLabel(b.status)}
                </Badge>
                <select
                  value={b.status}
                  disabled={busyId === b.id}
                  onChange={(e) =>
                    updateStatus(b.id, e.target.value as BookingStatus)
                  }
                  className="field-input w-auto py-1.5 text-xs"
                  aria-label="Status wijzigen"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {b.notes ? (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expandedId === b.id ? null : b.id)
                    }
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-muted"
                  >
                    <Icon name="info" size={13} />
                    Notities
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(b.id)}
                  disabled={busyId === b.id}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-red-200 text-red-600 transition-colors hover:bg-red-50"
                  aria-label="Aanvraag verwijderen"
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>

            {/* Uitklapbare notities */}
            {expandedId === b.id && b.notes ? (
              <p className="mt-4 rounded-[var(--radius)] bg-surface-muted p-4 text-sm leading-relaxed text-muted-foreground">
                {b.notes}
              </p>
            ) : null}
          </div>
        ))}

        {visible.length === 0 ? (
          <p className="rounded-[var(--radius)] border border-dashed border-border bg-surface-muted p-8 text-center text-sm text-muted-foreground">
            Geen aanvragen in deze categorie.
          </p>
        ) : null}
      </div>
    </div>
  );
}
