/**
 * ---------------------------------------------------------------------------
 * AdminSidebar.tsx — Navigatie in het admin-paneel
 * ---------------------------------------------------------------------------
 * Toont de beheer-secties met active-state op de huidige route.
 * De sectie "Gebruikers" is uitsluitend zichtbaar voor de superadmin (eigenaar).
 * Bevat tevens "Mijn account" voor het wijzigen van het eigen wachtwoord.
 * ---------------------------------------------------------------------------
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import type { Role } from "@/lib/types";

/** Algemene beheersecties voor alle admins en superadmins. */
const SECTIONS = [
  {
    href: "/admin",
    label: "Overzicht",
    icon: "dashboard" as const,
    exact: true,
  },
  {
    href: "/admin/statistieken",
    label: "Statistieken",
    icon: "chart" as const,
  },
  {
    href: "/admin/content/teksten",
    label: "Site-teksten",
    icon: "pen" as const,
  },
  {
    href: "/admin/content/navigatie",
    label: "Navigatie",
    icon: "layers" as const,
  },
  {
    href: "/admin/content/diensten",
    label: "Diensten & Modules",
    icon: "grid" as const,
  },
  {
    href: "/admin/content/trainingen",
    label: "Training boeken",
    icon: "calendar" as const,
  },
  {
    href: "/admin/content/waarom",
    label: "Waarom-punten",
    icon: "check" as const,
  },
  {
    href: "/admin/content/over",
    label: "Over WAIsely",
    icon: "user" as const,
  },
  {
    href: "/admin/content/contact",
    label: "Contact & footer",
    icon: "mail" as const,
  },
  {
    href: "/admin/content/voorwaarden",
    label: "Juridisch & Privacy",
    icon: "shield" as const,
  },
  {
    href: "/admin/content/pers",
    label: "Pers-pagina",
    icon: "quote" as const,
  },
  {
    href: "/admin/aanvragen",
    label: "Aanvragen",
    icon: "calendar" as const,
  },
  {
    href: "/admin/kennisbank",
    label: "Kennisbank",
    icon: "book" as const,
  },
  {
    href: "/admin/nieuws",
    label: "Nieuws & pers",
    icon: "news" as const,
  },
  {
    href: "/admin/account",
    label: "Mijn account",
    icon: "settings" as const,
  },
];

export default function AdminSidebar({
  userName,
  userRole,
}: {
  userName: string;
  userRole?: Role;
}) {
  const pathname = usePathname();
  const isSuper = userRole === "superadmin";

  return (
    <aside className="w-full lg:w-64 lg:shrink-0">
      {/* Profiel-blok */}
      <div className="flex items-center gap-3 rounded-[var(--radius)] border border-highlight/40 bg-highlight/10 p-3.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-highlight/25 text-yellow-800">
          <Icon name="edit" size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {userName}
          </p>
          <Badge tone={isSuper ? "neutral" : "warning"} className="mt-0.5">
            {isSuper ? "Superadmin" : "Admin"}
          </Badge>
        </div>
        {/* Terug naar site knop op mobiel/tablet */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-[var(--radius)] border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        >
          <Icon name="arrow-left" size={13} />
          Site
        </Link>
      </div>

      {/* Navigatie */}
      <nav className="mt-4 flex flex-wrap gap-1.5 sm:gap-2 lg:flex-col lg:gap-1">
        {SECTIONS.map((section) => {
          const active = section.exact
            ? pathname === section.href
            : pathname.startsWith(section.href);
          return (
            <Link
              key={section.href}
              href={section.href}
              className={`inline-flex shrink-0 items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-accent-foreground shadow-[var(--shadow-accent)]"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <Icon name={section.icon} size={15} />
              {section.label}
            </Link>
          );
        })}

        {/* Duidelijk afgebakende sectie Gebruikers: uitsluitend zichtbaar voor superadmin */}
        {isSuper ? (
          <div className="w-full pt-3 mt-1 border-t border-border/70">
            <p className="hidden lg:block px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Eigenaar / Beheer
            </p>
            <Link
              href="/admin/gebruikers"
              className={`inline-flex shrink-0 items-center justify-between w-full rounded-[var(--radius)] px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                pathname.startsWith("/admin/gebruikers")
                  ? "bg-accent text-accent-foreground shadow-[var(--shadow-accent)]"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Icon name="users" size={15} />
                Gebruikers & Rollen
              </span>
              <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                Superadmin
              </span>
            </Link>
          </div>
        ) : null}
      </nav>

      {/* Terug naar site (desktop) */}
      <Link
        href="/"
        className="mt-4 hidden items-center gap-2 rounded-[var(--radius)] px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground lg:inline-flex"
      >
        <Icon name="arrow-left" size={16} />
        Terug naar site
      </Link>
    </aside>
  );
}
