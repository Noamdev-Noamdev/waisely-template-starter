/**
 * ---------------------------------------------------------------------------
 * LoginForm.tsx — Client-side inlogformulier met foutafhandeling
 * ---------------------------------------------------------------------------
 * POST naar /api/auth/login en navigeert bij succes naar het juiste doel
 * (admin → /admin, gebruiker → /dashboard). Toont een foutmelding bij
 * onjuiste credentials. Voor productie: voeg rate limiting toe.
 * ---------------------------------------------------------------------------
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldInput } from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Inloggen mislukt.");
        setLoading(false);
        return;
      }
      // Succes: router.refresh() zodat server-componenten opnieuw renderen.
      router.refresh();
      // Kleine vertraging zodat de cookie door alle componenten is gelezen.
      window.location.assign(json.role === "admin" ? "/admin" : "/dashboard");
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
        label="E-mailadres"
        id="login-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="[jij@school.be]"
        required
      />
      <FieldInput
        label="Wachtwoord"
        id="login-password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Inloggen…" : "Inloggen"}
        {!loading && <Icon name="arrow-right" size={15} />}
      </Button>
    </form>
  );
}
