/**
 * ---------------------------------------------------------------------------
 * IntakeFieldsManager.tsx — Admin CRUD for intake form fields
 * ---------------------------------------------------------------------------
 * Lets the admin add, edit, reorder, and delete form fields. Each field
 * has: label, type, required, options (for select/radio/checkbox), section
 * header, help text, and order.
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
import type { IntakeField, IntakeFieldType } from "@/lib/types";

const TYPE_OPTIONS: { value: IntakeFieldType; label: string }[] = [
  { value: "text", label: "Kort tekstveld" },
  { value: "textarea", label: "Lang tekstveld" },
  { value: "email", label: "E-mail" },
  { value: "tel", label: "Telefoonnummer" },
  { value: "select", label: "Dropdown (keuze)" },
  { value: "radio", label: "Keuzerondjes (één kiezen)" },
  { value: "checkbox", label: "Vinkjes (meerdere kiezen)" },
  { value: "scale", label: "Schaal (1-5)" },
];

const NEEDS_OPTIONS: IntakeFieldType[] = ["select", "radio", "checkbox"];

export default function IntakeFieldsManager({
  initialFields,
}: {
  initialFields: IntakeField[];
}) {
  const router = useRouter();
  const [fields, setFields] = useState<IntakeField[]>(initialFields);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/intake-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: "Nieuw veld",
          type: "text",
          required: false,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setFields((prev) => [...prev, json.field]);
      setEditingId(json.field.id);
      router.refresh();
    } catch {
      setError("Toevoegen mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(field: IntakeField) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/intake-fields", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(field),
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
    if (!window.confirm("Dit veld verwijderen?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/intake-fields?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setFields((prev) => prev.filter((f) => f.id !== id));
      router.refresh();
    } catch {
      setError("Verwijderen mislukt.");
    } finally {
      setBusy(false);
    }
  }

  function patch(
    id: string,
    field: keyof IntakeField,
    value: string | number | boolean
  ) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  }

  const sorted = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {sorted.map((field) => {
        const isEditing = editingId === field.id;
        return (
          <div
            key={field.id}
            className="rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]"
          >
            {isEditing ? (
              <div className="space-y-4">
                <FieldInput
                  label="Sectiekop (optioneel)"
                  value={field.section ?? ""}
                  onChange={(e) => patch(field.id, "section", e.target.value)}
                  help="Wordt als kopje getoond boven dit veld in het formulier."
                />
                <FieldInput
                  label="Label (vraagtekst)"
                  value={field.label}
                  onChange={(e) => patch(field.id, "label", e.target.value)}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <FieldSelect
                    label="Type"
                    value={field.type}
                    onChange={(e) =>
                      patch(field.id, "type", e.target.value)
                    }
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </FieldSelect>
                  <FieldInput
                    label="Volgorde"
                    type="number"
                    value={field.order}
                    onChange={(e) =>
                      patch(field.id, "order", Number(e.target.value))
                    }
                  />
                  <div className="flex items-end gap-2 pb-0.5">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          patch(field.id, "required", e.target.checked)
                        }
                        className="h-4 w-4 rounded border-border accent-accent"
                      />
                      Verplicht
                    </label>
                  </div>
                </div>

                {NEEDS_OPTIONS.includes(field.type) ? (
                  <FieldTextarea
                    label="Opties (gescheiden door | )"
                    rows={2}
                    value={field.options ?? ""}
                    onChange={(e) => patch(field.id, "options", e.target.value)}
                    help="Bv. Optie A|Optie B|Optie C"
                  />
                ) : null}

                {field.type === "scale" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldInput
                      label="Schaalbereik (min|max)"
                      value={field.scaleRange ?? "1|5"}
                      onChange={(e) =>
                        patch(field.id, "scaleRange", e.target.value)
                      }
                      help="Bv. 1|5"
                    />
                    <FieldInput
                      label="Schaallabels (links|rechts)"
                      value={field.scaleLabels ?? ""}
                      onChange={(e) =>
                        patch(field.id, "scaleLabels", e.target.value)
                      }
                      help="Bv. Geen ervaring|Dagelijks gebruik"
                    />
                  </div>
                ) : null}

                <FieldInput
                  label="Hulptekst (optioneel)"
                  value={field.help ?? ""}
                  onChange={(e) => patch(field.id, "help", e.target.value)}
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdate(field)}
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  {field.section ? (
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
                      § {field.section}
                    </p>
                  ) : null}
                  <p className="font-medium text-foreground">{field.label}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge tone="accent">
                      {TYPE_OPTIONS.find((t) => t.value === field.type)?.label ?? field.type}
                    </Badge>
                    {field.required ? (
                      <Badge tone="warning">Verplicht</Badge>
                    ) : (
                      <Badge tone="neutral">Optioneel</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      #{field.order}
                    </span>
                  </div>
                  {field.options ? (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      Opties: {field.options.split("|").join(", ")}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setEditingId(field.id)}
                  >
                    <Icon name="edit" size={14} />
                    Bewerken
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(field.id)}
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
        Veld toevoegen
      </Button>
    </div>
  );
}
