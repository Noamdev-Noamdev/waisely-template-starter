/**
 * ---------------------------------------------------------------------------
 * Footer.tsx — Minimal footer (Quiet Warm Minimal)
 * ---------------------------------------------------------------------------
 * Toont enkel:
 *  - E-mailadres
 *  - LinkedIn
 *  - Ondernemingsnummer
 *  - Algemene voorwaarden
 *  - Privacyverklaring
 * Geen telefoonnummer, geen Instagram, geen navigatielijst.
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { SITE_NAME } from "@/lib/siteConfig";
import { seedSiteContent } from "@/lib/seed";
import type { SiteContent } from "@/lib/types";

export default function Footer({ content }: { content?: SiteContent }) {
  const year = new Date().getFullYear();
  const c = content ?? seedSiteContent;

  const email = c.footer.socialEmail || c.contact.email || "info@waisely.biz";
  const linkedinUrl = c.footer.linkedinUrl || "https://www.linkedin.com/company/waisely";
  const companyNumber = c.footer.companyNumber || "BE 0xxx.xxx.xxx";

  return (
    <footer className="mt-auto border-t border-border/60 bg-surface">
      <div className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand & Ondernemingsnummer */}
          <div className="space-y-1">
            <span
              className="text-base font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {SITE_NAME}
            </span>
            {companyNumber ? (
              <p className="text-xs text-muted-foreground">
                Ondernemingsnummer: {companyNumber}
              </p>
            ) : null}
          </div>

          {/* Contact (Email + LinkedIn) */}
          <div className="flex flex-wrap items-center gap-5 text-sm">
            {email ? (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="E-mailadres"
              >
                <Icon name="mail" size={16} className="text-accent" />
                <span>{email}</span>
              </a>
            ) : null}

            {linkedinUrl ? (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="LinkedIn"
              >
                <Icon name="linkedin" size={16} className="text-accent" />
                <span>LinkedIn</span>
              </a>
            ) : null}
          </div>
        </div>

        {/* Bottom bar with legal links and copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {SITE_NAME}. {c.footer.copyrightText || "Alle rechten voorbehouden."}
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="/algemene-voorwaarden"
              className="transition-colors hover:text-foreground hover:underline"
            >
              Algemene voorwaarden
            </Link>
            <span className="text-border" aria-hidden>
              •
            </span>
            <Link
              href="/privacyverklaring"
              className="transition-colors hover:text-foreground hover:underline"
            >
              Privacyverklaring
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}