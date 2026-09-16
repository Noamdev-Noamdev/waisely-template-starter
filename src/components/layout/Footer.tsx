/**
 * ---------------------------------------------------------------------------
 * Footer.tsx — Warm minimal footer with brand info and social links
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { NAV_LINKS, SITE_NAME, SITE_TAGLINE } from "@/lib/siteConfig";
import type { SiteContent } from "@/lib/types";

export default function Footer({ content }: { content: SiteContent }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-surface">
      <div className="mx-auto grid max-w-[1000px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        {/* Brand + tagline */}
        <div>
          <span
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {SITE_NAME}
          </span>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {content.footer.tagline}
          </p>
          {/* Social links */}
          <div className="mt-5 flex items-center gap-3">
            <a
              href={content.footer.instagramUrl || "https://www.instagram.com/waisely"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Instagram"
            >
              <Icon name="heart" size={16} />
            </a>
            <a
              href={`mailto:${content.footer.socialEmail || content.contact.email}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="E-mail"
            >
              <Icon name="mail" size={16} />
            </a>
          </div>
        </div>

        {/* Navigation links */}
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-wider text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Navigatie
          </h3>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact details */}
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-wider text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Contact
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Icon name="mail" size={16} className="mt-0.5 shrink-0 text-accent" />
              <a
                href={`mailto:${content.contact.email}`}
                className="transition-colors hover:text-foreground"
              >
                {content.contact.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="phone" size={16} className="mt-0.5 shrink-0 text-accent" />
              <span>{content.contact.phone}</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="map-pin" size={16} className="mt-0.5 shrink-0 text-accent" />
              <span>{content.contact.address}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1000px] flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>
            © {year} {SITE_NAME}. Alle rechten voorbehouden.
          </p>
          <p className="text-muted-foreground/60">
            {SITE_TAGLINE}
          </p>
        </div>
      </div>
    </footer>
  );
}