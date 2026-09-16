/**
 * ---------------------------------------------------------------------------
 * /api/auth/login — Inloggen en sessie-cookie zetten
 * ---------------------------------------------------------------------------
 * Verifieert credentials via de auth-laag en zet de httpOnly-cookie.
 * Foutmeldingen zijn bewust generiek (geen user-enumeration).
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { login, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mailadres en wachtwoord zijn verplicht." },
        { status: 400 }
      );
    }

    const result = await login(email, password);
    if (result.error || !result.session) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    await setSessionCookie(result.session);
    // Rol teruggeven zodat de client naar het juiste doel kan navigeren.
    return NextResponse.json({ ok: true, role: result.session.role });
  } catch {
    return NextResponse.json(
      { error: "Er ging iets mis bij het inloggen." },
      { status: 500 }
    );
  }
}
