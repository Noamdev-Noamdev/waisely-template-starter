/**
 * ---------------------------------------------------------------------------
 * AdminNieuwsPage (/admin/nieuws)
 * ---------------------------------------------------------------------------
 * Beheer artikelen en persvermeldingen voor de nieuwssectie op de publieke
 * site. Volledige CRUD via NewsManager.
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import NewsManager from "@/components/admin/NewsManager";

export const metadata = { title: "Nieuws & pers" };

export default async function AdminNieuwsPage() {
  const news = await get("news");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Nieuws & pers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Artikelen verschijnen op de site met een detailpagina;
          persvermeldingen linken direct naar het externe artikel.
        </p>
      </div>

      <NewsManager initialItems={news} />
    </div>
  );
}
