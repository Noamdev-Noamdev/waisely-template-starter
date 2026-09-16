/**
 * ---------------------------------------------------------------------------
 * BookingForm.tsx — Aanvraagformulier voor workshop/webinar op maat
 * ---------------------------------------------------------------------------
 * Client-side formulier dat naar /api/bookings POST. Bij niet-ingelogde
 * gebruikers toont het een login-hint i.p.v. het formulier. Onderwerp kan
 * vooraf gevuld worden via ?dienst=... (vanuit de dienstenkaarten).
 * ---------------------------------------------------------------------------
 */

"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  FieldInput,
  FieldSelect,
  FieldTextarea,
} from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";

export default function BookingForm({
  isLoggedIn,
  userName,
  userOrganization,
  serviceTitles,
}: {
  isLoggedIn: boolean;
  userName: string;
  userOrganization: string;
  /** Diensnamen uit de store; gebruikt als suggesties voor het onderwerp. */
  serviceTitles: string[];
}) {
  const params = useSearchParams();
  const preselected = params.get("dienst") ?? "";
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /** Minimale datum = vandaag (geen boekingen in het verleden). */
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: data.get("type"),
          topic: data.get("topic"),
          audience: data.get("audience"),
          date: data.get("date"),
          participants: data.get("participants"),
          notes: data.get("notes"),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "Aanvraag mislukt.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      form.reset();
    } catch {
      setErrorMsg("Er ging iets mis. Probeer het opnieuw.");
      setStatus("error");
    }
  }

  // Niet ingelogd: toon een uitnodiging om eerst in te loggen.
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Icon name="lock" size={22} />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Eerst inloggen
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Om een workshop aan te vragen heb je een account nodig.
          Zo kunnen we je aanvraag aan je school koppelen en opvolgen.
        </p>
        <div className="mt-5 flex gap-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-accent)] transition-all hover:-translate-y-0.5 hover:bg-accent-strong"
          >
            Inloggen
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-accent/40 bg-surface px-4 py-2.5 text-sm font-semibold text-accent transition-all hover:-translate-y-0.5 hover:bg-accent-softer"
          >
            Account aanmaken
          </Link>
        </div>
      </div>
    );
  }

  // Succes-toestand na versturen.
  if (status === "sent") {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Icon name="check" size={24} />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Aanvraag verstuurd!
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Bedankt! Je aanvraag staat nu in je dashboard. Je ontvangt binnen 2
          werkdagen een reactie.
        </p>
        <div className="mt-5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-accent)] transition-all hover:-translate-y-0.5 hover:bg-accent-strong"
          >
            Naar mijn dashboard
            <Icon name="arrow-right" size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Aanvraagformulier
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Aangevraagd door {userName}
          {userOrganization ? ` (${userOrganization})` : ""}.
        </p>
      </div>

      {status === "error" && errorMsg ? (
        <p className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </p>
      ) : null}

      <FieldSelect label="Type sessie" id="bk-type" name="type" required>
        <option value="workshop">Workshop (op locatie)</option>
        <option value="webinar">Webinar (online)</option>
      </FieldSelect>

      <FieldInput
        label="Onderwerp"
        id="bk-topic"
        name="topic"
        defaultValue={preselected}
        placeholder="Bv. AI-basis + Prompts schrijven"
        list="bk-suggestions"
        required
        help="Kies een bestaande dienst of beschrijf je eigen onderwerp."
      />
      {/* Suggesties uit de dienstenlijst (HTML datalist). */}
      <datalist id="bk-suggestions">
        {serviceTitles.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldInput
          label="Gewenste datum"
          id="bk-date"
          name="date"
          type="date"
          min={today}
          required
        />
        <FieldInput
          label="Aantal deelnemers (schatting)"
          id="bk-participants"
          name="participants"
          type="number"
          min="1"
          placeholder="20"
        />
      </div>

      <FieldInput
        label="Doelgroep"
        id="bk-audience"
        name="audience"
        placeholder="Bv. Leerkrachten 2e graad"
        required
      />

      <FieldTextarea
        label="Extra wensen of context"
        id="bk-notes"
        name="notes"
        rows={4}
        placeholder="Vertel kort over jullie situatie, niveau of ervaring met AI."
      />

      <Button type="submit" disabled={status === "sending"} className="w-full">
        {status === "sending" ? "Versturen…" : "Aanvraag versturen"}
        {status !== "sending" && <Icon name="arrow-right" size={15} />}
      </Button>
    </form>
  );
}
