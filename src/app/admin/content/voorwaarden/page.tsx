/**
 * ---------------------------------------------------------------------------
 * AdminVoorwaardenPage (/admin/content/voorwaarden)
 * ---------------------------------------------------------------------------
 * Bewerk de Algemene Voorwaarden en Privacyverklaring van de website.
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import ContentForm from "@/components/admin/ContentForm";

export const metadata = { title: "Voorwaarden & Privacy beheren" };

export default async function AdminVoorwaardenPage() {
  const content = await get("siteContent");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Voorwaarden &amp; Privacy
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Beheer de inhoud van de pagina&apos;s Algemene Voorwaarden en Privacyverklaring.
          Deze pagina&apos;s zijn bereikbaar via de links in de footer.
        </p>
      </div>

      <ContentForm
        initial={content}
        saveKeys={["terms", "privacy"]}
        submitLabel="Voorwaarden & Privacy opslaan"
      />
    </div>
  );
}
