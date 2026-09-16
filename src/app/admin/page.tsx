/**
 * ---------------------------------------------------------------------------
 * AdminIndex (/admin) — Overzichtspagina van het admin-paneel
 * ---------------------------------------------------------------------------
 * Toont per beheersectie de huidige status (aantallen, laatste wijziging)
 * met snelkoppelingen. Handig als "command center" voor de eigenaar.
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import { get } from "@/lib/db";
import Icon from "@/components/ui/Icon";
import Badge, { bookingStatusTone, bookingStatusLabel } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";

export default async function AdminIndexPage() {
  const [bookings, services, knowledge, news, users, content] = await Promise.all([
    get("bookings"),
    get("services"),
    get("knowledge"),
    get("news"),
    get("users"),
    get("siteContent"),
  ]);

  const newBookings = bookings.filter((b) => b.status === "new");

  // Kaarten met de belangrijkste beheerplekken + hun status.
  const cards = [
    {
      href: "/admin/aanvragen",
      icon: "calendar",
      title: "Aanvragen",
      count: bookings.length,
      hint: `${newBookings.length} nieuw te verwerken`,
    },
    {
      href: "/admin/content/teksten",
      icon: "pen",
      title: "Site-teksten",
      count: null,
      hint: "Hero, intro, over-sectie",
    },
    {
      href: "/admin/content/diensten",
      icon: "grid",
      title: "Diensten",
      count: services.length,
      hint: "Workshops & webinars",
    },
    {
      href: "/admin/content/waarom",
      icon: "check",
      title: "Waarom-punten",
      count: content.why.items.length,
      hint: "Checklist op de homepage",
    },
    {
      href: "/admin/content/contact",
      icon: "mail",
      title: "Contactgegevens",
      count: null,
      hint: "E-mail, telefoon, adres",
    },
    {
      href: "/admin/kennisbank",
      icon: "book",
      title: "Kennisbank",
      count: knowledge.length,
      hint: "Materialen voor ingelogde gebruikers",
    },
    {
      href: "/admin/nieuws",
      icon: "news",
      title: "Nieuws & pers",
      count: news.length,
      hint: "Artikelen en persvermeldingen",
    },
    {
      href: "/admin/gebruikers",
      icon: "users",
      title: "Gebruikers",
      count: users.length,
      hint: "Accounts en rollen",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Admin-overzicht
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Beheer hier de inhoud, modules en aanvragen van de WAIsely-site.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
        >
          <Icon name="eye" size={15} />
          Bekijk de site
        </Link>
      </div>

      {/* Nieuwe aanvragen-alert */}
      {newBookings.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-sky-200 bg-sky-50 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius)] bg-sky-100 text-sky-700">
              <Icon name="info" size={17} />
            </span>
            <p className="text-sm font-medium text-sky-800">
              {newBookings.length} nieuwe aanvra(a)g(en) wachten op behandeling.
            </p>
          </div>
          <Link
            href="/admin/aanvragen"
            className="text-sm font-semibold text-sky-700 underline-offset-2 hover:underline"
          >
            Bekijk aanvragen →
          </Link>
        </div>
      ) : null}

      {/* Snelkoppelingen-grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="card-hover group rounded-[var(--radius)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <Icon name={card.icon} size={18} />
              </span>
              {card.count !== null ? (
                <span className="text-2xl font-bold text-foreground">
                  {card.count}
                </span>
              ) : null}
            </div>
            <h2 className="mt-3.5 text-sm font-semibold text-foreground">
              {card.title}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{card.hint}</p>
          </Link>
        ))}
      </div>

      {/* Recente aanvragen */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Recente aanvragen
          </h2>
          <Link
            href="/admin/aanvragen"
            className="text-sm font-semibold text-accent hover:text-accent-strong"
          >
            Alles bekijken →
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {bookings.slice(-4).reverse().map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {b.topic}
                </p>
                <p className="text-xs text-muted-foreground">
                  {b.type} · {formatDate(b.date)} ·{" "}
                  {b.audience}
                </p>
              </div>
              <Badge tone={bookingStatusTone(b.status)}>
                {bookingStatusLabel(b.status)}
              </Badge>
            </div>
          ))}
          {bookings.length === 0 ? (
            <p className="rounded-[var(--radius)] border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
              Nog geen aanvragen.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
