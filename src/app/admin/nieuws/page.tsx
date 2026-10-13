/**
 * ---------------------------------------------------------------------------
 * AdminNieuwsPage (/admin/nieuws)
 * ---------------------------------------------------------------------------
 * Beheer artikelen, persvermeldingen én de sectiekopteksten op de homepage.
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import NewsManager from "@/components/admin/NewsManager";
import ContentForm from "@/components/admin/ContentForm";

export const metadata = { title: "Nieuws & pers" };

export default async function AdminNieuwsPage() {
  const [news, content] = await Promise.all([
    get("news"),
    get("siteContent"),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Nieuws &amp; pers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pas de koptekst op de homepage aan en beheer de artikelen en
            persvermeldingen.
          </p>
        </div>

        <ContentForm
          initial={content}
          saveKeys={["newsSection"]}
          submitLabel="Kopteksten opslaan"
        />
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-1">
          Artikelen &amp; persberichten
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Artikelen verschijnen op de site met een detailpagina;
          persvermeldingen linken direct naar het externe artikel.
        </p>

        <NewsManager initialItems={news} />
      </div>
    </div>
  );
}
