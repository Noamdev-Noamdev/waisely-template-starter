/**
 * ---------------------------------------------------------------------------
 * IntakeSubmissionsViewer.tsx — Admin view of submitted intake forms
 * ---------------------------------------------------------------------------
 * Shows a list of all submissions with expandable detail. Admin can
 * delete individual submissions. Displays field labels for readability.
 * ---------------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { IntakeField, IntakeSubmission } from "@/lib/types";

export default function IntakeSubmissionsViewer({
  initialSubmissions,
  fields,
}: {
  initialSubmissions: IntakeSubmission[];
  fields: IntakeField[];
}) {
  const router = useRouter();
  const [submissions, setSubmissions] =
    useState<IntakeSubmission[]>(initialSubmissions);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Map field id → label for display. */
  const fieldMap = Object.fromEntries(fields.map((f) => [f.id, f.label]));

  async function handleDelete(id: string) {
    if (!window.confirm("Deze inzending verwijderen?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/intake-submissions?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    } catch {
      setError("Verwijderen mislukt.");
    } finally {
      setBusy(false);
    }
  }

  /** Get a short summary for the list view: school name + email. */
  function getSummary(sub: IntakeSubmission): {
    school: string;
    contact: string;
    email: string;
  } {
    return {
      school: String(sub.answers["if_school"] ?? "—"),
      contact: String(sub.answers["if_contact_name"] ?? "—"),
      email: String(sub.answers["if_email"] ?? "—"),
    };
  }

  const sorted = [...submissions].sort(
    (a, b) => b.submittedAt.localeCompare(a.submittedAt)
  );

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {sorted.length === 0 ? (
        <p className="rounded-[var(--radius)] border border-dashed border-border bg-surface-muted p-8 text-center text-sm text-muted-foreground">
          Nog geen inzendingen ontvangen.
        </p>
      ) : null}

      {sorted.map((sub) => {
        const isExpanded = expandedId === sub.id;
        const summary = getSummary(sub);
        return (
          <div
            key={sub.id}
            className="rounded-[var(--radius)] border border-border bg-surface shadow-[var(--shadow-sm)]"
          >
            {/* Header row — always visible */}
            <button
              type="button"
              onClick={() =>
                setExpandedId(isExpanded ? null : sub.id)
              }
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-muted"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent">
                <Icon name="mail" size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">
                  {summary.school}
                </p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {summary.contact} · {summary.email}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge tone="accent">{formatDate(sub.submittedAt)}</Badge>
                <Icon
                  name={isExpanded ? "close" : "eye"}
                  size={16}
                  className="text-muted-foreground"
                />
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded ? (
              <div className="border-t border-border px-5 pb-5 pt-4">
                <div className="space-y-3">
                  {Object.entries(sub.answers).map(([fieldId, value]) => {
                    const label = fieldMap[fieldId] || fieldId;
                    const display = Array.isArray(value)
                      ? value.join(", ")
                      : String(value);
                    return (
                      <div key={fieldId}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {label}
                        </p>
                        <p className="mt-0.5 text-sm text-foreground">
                          {display || "—"}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 flex gap-2">
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(sub.id)}
                    disabled={busy}
                  >
                    <Icon name="trash" size={14} />
                    Verwijderen
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}

      <p className="text-center text-xs text-muted-foreground">
        {sorted.length} inzending{sorted.length !== 1 ? "en" : ""} totaal
      </p>
    </div>
  );
}
