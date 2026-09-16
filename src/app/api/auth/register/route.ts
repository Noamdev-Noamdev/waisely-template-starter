/**
 * ---------------------------------------------------------------------------
 * /api/auth/register — Nieuw account aanmaken (rol "user")
 * ---------------------------------------------------------------------------
 * Valideert input, maakt de gebruiker aan en logt die meteen in zodat de
 * registratie na afloop direct doorlinkt naar het dashboard.
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import {
  register,
  login,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, organization } = body ?? {};

    // Basisvalidatie (server-side; client heeft dezelfde regels).
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Naam, e-mailadres en wachtwoord zijn verplicht." },
        { status: 400 }
      );
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Het wachtwoord moet minstens 8 tekens bevatten." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Voer een geldig e-mailadres in." },
        { status: 400 }
      );
    }

    const result = await register(email, password, name, organization);
    if (result.error || !result.user) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    // Meteen inloggen na registratie voor een vloeiende flow.
    const loginResult = await login(email, password);
    if (loginResult.session) {
      await setSessionCookie(loginResult.session);
    }

    return NextResponse.json({ ok: true, user: publicUser(result.user) });
  } catch {
    return NextResponse.json(
      { error: "Er ging iets mis bij het aanmaken van je account." },
      { status: 500 }
    );
  }
}

/** Stript gevoelige velden uit het user-object voor de response. */
function publicUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
