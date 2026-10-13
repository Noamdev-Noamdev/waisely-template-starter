/**
 * ---------------------------------------------------------------------------
 * ServicesManager.tsx — CRUD-lijst voor diensten (client component)
 * ---------------------------------------------------------------------------
 * Rendert per dienst een bewerkbaar kaartje. Inline opslaan via PUT, nieuwe
 * dienst via POST, verwijderen via DELETE (met bevestiging). Na elke actie
 * wordt router.refresh() aangeroepen zodat server-componenten opnieuw
 * renderen en de publieke site direct up-to-date is.
 * ---------------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import {
  FieldInput,
  FieldTextarea,
  FieldSelect,
} from "@/components/ui/Field";
import type { Service } from "@/lib/types";

/** Icon-opties voor het dropdownveld (zie Icon.tsx voor de volledige set). */
const ICON_OPTIONS = [
  "spark",
  "shield",
  "book",
  "users",
  "video",
  "target",
  "clock",
  "layers",
  "star",
  "school",
  "pen",
  "eye",
  "check",
  "lock",
];

export default function ServicesManager({
  initialServices,
}: {
  initialServices: Service[];
}) {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Nieuwe dienst toevoegen (placeholder-velden; admin vult ze later in). */
  async function handleAdd() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nieuwe module",
          description: "Beschrijving van de module",
          icon: "spark",
          duration: "±40 min",
          audience: "Alle leerkrachten",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setServices((prev) => [...prev, json.service]);
      setEditingId(json.service.id);
      router.refresh();
    } catch {
      setError("Toevoegen mislukt.");
    } finally {
      setBusy(false);
    }
  }

  /** Bestaande dienst bijwerken. */
  async function handleUpdate(service: Service) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      router.refresh();
    } catch {
      setError("Opslaan mislukt.");
    } finally {
      setBusy(false);
    }
  }

  /** Dienst verwijderen na bevestiging. */
  async function handleDelete(id: string) {
    if (!window.confirm("Deze dienst verwijderen?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setServices((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    } catch {
      setError("Verwijderen mislukt.");
    } finally {
      setBusy(false);
    }
  }

  /** Lokale state-update terwijl de admin typt. */
  function patch(id: string, field: keyof Service, value: string | number) {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  /** Volgorde één plaats omhoog of omlaag verplaatsen. */
  async function handleMove(service: Service, direction: "up" | "down") {
    const sorted = [...services].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((s) => s.id === service.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const other = sorted[targetIndex];
    const newOrderService = other.order;
    const newOrderOther = service.order;

    setBusy(true);
    setError(null);
    try {
      await Promise.all([
        fetch("/api/admin/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...service, order: newOrderService }),
        }),
        fetch("/api/admin/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...other, order: newOrderOther }),
        }),
      ]);
      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id
            ? { ...s, order: newOrderService }
            : s.id === other.id
            ? { ...s, order: newOrderOther }
            : s
        )
      );
      router.refresh();
    } catch {
      setError("Volgorde wijzigen mislukt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {services.length} actieve modules
        </span>
        <Button variant="secondary" onClick={handleAdd} disabled={busy}>
          <Icon name="plus" size={15} />
          Module toevoegen
        </Button>
      </div>
      {error ? (
        <p className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {services
        .sort((a, b) => a.order - b.order)
        .map((service) => {
          const isEditing = editingId === service.id;
          return (
            <div
              key={service.id}
              className="rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]"
            >
              {isEditing ? (
                /* ---------- Bewerk-modus ---------- */
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldInput
                      label="Titel"
                      value={service.title}
                      onChange={(e) => patch(service.id, "title", e.target.value)}
                    />
                    <FieldSelect
                      label="Icoon"
                      value={service.icon}
                      onChange={(e) => patch(service.id, "icon", e.target.value)}
                    >
                      {ICON_OPTIONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </FieldSelect>
                    <FieldInput
                      label="Duur"
                      value={service.duration}
                      onChange={(e) =>
                        patch(service.id, "duration", e.target.value)
                      }
                    />
                    <FieldInput
                      label="Doelgroep"
                      value={service.audience}
                      onChange={(e) =>
                        patch(service.id, "audience", e.target.value)
                      }
                    />
                    <FieldInput
                      label="Volgorde"
                      type="number"
                      value={service.order}
                      onChange={(e) =>
                        patch(service.id, "order", Number(e.target.value))
                      }
                    />
                  </div>
                  <FieldTextarea
                    label="Beschrijving"
                    rows={3}
                    value={service.description}
                    onChange={(e) =>
                      patch(service.id, "description", e.target.value)
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdate(service)}
                      disabled={busy}
                    >
                      <Icon name="check" size={15} />
                      Opslaan
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      disabled={busy}
                    >
                      Annuleren
                    </Button>
                  </div>
                </div>
              ) : (
                /* ---------- Weergave-modus ---------- */
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent">
                      <Icon name={service.icon} size={18} />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">
                        {service.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {service.description}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {service.duration} · {service.audience} · volgorde:{" "}
                        {service.order}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMove(service, "up")}
                      disabled={busy}
                      title="Verplaats omhoog"
                      className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-border text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-40"
                    >
                      <Icon name="chevron-up" size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(service, "down")}
                      disabled={busy}
                      title="Verplaats omlaag"
                      className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-border text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-40"
                    >
                      <Icon name="chevron-down" size={14} />
                    </button>
                    <Button
                      variant="secondary"
                      onClick={() => setEditingId(service.id)}
                    >
                      <Icon name="edit" size={14} />
                      Bewerken
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(service.id)}
                      disabled={busy}
                    >
                      <Icon name="trash" size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

      {/* Toevoeg-knop */}
      <Button variant="secondary" onClick={handleAdd} disabled={busy}>
        <Icon name="plus" size={15} />
        Module toevoegen
      </Button>
    </div>
  );
}
