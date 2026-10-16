/**
 * ---------------------------------------------------------------------------
 * AdminAanvragenPage (/admin/aanvragen)
 * ---------------------------------------------------------------------------
 * Overzicht van alle aanvragen (workshops, webinars én contactformulier-
 * berichten). De admin ziet direct de naam én het e-mailadres van het account
 * achter de aanvraag, kan de status wijzigen of aanvragen verwijderen.
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

  // Map userId → user zodat de admin naam én e-mailadres ziet van wie de aanvraag deed.
  const userById = new Map(users.map((u) => [u.id, u]));

  const enriched = bookings
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((b) => {
      const account = userById.get(b.userId);
      const userName =
        b.userId === "guest"
          ? b.userName || "(contactformulier)"
          : b.userName || account?.name || b.userId;
      const userEmail =
        b.userId === "guest"
          ? b.userEmail || (b.type === "contact" ? b.audience : "")
          : b.userEmail || account?.email || "";

      return {
        ...b,
        userName,
        userEmail,
      };
    });

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

      <BookingsManager initialBookings={enriched} />
    </div>
  );
}
