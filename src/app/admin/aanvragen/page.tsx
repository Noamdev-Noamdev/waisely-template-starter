/**
 * ---------------------------------------------------------------------------
 * AdminAanvragenPage (/admin/aanvragen)
 * ---------------------------------------------------------------------------
 * Overzicht van alle aanvragen (workshops, webinars én contactformulier-
 * berichten). De admin kan de status wijzigen (bevestigen, afronden,
 * annuleren) of aanvragen verwijderen. Statuswijzigingen zijn direct
 * zichtbaar in het gebruikersdashboard.
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import BookingsManager from "@/components/admin/BookingsManager";

export const metadata = { title: "Aanvragen" };

export default async function AdminAanvragenPage() {
  const [bookings, users] = await Promise.all([
    get("bookings"),
    get("users"),
  ]);

  // Map userId → naam zodat de admin ziet wie er achter een aanvraag zit.
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  const enriched = bookings
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((b) => ({
      ...b,
      userName:
        b.userId === "guest"
          ? "(contactformulier)"
          : (nameById.get(b.userId) ?? b.userId),
    }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Aanvragen
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Alle workshop-/webinaraanvragen en contactformulier-berichten.
          Statuswijzigingen zijn direct zichtbaar voor de gebruiker.
        </p>
      </div>

      {/* statusHelpers worden NIET als props meegegeven: BookingsManager is
          een client component en importeert de helpers zelf (server-only
          functions mogen niet de client-grens passeren). */}
      <BookingsManager initialBookings={enriched} />
    </div>
  );
}
