/**
 * ---------------------------------------------------------------------------
 * /api/bookings — Boekings-API (aanmaken door gebruikers; beheren door admin)
 * ---------------------------------------------------------------------------
 * POST  (ingelogd) : nieuwe workshop-/webinaraanvraag aanmaken.
 * PATCH (admin)    : status van een aanvraag wijzigen (bevestigen, annuleren…).
 * DELETE (admin)   : aanvraag verwijderen.
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { get, save, uid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Booking, BookingStatus } from "@/lib/types";

const STATUSES: BookingStatus[] = ["new", "confirmed", "done", "cancelled"];

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Je moet ingelogd zijn om een aanvraag te doen." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { type, topic, audience, date, participants, notes } = body ?? {};

    if (type !== "workshop" && type !== "webinar") {
      return NextResponse.json(
        { error: "Kies een workshop of webinar." },
        { status: 400 }
      );
    }
    if (!topic || !audience || !date) {
      return NextResponse.json(
        { error: "Onderwerp, doelgroep en datum zijn verplicht." },
        { status: 400 }
      );
    }

    const booking: Booking = {
      id: uid("bkg_"),
      userId: user.id,
      type,
      topic: String(topic),
      audience: String(audience),
      date: String(date),
      participants: String(participants ?? ""),
      notes: String(notes ?? ""),
      status: "new",
      createdAt: new Date().toISOString(),
    };

    const bookings = await get("bookings");
    await save("bookings", [...bookings, booking]);

    return NextResponse.json({ ok: true, booking });
  } catch {
    return NextResponse.json(
      { error: "Er ging iets mis bij het aanvragen. Probeer het opnieuw." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return NextResponse.json(
      { error: "Alleen de admin kan aanvragen beheren." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { id, status } = body ?? {};
    if (!id || !STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Ongeldige aanvraag-id of status." },
        { status: 400 }
      );
    }

    const bookings = await get("bookings");
    const updated = bookings.map((b) =>
      b.id === id ? { ...b, status } : b
    );
    await save("bookings", updated);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kon status niet bijwerken." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return NextResponse.json(
      { error: "Alleen de admin kan aanvragen verwijderen." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Geen id opgegeven." }, { status: 400 });
    }

    const bookings = await get("bookings");
    await save("bookings", bookings.filter((b) => b.id !== id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Kon aanvraag niet verwijderen." },
      { status: 500 }
    );
  }
}
