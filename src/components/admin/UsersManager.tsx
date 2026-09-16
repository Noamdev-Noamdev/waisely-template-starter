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

      {/* Tabel (desktop) / kaarten (mobiel) */}
      <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-[var(--shadow-sm)]">
        <table className="hidden w-full text-left text-sm md:table">
          <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5">Naam</th>
              <th className="px-5 py-3.5">E-mail</th>
              <th className="px-5 py-3.5">Organisatie</th>
              <th className="px-5 py-3.5">Aanvragen</th>
              <th className="px-5 py-3.5">Rol</th>
              <th className="px-5 py-3.5 text-right">Acties</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-border/60 last:border-0 hover:bg-accent-softer/40"
              >
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Lid sinds {formatDate(u.createdAt)}
                  </p>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {u.organization || "—"}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {u.bookingsCount}
                </td>
                <td className="px-5 py-3.5">
                  <Badge tone={u.role === "admin" ? "warning" : "neutral"}>
                    {u.role === "admin" ? "Admin" : "Gebruiker"}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => toggleRole(u)}
                      disabled={busyId === u.id || u.id === currentAdminId}
                      title={
                        u.id === currentAdminId
                          ? "Je eigen rol is vergrendeld"
                          : undefined
                      }
                      className="inline-flex items-center gap-1 rounded-[var(--radius)] border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Icon name="shield" size={13} />
                      {u.role === "admin" ? "Maak gebruiker" : "Maak admin"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(u)}
                      disabled={busyId === u.id || u.id === currentAdminId}
                      title={
                        u.id === currentAdminId
                          ? "Je kunt jezelf niet verwijderen"
                          : undefined
                      }
                      className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius)] border border-red-200 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`${u.name} verwijderen`}
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobiele kaartweergave */}
        <div className="divide-y divide-border md:hidden">
          {users.map((u) => (
            <div key={u.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{u.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {u.email}
                  </p>
                  {u.organization ? (
                    <p className="text-xs text-muted-foreground">
                      {u.organization}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {u.bookingsCount} aanvra(a)g(en) ·{" "}
                    {u.role === "admin" ? "Admin" : "Gebruiker"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRole(u)}
                    disabled={busyId === u.id || u.id === currentAdminId}
                    className="inline-flex items-center gap-1 rounded-[var(--radius)] border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground disabled:opacity-40"
                  >
                    <Icon name="shield" size={12} />
                    Rol
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(u)}
                    disabled={busyId === u.id || u.id === currentAdminId}
                    className="inline-flex items-center justify-center rounded-[var(--radius)] border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 disabled:opacity-40"
                  >
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        [Template-hint: het verwijderen van een account ruimt ook de aanvragen
        op. Voor productie wil je dit waarschijnlijk soft-delete maken.]
      </p>
    </div>
  );
}
