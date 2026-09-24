/**
 * ---------------------------------------------------------------------------
 * BoekEenTrainingPage (/boek-een-training) — Combined intake + module flow
 * ---------------------------------------------------------------------------
 * Replaces the separate "Modules" nav item. Combines:
 *   1. The native intake form (admin-editable fields)
 *   2. The interactive module selector (8 modules)
 * into a single page, so visitors can complete the full booking flow at once.
 * ---------------------------------------------------------------------------
 */

import Reveal from "@/components/ui/Reveal";
import Link from "next/link";
import { get } from "@/lib/db";
import IntakeForm from "@/components/site/IntakeForm";
import ModuleSelector from "@/components/site/ModuleSelector";

export const metadata = {
  title: "Boek een training",
  description:
    "Vul het intake-formulier in en kies uw modules om een workshop of webinar op maat aan te vragen bij WAIsely.",
};

export default async function BoekEenTrainingPage() {
  const [fields, modules] = await Promise.all([
    get("intakeFields"),
    get("services"),
  ]);

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6 md:py-20">
      {/* Page header */}
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Boek een training
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Workshop of webinar aanvragen
        </h1>
        <p className="prose-muted mt-4 max-w-2xl">
          Bedankt voor je interesse in een WAIsely-vorming. Vul eerst het
          intake-formulier in zodat we de inhoud zo goed mogelijk kunnen
          afstemmen op uw school of instelling. Kies daarna de modules die
          het beste bij uw situatie passen. Liever eerst even bellen?{" "}
          <Link
            href="/contact"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Neem contact op
          </Link>
          .
        </p>
      </Reveal>

      {/* Step 1: Intake form */}
      <Reveal delay={100}>
        <div className="mt-12">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
              1
            </span>
            <h2
              className="text-xl font-medium text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Intake-formulier
            </h2>
          </div>
          <div className="rounded-[var(--radius)] bg-surface p-6 shadow-[var(--shadow-lg)] sm:p-8">
            <IntakeForm fields={fields} />
          </div>
        </div>
      </Reveal>

      {/* Step 2: Module selection */}
      <Reveal delay={200}>
        <div className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
              2
            </span>
            <h2
              className="text-xl font-medium text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Kies uw modules
            </h2>
          </div>
          <p className="prose-muted mb-8 max-w-2xl">
            Kies tot drie modules die je combineert in een workshop van 2 uur.
            Elke module bevat concrete lesvoorbeelden en werkvormen die je
            meteen kunt inzetten.
          </p>
          <ModuleSelector modules={modules} />
        </div>
      </Reveal>

      {/* Bottom spacer for sticky module selection bar */}
      <div className="h-24" />
    </div>
  );
}
