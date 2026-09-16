/**
 * ---------------------------------------------------------------------------
 * AdminTekstenPage (/admin/content/teksten)
 * ---------------------------------------------------------------------------
 * Bewerk de hero- en intro-teksten van de publieke site. Wijzigingen worden
 * opgeslagen via /api/admin/content en zijn meteen zichtbaar op de homepage.
 * Dit is het "content-management-stukje" van de template: bewust klein en
 * afgebakend — geen volwaardig CMS.
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import ContentForm from "@/components/admin/ContentForm";
import type { SiteContent } from "@/lib/types";

export const metadata = { title: "Site-teksten" };

export default async function AdminTekstenPage() {
  const content = await get("siteContent");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Hero & intro-teksten
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pas de eerste indruk van de site aan. Wijzigingen zijn direct
          zichtbaar op de publieke homepage.
        </p>
      </div>

      <ContentForm
        initial={content}
        saveKeys={["hero", "intro"]}
        submitLabel="Teksten opslaan"
      />
    </div>
  );
}
