/**
 * ---------------------------------------------------------------------------
 * PrivacyverklaringPage (/privacyverklaring)
 * ---------------------------------------------------------------------------
 * Toont de privacyverklaring van WAIsely in de Quiet Warm Minimal stijl.
 * Volledig bewerkbaar via het admin-dashboard onder "Voorwaarden & Privacy".
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { get } from "@/lib/db";
import { seedSiteContent } from "@/lib/seed";

export const metadata = {
  title: "Privacyverklaring",
  description: "Privacyverklaring van WAIsely conform de Algemene Verordening Gegevensbescherming (AVG/GDPR).",
};

export default async function PrivacyverklaringPage() {
  const content = await get("siteContent");
  const privacy = content.privacy ?? seedSiteContent.privacy!;

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
            {privacy.eyebrow || "Privacy"}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {privacy.title}
          </h1>
          {privacy.subtitle ? (
            <p className="prose-muted mt-3 text-base">{privacy.subtitle}</p>
          ) : null}
          {privacy.lastUpdated ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Laatst bijgewerkt: {privacy.lastUpdated}
            </p>
          ) : null}
        </div>
      </Reveal>

      {/* Artikelen / Secties */}
      <div className="mt-12 space-y-6">
        {privacy.sections.map((section, i) => (
          <Reveal key={section.id || i} delay={150 + i * 50}>
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
            </article>
          </Reveal>
        ))}
      </div>

      {/* Vragen footer-blok */}
      <Reveal delay={400}>
        <div className="mt-12 rounded-[var(--radius)] bg-surface-muted p-6 text-center sm:p-8">
          <p className="text-base font-medium text-foreground">
            Vragen over hoe wij omgaan met jouw gegevens?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Neem gerust contact op met Sabrina via{" "}
            <a
              href={`mailto:${content.contact.email}`}
              className="font-medium text-foreground underline hover:text-accent"
            >
              {content.contact.email}
            </a>
            .
          </p>
        </div>
      </Reveal>
    </div>
  );
}
