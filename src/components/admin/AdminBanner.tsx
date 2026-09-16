/**
 * ---------------------------------------------------------------------------
 * AdminBanner.tsx — Edit-mode bar for admins (Quiet Warm Minimal style)
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import Icon from "@/components/ui/Icon";

const QUICK_LINKS = [
  { href: "/admin/content/teksten", label: "Teksten", icon: "pen" },
  { href: "/admin/content/diensten", label: "Modules", icon: "grid" },
  { href: "/admin/content/waarom", label: "Waarom-punten", icon: "check" },
  { href: "/admin/content/contact", label: "Contact", icon: "mail" },
];

export default function AdminBanner() {
  return (
    <div className="sticky top-16 z-30 bg-surface-muted backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="editable-badge flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Icon name="edit" size={15} />
          </span>
          <p className="text-sm font-semibold text-foreground">
            Bewerkmodus actief
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon name={link.icon} size={13} />
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
          >
            Naar admin-paneel
            <Icon name="arrow-right" size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
