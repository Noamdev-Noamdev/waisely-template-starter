/**
 * ---------------------------------------------------------------------------
 * UsersManager.tsx — Gebruikerslijst met rol- en accountbeheer (Superadmin)
 * ---------------------------------------------------------------------------
 * Exclusief voor de superadmin (eigenaar):
 *   - Bekijken van alle accounts en details
 *   - Wisselen van rollen (user ↔ admin)
 *   - Tijdelijk nieuw wachtwoord instellen voor een gebruiker
 *   - Account verwijderen (+ bijbehorende boekingen)
 *   - Superadmin-account is strikt vergrendeld tegen wijziging of verwijdering
 * ---------------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { Role } from "@/lib/types";

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  organization: string;
  role: Role;
  createdAt: string;
  bookingsCount: number;
}

export default function UsersManager({
  users: initialUsers,
  currentSuperadminId,
}: {
  users: SafeUser[];
  currentSuperadminId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State voor wachtwoordreset-modal
  const [resetModalUser, setResetModalUser] = useState<SafeUser | null>(null);
  const [newTempPassword, setNewTempPassword] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  /** Rol wisselen tussen "user" en "admin" */
  async function toggleRole(user: SafeUser) {
    if (user.role === "superadmin" || user.id === currentSuperadminId) return;
    setBusyId(user.id);
    setError(null);
    setSuccess(null);

    const newRole: Role = user.role === "admin" ? "user" : "admin";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, role: newRole }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Rolwijziging mislukt.");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      setSuccess(`Rol van ${user.name} gewijzigd naar "${newRole === "admin" ? "Admin" : "Gebruiker"}".`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rolwijziging mislukt.");
    } finally {
      setBusyId(null);
    }
  }

  /** Account verwijderen (+ aanvragen) */
  async function remove(user: SafeUser) {
    if (user.role === "superadmin" || user.id === currentSuperadminId) return;
    if (
      !window.confirm(
        `Weet je zeker dat je het account van "${user.name}" (${user.email}) wilt verwijderen? Eventuele bijbehorende aanvragen worden ook verwijderd.`
      )
    ) {
      return;
    }

    setBusyId(user.id);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Verwijderen mislukt.");
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setSuccess(`Account "${user.name}" is succesvol verwijderd.`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verwijderen mislukt.");
    } finally {
      setBusyId(null);
    }
  }

  /** Wachtwoord resetten door superadmin */
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetModalUser) return;
    if (newTempPassword.length < 8) {
      setResetError("Het wachtwoord moet minstens 8 tekens lang zijn.");
      return;
    }

    setResetBusy(true);
    setResetError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resetModalUser.id,
          newPassword: newTempPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Kon wachtwoord niet resetten.");
      }

      setSuccess(`Wachtwoord voor "${resetModalUser.name}" is succesvol gereset.`);
      setResetModalUser(null);
      setNewTempPassword("");
    } catch (e) {
      setResetError(e instanceof Error ? e.message : "Wachtwoordreset mislukt.");
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <div>
      {error ? (
        <div className="mb-4 rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <Icon name="close" size={14} />
          </button>
        </div>
      ) : null}

      {success ? (
        <div className="mb-4 rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center justify-between">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
            <Icon name="close" size={14} />
          </button>
        </div>
      ) : null}

      {/* Tabel (desktop/tablet) */}
      <div className="rounded-[var(--radius)] border border-border bg-surface shadow-[var(--shadow-sm)]">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Naam & Lid sinds</th>
                <th className="px-5 py-3.5">E-mail</th>
                <th className="px-5 py-3.5">Organisatie</th>
                <th className="px-5 py-3.5 text-center">Aanvragen</th>
                <th className="px-5 py-3.5">Rol</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.map((u) => {
                const isSuper = u.role === "superadmin";
                const isMe = u.id === currentSuperadminId;

                return (
                  <tr
                    key={u.id}
                    className="transition-colors hover:bg-accent-softer/40"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-foreground whitespace-nowrap flex items-center gap-1.5">
                        {u.name}
                        {isMe ? (
                          <span className="text-[11px] font-normal text-muted-foreground">
                            (jij)
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(u.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      <span className="block max-w-[200px] truncate" title={u.email}>
                        {u.email}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      <span className="block max-w-[160px] truncate" title={u.organization || ""}>
                        {u.organization || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center text-muted-foreground font-medium">
                      {u.bookingsCount}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                          <Icon name="shield" size={11} />
                          Superadmin
                        </span>
                      ) : (
                        <Badge tone={u.role === "admin" ? "warning" : "neutral"}>
                          {u.role === "admin" ? "Admin" : "Gebruiker"}
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Rol wisselen knop */}
                        <button
                          type="button"
                          onClick={() => toggleRole(u)}
                          disabled={busyId === u.id || isSuper}
                          title={
                            isSuper
                              ? "De superadmin-rol is vergrendeld"
                              : u.role === "admin"
                              ? "Zet om naar normale gebruiker"
                              : "Promoveer naar admin"
                          }
                          className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Icon name="shield" size={13} />
                          <span>{u.role === "admin" ? "Maak gebruiker" : "Maak admin"}</span>
                        </button>

                        {/* Wachtwoord resetten knop */}
                        <button
                          type="button"
                          onClick={() => {
                            setResetModalUser(u);
                            setNewTempPassword("");
                            setResetError(null);
                          }}
                          disabled={busyId === u.id || isSuper}
                          title={
                            isSuper
                              ? "Superadmin wachtwoord kan hier niet gewijzigd worden"
                              : "Stel een nieuw wachtwoord in voor deze gebruiker"
                          }
                          className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Icon name="lock" size={13} />
                          <span>Reset ww</span>
                        </button>

                        {/* Account verwijderen knop */}
                        <button
                          type="button"
                          onClick={() => remove(u)}
                          disabled={busyId === u.id || isSuper}
                          title={
                            isSuper
                              ? "Het superadmin-account kan niet verwijderd worden"
                              : "Account verwijderen"
                          }
                          className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-red-200 bg-red-50/60 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`${u.name} verwijderen`}
                        >
                          <Icon name="trash" size={13} />
                          <span>Verwijder</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobiele kaartweergave */}
        <div className="divide-y divide-border md:hidden">
          {users.map((u) => {
            const isSuper = u.role === "superadmin";
            const isMe = u.id === currentSuperadminId;

            return (
              <div key={u.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground truncate">
                        {u.name}
                        {isMe ? (
                          <span className="text-xs font-normal text-muted-foreground ml-1.5">
                            (jij)
                          </span>
                        ) : null}
                      </p>
                      {isSuper ? (
                        <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
                          Superadmin
                        </span>
                      ) : (
                        <Badge tone={u.role === "admin" ? "warning" : "neutral"} className="shrink-0">
                          {u.role === "admin" ? "Admin" : "Gebruiker"}
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground mt-0.5" title={u.email}>
                      {u.email}
                    </p>
                    {u.organization ? (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {u.organization}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground mt-1">
                      {u.bookingsCount} aanvra(a)g(en) · Lid sinds {formatDate(u.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Actieknoppen voor mobiel */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => toggleRole(u)}
                    disabled={busyId === u.id || isSuper}
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon name="shield" size={13} />
                    <span>{u.role === "admin" ? "Maak gebruiker" : "Maak admin"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResetModalUser(u);
                      setNewTempPassword("");
                      setResetError(null);
                    }}
                    disabled={busyId === u.id || isSuper}
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon name="lock" size={13} />
                    <span>Reset ww</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(u)}
                    disabled={busyId === u.id || isSuper}
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-red-200 bg-red-50/60 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon name="trash" size={13} />
                    <span>Verwijder</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal voor wachtwoordreset door superadmin */}
      {resetModalUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-[var(--radius)] border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="text-base font-semibold text-foreground">
                Wachtwoord instellen voor {resetModalUser.name}
              </h3>
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Voer een nieuw wachtwoord in voor <strong>{resetModalUser.email}</strong>.
                Bestaande actieve sessies van deze gebruiker worden direct beëindigd.
              </p>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Nieuw tijdelijk wachtwoord (min. 8 tekens)
                </label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={newTempPassword}
                  onChange={(e) => setNewTempPassword(e.target.value)}
                  placeholder="bv. TijdelijkWachtwoord123!"
                  className="w-full rounded-[var(--radius)] border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              {resetError ? (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-[var(--radius)] border border-red-200">
                  {resetError}
                </p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  disabled={resetBusy}
                  className="rounded-[var(--radius)] border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-surface-muted"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={resetBusy || newTempPassword.length < 8}
                  className="rounded-[var(--radius)] bg-accent px-4 py-2 text-xs font-medium text-accent-foreground hover:bg-accent-strong disabled:opacity-40"
                >
                  {resetBusy ? "Opslaan..." : "Wachtwoord opslaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
