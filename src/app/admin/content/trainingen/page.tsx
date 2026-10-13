/**
 * ---------------------------------------------------------------------------
 * AdminTrainingenPage (/admin/content/trainingen)
 * ---------------------------------------------------------------------------
 * Beheer alle inhoudelijke teksten voor de boekingsflow:
 *   - De /boek-een-training pagina (titels, toelichting, intake, stappen)
 *   - De /boeken pagina (aanvraagstappen, login-notitie, succesmeldingen)
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import ContentForm from "@/components/admin/ContentForm";

export const metadata = { title: "Training boeken teksten" };

export default async function AdminTrainingenPage() {
  const content = await get("siteContent");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Training boeken &amp; Intake
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Beheer alle teksten op de &quot;Boek een training&quot; pagina (/boek-een-training)
          en de directe workshopaanvraag pagina (/boeken), inclusief stappen en succesberichten.
        </p>
      </div>

      <ContentForm
        initial={content}
        saveKeys={["bookTraining"]}
        submitLabel="Boekingsteksten opslaan"
      />
    </div>
  );
}
