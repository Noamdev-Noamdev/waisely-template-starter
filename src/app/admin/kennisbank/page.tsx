/**
 * ---------------------------------------------------------------------------
 * AdminKennisbankPage (/admin/kennisbank)
 * ---------------------------------------------------------------------------
 * Beheer de materialen in de kennisbank (enkel zichtbaar voor ingelogde
 * gebruikers op het dashboard). Volledige CRUD via KnowledgeManager.
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import KnowledgeManager from "@/components/admin/KnowledgeManager";

export const metadata = { title: "Kennisbank" };

export default async function AdminKennisbankPage() {
  const knowledge = await get("knowledge");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Kennisbank
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Materialen die alleen ingelogde gebruikers zien op hun dashboard.
          Voeg titel, beschrijving, soort en link toe.
        </p>
      </div>

      <KnowledgeManager initialItems={knowledge} />
    </div>
  );
}
