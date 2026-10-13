/**
 * ---------------------------------------------------------------------------
 * ContentForm.tsx — Generiek bewerkformulier voor siteContent-deelblokken
 * ---------------------------------------------------------------------------
 * Dit is het hart van het content-CMS-stukje van de template. De component
 * ontvangt:
 *   - initial: volledige SiteContent uit de store
 *   - saveKeys: welke onderdelen (hero, intro, about, why, contact, footer,
 *     bookTraining, servicesSection, newsSection, navigation) bewerkbaar
 *     zijn op deze pagina. Per onderdeel rendert het de juiste velden.
 * Bij opslaan wordt alleen de bewerkte sleutels naar de API gestuurd (merge
 * op de server), waarna de publieke pagina's direct de nieuwe content tonen.
 * ---------------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  FieldInput,
  FieldTextarea,
  FieldLabel,
} from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import type { SiteContent } from "@/lib/types";

/** Beschikbare bewerkbare onderdelen; uitbreiden = nieuw veldblok toevoegen. */
type ContentKey = keyof Pick<
  SiteContent,
  | "hero"
  | "intro"
  | "about"
  | "why"
  | "contact"
  | "footer"
  | "bookTraining"
  | "servicesSection"
  | "newsSection"
  | "navigation"
>;

export default function ContentForm({
  initial,
  saveKeys,
  submitLabel = "Opslaan",
}: {
  initial: SiteContent;
  /** Welke onderdelen deze pagina bewerkt (de rest blijft onaangeroerd). */
  saveKeys: ContentKey[];
  submitLabel?: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Uploaden mislukt");
      }

      patch("about", "imageUrl", data.url);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Uploaden mislukt");
    } finally {
      setUploading(false);
    }
  }

  /** Update één veld binnen één onderdeel, b.v. patch("hero", "title", v). */
  function patch<K extends ContentKey>(
    key: K,
    field: string,
    value: unknown
  ) {
    setContent((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as object), [field]: value },
    }));
  }

  /** Update titel/body van een lijstitem op index (why of about). */
  function patchListItem(
    key: "why" | "about",
    field: "items" | "highlights",
    index: number,
    part: "title" | "body",
    value: string
  ) {
    setContent((prev) => {
      const list =
        key === "why"
          ? [...(prev.why?.items ?? [])]
          : [...(prev.about?.highlights ?? [])];
      list[index] = { ...list[index], [part]: value };
      return key === "why"
        ? { ...prev, why: { ...prev.why, items: list } }
        : { ...prev, about: { ...prev.about, highlights: list } };
    });
  }

  function addListItem(key: "why" | "about") {
    setContent((prev) =>
      key === "why"
        ? {
            ...prev,
            why: {
              ...prev.why,
              items: [
                ...(prev.why?.items ?? []),
                { title: "Nieuw punt", body: "Toelichting" },
              ],
            },
          }
        : {
            ...prev,
            about: {
              ...prev.about,
              highlights: [
                ...(prev.about?.highlights ?? []),
                { title: "Nieuwe highlight", body: "Beschrijving" },
              ],
            },
          }
    );
  }

  function removeListItem(key: "why" | "about", index: number) {
    setContent((prev) =>
      key === "why"
        ? {
            ...prev,
            why: {
              ...prev.why,
              items: (prev.why?.items ?? []).filter((_, i) => i !== index),
            },
          }
        : {
            ...prev,
            about: {
              ...prev.about,
              highlights: (prev.about?.highlights ?? []).filter(
                (_, i) => i !== index
              ),
            },
          }
    );
  }

  /* ---------------------- Hero Stats helpers ---------------------- */
  const heroStats = content.hero?.stats ?? [
    { value: "20+", label: "Jaar onderwijservaring" },
    { value: "8", label: "Modulaire thema's" },
    { value: "Op maat", label: "Elke workshop uniek" },
  ];

  function patchHeroStat(index: number, part: "value" | "label", val: string) {
    const next = [...heroStats];
    next[index] = { ...next[index], [part]: val };
    patch("hero", "stats", next);
  }

  function addHeroStat() {
    patch("hero", "stats", [
      ...heroStats,
      { value: "100%", label: "Tevreden docenten" },
    ]);
  }

  function removeHeroStat(index: number) {
    patch(
      "hero",
      "stats",
      heroStats.filter((_, i) => i !== index)
    );
  }

  /* -------------------- Navigation links helpers -------------------- */
  const navLinks = content.navigation?.links ?? [
    { href: "/#waarom", label: "Waarom WAIsely?" },
    { href: "/over", label: "Wie is WAIsely?" },
    { href: "/boek-een-training", label: "Boek een training" },
    { href: "/pers", label: "Pers en Sociale Media" },
    { href: "/contact", label: "Contact" },
  ];

  function patchNavLink(index: number, part: "href" | "label", val: string) {
    const next = [...navLinks];
    next[index] = { ...next[index], [part]: val };
    setContent((prev) => ({
      ...prev,
      navigation: { links: next },
    }));
  }

  function addNavLink() {
    setContent((prev) => ({
      ...prev,
      navigation: {
        links: [...navLinks, { href: "/nieuw", label: "Nieuwe pagina" }],
      },
    }));
  }

  function removeNavLink(index: number) {
    setContent((prev) => ({
      ...prev,
      navigation: {
        links: navLinks.filter((_, i) => i !== index),
      },
    }));
  }

  /* ------------------- Boeken Stappen helpers ------------------- */
  const bookingSteps = content.bookTraining?.bookingSteps ?? [
    "Vul het formulier in met je wensen",
    "Ontvang binnen 2 werkdagen een voorstel",
    "We plannen samen een datum",
  ];

  function patchBookingStep(index: number, val: string) {
    const next = [...bookingSteps];
    next[index] = val;
    patch("bookTraining", "bookingSteps", next);
  }

  function addBookingStep() {
    patch("bookTraining", "bookingSteps", [...bookingSteps, "Nieuwe stap"]);
  }

  function removeBookingStep(index: number) {
    patch(
      "bookTraining",
      "bookingSteps",
      bookingSteps.filter((_, i) => i !== index)
    );
  }

  /** Stuurt alleen de bewerkte onderdelen naar de API (merge server-side). */
  async function handleSave() {
    setStatus("saving");
    try {
      const payload: Partial<SiteContent> = {};
      for (const key of saveKeys) {
        (payload as Record<string, unknown>)[key] = content[key];
      }
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
      router.refresh();
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }

  const servicesSec = content.servicesSection ?? {
    eyebrow: "Modules",
    title: "Stel je workshop samen",
    subtitle:
      "Kies maximaal drie modules die je combineert tot een workshop van 2 uur. Elke module bevat concrete lesvoorbeelden die je meteen kunt inzetten.",
    primaryCtaLabel: "Boek een training",
    secondaryCtaLabel: "Of neem vrijblijvend contact op",
  };

  const newsSec = content.newsSection ?? {
    eyebrow: "Nieuws & pers",
    title: "Recent nieuws en persvermeldingen",
    readMoreLabel: "Lees verder",
    externalLabel: "Lees het artikel",
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------- NAVIGATION ---------------------------- */}
      {saveKeys.includes("navigation") ? (
        <fieldset className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
          <legend className="px-2 text-sm font-bold uppercase tracking-wider text-accent">
            Hoofdmenu Navigatie
          </legend>
          <p className="mb-4 text-xs text-muted-foreground">
            Pas de labels en URL&#39;s van de links in de navigatiebalk aan.
          </p>
          <div className="space-y-3">
            {navLinks.map((link, i) => (
              <div
                key={i}
                className="grid gap-3 rounded-[var(--radius)] border border-border bg-surface-muted p-4 sm:grid-cols-[1fr_1.5fr_auto]"
              >
                <FieldInput
                  label={`Link ${i + 1} — URL / Href`}
                  value={link.href}
                  onChange={(e) => patchNavLink(i, "href", e.target.value)}
                  placeholder="/#waarom of /over"
                />
                <FieldInput
                  label={`Link ${i + 1} — Tekst (Label)`}
                  value={link.label}
                  onChange={(e) => patchNavLink(i, "label", e.target.value)}
                  placeholder="bv. Wie is WAIsely?"
                />
                <button
                  type="button"
                  onClick={() => removeNavLink(i)}
                  className="mt-6 inline-flex h-9 w-9 items-center justify-center self-end rounded-[var(--radius)] border border-red-200 text-red-600 transition-colors hover:bg-red-50"
                  aria-label={`Link ${i + 1} verwijderen`}
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={addNavLink}
          >
            <Icon name="plus" size={15} />
            Menu-item toevoegen
          </Button>
        </fieldset>
      ) : null}

      {/* ---------------------------- HERO ---------------------------- */}
      {saveKeys.includes("hero") ? (
        <fieldset className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
          <legend className="px-2 text-sm font-bold uppercase tracking-wider text-accent">
            Hero-sectie
          </legend>
          <div className="space-y-4">
            <FieldInput
              label="Eyebrow-tekst (klein label boven de titel)"
              value={content.hero.eyebrow}
              onChange={(e) => patch("hero", "eyebrow", e.target.value)}
            />
            <FieldInput
              label="Titel"
              value={content.hero.title}
              onChange={(e) => patch("hero", "title", e.target.value)}
            />
            <FieldTextarea
              label="Ondertitel"
              rows={3}
              value={content.hero.subtitle}
              onChange={(e) => patch("hero", "subtitle", e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldInput
                label="Label primaire knop"
                value={content.hero.primaryCtaLabel}
                onChange={(e) =>
                  patch("hero", "primaryCtaLabel", e.target.value)
                }
              />
              <FieldInput
                label="Label secundaire knop"
                value={content.hero.secondaryCtaLabel}
                onChange={(e) =>
                  patch("hero", "secondaryCtaLabel", e.target.value)
                }
              />
            </div>

            {/* Statistieken-strook */}
            <div className="mt-4 pt-4 border-t border-border">
              <FieldLabel>Statistieken-strook (3 kaarten onder de knoppen)</FieldLabel>
              <div className="space-y-3 mt-2">
                {heroStats.map((stat, i) => (
                  <div
                    key={i}
                    className="grid gap-3 rounded-[var(--radius)] border border-border bg-surface-muted p-4 sm:grid-cols-[1fr_2fr_auto]"
                  >
                    <FieldInput
                      label={`Kaart ${i + 1} — Waarde / Getal`}
                      value={stat.value}
                      onChange={(e) => patchHeroStat(i, "value", e.target.value)}
                      placeholder="bv. 20+ of Op maat"
                    />
                    <FieldInput
                      label={`Kaart ${i + 1} — Omschrijving (Label)`}
                      value={stat.label}
                      onChange={(e) => patchHeroStat(i, "label", e.target.value)}
                      placeholder="bv. Jaar onderwijservaring"
                    />
                    <button
                      type="button"
                      onClick={() => removeHeroStat(i)}
                      className="mt-6 inline-flex h-9 w-9 items-center justify-center self-end rounded-[var(--radius)] border border-red-200 text-red-600 transition-colors hover:bg-red-50"
                      aria-label={`Kaart ${i + 1} verwijderen`}
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                className="mt-3"
                onClick={addHeroStat}
              >
                <Icon name="plus" size={15} />
                Statistiekkaart toevoegen
              </Button>
            </div>
          </div>
        </fieldset>
      ) : null}

      {/* ---------------------------- INTRO ---------------------------- */}
      {saveKeys.includes("intro") ? (
        <fieldset className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
          <legend className="px-2 text-sm font-bold uppercase tracking-wider text-accent">
            Intro-blok
          </legend>
          <div className="space-y-4">
            <FieldInput
              label="Titel"
              value={content.intro.title}
              onChange={(e) => patch("intro", "title", e.target.value)}
            />
            <FieldTextarea
              label="Tekst"
              rows={4}
              value={content.intro.body}
              onChange={(e) => patch("intro", "body", e.target.value)}
            />
            <FieldInput
              label="Callout-tekst (naast doelwit-icoon)"
              value={
                content.intro.badgeText ??
                "Alle trainingen zijn praktisch en direct inzetbaar in de klas."
              }
              onChange={(e) => patch("intro", "badgeText", e.target.value)}
            />
          </div>
        </fieldset>
      ) : null}

      {/* ----------------------- SERVICES SECTION ----------------------- */}
      {saveKeys.includes("servicesSection") ? (
        <fieldset className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
          <legend className="px-2 text-sm font-bold uppercase tracking-wider text-accent">
            Kopteksten Diensten &amp; Modules Sectie
          </legend>
          <div className="space-y-4">
            <FieldInput
              label="Eyebrow-tekst (boven titel)"
              value={servicesSec.eyebrow}
              onChange={(e) =>
                patch("servicesSection", "eyebrow", e.target.value)
              }
            />
            <FieldInput
              label="Sectietitel"
              value={servicesSec.title}
              onChange={(e) => patch("servicesSection", "title", e.target.value)}
            />
            <FieldTextarea
              label="Ondertitel / toelichting"
              rows={3}
              value={servicesSec.subtitle}
              onChange={(e) =>
                patch("servicesSection", "subtitle", e.target.value)
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldInput
                label="Primaire knoplabel"
                value={servicesSec.primaryCtaLabel}
                onChange={(e) =>
                  patch("servicesSection", "primaryCtaLabel", e.target.value)
                }
              />
              <FieldInput
                label="Secundaire knoplabel"
                value={servicesSec.secondaryCtaLabel}
                onChange={(e) =>
                  patch("servicesSection", "secondaryCtaLabel", e.target.value)
                }
              />
            </div>
          </div>
        </fieldset>
      ) : null}

      {/* ------------------------- NEWS SECTION ------------------------- */}
      {saveKeys.includes("newsSection") ? (
        <fieldset className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
          <legend className="px-2 text-sm font-bold uppercase tracking-wider text-accent">
            Kopteksten Nieuws &amp; Pers op Homepage
          </legend>
          <div className="space-y-4">
            <FieldInput
              label="Eyebrow-tekst"
              value={newsSec.eyebrow}
              onChange={(e) => patch("newsSection", "eyebrow", e.target.value)}
            />
            <FieldInput
              label="Sectietitel"
              value={newsSec.title}
              onChange={(e) => patch("newsSection", "title", e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldInput
                label="Knoptekst voor artikelen"
                value={newsSec.readMoreLabel}
                onChange={(e) =>
                  patch("newsSection", "readMoreLabel", e.target.value)
                }
              />
              <FieldInput
                label="Knoptekst voor persberichten"
                value={newsSec.externalLabel}
                onChange={(e) =>
                  patch("newsSection", "externalLabel", e.target.value)
                }
              />
            </div>
          </div>
        </fieldset>
      ) : null}

      {/* ---------------------------- ABOUT ---------------------------- */}
      {saveKeys.includes("about") ? (
        <fieldset className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
          <legend className="px-2 text-sm font-bold uppercase tracking-wider text-accent">
            Over WAIsely (Bio &amp; Visie)
          </legend>
          <div className="space-y-4">
            <FieldInput
              label="Eyebrow-tekst"
              value={content.about.eyebrow ?? "Over"}
              onChange={(e) => patch("about", "eyebrow", e.target.value)}
            />
            <FieldInput
              label="Titel"
              value={content.about.title}
              onChange={(e) => patch("about", "title", e.target.value)}
            />
            <FieldTextarea
              label="Hoofdtekst (alinea's gescheiden door witregels)"
              rows={8}
              value={content.about.body}
              onChange={(e) => patch("about", "body", e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldInput
                label="Naam profielkaart"
                value={content.about.name ?? ""}
                onChange={(e) => patch("about", "name", e.target.value)}
                placeholder="bv. Sabrina Carota"
              />
              <FieldInput
                label="Functie / rol profielkaart"
                value={content.about.role ?? ""}
                onChange={(e) => patch("about", "role", e.target.value)}
                placeholder="bv. Leerkracht, taalwetenschapper & AI-trainer"
              />
            </div>

            {/* Afbeelding sectie */}
            <div className="rounded-[var(--radius)] border border-border bg-surface-muted p-4">
              <FieldLabel>Afbeelding / Profielfoto</FieldLabel>
              <p className="mb-3 text-xs text-muted-foreground">
                Upload een foto vanaf je computer of geef een afbeeldings-URL op.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-[var(--shadow-sm)]">
                  {content.about.imageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={content.about.imageUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => patch("about", "imageUrl", "")}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow transition-colors hover:bg-red-700"
                        title="Afbeelding verwijderen"
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Icon name="image" size={28} />
                      <span className="mt-1 text-[10px]">Geen foto</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted">
                      <Icon name="upload" size={16} />
                      {uploading ? "Uploaden…" : "Kies afbeelding van computer"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        disabled={uploading}
                        onChange={handleImageUpload}
                      />
                    </label>
                    {uploadError ? (
                      <p className="mt-1.5 text-xs text-red-600">{uploadError}</p>
                    ) : null}
                  </div>

                  <FieldInput
                    label="Of geef een afbeeldings-URL op"
                    value={content.about.imageUrl ?? ""}
                    onChange={(e) => patch("about", "imageUrl", e.target.value)}
                    placeholder="https://... of /uploads/..."
                  />
                </div>
              </div>
            </div>

            {/* Highlights-lijst */}
            <div>
              <FieldLabel>Highlights (sterke punten)</FieldLabel>
              <div className="space-y-3">
                {(content.about.highlights ?? []).map((h, i) => (
                  <div
                    key={i}
                    className="rounded-[var(--radius)] border border-border bg-surface-muted p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <FieldInput
                        label={`Highlight ${i + 1} — titel`}
                        value={h.title}
                        onChange={(e) =>
                          patchListItem("about", "highlights", i, "title", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeListItem("about", i)}
                        className="mt-6 inline-flex h-9 w-9 items-center justify-center self-end rounded-[var(--radius)] border border-red-200 text-red-600 transition-colors hover:bg-red-50"
                        aria-label={`Highlight ${i + 1} verwijderen`}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                    <FieldTextarea
                      label="Beschrijving"
                      rows={2}
                      value={h.body}
                      onChange={(e) =>
                        patchListItem("about", "highlights", i, "body", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                className="mt-3"
                onClick={() => addListItem("about")}
              >
                <Icon name="plus" size={15} />
                Highlight toevoegen
              </Button>
            </div>

            {/* Visie sectie */}
            <div className="mt-6 pt-4 border-t border-border">
              <h3 className="text-base font-semibold text-foreground">
                Visie-blok (onderaan op de &quot;Wie is WAIsely?&quot; pagina)
              </h3>
              <div className="space-y-4 mt-3">
                <FieldInput
                  label="Visie titel"
                  value={content.about.visionTitle ?? "Mijn visie"}
                  onChange={(e) => patch("about", "visionTitle", e.target.value)}
                />
                <FieldTextarea
                  label="Visie tekst"
                  rows={4}
                  value={
                    content.about.visionBody ??
                    "AI is geen bedreiging voor onderwijs — het is een kans. Maar alleen als we het doordacht en verantwoord inzetten..."
                  }
                  onChange={(e) => patch("about", "visionBody", e.target.value)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldInput
                    label="Label primaire knop (onder visie)"
                    value={content.about.primaryCtaLabel ?? "Boek een training"}
                    onChange={(e) =>
                      patch("about", "primaryCtaLabel", e.target.value)
                    }
                  />
                  <FieldInput
                    label="Label secundaire knop (onder visie)"
                    value={content.about.secondaryCtaLabel ?? "Neem contact op"}
                    onChange={(e) =>
                      patch("about", "secondaryCtaLabel", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      ) : null}

      {/* ---------------------------- WHY ----------------------------- */}
      {saveKeys.includes("why") ? (
        <fieldset className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
          <legend className="px-2 text-sm font-bold uppercase tracking-wider text-accent">
            &quot;Waarom&quot;-checklist
          </legend>
          <div className="space-y-4">
            <FieldInput
              label="Eyebrow-tekst"
              value={content.why.eyebrow ?? "Waarom WAIsely"}
              onChange={(e) => patch("why", "eyebrow", e.target.value)}
            />
            <FieldInput
              label="Sectietitel"
              value={content.why.title}
              onChange={(e) => patch("why", "title", e.target.value)}
            />

            {/* Checklist-punten */}
            <div>
              <FieldLabel>Checklist-punten</FieldLabel>
              <div className="space-y-3">
                {(content.why.items ?? []).map((item, i) => (
                  <div
                    key={i}
                    className="rounded-[var(--radius)] border border-border bg-surface-muted p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <FieldInput
                        label={`Punt ${i + 1} — titel`}
                        value={item.title}
                        onChange={(e) =>
                          patchListItem("why", "items", i, "title", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeListItem("why", i)}
                        className="mt-6 inline-flex h-9 w-9 items-center justify-center self-end rounded-[var(--radius)] border border-red-200 text-red-600 transition-colors hover:bg-red-50"
                        aria-label={`Punt ${i + 1} verwijderen`}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                    <FieldTextarea
                      label="Toelichting"
                      rows={2}
                      value={item.body}
                      onChange={(e) =>
                        patchListItem("why", "items", i, "body", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                className="mt-3"
                onClick={() => addListItem("why")}
              >
                <Icon name="plus" size={15} />
                Punt toevoegen
              </Button>
            </div>
          </div>
        </fieldset>
      ) : null}

      {/* --------------------------- CONTACT --------------------------- */}
      {saveKeys.includes("contact") ? (
        <fieldset className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
          <legend className="px-2 text-sm font-bold uppercase tracking-wider text-accent">
            Contactsectie &amp; Formulier
          </legend>
          <div className="space-y-4">
            <FieldInput
              label="Eyebrow-tekst"
              value={content.contact.eyebrow ?? "Contact"}
              onChange={(e) => patch("contact", "eyebrow", e.target.value)}
            />
            <FieldInput
              label="Titel"
              value={content.contact.title}
              onChange={(e) => patch("contact", "title", e.target.value)}
            />
            <FieldTextarea
              label="Tekst"
              rows={3}
              value={content.contact.body}
              onChange={(e) => patch("contact", "body", e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <FieldInput
                label="E-mailadres"
                type="email"
                value={content.contact.email}
                onChange={(e) => patch("contact", "email", e.target.value)}
              />
              <FieldInput
                label="Telefoonnummer"
                value={content.contact.phone}
                onChange={(e) => patch("contact", "phone", e.target.value)}
              />
              <FieldInput
                label="Adres / Locatie"
                value={content.contact.address}
                onChange={(e) => patch("contact", "address", e.target.value)}
              />
            </div>

            {/* Contactformulier teksten */}
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-base font-semibold text-foreground">
                Contactformulier Teksten
              </h3>
              <div className="space-y-4 mt-3">
                <FieldInput
                  label="Formuliertitel"
                  value={content.contact.formTitle ?? "Stuur een bericht"}
                  onChange={(e) => patch("contact", "formTitle", e.target.value)}
                />
                <FieldInput
                  label="Formulier ondertitel / responstijd"
                  value={
                    content.contact.formSubtitle ??
                    "Ik reageer doorgaans binnen 2 werkdagen."
                  }
                  onChange={(e) =>
                    patch("contact", "formSubtitle", e.target.value)
                  }
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldInput
                    label="Label verzendknop"
                    value={
                      content.contact.formSubmitLabel ?? "Verstuur bericht"
                    }
                    onChange={(e) =>
                      patch("contact", "formSubmitLabel", e.target.value)
                    }
                  />
                  <FieldInput
                    label="Succesbericht na versturen"
                    value={
                      content.contact.formSuccessMessage ??
                      "Bedankt! Je bericht is verstuurd."
                    }
                    onChange={(e) =>
                      patch("contact", "formSuccessMessage", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      ) : null}

      {/* --------------------------- FOOTER --------------------------- */}
      {saveKeys.includes("footer") ? (
        <fieldset className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
          <legend className="px-2 text-sm font-bold uppercase tracking-wider text-accent">
            Footer
          </legend>
          <div className="space-y-4">
            <FieldTextarea
              label="Tagline"
              rows={2}
              value={content.footer.tagline}
              onChange={(e) => patch("footer", "tagline", e.target.value)}
            />
            <FieldInput
              label="Copyright-toevoeging"
              value={
                content.footer.copyrightText ?? "Alle rechten voorbehouden."
              }
              onChange={(e) => patch("footer", "copyrightText", e.target.value)}
              placeholder="bv. Alle rechten voorbehouden."
            />
            <FieldInput
              label="Instagram-URL"
              value={content.footer.instagramUrl}
              onChange={(e) => patch("footer", "instagramUrl", e.target.value)}
              placeholder="https://www.instagram.com/waisely"
              help="De link achter het Instagram-icoon in de footer."
            />
            <FieldInput
              label="E-mailadres footer"
              type="email"
              value={content.footer.socialEmail}
              onChange={(e) => patch("footer", "socialEmail", e.target.value)}
              placeholder="sabrina@waisely.biz"
              help="De e-mail achter het mail-icoon in de footer."
            />
          </div>
        </fieldset>
      ) : null}

      {/* ------------------------ BOOK TRAINING ----------------------- */}
      {saveKeys.includes("bookTraining") ? (
        <fieldset className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
          <legend className="px-2 text-sm font-bold uppercase tracking-wider text-accent">
            Training Boeken &amp; Intake Flow
          </legend>
          <div className="space-y-6">
            {/* Pagina /boek-een-training */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">
                1. Pagina &quot;Boek een training&quot; (/boek-een-training)
              </h3>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldInput
                    label="Eyebrow-tekst"
                    value={
                      content.bookTraining.eyebrow ?? "Boek een training"
                    }
                    onChange={(e) =>
                      patch("bookTraining", "eyebrow", e.target.value)
                    }
                  />
                  <FieldInput
                    label="Paginatitel"
                    value={content.bookTraining.title}
                    onChange={(e) =>
                      patch("bookTraining", "title", e.target.value)
                    }
                  />
                </div>
                <FieldTextarea
                  label="Beschrijving bovenaan"
                  rows={3}
                  value={content.bookTraining.description}
                  onChange={(e) =>
                    patch("bookTraining", "description", e.target.value)
                  }
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldInput
                    label="Bel-vraag prompt"
                    value={
                      content.bookTraining.contactPrompt ??
                      "Liever eerst even bellen?"
                    }
                    onChange={(e) =>
                      patch("bookTraining", "contactPrompt", e.target.value)
                    }
                  />
                  <FieldInput
                    label="Bel-link tekst"
                    value={
                      content.bookTraining.contactLinkText ?? "Neem contact op"
                    }
                    onChange={(e) =>
                      patch("bookTraining", "contactLinkText", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldInput
                    label="Stap 1 koptekst"
                    value={
                      content.bookTraining.step1Title ?? "Intake-formulier"
                    }
                    onChange={(e) =>
                      patch("bookTraining", "step1Title", e.target.value)
                    }
                  />
                  <FieldInput
                    label="Stap 2 koptekst"
                    value={
                      content.bookTraining.step2Title ?? "Kies uw modules"
                    }
                    onChange={(e) =>
                      patch("bookTraining", "step2Title", e.target.value)
                    }
                  />
                </div>
                <FieldTextarea
                  label="Stap 2 toelichting"
                  rows={2}
                  value={
                    content.bookTraining.step2Description ??
                    "Kies tot drie modules die je combineert in een workshop van 2 uur..."
                  }
                  onChange={(e) =>
                    patch("bookTraining", "step2Description", e.target.value)
                  }
                />
                <FieldInput
                  label="Knoptekst sticky module-balk"
                  value={
                    content.bookTraining.moduleSelectorCta ??
                    "Workshop aanvragen"
                  }
                  onChange={(e) =>
                    patch("bookTraining", "moduleSelectorCta", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Intake Formulier Succes-scherm */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-base font-semibold text-foreground mb-3">
                2. Intake-formulier Succesbericht
              </h3>
              <div className="space-y-4">
                <FieldInput
                  label="Succes-titel"
                  value={
                    content.bookTraining.intakeSuccessTitle ??
                    "Bedankt voor je intake!"
                  }
                  onChange={(e) =>
                    patch("bookTraining", "intakeSuccessTitle", e.target.value)
                  }
                />
                <FieldTextarea
                  label="Succes-bericht"
                  rows={2}
                  value={
                    content.bookTraining.intakeSuccessMessage ??
                    "Je formulier is succesvol verstuurd..."
                  }
                  onChange={(e) =>
                    patch(
                      "bookTraining",
                      "intakeSuccessMessage",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* Pagina /boeken */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-base font-semibold text-foreground mb-3">
                3. Directe Boekingspagina (/boeken)
              </h3>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldInput
                    label="Eyebrow-tekst"
                    value={content.bookTraining.bookingEyebrow ?? "Op maat"}
                    onChange={(e) =>
                      patch("bookTraining", "bookingEyebrow", e.target.value)
                    }
                  />
                  <FieldInput
                    label="Paginatitel"
                    value={
                      content.bookTraining.bookingTitle ?? "Workshop aanvragen"
                    }
                    onChange={(e) =>
                      patch("bookTraining", "bookingTitle", e.target.value)
                    }
                  />
                </div>
                <FieldTextarea
                  label="Omschrijving"
                  rows={2}
                  value={
                    content.bookTraining.bookingDescription ??
                    "Beschrijf kort wat je nodig hebt en je ontvangt binnen 2 werkdagen een voorstel op maat..."
                  }
                  onChange={(e) =>
                    patch("bookTraining", "bookingDescription", e.target.value)
                  }
                />

                {/* Stappenlijst */}
                <div>
                  <FieldLabel>Stappenlijst (links op /boeken)</FieldLabel>
                  <div className="space-y-2.5 mt-2">
                    {bookingSteps.map((step, i) => (
                      <div
                        key={i}
                        className="grid gap-3 rounded-[var(--radius)] border border-border bg-surface-muted p-3 sm:grid-cols-[1fr_auto]"
                      >
                        <FieldInput
                          label={`Stap ${i + 1}`}
                          value={step}
                          onChange={(e) => patchBookingStep(i, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => removeBookingStep(i)}
                          className="mt-6 inline-flex h-9 w-9 items-center justify-center self-end rounded-[var(--radius)] border border-red-200 text-red-600 transition-colors hover:bg-red-50"
                          aria-label={`Stap ${i + 1} verwijderen`}
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3"
                    onClick={addBookingStep}
                  >
                    <Icon name="plus" size={15} />
                    Stap toevoegen
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <FieldInput
                    label="Account vereist titel"
                    value={
                      content.bookTraining.bookingAccountTitle ??
                      "Account vereist"
                    }
                    onChange={(e) =>
                      patch(
                        "bookTraining",
                        "bookingAccountTitle",
                        e.target.value
                      )
                    }
                  />
                  <FieldInput
                    label="Account vereist toelichting"
                    value={
                      content.bookTraining.bookingAccountDescription ??
                      "Aanvragen doen vereist een account."
                    }
                    onChange={(e) =>
                      patch(
                        "bookTraining",
                        "bookingAccountDescription",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <FieldInput
                    label="Boeking succes titel"
                    value={
                      content.bookTraining.bookingSuccessTitle ??
                      "Aanvraag verstuurd!"
                    }
                    onChange={(e) =>
                      patch(
                        "bookTraining",
                        "bookingSuccessTitle",
                        e.target.value
                      )
                    }
                  />
                  <FieldInput
                    label="Boeking succes bericht"
                    value={
                      content.bookTraining.bookingSuccessMessage ??
                      "Bedankt! Je aanvraag staat nu in je dashboard. Je ontvangt binnen 2 werkdagen een reactie."
                    }
                    onChange={(e) =>
                      patch(
                        "bookTraining",
                        "bookingSuccessMessage",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      ) : null}

      {/* ------------------------- Opslaan-balk ------------------------- */}
      <div className="sticky bottom-4 z-20 flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface/95 p-4 shadow-[var(--shadow-lg)] backdrop-blur-sm">
        <Button onClick={handleSave} disabled={status === "saving"}>
          {status === "saving" ? (
            "Opslaan…"
          ) : (
            <>
              <Icon name="check" size={15} />
              {submitLabel}
            </>
          )}
        </Button>
        {status === "saved" ? (
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <Icon name="check" size={15} />
            Opgeslagen — zichtbaar op de site.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm font-medium text-red-600">
            Opslaan mislukt. Probeer het opnieuw.
          </p>
        ) : null}
        <p className="ml-auto hidden text-xs text-muted-foreground sm:block">
          Wijzigingen worden direct gepubliceerd op de openbare site.
        </p>
      </div>
    </div>
  );
}
