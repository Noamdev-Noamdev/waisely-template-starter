/**
 * ---------------------------------------------------------------------------
 * PressManager.tsx — Beheer van de /pers-pagina (client component)
 * ---------------------------------------------------------------------------
 * Drie blokken op één pagina:
 *   1. Paginateksten (kop, intro, sectietitels, Instagram-knop)
 *   2. Reviews: toevoegen, bewerken, verbergen, herschikken, verwijderen
 *   3. Instagram-posts: link plakken → officiële embed op de site
 * Alles wordt in één keer opgeslagen via PUT /api/admin/content ({ press }).
 * De server valideert/normaliseert opnieuw (zie api/admin/content/route.ts).
 * ---------------------------------------------------------------------------
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FieldInput, FieldTextarea, FieldLabel } from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import InstagramEmbeds from "@/components/site/InstagramEmbeds";
import { instagramShortcode, normalizeInstagramUrl } from "@/lib/instagram";
import type { InstagramPost, PressContent, Review } from "@/lib/types";

type TextKey = {
  [K in keyof PressContent]: PressContent[K] extends string ? K : never;
}[keyof PressContent];

/** Korte client-side id; de server behoudt deze of maakt zelf een nieuwe. */
function tempId(prefix: string) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Verplaatst een item in een lijst één plaats omhoog (-1) of omlaag (+1). */
function move<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

const fieldsetClass =
  "rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]";
const legendClass =
  "px-2 text-sm font-bold uppercase tracking-wider text-accent";
const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius)] border border-border text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none";
const dangerBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius)] border border-red-200 text-red-600 transition-colors hover:bg-red-50";

