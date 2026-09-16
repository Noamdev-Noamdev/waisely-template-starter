/**
 * ---------------------------------------------------------------------------
 * RootLayout (layout.tsx)
 * ---------------------------------------------------------------------------
 * Wraps all pages with Navbar and Footer. Loads Fraunces (headings) and
 * Manrope (body) from Google Fonts for the Quiet Warm Minimal design.
 * ---------------------------------------------------------------------------
 */

import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ensureSeeded, get } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SITE_NAME, SITE_URL } from "@/lib/siteConfig";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Rust in de chaos`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "WAIsely begeleidt leerkrachten en scholen bij verantwoord en praktisch AI-gebruik via workshops en webinars op maat. Rust in de chaos.",
  metadataBase: new URL(SITE_URL),
};

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  await ensureSeeded();

  const user = await getCurrentUser();
  const siteContent = await get("siteContent");

  return (
    <html
      lang="nl"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Navbar user={user} />
        <main className="page-enter flex-1">{children}</main>
        <Footer content={siteContent} />
      </body>
    </html>
  );
}
