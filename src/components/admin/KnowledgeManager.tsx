/**
 * ---------------------------------------------------------------------------
 * KnowledgeManager.tsx — CRUD-lijst voor kennisbankmaterialen
 * ---------------------------------------------------------------------------
 * Zelfde patroon als ServicesManager: per item een kaart met weergave- en
 * bewerkmodus; acties spreken /api/admin/knowledge aan en refreshen de
 * server-componenten (publiek dashboard is direct actueel).
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
import type { KnowledgeItem } from "@/lib/types";

const KIND_OPTIONS: { value: KnowledgeItem["kind"]; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Document" },
  { value: "link", label: "Link" },
  { value: "slides", label: "Slides" },
  { value: "video", label: "Video" },
  { value: "template", label: "Template" },
];

export default function KnowledgeManager({
  initialItems,
}: {
  initialItems: KnowledgeItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nieuw materiaal",
          description: "Korte beschrijving",
          kind: "pdf",
          url: "#",
          tag: "Algemeen",
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

  async function handleUpdate(item: KnowledgeItem) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/knowledge", {
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
    if (!window.confirm("Dit materiaal verwijderen?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/knowledge?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((k) => k.id !== id));
      router.refresh();
    } catch {
      setError("Verwijderen mislukt.");
    } finally {
      setBusy(false);
    }
  }

  function patch(
    id: string,
    field: keyof KnowledgeItem,
    value: string | number
  ) {
    setItems((prev) =>
      prev.map((k) => (k.id === id ? { ...k, [field]: value } : k))
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
        .sort((a, b) => a.order - b.order)
        .map((item) => {
          const isEditing = editingId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]"
            >
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldInput
                      label="Titel"
                      value={item.title}
                      onChange={(e) => patch(item.id, "title", e.target.value)}
                    />
                    <FieldSelect
                      label="Soort"
                      value={item.kind}
                      onChange={(e) => patch(item.id, "kind", e.target.value)}
                    >
                      {KIND_OPTIONS.map((k) => (
                        <option key={k.value} value={k.value}>
                          {k.label}
                        </option>
                      ))}
                    </FieldSelect>
                    <FieldInput
                      label="Link/URL"
                      value={item.url}
                      onChange={(e) => patch(item.id, "url", e.target.value)}
                      placeholder="https://..."
                      help="Plaats hier de downloadlink of externe URL."
                    />
                    <FieldInput
                      label="Categorie/tag"
                      value={item.tag}
                      onChange={(e) => patch(item.id, "tag", e.target.value)}
                    />
                    <FieldInput
                      label="Volgorde"
                      type="number"
                      value={item.order}
                      onChange={(e) =>
                        patch(item.id, "order", Number(e.target.value))
                      }
                    />
                  </div>
                  <FieldTextarea
                    label="Beschrijving"
                    rows={2}
                    value={item.description}
                    onChange={(e) =>
                      patch(item.id, "description", e.target.value)
                    }
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
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent">
                      <Icon name={item.kind} size={18} />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {item.title}
                        </p>
                        <Badge tone="accent">{item.tag}</Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <p className="mt-1.5 truncate text-xs text-muted-foreground">
                        {item.url}
                      </p>
                    </div>
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

      <Button variant="secondary" onClick={handleAdd} disabled={busy}>
        <Icon name="plus" size={15} />
        Materiaal toevoegen
      </Button>
    </div>
  );
}
