/**
 * ---------------------------------------------------------------------------
 * RegisterForm.tsx — Client-side registratieformulier
 * ---------------------------------------------------------------------------
 * POST naar /api/auth/register; de API logt de gebruiker meteen in. Na
 * succes doorlinken naar het dashboard.
 * ---------------------------------------------------------------------------
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldInput } from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          organization: data.get("organization"),
          password: data.get("password"),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Registratie mislukt.");
        setLoading(false);
        return;
      }
      router.refresh();
      window.location.assign("/dashboard");
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <FieldInput
        label="Naam"
        id="reg-name"
        name="name"
        autoComplete="name"
        placeholder="[Jouw naam]"
        required
      />
      <FieldInput
        label="School of organisatie (optioneel)"
        id="reg-org"
        name="organization"
        autoComplete="organization"
        placeholder="[Naam van je school]"
      />
      <FieldInput
        label="E-mailadres"
        id="reg-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="[jij@school.be]"
        required
      />
      <FieldInput
        label="Wachtwoord"
        id="reg-password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Minstens 8 tekens"
        minLength={8}
        required
        help="Kies een sterk wachtwoord dat je nergens anders gebruikt."
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Account aanmaken…" : "Account aanmaken"}
        {!loading && <Icon name="arrow-right" size={15} />}
      </Button>
    </form>
  );
}
