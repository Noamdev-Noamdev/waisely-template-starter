/**
 * ---------------------------------------------------------------------------
 * AlgemeneVoorwaardenPage (/algemene-voorwaarden)
 * ---------------------------------------------------------------------------
 * Toont de algemene voorwaarden van WAIsely in de Quiet Warm Minimal stijl.
 * Tekst en link zijn bewerkbaar via het admin-dashboard onder "Voorwaarden & Privacy".
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { get } from "@/lib/db";
import { seedSiteContent } from "@/lib/seed";

export const metadata = {
  title: "Algemene Voorwaarden",
  description: "Algemene voorwaarden voor trainingen, workshops en webinars van WAIsely.",
};

export default async function AlgemeneVoorwaardenPage() {
  const content = await get("siteContent");
  const terms = { ...seedSiteContent.terms!, ...content.terms };

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
            {terms.eyebrow || "Juridisch"}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {terms.title}
          </h1>
          {terms.subtitle ? (
            <p className="prose-muted mt-3 text-base">{terms.subtitle}</p>
          ) : null}
          {terms.lastUpdated ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Laatst bijgewerkt: {terms.lastUpdated}
            </p>
          ) : null}
        </div>
      </Reveal>

      {/* Verwijzing naar de volledige voorwaarden */}
      <Reveal delay={150}>
        <div className="mt-12 rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] sm:p-7">
          <p className="text-base text-foreground">
            {terms.linkIntro}{" "}
            {terms.linkUrl ? (
              <a
                href={terms.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline hover:text-accent"
              >
                {terms.linkLabel || terms.linkUrl}
              </a>
            ) : null}
          </p>
        </div>
      </Reveal>

      {/* Vragen footer-blok */}
      <Reveal delay={400}>
        <div className="mt-12 rounded-[var(--radius)] bg-surface-muted p-6 text-center sm:p-8">
          <p className="text-base font-medium text-foreground">
            Vragen over onze algemene voorwaarden?
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
