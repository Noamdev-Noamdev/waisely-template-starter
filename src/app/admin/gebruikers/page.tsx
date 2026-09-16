/**
 * ---------------------------------------------------------------------------
 * AdminGebruikersPage (/admin/gebruikers)
 * ---------------------------------------------------------------------------
 * Overzicht van alle accounts: naam, e-mail, organisatie, rol en aantal
 * aanvragen. De admin kan rollen wisselen of accounts verwijderen (met
 * bescherming tegen self-lockout).
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import UsersManager from "@/components/admin/UsersManager";

export const metadata = { title: "Gebruikers" };

export default async function AdminGebruikersPage() {
  const [users, bookings, me] = await Promise.all([
    get("users"),
    get("bookings"),
    getCurrentUser(),
  ]);

  // Aantal aanvragen per gebruiker tonen bij het overzicht.
  const counts = new Map<string, number>();
  for (const b of bookings) {
    counts.set(b.userId, (counts.get(b.userId) ?? 0) + 1);
  }

  const safeUsers = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    organization: u.organization ?? "",
    role: u.role,
    createdAt: u.createdAt,
    bookingsCount: counts.get(u.id) ?? 0,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Gebruikers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Alle accounts op de site. Rollen bepalen toegang: "user" krijgt het
          dashboard, "admin" krijgt daarnaast het beheerpaneel.
        </p>
      </div>

      <UsersManager users={safeUsers} currentAdminId={me?.id ?? ""} />
    </div>
  );
}
