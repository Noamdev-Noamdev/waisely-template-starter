/**
 * ---------------------------------------------------------------------------
 * UsersManager.tsx — Gebruikerslijst met rol-beheer (client component)
 * ---------------------------------------------------------------------------
 * Toont alle accounts in een tabelvorm. De admin kan de rol wisselen (user ↔
 * admin) of een account verwijderen. De eigen admin-account is beschermd:
 * geen rolwijziging of verwijdering mogelijk (self-lockout voorkomen).
 * ---------------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";

/** Gebruiker zonder gevoelige velden, plus aantal aanvragen. */
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  organization: string;
  role: "user" | "admin";
  createdAt: string;
  bookingsCount: number;
}

export default function UsersManager({
  users: initialUsers,
  currentAdminId,
}: {
  users: SafeUser[];
  currentAdminId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Rol wisselen; de eigen admin-rol is vergrendeld. */
  async function toggleRole(user: SafeUser) {
    if (user.id === currentAdminId) return;
    setBusyId(user.id);
    setError(null);
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, role: newRole }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Rolwijziging mislukt.");
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rolwijziging mislukt.");
    } finally {
      setBusyId(null);
    }
  }

  /** Gebruiker verwijderen (+ bijhorende aanvragen). */
  async function remove(user: SafeUser) {
    if (user.id === currentAdminId) return;
    if (
      !window.confirm(
        `Account "${user.name}" verwijderen? De bijhorende aanvragen worden ook verwijderd.`
      )
    ) {
      return;
    }
    setBusyId(user.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Verwijderen mislukt.");
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verwijderen mislukt.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {error ? (
        <p className="mb-4 rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {/* Tabel (desktop/tablet) met horizontale scroll / kaarten (mobiel) */}
      <div className="rounded-[var(--radius)] border border-border bg-surface shadow-[var(--shadow-sm)]">
        {/* Scrollbare tabel voor tablets en grotere schermen */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Naam</th>
                <th className="px-5 py-3.5">E-mail</th>
                <th className="px-5 py-3.5">Organisatie</th>
                <th className="px-5 py-3.5 text-center">Aanvragen</th>
                <th className="px-5 py-3.5">Rol</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="transition-colors hover:bg-accent-softer/40"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-foreground whitespace-nowrap">{u.name}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      Lid sinds {formatDate(u.createdAt)}
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
                  <td className="px-5 py-3.5">
                    <Badge tone={u.role === "admin" ? "warning" : "neutral"}>
                      {u.role === "admin" ? "Admin" : "Gebruiker"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => toggleRole(u)}
                        disabled={busyId === u.id || u.id === currentAdminId}
                        title={
                          u.id === currentAdminId
                            ? "Je eigen rol is vergrendeld"
                            : undefined
                        }
                        className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Icon name="shield" size={13} />
                        <span>{u.role === "admin" ? "Maak gebruiker" : "Maak admin"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(u)}
                        disabled={busyId === u.id || u.id === currentAdminId}
                        title={
                          u.id === currentAdminId
                            ? "Je kunt jezelf niet verwijderen"
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobiele kaartweergave */}
        <div className="divide-y divide-border md:hidden">
          {users.map((u) => (
            <div key={u.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground truncate">{u.name}</p>
                    <Badge tone={u.role === "admin" ? "warning" : "neutral"} className="shrink-0">
                      {u.role === "admin" ? "Admin" : "Gebruiker"}
                    </Badge>
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

              {/* Duidelijke actieknoppen voor mobiel */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => toggleRole(u)}
                  disabled={busyId === u.id || u.id === currentAdminId}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon name="shield" size={13} />
                  <span>{u.role === "admin" ? "Maak gebruiker" : "Maak admin"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => remove(u)}
                  disabled={busyId === u.id || u.id === currentAdminId}
                  title={
                    u.id === currentAdminId
                      ? "Je kunt jezelf niet verwijderen"
                      : "Account verwijderen"
                  }
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-red-200 bg-red-50/60 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon name="trash" size={13} />
                  <span>Verwijder</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
