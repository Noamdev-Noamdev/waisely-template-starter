/**
 * ---------------------------------------------------------------------------
 * AdminVoorwaardenPage (/admin/content/voorwaarden)
 * ---------------------------------------------------------------------------
 * Bewerk de wettelijke gegevens (Impressum), Algemene Voorwaarden,
 * Privacyverklaring en Cookieverklaring/cookiebanner van de website.
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import ContentForm from "@/components/admin/ContentForm";

export const metadata = { title: "Juridisch, Privacy & Cookies beheren" };

export default async function AdminVoorwaardenPage() {
  const content = await get("siteContent");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Juridisch, Privacy &amp; Cookies
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Beheer de impressum- en ondernemingsgegevens, Algemene Voorwaarden,
          Privacyverklaring (8 AVG-secties) en Cookieverklaring/banner.
          Deze zijn permanent bereikbaar via de footer.
        </p>
      </div>

      <ContentForm
        initial={content}
        saveKeys={["footer", "terms", "privacy", "cookiePolicy"]}
        submitLabel="Juridische gegevens opslaan"
      />
    </div>
  );
}
