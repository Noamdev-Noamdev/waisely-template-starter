/**
 * ---------------------------------------------------------------------------
 * DashboardPage (/dashboard)
 * ---------------------------------------------------------------------------
 * Privé-omgeving voor ingelogde gebruikers:
 *   1. Overzicht van geboekte/aangevraagde workshops en webinars
 *   2. Kennisbank met downloadbare materialen (alleen zichtbaar ingelogd)
 *   3. Sneltoets naar de boekingsflow
 *
 * Beveiliging: getCurrentUser() + redirect naar /login indien niet ingelogd.
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { get } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Icon from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import KnowledgeList from "@/components/dashboard/KnowledgeList";
import BookingsList from "@/components/dashboard/BookingsList";
import PasswordChangeForm from "@/components/auth/PasswordChangeForm";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Alle aanvragen van deze gebruiker (nieuwste eerst).
  const [allBookings, allIntakes, intakeFields, knowledgeRaw] = await Promise.all([
    get("bookings"),
    get("intakeSubmissions"),
    get("intakeFields"),
    get("knowledge"),
  ]);

  const userEmail = user.email.toLowerCase().trim();

  // Bookings (via /boeken)
  const myBookings = allBookings
    .filter((b) => b.userId === user.id && b.type !== "contact")
    .sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date));

  // Intake-aanvragen (via /boek-een-training)
  const myIntakes = allIntakes
    .filter((s) => {
      if (s.userId && s.userId === user.id) return true;
      const email = typeof s.answers?.if_email === "string" ? s.answers.if_email.toLowerCase().trim() : "";
      return email && email === userEmail;
    })
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  const knowledge = knowledgeRaw.sort((a, b) => a.order - b.order);

  const totalAankomend =
    myBookings.filter((b) => b.status === "confirmed" || b.status === "new").length +
    myIntakes.length;
  const totalAfgelopen = myBookings.filter((b) => b.status === "done").length;

  // Statistiekjes voor de samenvatting bovenaan.
  const stats = [
    {
      label: "Aankomend",
      value: totalAankomend,
      icon: "calendar",
    },
    {
      label: "Afgelopen",
      value: totalAfgelopen,
      icon: "check",
    },
    {
      label: "Materialen",
      value: knowledge.length,
      icon: "download",
    },
  ];

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6 md:py-14">
      {/* Begroeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            Hallo, {user.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user.organization
              ? `${user.organization} — hier vind je je aanvragen en materialen.`
              : "Hier vind je je aanvragen en exclusieve materialen."}
          </p>
        </div>
        <ButtonLink href="/boeken">
          <Icon name="plus" size={16} />
          Nieuwe aanvraag
        </ButtonLink>
      </div>

      {/* Statistieken */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="card-hover rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent">
                <Icon name={s.icon} size={18} />
              </span>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Aanvragen */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-foreground">Mijn aanvragen</h2>
        {myBookings.length === 0 && myIntakes.length === 0 ? (
          <div className="mt-4 rounded-[var(--radius)] border border-dashed border-border bg-surface-muted p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Je hebt nog geen workshops of webinars aangevraagd.
            </p>
            <Link
              href="/boeken"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-strong"
            >
              Vraag je eerste workshop aan
              <Icon name="arrow-right" size={15} />
            </Link>
          </div>
        ) : (
          <BookingsList
            bookings={myBookings}
            intakes={myIntakes}
            intakeFields={intakeFields}
            currentUser={{
              name: user.name,
              email: user.email,
              organization: user.organization,
            }}
          />
        )}
      </section>

      {/* Kennisbank */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Kennisbank</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-softer px-3 py-1 text-xs font-semibold text-accent-strong">
            <Icon name="lock" size={12} />
            Alleen voor ingelogde gebruikers
          </span>
        </div>
        <KnowledgeList items={knowledge} />
      </section>

      {/* Account & Beveiliging */}
      <section className="mt-12 border-t border-border/70 pt-10">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground">
            Account & Beveiliging
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Beheer hier je inloggegevens en wijzig je wachtwoord.
          </p>
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] max-w-xl">
          <div className="mb-6 pb-5 border-b border-border/60">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Naam
                </dt>
                <dd className="mt-1 font-medium text-foreground">{user.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  E-mailadres
                </dt>
                <dd className="mt-1 font-medium text-foreground">{user.email}</dd>
              </div>
              {user.organization ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Organisatie / School
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">{user.organization}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <h3 className="text-sm font-semibold text-foreground mb-1">
            Wachtwoord wijzigen
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Na het wijzigen van je wachtwoord worden alle andere actieve sessies direct beëindigd.
          </p>
          <PasswordChangeForm />
        </div>
      </section>
    </div>
  );
}
