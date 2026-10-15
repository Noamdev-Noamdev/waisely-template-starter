/**
 * ---------------------------------------------------------------------------
 * PasswordChangeForm.tsx — Wachtwoord wijzigen (Quiet Warm Minimal)
 * ---------------------------------------------------------------------------
 * Herbruikbaar formulier voor het wijzigen van het eigen wachtwoord.
 * Te gebruiken in zowel het gebruikersdashboard als het admin-paneel.
 * ---------------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError("Vul je huidige wachtwoord in.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Het nieuwe wachtwoord moet minstens 8 tekens bevatten.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Het nieuwe wachtwoord en de bevestiging komen niet overeen.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("Het nieuwe wachtwoord mag niet hetzelfde zijn als je huidige wachtwoord.");
      return;
    }

    setBusy(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Wachtwoordwijziging mislukt.");
      }

      setSuccess(
        json.message ??
          "Je wachtwoord is succesvol gewijzigd. Andere actieve sessies zijn beëindigd."
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <div className="rounded-[var(--radius)] border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 flex items-start gap-2">
          <Icon name="info" size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div className="rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800 flex items-start gap-2">
          <Icon name="check" size={16} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      ) : null}

      {/* Huidig wachtwoord */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          Huidig wachtwoord
        </label>
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-[var(--radius)] border border-border bg-surface px-3.5 py-2.5 pr-10 text-sm text-foreground focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            aria-label={showCurrent ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
          >
            <Icon name={showCurrent ? "eye-off" : "eye"} size={16} />
          </button>
        </div>
      </div>

      {/* Nieuw wachtwoord */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          Nieuw wachtwoord (minstens 8 tekens)
        </label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-[var(--radius)] border border-border bg-surface px-3.5 py-2.5 pr-10 text-sm text-foreground focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowNew((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            aria-label={showNew ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
          >
            <Icon name={showNew ? "eye-off" : "eye"} size={16} />
          </button>
        </div>
      </div>

      {/* Bevestig nieuw wachtwoord */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          Bevestig nieuw wachtwoord
        </label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-[var(--radius)] border border-border bg-surface px-3.5 py-2.5 pr-10 text-sm text-foreground focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
            aria-label={showConfirm ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
          >
            <Icon name={showConfirm ? "eye-off" : "eye"} size={16} />
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={busy || !currentPassword || newPassword.length < 8}
          className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="lock" size={15} />
          <span>{busy ? "Wachtwoord opslaan..." : "Wachtwoord bijwerken"}</span>
        </button>
      </div>
    </form>
  );
}
