/**
 * ---------------------------------------------------------------------------
 * AdminOverPage (/admin/content/over)
 * ---------------------------------------------------------------------------
 * Bewerk de "Over WAIsely"-sectie: titel, introtekst, profielkaart
 * (naam en rol/functie) en de highlights met toelichting.
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import ContentForm from "@/components/admin/ContentForm";

export const metadata = { title: "Over WAIsely beheren" };

export default async function AdminOverPage() {
  const content = await get("siteContent");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Over WAIsely
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bewerk de bio, profielgegevens en de highlights van de &quot;Over WAIsely&quot;-sectie.
          Wijzigingen zijn direct zichtbaar op de homepage en de over-pagina.
        </p>
      </div>

      <ContentForm
        initial={content}
        saveKeys={["about"]}
        submitLabel="Over-sectie opslaan"
      />
    </div>
  );
}
