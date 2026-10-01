/**
 * ---------------------------------------------------------------------------
 * ContentForm.tsx — Generiek bewerkformulier voor siteContent-deelblokken
 * ---------------------------------------------------------------------------
 * Dit is het hart van het content-CMS-stukje van de template. De component
 * ontvangt:
 *   - initial: volledige SiteContent uit de store
 *   - saveKeys: welke onderdelen (hero, intro, why, contact, footer) bewerkbaar
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
  "hero" | "intro" | "about" | "why" | "contact" | "footer"
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
  // Lokale kopie van de content; only-what-you-edit wordt verstuurd.
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
    field: keyof SiteContent[K],
    value: string
  ) {
    setContent((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  /** Update titel/body van een lijstitem op index. */
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
          ? [...prev.why.items]
          : [...prev.about.highlights];
      list[index] = { ...list[index], [part]: value };
      return key === "why"
        ? { ...prev, why: { ...prev.why, items: list } }
        : { ...prev, about: { ...prev.about, highlights: list } };
    });
  }

  /** Voegt een item toe aan een lijst (why-items of about-highlights). */
  function addListItem(key: "why" | "about") {
    setContent((prev) =>
      key === "why"
        ? {
            ...prev,
            why: {
              ...prev.why,
              items: [...prev.why.items, { title: "Nieuw punt", body: "Toelichting" }],
            },
          }
        : {
            ...prev,
            about: {
              ...prev.about,
              highlights: [
                ...prev.about.highlights,
                { title: "Nieuwe highlight", body: "Beschrijving" },
              ],
            },
          }
    );
  }

  /** Verwijdert een item uit een lijst. */
  function removeListItem(
    key: "why" | "about",
    index: number
  ) {
    setContent((prev) =>
      key === "why"
        ? {
            ...prev,
            why: {
              ...prev.why,
              items: prev.why.items.filter((_, i) => i !== index),
            },
          }
        : {
            ...prev,
            about: {
              ...prev.about,
              highlights: prev.about.highlights.filter((_, i) => i !== index),
            },
          }
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
      // Server-componenten opnieuw laden zodat de site meteen up-toate is.
      router.refresh();
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
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
          </div>
        </fieldset>
      ) : null}

      {/* ---------------------------- ABOUT ---------------------------- */}
      {saveKeys.includes("about") ? (
        <fieldset className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
          <legend className="px-2 text-sm font-bold uppercase tracking-wider text-accent">
            Over-sectie
          </legend>
          <div className="space-y-4">
            <FieldInput
              label="Titel"
              value={content.about.title}
              onChange={(e) => patch("about", "title", e.target.value)}
            />
            <FieldTextarea
              label="Tekst"
              rows={10}
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
                Upload een foto vanaf je computer of geef een afbeeldings-URL op. Deze foto vervangt de standaard placeholder.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Preview / Placeholder thumbnail */}
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

                {/* Upload controls */}
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
              <FieldLabel>Highlights</FieldLabel>
              <div className="space-y-3">
                {content.about.highlights.map((h, i) => (
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
          </div>
        </fieldset>
      ) : null}

      {/* ---------------------------- WHY ----------------------------- */}
      {saveKeys.includes("why") ? (
        <fieldset className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
          <legend className="px-2 text-sm font-bold uppercase tracking-wider text-accent">
            "Waarom"-checklist
          </legend>
          <div className="space-y-4">
            <FieldInput
              label="Sectietitel"
              value={content.why.title}
              onChange={(e) => patch("why", "title", e.target.value)}
            />

            {/* Checklist-punten */}
            <div>
              <FieldLabel>Checklist-punten</FieldLabel>
              <div className="space-y-3">
                {content.why.items.map((item, i) => (
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
            Contactsectie
          </legend>
          <div className="space-y-4">
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
              label="Adres"
              value={content.contact.address}
              onChange={(e) => patch("contact", "address", e.target.value)}
            />
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

      {/* ------------------------- Opslaan-balk ------------------------- */}
      <div className="sticky bottom-4 flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface/95 p-4 shadow-[var(--shadow-lg)] backdrop-blur-sm">
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
