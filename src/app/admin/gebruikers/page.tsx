/**
 * ---------------------------------------------------------------------------
 * AdminGebruikersPage (/admin/gebruikers) — Uitsluitend Superadmin
 * ---------------------------------------------------------------------------
 * Exclusief beheerpaneel voor de eigenaar (superadmin):
 *   - Overzicht van alle accounts (naam, e-mail, organisatie, rol, aantal aanvragen)
 *   - Rollen wisselen tussen "user" en "admin"
 *   - Tijdelijk nieuw wachtwoord instellen voor een gebruiker
 *   - Accounts verwijderen (met uitzondering van de superadmin)
 * ---------------------------------------------------------------------------
 */

import { redirect } from "next/navigation";
import { get } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import UsersManager from "@/components/admin/UsersManager";

export const metadata = { title: "Gebruikers & Rollen — Superadmin" };

export default async function AdminGebruikersPage() {
  const me = await getCurrentUser();

  // Server-side guard: gewone admins mogen deze pagina niet zien of gebruiken
  if (!me || me.role !== "superadmin") {
    redirect("/admin");
  }

  const [users, bookings] = await Promise.all([
    get("users"),
    get("bookings"),
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
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gebruikers & Rollen
          </h1>
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
            Superadmin
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Beheerpaneel voor de eigenaar. Bekijk alle accounts, wissel rollen tussen
          gebruiker en admin, stel zo nodig een nieuw wachtwoord in, of verwijder accounts.
        </p>
      </div>

      <UsersManager users={safeUsers} currentSuperadminId={me.id} />
    </div>
  );
}
