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
import Badge, {
  bookingStatusLabel,
  bookingStatusTone,
} from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import KnowledgeList from "@/components/dashboard/KnowledgeList";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Alle aanvragen van deze gebruiker (nieuwste eerst).
  const allBookings = await get("bookings");
  const myBookings = allBookings
    .filter((b) => b.userId === user.id && b.type !== "contact")
    .sort((a, b) => a.date.localeCompare(b.date));

  const knowledge = (await get("knowledge")).sort((a, b) => a.order - b.order);

  // Statistiekjes voor de samenvatting bovenaan.
  const stats = [
    {
      label: "Aankomend",
      value: myBookings.filter(
        (b) => b.status === "confirmed" || b.status === "new"
      ).length,
      icon: "calendar",
    },
    {
      label: "Afgelopen",
      value: myBookings.filter((b) => b.status === "done").length,
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
        {myBookings.length === 0 ? (
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
          <div className="mt-4 space-y-3">
            {myBookings.map((b) => (
              <div
                key={b.id}
                className="card-hover flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent">
                    <Icon name={b.type === "webinar" ? "video" : "users"} size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{b.topic}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {b.type === "webinar" ? "Webinar" : "Workshop"} ·{" "}
                      {formatDate(b.date)} · {b.audience}
                    </p>
                  </div>
                </div>
                <Badge tone={bookingStatusTone(b.status)}>
                  {bookingStatusLabel(b.status)}
                </Badge>
              </div>
            ))}
          </div>
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
    </div>
  );
}
