/**
 * ---------------------------------------------------------------------------
 * CookieConsent.tsx — Belgische GBA / AVG-conforme cookiebanner & modal
 * ---------------------------------------------------------------------------
 * Kenmerken conform de checklist:
 *  - Geen cookiewall: niet-blokkerende zwevende banner onderaan.
 *  - Geen vooraf aangevinkte vakjes: niet-noodzakelijke cookies staan standaard uit.
 *  - Weigeren is even makkelijk als aanvaarden: duidelijke knoppen met gelijke zichtbaarheid.
 *  - Toestemming per categorie afzonderlijk te geven/beheren via modal.
 *  - Te allen tijde herroepbaar via 'Cookie-instellingen' link in de footer.
 *  - Registreert anoniem bewijs van toestemming via /api/consent.
 * ---------------------------------------------------------------------------
 */

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import {
  getStoredConsent,
  saveConsent,
  subscribeConsent,
} from "@/lib/consent";
import type { CookiePolicyContent } from "@/lib/types";

export default function CookieConsent({
  bannerContent,
}: {
  bannerContent?: CookiePolicyContent;
}) {
  const cookieString = useSyncExternalStore(
    subscribeConsent,
    () => document.cookie,
    () => ""
  );

  const isClient = cookieString !== "";
  const storedConsent = isClient ? getStoredConsent() : null;

  const [modalOpen, setModalOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [customSocial, setCustomSocial] = useState(false);

  useEffect(() => {
    function handleOpenSettings() {
      setCustomSocial(getStoredConsent()?.social ?? false);
      setModalOpen(true);
    }

    window.addEventListener("waisely-open-cookie-settings", handleOpenSettings);
    return () => {
      window.removeEventListener("waisely-open-cookie-settings", handleOpenSettings);
    };
  }, []);

  if (!isClient) return null;

  const showBanner = !storedConsent && !bannerDismissed && !modalOpen;

  const title = bannerContent?.bannerTitle || "Wij respecteren je privacy";
  const body =
    bannerContent?.bannerBody ||
    "WAIsely gebruikt strikt noodzakelijke cookies voor het functioneren en beveiligen van de website. Voor het laden van externe, interactieve media (zoals ingebedde Instagram-posts) vragen we vooraf je toestemming.";
  const socialLabel =
    bannerContent?.socialLabel || "Social media en externe inhoud";
  const socialDescription =
    bannerContent?.socialDescription ||
    "Maakt het mogelijk om interactieve Instagram-berichten direct op de website weer te geven. Hierdoor kan Instagram/Meta cookies en volgtechnologieën plaatsen.";

  async function handleAcceptAll() {
    await saveConsent(true, "accept_all");
    setBannerDismissed(true);
    setModalOpen(false);
  }

  async function handleRejectAll() {
    await saveConsent(false, "reject_all");
    setBannerDismissed(true);
    setModalOpen(false);
  }

  async function handleSaveCustom() {
    await saveConsent(customSocial, "custom");
    setBannerDismissed(true);
    setModalOpen(false);
  }

  function handleOpenModalFromBanner() {
    setCustomSocial(storedConsent?.social ?? false);
    setModalOpen(true);
  }

  return (
    <>
      {/* ----------------- Niet-blokkerende Cookiebanner ----------------- */}
      {showBanner && (
        <aside
          aria-label="Cookie-toestemming"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-[620px] rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-lg)] transition-all sm:bottom-6 sm:right-6 sm:left-auto"
        >
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Icon name="shield" size={18} />
            </div>
            <div className="flex-1">
              <h2
                className="text-base font-medium text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {body}{" "}
                <Link
                  href="/cookieverklaring"
                  className="font-medium text-foreground underline hover:text-accent"
                >
                  Lees onze cookieverklaring
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Knoppen: gelijkwaardige keuzes conform GBA */}
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={handleOpenModalFromBanner}
              className="rounded-[var(--radius)] px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              Voorkeuren aanpassen
            </button>
            <button
              type="button"
              onClick={handleRejectAll}
              className="rounded-[var(--radius)] border border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-surface-muted"
            >
              Alleen noodzakelijk
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="rounded-[var(--radius)] bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-accent-foreground shadow-[var(--shadow-accent)] transition-all hover:bg-accent-strong"
            >
              Alles accepteren
            </button>
          </div>
        </aside>
      )}

      {/* ---------------- Cookie-voorkeuren Modal ---------------- */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <Icon name="shield" size={18} className="text-accent" />
                <h3
                  id="cookie-modal-title"
                  className="text-lg font-medium text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Cookie-instellingen
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Venster sluiten"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6 text-sm text-foreground">
              <p className="text-xs text-muted-foreground">
                Je kunt hieronder instellen welke cookies WAIsely mag gebruiken.
                Strikt noodzakelijke cookies zijn altijd actief omdat de website
                anders niet functioneert. Je kunt je instellingen op ieder gewenst
                moment opnieuw wijzigen.
              </p>

              {/* Categorie 1: Noodzakelijk */}
              <div className="rounded-[var(--radius)] border border-border/80 bg-surface-muted p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <span>Strikt noodzakelijk</span>
                    <span className="rounded bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                      Altijd actief
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked
                    disabled
                    aria-label="Strikt noodzakelijke cookies altijd actief"
                    className="h-4 w-4 rounded accent-accent opacity-60"
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Noodzakelijk voor de basiswerking en beveiliging van de website,
                  zoals het veilig inloggen en het onthouden van je cookiekeuze.
                  Geen toestemming vereist.
                </p>
              </div>

              {/* Categorie 2: Social media / Embeds */}
              <div className="rounded-[var(--radius)] border border-border/80 bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{socialLabel}</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={customSocial}
                      onChange={(e) => setCustomSocial(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-5 w-9 rounded-full bg-border transition-colors peer-checked:bg-accent after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                  </label>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {socialDescription}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Bekijk onze volledige{" "}
                <Link
                  href="/cookieverklaring"
                  onClick={() => setModalOpen(false)}
                  className="font-medium text-foreground underline hover:text-accent"
                >
                  Cookieverklaring
                </Link>{" "}
                voor een specificatie van alle gebruikte cookies en bewaartermijnen.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border/60 bg-surface-muted px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleRejectAll}
                className="rounded-[var(--radius)] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                Alles weigeren
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="rounded-[var(--radius)] border border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-surface-muted"
                >
                  Voorkeuren opslaan
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="rounded-[var(--radius)] bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-accent-foreground shadow-[var(--shadow-accent)] transition-all hover:bg-accent-strong"
                >
                  Alles accepteren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
