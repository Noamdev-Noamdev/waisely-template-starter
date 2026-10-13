/**
 * ---------------------------------------------------------------------------
 * ImpressumPage (/impressum)
 * ---------------------------------------------------------------------------
 * Wettelijk verplichte vermeldingen conform het Belgisch Wetboek van
 * Economisch Recht en de richtlijnen van FOD Economie / VLAIO.
 *
 * Bevat ondernemingsnaam, adres, ondernemingsnummer (KBO), btw-status
 * en twee contactmogelijkheden (e-mail en contactformulier).
 * Bewust géén telefoonnummer conform de wens van de klant.
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { get } from "@/lib/db";
import { seedSiteContent } from "@/lib/seed";
import { SITE_NAME } from "@/lib/siteConfig";

export const metadata = {
  title: "Impressum / Juridische vermeldingen",
  description: "Wettelijke identificatie- en contactgegevens van WAIsely (België).",
};

export default async function ImpressumPage() {
  const content = await get("siteContent");
  const c = content ?? seedSiteContent;

  const companyName = c.footer.companyName || SITE_NAME;
  const legalAddress =
    c.footer.legalAddress || "[straat en nummer, postcode en gemeente]";
  const email = c.footer.socialEmail || c.contact.email || "info@waisely.biz";
  const companyNumber = c.footer.companyNumber || "[0000.000.000]";
  const vatNumber =
    c.footer.vatNumber ||
    "[BE 0000.000.000, of: niet btw-plichtig / vrijgesteld van btw conform artikel 44 W.Btw]";

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
            Wettelijke vermeldingen
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Impressum
          </h1>
          <p className="prose-muted mt-3 text-base">
            Wettelijke identificatie- en contactgegevens conform de Belgische wetgeving (Wetboek van Economisch Recht).
          </p>
        </div>
      </Reveal>

      {/* Overzichtskaart met identificatiegegevens */}
      <Reveal delay={150}>
        <div className="mt-10 overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-[var(--shadow-sm)]">
          <div className="border-b border-border/60 bg-surface-muted px-6 py-4">
            <h2
              className="text-base font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Identificatie van de onderneming
            </h2>
          </div>

          <dl className="divide-y divide-border/60 text-sm">
            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">
                Ondernemingsnaam / Handelsnaam
              </dt>
              <dd className="font-semibold text-foreground sm:col-span-2">
                {companyName}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">Rechtsvorm</dt>
              <dd className="text-foreground sm:col-span-2">
                Eenmanszaak (België)
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">
                Vestigingsadres
              </dt>
              <dd className="text-foreground sm:col-span-2">
                {legalAddress}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">
                Ondernemingsnummer (KBO)
              </dt>
              <dd className="font-mono text-foreground sm:col-span-2">
                {companyNumber}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">
                Btw-nummer / Btw-statuut
              </dt>
              <dd className="text-foreground sm:col-span-2">
                {vatNumber}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">
                E-mailadres
              </dt>
              <dd className="text-foreground sm:col-span-2">
                <a
                  href={`mailto:${email}`}
                  className="font-medium text-foreground underline hover:text-accent"
                >
                  {email}
                </a>
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-muted-foreground">
                Contactmogelijkheid 2
              </dt>
              <dd className="text-foreground sm:col-span-2">
                <Link
                  href="/contact"
                  className="font-medium text-foreground underline hover:text-accent"
                >
                  Online contactformulier
                </Link>{" "}
                (snelle schriftelijke reactie)
              </dd>
            </div>
          </dl>
        </div>
      </Reveal>

      {/* Toelichting & Verwijzingen */}
      <Reveal delay={250}>
        <div className="mt-8 space-y-4 rounded-[var(--radius)] border border-border/70 bg-surface-muted p-6 text-xs leading-relaxed text-muted-foreground">
          <p>
            <strong>Toelichting bereikbaarheid:</strong> Wij communiceren bij voorkeur schriftelijk om opleidingswensen van scholen en leerkrachten zo zorgvuldig en gedocumenteerd mogelijk af te stemmen. Je kunt ons te allen tijde bereiken via bovenstaand e-mailadres of via het{" "}
            <Link href="/contact" className="underline hover:text-foreground">
              contactformulier
            </Link>
            .
          </p>
          <p>
            Voor meer informatie over hoe wij met jouw persoonsgegevens omgaan, verwijzen we naar onze{" "}
            <Link href="/privacyverklaring" className="underline hover:text-foreground">
              Privacyverklaring
            </Link>
            . Voor informatie over het gebruik van cookies verwijzen we naar onze{" "}
            <Link href="/cookieverklaring" className="underline hover:text-foreground">
              Cookieverklaring
            </Link>
            .
          </p>
        </div>
      </Reveal>
    </div>
  );
}
