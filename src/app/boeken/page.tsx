/**
 * ---------------------------------------------------------------------------
 * BookingPage (/boeken) — Workshop request flow
 * ---------------------------------------------------------------------------
 * Users request a custom workshop. Logged-in users are auto-recognized;
 * anonymous users see a login prompt. Supports pre-selected modules from
 * the /modules page via query parameter.
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import { get } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import BookingForm from "@/components/site/BookingForm";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "Workshop aanvragen",
};

export default async function BookingPage() {
  const [user, services] = await Promise.all([
    getCurrentUser(),
    get("services"),
  ]);

  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-[1000px] px-4 py-14 sm:px-6 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          {/* Explanation */}
          <Reveal>
            <div>
              <p className="pulse-dot inline-flex items-center rounded-full bg-surface px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Op maat
              </p>
              <h1 className="mt-5 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                Workshop aanvragen
              </h1>
              <p className="prose-muted mt-4 max-w-md">
                Beschrijf kort wat je nodig hebt en je ontvangt binnen 2
                werkdagen een voorstel op maat, inclusief een passende
                modulecombinatie.
              </p>

              {/* Steps */}
              <ol className="mt-8 space-y-4">
                {[
                  "Vul het formulier in met je wensen",
                  "Ontvang binnen 2 werkdagen een voorstel",
                  "We plannen samen een datum",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                      {i + 1}
                    </span>
                    <p className="pt-1 text-sm text-muted-foreground">{step}</p>
                  </li>
                ))}
              </ol>

              {/* Login prompt */}
              {!user ? (
                <div className="mt-8 rounded-[var(--radius)] bg-surface p-4 text-sm text-muted-foreground shadow-[var(--shadow-sm)]">
                  <p className="font-semibold text-foreground">
                    Account vereist
                  </p>
                  <p className="mt-1">
                    Aanvragen doen vereist een account.{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-accent underline-offset-2 hover:underline"
                    >
                      Log in
                    </Link>{" "}
                    of{" "}
                    <Link
                      href="/register"
                      className="font-semibold text-accent underline-offset-2 hover:underline"
                    >
                      maak er één aan
                    </Link>
                    .
                  </p>
                </div>
              ) : null}
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={150}>
            <div className="rounded-[var(--radius)] bg-surface p-6 shadow-[var(--shadow-lg)] sm:p-8">
              <BookingForm
                isLoggedIn={Boolean(user)}
                userName={user?.name ?? ""}
                userOrganization={user?.organization ?? ""}
                serviceTitles={services.map((s) => s.title)}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
