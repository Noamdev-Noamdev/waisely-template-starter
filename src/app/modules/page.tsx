/**
 * ---------------------------------------------------------------------------
 * ModulesPage (/modules) — Interactive module selection
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import ModuleSelector from "@/components/site/ModuleSelector";
import Reveal from "@/components/ui/Reveal";
import Link from "next/link";

export const metadata = {
  title: "Modules — Stel je workshop samen",
  description:
    "Kies tot drie modules en combineer ze tot een workshop van 2 uur, volledig op maat van jouw school.",
};

export default async function ModulesPage() {
  const modules = await get("services");

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6 md:py-20">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Modules
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Stel je workshop samen
        </h1>
        <p className="prose-muted mt-4 max-w-2xl">
          Kies tot drie modules die je combineert in een workshop van 2 uur.
          Elke module bevat concrete lesvoorbeelden en werkvormen die je meteen
          kunt inzetten. Niet zeker welke modules bij jou passen?{" "}
          <Link
            href="/contact"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Neem contact op
          </Link>{" "}
          en ik denk graag mee.
        </p>
      </Reveal>

      <div className="mt-12">
        <ModuleSelector modules={modules} />
      </div>

      {/* Bottom spacer for sticky bar */}
      <div className="h-24" />
    </div>
  );
}
