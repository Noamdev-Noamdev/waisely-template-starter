/**
 * ---------------------------------------------------------------------------
 * /api/admin/users — Gebruikersbeheer (uitsluitend superadmin)
 * ---------------------------------------------------------------------------
 * Beveiligingsregels (server-side afgedwongen):
 *   1. Alleen de superadmin heeft toegang. Gewone admins krijgen direct 403.
 *   2. De superadmin-rol kan niet via de interface/API worden toegekend of afgenomen.
 *   3. Het superadmin-account kan niet worden verwijderd, gedowngraded of vergrendeld.
 *   4. Superadmin kan rollen wisselen tussen "user" en "admin".
 *   5. Superadmin kan accounts verwijderen (+ bijbehorende boekingen).
 *   6. Superadmin kan een nieuw tijdelijk wachtwoord voor een gebruiker instellen.
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { get, save } from "@/lib/db";
import { requireSuperadmin, adminResetPassword } from "@/lib/auth";
import type { User, Role } from "@/lib/types";

/** Stript gevoelige velden uit een user-object voor responses. */
function sanitize(u: User) {
  const { passwordHash, ...safe } = u;
  return safe;
}

export async function GET() {
  const superadmin = await requireSuperadmin();
  if (!superadmin) {
    return NextResponse.json(
      { error: "Uitsluitend de superadmin heeft toegang tot gebruikersbeheer." },
      { status: 403 }
    );
  }

  const users = await get("users");
  return NextResponse.json({ users: users.map(sanitize) });
}

export async function PATCH(request: Request) {
  const superadmin = await requireSuperadmin();
  if (!superadmin) {
    return NextResponse.json(
      { error: "Uitsluitend de superadmin heeft toegang tot gebruikersbeheer." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { id, role, name, organization, newPassword } = body ?? {};

    if (!id) {
      return NextResponse.json({ error: "Geen account-id opgegeven." }, { status: 400 });
    }

    const users = await get("users");
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) {
      return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 404 });
    }

    // Bescherming van het superadmin account
    if (targetUser.role === "superadmin") {
      if (role && role !== "superadmin") {
        return NextResponse.json(
          { error: "De rol van het superadmin-account kan niet gewijzigd worden." },
          { status: 400 }
        );
      }
      if (newPassword) {
        return NextResponse.json(
          { error: "Het wachtwoord van de superadmin kan hier niet gereset worden. Gebruik 'Wachtwoord wijzigen' in je eigen account." },
          { status: 400 }
        );
      }
    }

    // Poging om iemand superadmin te maken via de API blokkeren
    if (role === "superadmin" && targetUser.role !== "superadmin") {
      return NextResponse.json(
        { error: "De rol 'superadmin' kan niet via de interface worden toegekend." },
        { status: 400 }
      );
    }

    // Rol validatie: enkel "user" en "admin" toegestaan
    if (role && role !== "user" && role !== "admin") {
      return NextResponse.json({ error: "Ongeldige rol opgegeven." }, { status: 400 });
    }

    // 1. Wachtwoordreset door superadmin (indien opgegeven)
    if (newPassword) {
      const resetResult = await adminResetPassword(id, String(newPassword));
      if (!resetResult.success) {
        return NextResponse.json({ error: resetResult.error }, { status: 400 });
      }
    }

    // 2. Gegevens of rol bijwerken
    const updatedUsers = users.map((u) => {
      if (u.id !== id) return u;
      return {
        ...u,
        ...(role && u.role !== "superadmin" ? { role: role as Role } : {}),
        ...(name ? { name: String(name).trim() } : {}),
        ...(organization !== undefined ? { organization: String(organization).trim() } : {}),
      };
    });

    await save("users", updatedUsers);
    return NextResponse.json({ ok: true, message: "Gebruiker succesvol bijgewerkt." });
  } catch {
    return NextResponse.json(
      { error: "Kon gebruiker niet bijwerken." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const superadmin = await requireSuperadmin();
  if (!superadmin) {
    return NextResponse.json(
      { error: "Uitsluitend de superadmin heeft toegang tot gebruikersbeheer." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Geen account-id opgegeven." }, { status: 400 });
    }

    const users = await get("users");
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) {
      return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 404 });
    }

    // Het superadmin account kan nooit verwijderd worden
    if (targetUser.role === "superadmin" || targetUser.id === superadmin.id) {
      return NextResponse.json(
        { error: "Het superadmin-account kan niet verwijderd worden." },
        { status: 400 }
      );
    }

    await save("users", users.filter((u) => u.id !== id));

    // Bijbehorende boekingen ook opruimen
    const bookings = await get("bookings");
    await save("bookings", bookings.filter((b) => b.userId !== id));

    return NextResponse.json({ ok: true, message: "Account succesvol verwijderd." });
  } catch {
    return NextResponse.json(
      { error: "Kon gebruiker niet verwijderen." },
      { status: 500 }
    );
  }
}
