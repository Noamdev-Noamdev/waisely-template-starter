/**
 * ---------------------------------------------------------------------------
 * NewsManager.tsx — CRUD-lijst voor nieuwsberichten (client component)
 * ---------------------------------------------------------------------------
 * Per bericht: titel, samenvatting, volledige tekst, datum, type (artikel/
 * pers) en optionele externe URL. Zelfde interaction-patroon als de andere
 * managers: weergave/bewerkmodus met router.refresh() na opslaan.
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
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { NewsItem } from "@/lib/types";

export default function NewsManager({
  initialItems,
}: {
  initialItems: NewsItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(type: "article" | "press") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:
            type === "press"
              ? "Nieuwe persvermelding"
              : "Nieuw artikel",
          excerpt: "Korte samenvatting",
          body: "Volledige tekst van het bericht.",
          type,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setItems((prev) => [...prev, json.item]);
      setEditingId(json.item.id);
      router.refresh();
    } catch {
      setError("Toevoegen mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(item: NewsItem) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
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

  async function handleDelete(id: string) {
    if (!window.confirm("Dit bericht verwijderen?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((n) => n.id !== id));
      router.refresh();
    } catch {
      setError("Verwijderen mislukt.");
    } finally {
      setBusy(false);
    }
  }

  function patch(
    id: string,
    field: keyof NewsItem,
    value: string
  ) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [field]: value } : n))
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {items
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((item) => {
          const isEditing = editingId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]"
            >
              {isEditing ? (
                <div className="space-y-4">
                  <FieldInput
                    label="Titel"
                    value={item.title}
                    onChange={(e) => patch(item.id, "title", e.target.value)}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldSelect
                      label="Type"
                      value={item.type}
                      onChange={(e) => patch(item.id, "type", e.target.value)}
                    >
                      <option value="article">Artikel</option>
                      <option value="press">Persvermelding</option>
                    </FieldSelect>
                    <FieldInput
                      label="Datum"
                      type="date"
                      value={item.date.slice(0, 10)}
                      onChange={(e) =>
                        patch(item.id, "date", new Date(e.target.value).toISOString())
                      }
                    />
                  </div>
                  {item.type === "press" ? (
                    <FieldInput
                      label="Externe URL"
                      value={item.externalUrl ?? ""}
                      onChange={(e) => patch(item.id, "externalUrl", e.target.value)}
                      placeholder="https://..."
                    />
                  ) : null}
                  <FieldTextarea
                    label="Samenvatting (voor op de kaart)"
                    rows={2}
                    value={item.excerpt}
                    onChange={(e) => patch(item.id, "excerpt", e.target.value)}
                  />
                  <FieldTextarea
                    label="Volledige tekst"
                    rows={6}
                    value={item.body}
                    onChange={(e) => patch(item.id, "body", e.target.value)}
                    help="Gebruik lege regels voor nieuwe paragrafen."
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(item)} disabled={busy}>
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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <Badge tone={item.type === "press" ? "warning" : "accent"}>
                        {item.type === "press" ? "Pers" : "Artikel"}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {item.excerpt}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(item.date)}
                      {item.externalUrl ? ` · ${item.externalUrl}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setEditingId(item.id)}
                    >
                      <Icon name="edit" size={14} />
                      Bewerken
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(item.id)}
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

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => handleAdd("article")} disabled={busy}>
          <Icon name="plus" size={15} />
          Artikel toevoegen
        </Button>
        <Button variant="secondary" onClick={() => handleAdd("press")} disabled={busy}>
          <Icon name="plus" size={15} />
          Persvermelding toevoegen
        </Button>
      </div>
    </div>
  );
}
