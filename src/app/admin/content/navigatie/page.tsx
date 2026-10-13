/**
 * ---------------------------------------------------------------------------
 * AdminNavigatiePage (/admin/content/navigatie)
 * ---------------------------------------------------------------------------
 * Beheer de navigatielabels en links in de menubalk (navbar) en footer.
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import ContentForm from "@/components/admin/ContentForm";

export const metadata = { title: "Navigatie beheren" };

export default async function AdminNavigatiePage() {
  const content = await get("siteContent");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Navigatiebalk &amp; Menulabels
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pas de namen en volgorde van de navigatie-items in het hoofdmenu aan.
        </p>
      </div>

      <ContentForm
        initial={content}
        saveKeys={["navigation"]}
        submitLabel="Navigatie opslaan"
      />
    </div>
  );
}
