/**
 * ---------------------------------------------------------------------------
 * IntakeForm.tsx — Public intake form (client component)
 * ---------------------------------------------------------------------------
 * Dynamically renders a form from IntakeField definitions. Supports all
 * field types: text, textarea, email, tel, select, radio, checkbox, scale.
 * Groups fields by section with visual headers.
 * ---------------------------------------------------------------------------
 */

"use client";

import { FormEvent, useState } from "react";
import Icon from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { IntakeField } from "@/lib/types";

export default function IntakeForm({ fields }: { fields: IntakeField[] }) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sorted = [...fields].sort((a, b) => a.order - b.order);

  function setValue(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggleCheckbox(id: string, option: string) {
    setAnswers((prev) => {
      const current = (prev[id] as string[]) || [];
      return {
        ...prev,
        [id]: current.includes(option)
          ? current.filter((v) => v !== option)
          : [...current, option],
      };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Er ging iets mis.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorMsg("Kon het formulier niet versturen. Probeer het later opnieuw.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[var(--radius)] bg-surface p-10 text-center shadow-[var(--shadow-lg)]">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-accent)]">
          <Icon name="check" size={24} />
        </span>
        <h2
          className="text-xl font-medium text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Bedankt voor je intake!
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Je formulier is succesvol verstuurd. Sabrina neemt zo snel mogelijk
          contact met je op om de workshop op maat af te stemmen.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {sorted.map((field, idx) => {
        const prevField = idx > 0 ? sorted[idx - 1] : undefined;
        const showSection = Boolean(
          field.section && field.section !== prevField?.section
        );

        return (
          <div key={field.id}>
            {showSection ? (
              <h3
                className="mb-4 mt-8 border-b border-border pb-2 text-lg font-medium text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {field.section}
              </h3>
            ) : null}
            <FieldRenderer
              field={field}
              value={answers[field.id]}
              onChange={setValue}
              onToggle={toggleCheckbox}
            />
          </div>
        );
      })}

      {errorMsg ? (
        <p className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </p>
      ) : null}

      <Button type="submit" disabled={status === "sending"} className="w-full">
        {status === "sending" ? "Versturen…" : "Formulier versturen"}
      </Button>
    </form>
  );
}

/* ---------------------------------------------------------------------------
 * FieldRenderer — renders a single field based on its type
 * ------------------------------------------------------------------------- */

function FieldRenderer({
  field,
  value,
  onChange,
  onToggle,
}: {
  field: IntakeField;
  value: string | string[] | undefined;
  onChange: (id: string, value: string) => void;
  onToggle: (id: string, option: string) => void;
}) {
  const strVal = typeof value === "string" ? value : "";
  const arrVal = Array.isArray(value) ? value : [];
  const options = field.options?.split("|") ?? [];

  return (
    <div className="mb-4">
      <label className="field-label" htmlFor={field.id}>
        {field.label}
        {field.required ? <span className="text-accent"> *</span> : null}
      </label>

      {/* TEXT */}
      {(field.type === "text" || field.type === "email" || field.type === "tel") ? (
        <input
          id={field.id}
          type={field.type}
          className="field-input"
          value={strVal}
          onChange={(e) => onChange(field.id, e.target.value)}
          required={field.required}
        />
      ) : null}

      {/* TEXTAREA */}
      {field.type === "textarea" ? (
        <textarea
          id={field.id}
          className="field-input min-h-24 resize-y"
          rows={3}
          value={strVal}
          onChange={(e) => onChange(field.id, e.target.value)}
          required={field.required}
        />
      ) : null}

      {/* SELECT */}
      {field.type === "select" ? (
        <select
          id={field.id}
          className="field-input appearance-none bg-surface"
          value={strVal}
          onChange={(e) => onChange(field.id, e.target.value)}
          required={field.required}
        >
          <option value="">Kies een optie…</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : null}

      {/* RADIO */}
      {field.type === "radio" ? (
        <div className="mt-2 space-y-2">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius)] px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-muted"
            >
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={strVal === opt}
                onChange={() => onChange(field.id, opt)}
                required={field.required && !strVal}
                className="h-4 w-4 accent-accent"
              />
              {opt}
            </label>
          ))}
        </div>
      ) : null}

      {/* CHECKBOX */}
      {field.type === "checkbox" ? (
        <div className="mt-2 space-y-2">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius)] px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-muted"
            >
              <input
                type="checkbox"
                value={opt}
                checked={arrVal.includes(opt)}
                onChange={() => onToggle(field.id, opt)}
                className="h-4 w-4 rounded border-border accent-accent"
              />
              {opt}
            </label>
          ))}
        </div>
      ) : null}

      {/* SCALE */}
      {field.type === "scale" ? (
        <ScaleField field={field} value={strVal} onChange={onChange} />
      ) : null}

      {field.help ? (
        <p className="field-help">{field.help}</p>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * ScaleField — renders a 1-5 (or custom) scale with labels
 * ------------------------------------------------------------------------- */

function ScaleField({
  field,
  value,
  onChange,
}: {
  field: IntakeField;
  value: string;
  onChange: (id: string, value: string) => void;
}) {
  const [minStr, maxStr] = (field.scaleRange ?? "1|5").split("|");
  const min = parseInt(minStr) || 1;
  const max = parseInt(maxStr) || 5;
  const [leftLabel, rightLabel] = (field.scaleLabels ?? "").split("|");
  const points = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-2">
        {leftLabel ? (
          <span className="text-xs text-muted-foreground">{leftLabel}</span>
        ) : null}
        <div className="flex flex-1 justify-center gap-3">
          {points.map((n) => (
            <label
              key={n}
              className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-sm font-medium transition-all ${
                value === String(n)
                  ? "bg-accent text-accent-foreground shadow-[var(--shadow-accent)]"
                  : "bg-surface-muted text-muted-foreground hover:bg-accent-soft hover:text-foreground"
              }`}
            >
              <input
                type="radio"
                name={field.id}
                value={String(n)}
                checked={value === String(n)}
                onChange={() => onChange(field.id, String(n))}
                className="sr-only"
                required={field.required && !value}
              />
              {n}
            </label>
          ))}
        </div>
        {rightLabel ? (
          <span className="text-xs text-muted-foreground">{rightLabel}</span>
        ) : null}
      </div>
    </div>
  );
}
