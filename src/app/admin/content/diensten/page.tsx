/**
 * ---------------------------------------------------------------------------
 * AdminDienstenPage (/admin/content/diensten)
 * ---------------------------------------------------------------------------
 * Beheer de sectiekopteksten én de lijst met diensten (workshops/webinars).
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import ServicesManager from "@/components/admin/ServicesManager";
import ContentForm from "@/components/admin/ContentForm";

export const metadata = { title: "Diensten beheren" };

export default async function AdminDienstenPage() {
  const [services, content] = await Promise.all([
    get("services"),
    get("siteContent"),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Diensten &amp; Modules
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pas de introductie en knoppen van de modulesectie aan, en beheer
            de individuele workshopmodules.
          </p>
        </div>

        <ContentForm
          initial={content}
          saveKeys={["servicesSection"]}
          submitLabel="Kopteksten opslaan"
        />
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-1">
          Modules &amp; Workshops
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Voeg modules toe, pas ze aan of wijzig de volgorde.
        </p>

        <ServicesManager initialServices={services} />
      </div>
    </div>
  );
}
