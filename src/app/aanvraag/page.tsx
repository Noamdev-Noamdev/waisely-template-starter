/**
 * ---------------------------------------------------------------------------
 * AanvraagPage (/aanvraag) — Native intake form
 * ---------------------------------------------------------------------------
 * Replaces the external Google Forms embed with a native form that reads
 * its field definitions from the database (admin-editable).
 * ---------------------------------------------------------------------------
 */

import Reveal from "@/components/ui/Reveal";
import Link from "next/link";
import { get } from "@/lib/db";
import IntakeForm from "@/components/site/IntakeForm";

export const metadata = {
  title: "Workshop aanvragen",
  description:
    "Vul het intake-formulier in om een workshop of webinar op maat aan te vragen bij WAIsely.",
};

export default async function AanvraagPage() {
  const fields = await get("intakeFields");

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6 md:py-20">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Intake-formulier
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Workshop aanvragen
        </h1>
        <p className="prose-muted mt-4 max-w-2xl">
          Bedankt voor je interesse in een WAIsely-vorming. Met deze intake stem
          ik de inhoud zo goed mogelijk af op uw school of instelling. Het
          invullen duurt ongeveer 5 tot 10 minuten. Liever eerst even
          bellen?{" "}
          <Link
            href="/contact"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Neem contact op
          </Link>
          .
        </p>
      </Reveal>

      <Reveal delay={150}>
        <div className="mt-10 rounded-[var(--radius)] bg-surface p-6 shadow-[var(--shadow-lg)] sm:p-8">
          <IntakeForm fields={fields} />
        </div>
      </Reveal>
    </div>
  );
}
