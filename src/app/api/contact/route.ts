/**
 * ---------------------------------------------------------------------------
 * /api/contact — Publiek contactformulier
 * ---------------------------------------------------------------------------
 * Slaat het bericht op als aanvraag met type "contact" in de bookings-store,
 * zodat het bij de admin in het overzicht verschijnt. In productie kan dit
 * vervangen worden door een mail-service (Resend, SendGrid, ...).
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { get, save, uid } from "@/lib/db";
import type { Booking } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body ?? {};

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Naam, e-mail en bericht zijn verplicht." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json(
        { error: "Voer een geldig e-mailadres in." },
        { status: 400 }
      );
    }

    // Bericht opslaan als contact-aanvraag (admin ziet het in het overzicht).
    const booking: Booking = {
      id: uid("bkg_contact_"),
      userId: "guest",
      type: "contact",
      topic: `Contactformulier van ${name}`,
      audience: String(email),
      date: new Date().toISOString(),
      participants: "",
      notes: String(message),
      status: "new",
      createdAt: new Date().toISOString(),
    };

    const bookings = await get("bookings");
    await save("bookings", [...bookings, booking]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Er ging iets mis bij het versturen." },
      { status: 500 }
    );
  }
}
