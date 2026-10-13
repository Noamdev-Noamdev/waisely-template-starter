/**
 * ---------------------------------------------------------------------------
 * /api/consent — Cookie Consent Logging API
 * ---------------------------------------------------------------------------
 * Registreert anoniem bewijs van de gemaakte cookiekeuze conform de
 * Belgische GBA / AVG-richtlijnen.
 *
 * Bevat bewust GEEN IP-adressen of herleidbare persoonsgegevens: enkel
 * een willekeurige consentId (die overeenkomt met de cookie van de bezoeker),
 * de gekozen categorieën en het tijdstip.
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { get, save } from "@/lib/db";
import type { ConsentRecord } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const consentId =
      typeof body.consentId === "string" && body.consentId.trim()
        ? body.consentId.trim().slice(0, 64)
        : `cst_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

    const method: ConsentRecord["method"] =
      body.method === "accept_all" || body.method === "reject_all"
        ? body.method
        : "custom";

    const record: ConsentRecord = {
      consentId,
      version: typeof body.version === "number" ? body.version : 1,
      categories: {
        essential: true,
        social: Boolean(body.categories?.social),
      },
      method,
      recordedAt: new Date().toISOString(),
    };

    const currentLogs = await get("consentLogs");
    // Bewaar maximaal de laatste 5.000 logs in het JSON-bestand
    const updated = [...(Array.isArray(currentLogs) ? currentLogs : []), record].slice(-5000);
    await save("consentLogs", updated);

    return NextResponse.json({ ok: true, consentId });
  } catch (err) {
    console.error("Fout bij opslaan consent log:", err);
    return NextResponse.json(
      { error: "Kon toestemming niet registreren." },
      { status: 500 }
    );
  }
}
