/**
 * ---------------------------------------------------------------------------
 * AdminSidebar.tsx — Navigatie in het admin-paneel
 * ---------------------------------------------------------------------------
 * Toont de beheer-secties met active-state op de huidige route. Mobiel
 * klapt de sidebar horizontaal boven de content.
 * ---------------------------------------------------------------------------
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

/** Alle beheersecties; voeg hier nieuwe secties toe (bv. instellingen). */
const SECTIONS = [
  {
    href: "/admin",
    label: "Overzicht",
    icon: "dashboard",
    exact: true,
  },
  {
    href: "/admin/content/teksten",
    label: "Site-teksten",
    icon: "pen",
  },
  {
    href: "/admin/content/diensten",
    label: "Diensten",
    icon: "grid",
  },
  {
    href: "/admin/content/waarom",
    label: "Waarom-punten",
    icon: "check",
  },
  {
    href: "/admin/content/contact",
    label: "Contactgegevens",
    icon: "mail",
  },
  {
    href: "/admin/aanvragen",
    label: "Aanvragen",
    icon: "calendar",
  },
  {
    href: "/admin/kennisbank",
    label: "Kennisbank",
    icon: "book",
  },
  {
    href: "/admin/nieuws",
    label: "Nieuws & pers",
    icon: "news",
  },
  {
    href: "/admin/intake/velden",
    label: "Intake-velden",
    icon: "layers",
  },
  {
    href: "/admin/intake/inzendingen",
    label: "Inzendingen",
    icon: "book",
  },
  {
    href: "/admin/gebruikers",
    label: "Gebruikers",
    icon: "users",
  },
];

export default function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="lg:w-60 lg:shrink-0">
      {/* Profiel-blok */}
      <div className="flex items-center gap-3 rounded-[var(--radius)] border border-highlight/40 bg-highlight/10 p-3.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-highlight/25 text-yellow-800">
          <Icon name="edit" size={16} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {userName}
          </p>
          <Badge tone="warning" className="mt-0.5">
            Admin
          </Badge>
        </div>
      </div>

      {/* Navigatie */}
      <nav className="mt-4 flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {SECTIONS.map((section) => {
          const active = section.exact
            ? pathname === section.href
            : pathname.startsWith(section.href);
          return (
            <Link
              key={section.href}
              href={section.href}
              className={`inline-flex shrink-0 items-center gap-2.5 rounded-[var(--radius)] px-3.5 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-accent-foreground shadow-[var(--shadow-accent)]"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <Icon name={section.icon} size={16} />
              {section.label}
            </Link>
          );
        })}
      </nav>

      {/* Terug naar site */}
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
