/**
 * ---------------------------------------------------------------------------
 * BoekEenTrainingPage (/boek-een-training) — Module selection flow
 * ---------------------------------------------------------------------------
 * Toont de interactieve moduleselector waarmee bezoekers tot drie modules
 * kunnen combineren en direct doorstromen naar het aanvraagformulier (/boeken).
 * ---------------------------------------------------------------------------
 */

import Reveal from "@/components/ui/Reveal";
import Link from "next/link";
import { get } from "@/lib/db";
import ModuleSelector from "@/components/site/ModuleSelector";

export const metadata = {
  title: "Boek een training",
  description:
    "Kies uw modules om een workshop of webinar op maat aan te vragen bij WAIsely.",
};

export default async function BoekEenTrainingPage() {
  const [modules, siteContent] = await Promise.all([
    get("services"),
    get("siteContent"),
  ]);

  const bt = siteContent.bookTraining;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6 md:py-20">
      {/* Page header */}
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {bt.eyebrow || "Boek een training"}
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {bt.title}
        </h1>
        <p className="prose-muted mt-4 max-w-2xl">
          {bt.description} {bt.contactPrompt || "Liever eerst even bellen?"}{" "}
          <Link
            href="/contact"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            {bt.contactLinkText || "Neem contact op"}
          </Link>
          .
        </p>
      </Reveal>

      {/* Module selection */}
      <Reveal delay={100}>
        <div className="mt-12">
          <h2
            className="mb-3 text-xl font-medium text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {bt.step2Title || "Kies uw modules"}
          </h2>
          <p className="prose-muted mb-8 max-w-2xl whitespace-pre-line">
            {bt.step2Description ||
              "Kies tot drie modules die je combineert in een workshop van 2 uur. Elke module bevat concrete lesvoorbeelden en werkvormen die je meteen kunt inzetten."}
          </p>
          <ModuleSelector
            modules={modules}
            ctaLabel={bt.moduleSelectorCta || "Workshop aanvragen"}
          />
        </div>
      </Reveal>

      {/* Bottom spacer for sticky module selection bar */}
      <div className="h-24" />
    </div>
  );
}
