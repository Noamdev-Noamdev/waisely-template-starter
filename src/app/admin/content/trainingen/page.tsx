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
          Beheer alle teksten voor de modulekeuze op &quot;Boek een training&quot; (/boek-een-training),
          het Google Forms intake-formulier (/aanvraag) en de directe workshopaanvraag (/boeken).
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
