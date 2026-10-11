/**
 * ---------------------------------------------------------------------------
 * AdminPersPage (/admin/content/pers)
 * ---------------------------------------------------------------------------
 * Beheer van de publieke /pers-pagina: paginateksten, reviews en
 * Instagram-posts (officiële embeds via post-link). Persvermeldingen zelf
 * blijven in "Nieuws & pers" (type: pers).
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import { get } from "@/lib/db";
import PressManager from "@/components/admin/PressManager";

export const metadata = { title: "Pers-pagina" };

export default async function AdminPersPage() {
  const content = await get("siteContent");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pers-pagina
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pas de teksten, reviews en Instagram-posts van de{" "}
          <Link href="/pers" target="_blank" className="font-medium text-accent hover:underline">
            pers-pagina
          </Link>{" "}
          aan. Persvermeldingen beheer je via{" "}
          <Link href="/admin/nieuws" className="font-medium text-accent hover:underline">
            Nieuws &amp; pers
          </Link>
          .
        </p>
      </div>

      <PressManager
        initial={content.press}
        footerInstagramUrl={content.footer.instagramUrl}
      />
    </div>
  );
}
