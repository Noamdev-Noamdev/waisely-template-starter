/**
 * ---------------------------------------------------------------------------
 * BookingsList.tsx — Klikbare aanvragenlijst in het gebruikersdashboard
 * ---------------------------------------------------------------------------
 * Toont alle ingediende aanvragen van de ingelogde gebruiker (zowel snelle
 * boekingsaanvragen als uitgebreide intake-inzendingen) als interactieve,
 * uitklapbare kaarten.
 *
 * Bij klikken op een aanvraag verschijnt een gedetailleerd overzicht met
 * alle ingevulde gegevens: gekozen modules, webinar/workshop-keuze,
 * tijdsvoorkeur, contactgegevens, enz.
 *
 * Quiet Warm Minimal stijl, consistent met de rest van de site.
 * ---------------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Badge, {
  bookingStatusLabel,
  bookingStatusTone,
} from "@/components/ui/Badge";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Booking, IntakeField, IntakeSubmission } from "@/lib/types";

export interface CurrentUserSummary {
  name: string;
  email: string;
  organization?: string;
}

interface Props {
  bookings: Booking[];
  intakes?: IntakeSubmission[];
  intakeFields?: IntakeField[];
  currentUser?: CurrentUserSummary;
}

type UnifiedRequest =
  | {
      kind: "booking";
      id: string;
      dateKey: string;
      data: Booking;
    }
  | {
      kind: "intake";
      id: string;
      dateKey: string;
      data: IntakeSubmission;
    };

export default function BookingsList({
  bookings,
  intakes = [],
  intakeFields = [],
  currentUser,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Veldmap voor labels van intake-velden (id -> label)
  const fieldMap = Object.fromEntries(intakeFields.map((f) => [f.id, f.label]));

  // Combineer bookings en intakes in één gesorteerde lijst (nieuwste eerst)
  const items: UnifiedRequest[] = [
    ...bookings.map((b) => ({
      kind: "booking" as const,
      id: b.id,
      dateKey: b.createdAt || b.date,
      data: b,
    })),
    ...intakes.map((s) => ({
      kind: "intake" as const,
      id: s.id,
      dateKey: s.submittedAt,
      data: s,
    })),
  ].sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      {items.map((item) => {
        const isExpanded = expandedId === item.id;

        if (item.kind === "booking") {
          const b = item.data;
          const isWebinar = b.type === "webinar";

          return (
            <div
              key={b.id}
              className="rounded-[var(--radius)] border border-border bg-surface shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
            >
              {/* Klikbare header */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : b.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-muted sm:gap-4"
                aria-expanded={isExpanded}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent">
                  <Icon name={isWebinar ? "video" : "users"} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{b.topic}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {isWebinar ? "Webinar" : "Workshop"} · {formatDate(b.date)}
                    {b.audience ? ` · ${b.audience}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge tone={bookingStatusTone(b.status)}>
                    {bookingStatusLabel(b.status)}
                  </Badge>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
                    <Icon name={isExpanded ? "close" : "eye"} size={16} />
                  </span>
                </div>
              </button>

              {/* Uitklapbaar detailpaneel */}
              {isExpanded && (
                <div className="border-t border-border px-5 pb-6 pt-5 bg-surface space-y-6">
                  {/* Sessie & Inhoud */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
                      Sessie & Inhoud
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <DetailRow
                        label="Type sessie"
                        value={isWebinar ? "Webinar (online)" : "Workshop (op locatie)"}
                      />
                      <DetailRow label="Gekozen module(s) / onderwerp" value={b.topic} />
                      <DetailRow label="Doelgroep" value={b.audience} />
                      <DetailRow label="Gewenste datum" value={formatDate(b.date)} />
                      <DetailRow
                        label="Aantal deelnemers"
                        value={b.participants ? `${b.participants} deelnemers` : "—"}
                      />
                      <DetailRow label="Status" value={bookingStatusLabel(b.status)} />
                    </div>
                  </div>

                  {/* Contactgegevens */}
                  {currentUser && (
                    <div className="border-t border-border/60 pt-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
                        Contactgegevens
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <DetailRow label="Contactpersoon" value={currentUser.name} />
                        <DetailRow label="E-mailadres" value={currentUser.email} />
                        <DetailRow
                          label="School / organisatie"
                          value={currentUser.organization || "—"}
                        />
                      </div>
                    </div>
                  )}

                  {/* Extra context / notities */}
                  {b.notes && (
                    <div className="border-t border-border/60 pt-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                        Extra context of wensen
                      </h4>
                      <p className="rounded-[var(--radius)] bg-surface-muted p-4 text-sm leading-relaxed text-foreground">
                        {b.notes}
                      </p>
                    </div>
                  )}

                  {/* Footer met timestamp */}
                  <div className="border-t border-border/60 pt-3 text-xs text-muted-foreground flex justify-between">
                    <span>Aanvraag-ID: {b.id}</span>
                    <span>Ingediend op {formatDateTime(b.createdAt)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        }

        // Intake submission
        const s = item.data;
        const answers = s.answers || {};
        const sessionType = String(answers["if_session_type"] || "");
        const isWebinar = sessionType.toLowerCase().includes("webinar");

        // Bepaal titel
        const rawTopics = answers["if_topics"];
        const topicsStr = Array.isArray(rawTopics)
          ? rawTopics.join(" + ")
          : typeof rawTopics === "string"
          ? rawTopics
          : "";
        const title = topicsStr || sessionType || "Intake-aanvraag op maat";

        // Tijdsvoorkeur & datumvoorstellen
        const timePref = answers["if_time_pref"];
        const dateProposal = answers["if_date_proposal"];

        return (
          <div
            key={s.id}
            className="rounded-[var(--radius)] border border-border bg-surface shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
          >
            {/* Klikbare header */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : s.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-muted sm:gap-4"
              aria-expanded={isExpanded}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent">
                <Icon name={isWebinar ? "video" : "users"} size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground truncate">{title}</p>
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {sessionType || "Workshop op maat"} · {String(answers["if_date"] || formatDate(s.submittedAt))}
                  {answers["if_school"] ? ` · ${String(answers["if_school"])}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge tone="accent">In behandeling</Badge>
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
                  <Icon name={isExpanded ? "close" : "eye"} size={16} />
                </span>
              </div>
            </button>

            {/* Uitklapbaar detailpaneel */}
            {isExpanded && (
              <div className="border-t border-border px-5 pb-6 pt-5 bg-surface space-y-6">
                {/* 1. Contactgegevens */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
                    Contactgegevens
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailRow label="School / organisatie" value={String(answers["if_school"] || "—")} />
                    <DetailRow
                      label="Contactpersoon"
                      value={
                        answers["if_contact_name"]
                          ? `${String(answers["if_contact_name"])}${
                              answers["if_contact_function"]
                                ? ` (${String(answers["if_contact_function"])})`
                                : ""
                            }`
                          : "—"
                      }
                    />
                    <DetailRow label="E-mailadres" value={String(answers["if_email"] || "—")} />
                    <DetailRow label="Telefoonnummer" value={String(answers["if_phone"] || "—")} />
                    <DetailRow label="Locatie" value={String(answers["if_location"] || "—")} />
                    {answers["if_onsite_contact"] && (
                      <DetailRow
                        label="Contact ter plaatse"
                        value={String(answers["if_onsite_contact"])}
                      />
                    )}
                  </div>
                </div>

                {/* 2. Sessie & Inhoud */}
                <div className="border-t border-border/60 pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
                    Sessie & Inhoud
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailRow label="Type sessie" value={String(answers["if_session_type"] || "—")} />
                    <DetailRow
                      label="Aantal deelnemers"
                      value={answers["if_participants"] ? `${String(answers["if_participants"])} deelnemers` : "—"}
                    />
                    <DetailRow label="Doelgroep" value={String(answers["if_audience"] || "—")} />
                    <DetailRow label="Onderwijsniveau" value={String(answers["if_level"] || "—")} />
                  </div>

                  {/* Gekozen onderwerpen / modules */}
                  {answers["if_topics"] && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Gekozen modules / onderwerpen
                      </p>
                      {Array.isArray(answers["if_topics"]) ? (
                        <div className="flex flex-wrap gap-1.5">
                          {answers["if_topics"].map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center rounded-full bg-accent-soft border border-accent/25 px-2.5 py-0.5 text-xs font-medium text-accent-strong"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-foreground">{String(answers["if_topics"])}</p>
                      )}
                    </div>
                  )}

                  {/* Vakgebieden */}
                  {answers["if_subjects"] && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Vakgebied(en)
                      </p>
                      {Array.isArray(answers["if_subjects"]) ? (
                        <div className="flex flex-wrap gap-1.5">
                          {answers["if_subjects"].map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center rounded-full bg-surface-muted border border-border px-2.5 py-0.5 text-xs text-foreground"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-foreground">{String(answers["if_subjects"])}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Tijdsplanning & Voorkeuren */}
                <div className="border-t border-border/60 pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
                    Tijdsplanning & Voorkeuren
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailRow
                      label="Gewenste datum (indicatief)"
                      value={String(answers["if_date"] || "—")}
                    />
                  </div>

                  {/* Algemene tijdsvoorkeur (dagdelen) */}
                  {timePref && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Algemene tijdsvoorkeur (dagdelen)
                      </p>
                      {Array.isArray(timePref) && timePref.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {timePref.map((tp) => (
                            <span
                              key={tp}
                              className="inline-flex items-center rounded-full bg-surface-muted border border-border px-2.5 py-0.5 text-xs text-foreground"
                            >
                              {tp}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-foreground">{String(timePref || "Geen specifieke voorkeur opgegeven")}</p>
                      )}
                    </div>
                  )}

                  {/* Datumvoorstel onder voorbehoud */}
                  {dateProposal && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Datumvoorstellen (onder voorbehoud)
                      </p>
                      <p className="rounded-[var(--radius)] bg-surface-muted p-3 text-sm text-foreground leading-relaxed">
                        {String(dateProposal)}
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Context & Noden (indien ingevuld) */}
                {(answers["if_reason"] ||
                  answers["if_challenges"] ||
                  answers["if_experience"] ||
                  answers["if_tools_used"] ||
                  answers["if_ai_policy"] ||
                  answers["if_remarks"]) && (
                  <div className="border-t border-border/60 pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
                      Context & Noden
                    </h4>
                    <div className="space-y-3">
                      {answers["if_experience"] && (
                        <DetailRow
                          label="Ervaring met AI-tools"
                          value={`${String(answers["if_experience"])} / 5`}
                        />
                      )}
                      {answers["if_tools_used"] && (
                        <DetailRow
                          label="Al gebruikte AI-tools"
                          value={String(answers["if_tools_used"])}
                        />
                      )}
                      {answers["if_reason"] && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Belangrijkste reden
                          </p>
                          <p className="mt-0.5 text-sm text-foreground">{String(answers["if_reason"])}</p>
                        </div>
                      )}
                      {answers["if_challenges"] && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Vragen of uitdagingen
                          </p>
                          <p className="mt-0.5 text-sm text-foreground">{String(answers["if_challenges"])}</p>
                        </div>
                      )}
                      {answers["if_ai_policy"] && (
                        <DetailRow
                          label="AI-beleid op school"
                          value={String(answers["if_ai_policy"])}
                        />
                      )}
                      {answers["if_remarks"] && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Overige opmerkingen
                          </p>
                          <p className="mt-0.5 text-sm text-foreground">{String(answers["if_remarks"])}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer met timestamp */}
                <div className="border-t border-border/60 pt-3 text-xs text-muted-foreground flex justify-between">
                  <span>Intake-aanvraag ID: {s.id}</span>
                  <span>Verstuurd op {formatDateTime(s.submittedAt)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Herbruikbaar label/waarde-paar voor de detailweergave. */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}
