/**
 * ---------------------------------------------------------------------------
 * IntakeForm.tsx — Wrapper rond GoogleFormsEmbed
 * ---------------------------------------------------------------------------
 * Behoudt compatibiliteit met eerdere imports en rendert de Google Forms embed.
 * ---------------------------------------------------------------------------
 */

"use client";

import GoogleFormsEmbed, { DEFAULT_GOOGLE_FORMS_URL } from "./GoogleFormsEmbed";
import type { IntakeField } from "@/lib/types";

export default function IntakeForm({
  formUrl,
}: {
  fields?: IntakeField[];
  successTitle?: string;
  successMessage?: string;
  formUrl?: string;
}) {
  return <GoogleFormsEmbed formUrl={formUrl || DEFAULT_GOOGLE_FORMS_URL} />;
}
