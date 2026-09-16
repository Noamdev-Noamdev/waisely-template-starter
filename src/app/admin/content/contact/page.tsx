/**
 * ---------------------------------------------------------------------------
 * AdminContactPage (/admin/content/contact)
 * ---------------------------------------------------------------------------
 * Bewerk de contactgegevens (e-mail, telefoon, adres) en de bijbehorende
 * sectieteksten. Deze gegevens verschijnen in de contactsectie én de footer.
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import ContentForm from "@/components/admin/ContentForm";

export const metadata = { title: "Contactgegevens" };

export default async function AdminContactPage() {
  const content = await get("siteContent");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Contactgegevens
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deze gegevens verschijnen in de contactsectie en de footer van elke
          pagina.
        </p>
      </div>

      <ContentForm
        initial={content}
        saveKeys={["contact", "footer"]}
        submitLabel="Contactgegevens opslaan"
      />
    </div>
  );
}
