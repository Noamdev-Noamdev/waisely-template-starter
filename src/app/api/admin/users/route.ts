/**
 * ---------------------------------------------------------------------------
 * /api/admin/users — Gebruikersbeheer (alleen admin)
 * ---------------------------------------------------------------------------
 * GET    : alle gebruikers (zonder wachtwoord-hashes)
 * PATCH  : rol wijzigen (user ↔ admin) of naam/organisatie corrigeren
 * DELETE : gebruiker verwijderen (+ bijhorende aanvragen)
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { get, save } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/lib/types";

async function guard() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}

/** Stript gevoelige velden uit een user-object. */
function sanitize(u: User) {
  const { passwordHash, ...safe } = u;
  return safe;
}

export async function GET() {
  if (!(await guard())) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  const users = await get("users");
  return NextResponse.json({ users: users.map(sanitize) });
}

export async function PATCH(request: Request) {
  const admin = await guard();
  if (!admin) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { id, role, name, organization } = body ?? {};
    if (!id) {
      return NextResponse.json({ error: "Geen id opgegeven." }, { status: 400 });
    }
    // Beveiliging: de admin kan niet zijn eigen rol wegnemen (anders sluit
    // hij zichzelf buiten het paneel).
    if (id === admin.id && role && role !== "admin") {
      return NextResponse.json(
        { error: "Je kunt je eigen admin-rol niet verwijderen." },
        { status: 400 }
      );
    }
    if (role && role !== "user" && role !== "admin") {
      return NextResponse.json({ error: "Ongeldige rol." }, { status: 400 });
    }

    const users = await get("users");
    const updated = users.map((u) =>
      u.id === id
        ? {
            ...u,
            ...(role ? { role } : {}),
            ...(name ? { name: String(name) } : {}),
            ...(organization !== undefined
              ? { organization: String(organization) }
              : {}),
          }
        : u
    );
    await save("users", updated);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Kon gebruiker niet bijwerken." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const admin = await guard();
  if (!admin) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Geen id opgegeven." }, { status: 400 });
    }
    if (id === admin.id) {
      return NextResponse.json(
        { error: "Je kunt jezelf niet verwijderen." },
        { status: 400 }
      );
    }

    const users = await get("users");
    await save("users", users.filter((u) => u.id !== id));
    // Bijhorende aanvragen ook opruimen.
    const bookings = await get("bookings");
    await save("bookings", bookings.filter((b) => b.userId !== id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Kon gebruiker niet verwijderen." },
      { status: 500 }
    );
  }
}
