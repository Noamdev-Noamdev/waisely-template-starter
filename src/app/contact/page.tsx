/**
 * ---------------------------------------------------------------------------
 * ContactPage (/contact) — Dedicated contact page
 * ---------------------------------------------------------------------------
 */

import { get } from "@/lib/db";
import Contact from "@/components/site/Contact";

export const metadata = {
  title: "Contact",
  description:
    "Neem contact op met WAIsely voor een vrijblijvend gesprek over AI-workshops voor jouw school.",
};

export default async function ContactPage() {
  const siteContent = await get("siteContent");

  return (
    <div>
      <Contact content={siteContent} />
    </div>
  );
}
