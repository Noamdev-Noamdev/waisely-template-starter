/**
 * ---------------------------------------------------------------------------
 * CookieverklaringPage (/cookieverklaring)
 * ---------------------------------------------------------------------------
 * Volledige cookieverklaring conform de Belgische Gegevensbeschermingsautoriteit
 * en de Wet betreffende de elektronische communicatie.
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import CookieSettingsButton from "@/components/ui/CookieSettingsButton";
import { get } from "@/lib/db";
import { seedSiteContent } from "@/lib/seed";

export const metadata = {
  title: "Cookieverklaring",
  description:
    "Overzicht van de gebruikte cookies, doeleinden en cookie-instellingen van WAIsely.",
};

export default async function CookieverklaringPage() {
  const content = await get("siteContent");
  const cookiePolicy = content.cookiePolicy ?? seedSiteContent.cookiePolicy!;
  const email = content.contact?.email || "info@waisely.biz";

  return (
    <div className="mx-auto max-w-[860px] px-4 py-14 sm:px-6 md:py-20">
      {/* Terug-link */}
      <Reveal>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
        >
          <Icon name="arrow-left" size={15} />
          Terug naar de startpagina
        </Link>
      </Reveal>

      {/* Paginakop */}
      <Reveal delay={100}>
        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {cookiePolicy.eyebrow || "Cookies"}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {cookiePolicy.title}
          </h1>
          {cookiePolicy.subtitle ? (
            <p className="prose-muted mt-3 text-base">
              {cookiePolicy.subtitle}
            </p>
          ) : null}
          {cookiePolicy.lastUpdated ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Laatst bijgewerkt: {cookiePolicy.lastUpdated}
            </p>
          ) : null}
        </div>
      </Reveal>

      {/* Cookie-instellingen actiebanner */}
      <Reveal delay={150}>
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-[var(--radius)] border border-accent/30 bg-accent-soft p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Jouw huidige cookievoorkeuren beheren
            </p>
            <p className="text-xs text-muted-foreground">
              Pas je toestemming direct aan of trek deze op ieder moment weer in.
            </p>
          </div>
          <CookieSettingsButton />
        </div>
      </Reveal>

      {/* Artikelen / Toelichtingssecties */}
      <div className="mt-10 space-y-8">
        {cookiePolicy.sections.map((section, i) => (
          <Reveal key={section.id || i} delay={180 + i * 50}>
            <article className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] sm:p-7">
              <h2
                className="text-lg font-medium text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {section.title}
              </h2>
              <div className="prose-muted mt-3 whitespace-pre-line text-sm leading-relaxed">
                {section.body}
              </div>

              {/* Voeg de interactieve knop in bij de sectie over toestemming */}
              {section.title.toLowerCase().includes("toestemming") && (
                <div className="mt-4 pt-3">
                  <CookieSettingsButton label="Voorkeuren nu openen" />
                </div>
              )}

              {/* Voeg de tabel in bij de sectie over welke cookies we gebruiken */}
              {section.title.toLowerCase().includes("welke cookies") && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-surface-muted text-muted-foreground">
                        <th className="p-3 font-semibold">Cookie</th>
                        <th className="p-3 font-semibold">Categorie</th>
                        <th className="p-3 font-semibold">Doel</th>
                        <th className="p-3 font-semibold">Bewaartermijn</th>
                        <th className="p-3 font-semibold">Aanbieder</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {cookiePolicy.cookies.map((cookie) => (
                        <tr key={cookie.id} className="hover:bg-surface-muted/50">
                          <td className="p-3 font-mono font-medium text-foreground">
                            {cookie.name}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            <span className="inline-block rounded bg-surface-muted px-2 py-0.5 font-medium text-foreground">
                              {cookie.category}
                            </span>
                          </td>
                          <td className="p-3 text-foreground leading-normal">
                            {cookie.purpose}
                          </td>
                          <td className="p-3 text-muted-foreground whitespace-nowrap">
                            {cookie.duration}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {cookie.provider}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          </Reveal>
        ))}
      </div>

      {/* Vragen footer-blok */}
      <Reveal delay={400}>
        <div className="mt-12 rounded-[var(--radius)] bg-surface-muted p-6 text-center sm:p-8">
          <p className="text-base font-medium text-foreground">
            Vragen over ons cookie- of privacybeleid?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Neem gerust contact op via{" "}
            <a
              href={`mailto:${email}`}
              className="font-medium text-foreground underline hover:text-accent"
            >
              {email}
            </a>
            .
          </p>
        </div>
      </Reveal>
    </div>
  );
}
