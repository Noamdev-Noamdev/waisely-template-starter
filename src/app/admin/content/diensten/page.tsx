/**
 * ---------------------------------------------------------------------------
 * AdminDienstenPage (/admin/content/diensten)
 * ---------------------------------------------------------------------------
 * Beheer de lijst met diensten (workshops/webinars) die op de publieke site
 * staan. Volledige CRUD via ServicesManager: toevoegen, bewerken, verwijderen
 * en herordenen (volgorde-nummers).
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import ServicesManager from "@/components/admin/ServicesManager";

export const metadata = { title: "Diensten beheren" };

export default async function AdminDienstenPage() {
  const services = await get("services");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Diensten
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          De workshops en webinars op de publieke site. Voeg toe, bewerk of
          verwijder; wijzigingen zijn direct zichtbaar.
        </p>
      </div>

      <ServicesManager initialServices={services} />
    </div>
  );
}
