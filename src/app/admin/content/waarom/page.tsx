/**
 * ---------------------------------------------------------------------------
 * AdminWaaromPage (/admin/content/waarom)
 * ---------------------------------------------------------------------------
 * Bewerk de "waarom kiezen voor dit bedrijf"-checklist: titel van de sectie
 * en de losse punten met toelichting.
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import ContentForm from "@/components/admin/ContentForm";

export const metadata = { title: "Waarom-punten" };

export default async function AdminWaaromPage() {
  const content = await get("siteContent");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          "Waarom"-checklist
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          De punten die in de donkere sectie op de homepage staan. Voeg punten
          toe, herschik ze of pas de teksten aan.
        </p>
      </div>

      <ContentForm
        initial={content}
        saveKeys={["why"]}
        submitLabel="Checklist opslaan"
      />
    </div>
  );
}
