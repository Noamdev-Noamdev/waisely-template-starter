/**
 * ---------------------------------------------------------------------------
 * /api/auth/change-password — Eigen wachtwoord wijzigen (alle ingelogde gebruikers)
 * ---------------------------------------------------------------------------
 * Server-side verificatie:
 *   1. Gebruiker moet ingelogd zijn (kan enkel eigen wachtwoord wijzigen).
 *   2. Huidige wachtwoord moet kloppen (beschermd tegen brute-force).
 *   3. Nieuw wachtwoord moet minstens 8 tekens zijn en overeenkomen met bevestiging.
 *   4. Bij succes wordt tokenVersion opgehoogd (andere sessies vervallen) en
 *      krijgt de huidige sessie direct een ververste cookie.
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { getCurrentUser, changePassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Je moet ingelogd zijn om je wachtwoord te wijzigen." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body ?? {};

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Voer je huidige wachtwoord in." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "Voer een nieuw wachtwoord in." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Het nieuwe wachtwoord moet minstens 8 tekens bevatten." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Het nieuwe wachtwoord en de bevestiging komen niet overeen." },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          error:
            "Het nieuwe wachtwoord mag niet hetzelfde zijn als je huidige wachtwoord.",
        },
        { status: 400 }
      );
    }

    const result = await changePassword(user.id, currentPassword, newPassword);

    if (result.error || !result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Ververs de cookie van de huidige browser zodat de gebruiker ingelogd blijft
    if (result.session) {
      await setSessionCookie(result.session);
    }

    return NextResponse.json({
      ok: true,
      message: "Je wachtwoord is succesvol gewijzigd. Andere actieve sessies zijn beëindigd.",
    });
  } catch {
    return NextResponse.json(
      { error: "Er ging iets mis bij het wijzigen van je wachtwoord." },
      { status: 500 }
    );
  }
}