export default function PressManager({
  initial,
  footerInstagramUrl,
}: {
  initial: PressContent;
  /** Fallback voor de profiel-URL (ingesteld bij Contactgegevens → footer). */
  footerInstagramUrl: string;
}) {
  const router = useRouter();
  const [press, setPress] = useState<PressContent>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const [newPostUrl, setNewPostUrl] = useState("");
  const [newPostError, setNewPostError] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  function update(next: (prev: PressContent) => PressContent) {
    setPress(next);
    setDirty(true);
    if (status !== "saving") setStatus("idle");
  }

  function setText(key: TextKey, value: string) {
    update((prev) => ({ ...prev, [key]: value }));
  }

  /* ------------------------------ Reviews ------------------------------ */

  function patchReview(index: number, patch: Partial<Review>) {
    update((prev) => {
      const reviews = [...prev.reviews];
      reviews[index] = { ...reviews[index], ...patch };
      return { ...prev, reviews };
    });
  }

  function addReview() {
    update((prev) => ({
      ...prev,
      reviews: [
        ...prev.reviews,
        { id: tempId("rev_"), name: "", role: "", text: "", visible: true },
      ],
    }));
  }

  function removeReview(index: number) {
    const r = press.reviews[index];
    if (!confirm(`Review van "${r.name || "naamloos"}" verwijderen?`)) return;
    update((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((_, i) => i !== index),
    }));
  }

  /* ------------------------------ Instagram ---------------------------- */

  function addPost() {
    const url = normalizeInstagramUrl(newPostUrl);
    if (!url) {
      setNewPostError(
        "Dit is geen geldige Instagram-post. Plak een link zoals https://www.instagram.com/p/… of /reel/…"
      );
      return;
    }
    if (press.instagramPosts.some((p) => p.url === url)) {
      setNewPostError("Deze post staat al in de lijst.");
      return;
    }
    // Nieuwe posts bovenaan: meestal wil je de recentste eerst tonen.
    update((prev) => ({
      ...prev,
      instagramPosts: [{ id: tempId("ig_"), url, visible: true }, ...prev.instagramPosts],
    }));
    setNewPostUrl("");
    setNewPostError(null);
  }

  function patchPost(index: number, patch: Partial<InstagramPost>) {
    update((prev) => {
      const posts = [...prev.instagramPosts];
      posts[index] = { ...posts[index], ...patch };
      return { ...prev, instagramPosts: posts };
    });
  }

  function removePost(index: number) {
    if (!confirm("Deze Instagram-post van de site verwijderen?")) return;
    update((prev) => ({
      ...prev,
      instagramPosts: prev.instagramPosts.filter((_, i) => i !== index),
    }));
  }

  /* ------------------------------- Opslaan ----------------------------- */

  async function handleSave() {
    // Client-side check zodat de admin meteen ziet wat er ontbreekt.
    const incomplete = press.reviews.findIndex((r) => !r.name.trim() || !r.text.trim());
    if (incomplete !== -1) {
      setStatus("error");
      setError(`Review ${incomplete + 1} heeft nog geen naam of tekst.`);
      return;
    }

    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ press }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Opslaan mislukt. Probeer het opnieuw.");
      // Server-genormaliseerde versie overnemen (b.v. opgeschoonde URL's).
      if (json.content?.press) setPress(json.content.press);
      setDirty(false);
      setStatus("saved");
      router.refresh();
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 2500);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
    }
  }

  const visibleReviews = press.reviews.filter((r) => r.visible).length;
  const visiblePosts = press.instagramPosts.filter((p) => p.visible).length;

  return (
    <div className="space-y-6">
      {/* ------------------------- PAGINATEKSTEN ------------------------- */}
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Paginateksten</legend>
        <div className="space-y-4">
          <FieldInput
            label="Eyebrow-tekst (klein label boven de titel)"
            value={press.eyebrow}
            onChange={(e) => setText("eyebrow", e.target.value)}
          />
          <FieldInput
            label="Titel"
            value={press.title}
            onChange={(e) => setText("title", e.target.value)}
          />
          <FieldTextarea
            label="Introtekst"
            rows={3}
            value={press.intro}
            onChange={(e) => setText("intro", e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldInput
              label="Titel reviews-sectie"
              value={press.reviewsTitle}
              onChange={(e) => setText("reviewsTitle", e.target.value)}
            />
            <FieldInput
              label="Titel pers-sectie"
              value={press.pressTitle}
              onChange={(e) => setText("pressTitle", e.target.value)}
              help="Persvermeldingen zelf beheer je via Nieuws & pers (type: pers)."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldInput
              label="Titel Instagram-sectie"
              value={press.instagramTitle}
              onChange={(e) => setText("instagramTitle", e.target.value)}
            />
            <FieldInput
              label="Ondertitel Instagram-sectie"
              value={press.instagramSubtitle}
              onChange={(e) => setText("instagramSubtitle", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldInput
              label="Label Instagram-knop"
              value={press.instagramButtonLabel}
              onChange={(e) => setText("instagramButtonLabel", e.target.value)}
              placeholder="Volg op Instagram"
            />
            <FieldInput
              label="Instagram-profiel-URL (knop)"
              value={press.instagramProfileUrl}
              onChange={(e) => setText("instagramProfileUrl", e.target.value)}
              placeholder={footerInstagramUrl || "https://www.instagram.com/…"}
              help={
                footerInstagramUrl
                  ? `Leeg laten = de URL uit de footer (${footerInstagramUrl}).`
                  : "Leeg laten = geen knop tonen."
              }
            />
          </div>
        </div>
      </fieldset>

      {/* ------------------------------ REVIEWS ------------------------------ */}
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Reviews</legend>
        <p className="mb-4 text-sm text-muted-foreground">
          {press.reviews.length} review{press.reviews.length === 1 ? "" : "s"},
          waarvan {visibleReviews} zichtbaar op de site. Verborgen reviews blijven
          bewaard, maar worden niet getoond.
        </p>

        <div className="space-y-3">
          {press.reviews.map((review, i) => (
            <div
              key={review.id}
              className={`rounded-[var(--radius)] border border-border p-4 ${
                review.visible ? "bg-surface-muted" : "bg-surface-muted/40 opacity-70"
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Review {i + 1}
                  </span>
                  {review.visible ? (
                    <Badge tone="success">Zichtbaar</Badge>
                  ) : (
                    <Badge tone="neutral">Verborgen</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className={iconBtn}
                    onClick={() => patchReview(i, { visible: !review.visible })}
                    title={review.visible ? "Verbergen op de site" : "Tonen op de site"}
                    aria-label={review.visible ? "Verbergen" : "Tonen"}
                  >
                    <Icon name={review.visible ? "eye" : "eye-off"} size={15} />
                  </button>
                  <button
                    type="button"
                    className={iconBtn}
                    disabled={i === 0}
                    onClick={() => update((p) => ({ ...p, reviews: move(p.reviews, i, -1) }))}
                    title="Omhoog"
                    aria-label="Omhoog"
                  >
                    <Icon name="chevron-up" size={15} />
                  </button>
                  <button
                    type="button"
                    className={iconBtn}
                    disabled={i === press.reviews.length - 1}
                    onClick={() => update((p) => ({ ...p, reviews: move(p.reviews, i, 1) }))}
                    title="Omlaag"
                    aria-label="Omlaag"
                  >
                    <Icon name="chevron-down" size={15} />
                  </button>
                  <button
                    type="button"
                    className={dangerBtn}
                    onClick={() => removeReview(i)}
                    title="Verwijderen"
                    aria-label={`Review ${i + 1} verwijderen`}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldInput
                  label="Naam"
                  required
                  value={review.name}
                  onChange={(e) => patchReview(i, { name: e.target.value })}
                  placeholder="bv. Lisa D."
                />
                <FieldInput
                  label="Functie / school"
                  value={review.role}
                  onChange={(e) => patchReview(i, { role: e.target.value })}
                  placeholder="bv. Leerkracht Engels, 3de graad"
                />
              </div>
              <div className="mt-3">
                <FieldTextarea
                  label="Reviewtekst"
                  required
                  rows={3}
                  value={review.text}
                  onChange={(e) => patchReview(i, { text: e.target.value })}
                  placeholder="Wat vond de deelnemer van de workshop?"
                />
              </div>
            </div>
          ))}
          {press.reviews.length === 0 ? (
            <p className="rounded-[var(--radius)] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nog geen reviews. De reviews-sectie wordt verborgen op de site
              zolang er geen zichtbare reviews zijn.
            </p>
          ) : null}
        </div>
        <Button type="button" variant="secondary" className="mt-3" onClick={addReview}>
          <Icon name="plus" size={15} />
          Review toevoegen
        </Button>
      </fieldset>

      {/* ----------------------------- INSTAGRAM ----------------------------- */}
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Instagram-posts</legend>
        <div className="mb-4 rounded-[var(--radius)] border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          <p className="font-semibold">Zo voeg je een post toe:</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5">
            <li>
              Open de post op Instagram (app of browser) en kies{" "}
              <strong>Delen → Link kopiëren</strong>.
            </li>
            <li>Plak de link hieronder en klik op Toevoegen.</li>
            <li>Klik onderaan op Opslaan — de post verschijnt op de pers-pagina.</li>
          </ol>
          <p className="mt-2 text-xs text-sky-800">
            Werkt met foto&apos;s, carrousels en reels van een <strong>openbaar</strong>{" "}
            account. Foto, caption en likes komen rechtstreeks van Instagram.
          </p>
        </div>

        <FieldLabel htmlFor="new-ig-url">Nieuwe post</FieldLabel>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="new-ig-url"
            className="field-input flex-1"
            value={newPostUrl}
            onChange={(e) => {
              setNewPostUrl(e.target.value);
              setNewPostError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPost();
              }
            }}
            placeholder="https://www.instagram.com/p/…"
          />
          <Button type="button" onClick={addPost} disabled={!newPostUrl.trim()}>
            <Icon name="plus" size={15} />
            Toevoegen
          </Button>
        </div>
        {newPostError ? (
          <p className="mt-1.5 text-xs text-red-600">{newPostError}</p>
        ) : null}

        <p className="mb-3 mt-5 text-sm text-muted-foreground">
          {press.instagramPosts.length} post
          {press.instagramPosts.length === 1 ? "" : "s"}, waarvan {visiblePosts}{" "}
          zichtbaar. De volgorde hieronder is de volgorde op de site.
        </p>

        <div className="space-y-3">
          {press.instagramPosts.map((post, i) => (
            <div
              key={post.id}
              className={`rounded-[var(--radius)] border border-border p-4 ${
                post.visible ? "bg-surface-muted" : "bg-surface-muted/40 opacity-70"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-surface text-accent">
                    <Icon name="instagram" size={17} />
                  </span>
                  <div className="min-w-0">
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm font-medium text-foreground hover:text-accent"
                    >
                      {post.url.includes("/reel/") ? "Reel" : "Post"}{" "}
                      {instagramShortcode(post.url)}
                    </a>
                    <span className="block truncate text-xs text-muted-foreground">
                      {post.url}
                    </span>
                  </div>
                  {post.visible ? (
                    <Badge tone="success">Zichtbaar</Badge>
                  ) : (
                    <Badge tone="neutral">Verborgen</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className={`${iconBtn} w-auto px-2.5 text-xs font-medium`}
                    onClick={() => setPreviewId(previewId === post.id ? null : post.id)}
                  >
                    {previewId === post.id ? "Sluit voorbeeld" : "Voorbeeld"}
                  </button>
                  <button
                    type="button"
                    className={iconBtn}
                    onClick={() => patchPost(i, { visible: !post.visible })}
                    title={post.visible ? "Verbergen op de site" : "Tonen op de site"}
                    aria-label={post.visible ? "Verbergen" : "Tonen"}
                  >
                    <Icon name={post.visible ? "eye" : "eye-off"} size={15} />
                  </button>
                  <button
                    type="button"
                    className={iconBtn}
                    disabled={i === 0}
                    onClick={() =>
                      update((p) => ({ ...p, instagramPosts: move(p.instagramPosts, i, -1) }))
                    }
                    title="Omhoog"
                    aria-label="Omhoog"
                  >
                    <Icon name="chevron-up" size={15} />
                  </button>
                  <button
                    type="button"
                    className={iconBtn}
                    disabled={i === press.instagramPosts.length - 1}
                    onClick={() =>
                      update((p) => ({ ...p, instagramPosts: move(p.instagramPosts, i, 1) }))
                    }
                    title="Omlaag"
                    aria-label="Omlaag"
                  >
                    <Icon name="chevron-down" size={15} />
                  </button>
                  <button
                    type="button"
                    className={dangerBtn}
                    onClick={() => removePost(i)}
                    title="Verwijderen"
                    aria-label="Post verwijderen"
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <FieldInput
                  label="Interne notitie (optioneel, niet zichtbaar op de site)"
                  value={post.note ?? ""}
                  onChange={(e) => patchPost(i, { note: e.target.value })}
                  placeholder="bv. Workshop Sint-Jozefcollege, mei"
                />
              </div>
              {previewId === post.id ? (
                <div className="mt-4 rounded-[var(--radius)] bg-surface p-4">
                  <InstagramEmbeds urls={[post.url]} />
                </div>
              ) : null}
            </div>
          ))}
          {press.instagramPosts.length === 0 ? (
            <p className="rounded-[var(--radius)] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nog geen Instagram-posts. Zolang de lijst leeg is, toont de site
              enkel de &ldquo;Volg op Instagram&rdquo;-knop.
            </p>
          ) : null}
        </div>
      </fieldset>

      {/* ---------------------------- Opslaan-balk ---------------------------- */}
      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-[var(--radius)] border border-border bg-surface/95 p-4 shadow-[var(--shadow-lg)] backdrop-blur-sm">
        <Button onClick={handleSave} disabled={status === "saving"}>
          {status === "saving" ? (
            "Opslaan…"
          ) : (
            <>
              <Icon name="check" size={15} />
              Pers-pagina opslaan
            </>
          )}
        </Button>
        {status === "saved" ? (
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <Icon name="check" size={15} />
            Opgeslagen — zichtbaar op de site.
          </p>
        ) : null}
        {status === "error" && error ? (
          <p className="text-sm font-medium text-red-600">{error}</p>
        ) : null}
        {dirty && status === "idle" ? (
          <p className="text-sm text-amber-700">Niet-opgeslagen wijzigingen</p>
        ) : null}
        <Link
          href="/pers"
          target="_blank"
          className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent"
        >
          <Icon name="eye" size={14} />
          Bekijk pers-pagina
        </Link>
      </div>
    </div>
  );
}
