/**
 * ---------------------------------------------------------------------------
 * Navbar.tsx — Pill-style navigation (Quiet Warm Minimal)
 * ---------------------------------------------------------------------------
 * Nav links sit inside a rounded pill container. Scroll-based active
 * detection for hash-links on the homepage. Compact vertical sizing.
 * ---------------------------------------------------------------------------
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { NAV_LINKS, SITE_NAME } from "@/lib/siteConfig";
import type { User } from "@/lib/types";

export default function Navbar({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState<string | null>(null);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }
  const ticking = useRef(false);

  /**
   * Scroll-based active detection: on the homepage, determine which
   * hash-section is currently in view and highlight only that one.
   */
  const updateActiveHash = useCallback(() => {
    if (pathname !== "/") {
      setActiveHash(null);
      return;
    }

    const hashLinks = NAV_LINKS.filter((l) => l.href.startsWith("/#"));
    let current: string | null = null;

    for (const link of hashLinks) {
      const id = link.href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Section is "active" when its top is within the top half of the viewport
        if (rect.top <= window.innerHeight * 0.45) {
          current = link.href;
        }
      }
    }

    setActiveHash(current);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);

      if (!ticking.current) {
        requestAnimationFrame(() => {
          updateActiveHash();
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [updateActiveHash]);

  function isActive(link: { href: string }) {
    // Direct page match (e.g. /modules, /contact)
    if (!link.href.startsWith("/#") && pathname === link.href) return true;
    // Hash-link on homepage: use scroll-based detection
    if (link.href.startsWith("/#") && pathname === "/") {
      return activeHash === link.href;
    }
    return false;
  }

  return (
    <>
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 shadow-[var(--shadow-sm)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-12 max-w-[1000px] items-center justify-end md:justify-between gap-4 px-4 sm:px-6">
        {/* Desktop pill navigation */}
        <div className="hidden items-center md:flex">
          <div className="nav-pill">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive(link)
                    ? "rounded-full bg-background px-3.5 py-1 text-sm font-medium text-foreground shadow-[var(--shadow-sm)]"
                    : ""
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Account zone (desktop) */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  title="Naar het admin-paneel"
                >
                  <Icon name="edit" size={14} />
                  Admin
                </Link>
              ) : null}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon name="dashboard" size={14} />
                Dashboard
              </Link>
              <span className="max-w-28 truncate text-xs font-medium text-muted-foreground">
                {user.name}
              </span>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                >
                  <Icon name="logout" size={14} />
                  Uitloggen
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Inloggen
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-accent px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground shadow-[var(--shadow-accent)] transition-all hover:-translate-y-0.5 hover:bg-accent-strong"
              >
                Account aanmaken
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Menu openen of sluiten"
          className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius)] text-foreground md:hidden"
        >
          <Icon name={open ? "close" : "menu"} size={20} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open ? (
        <div className="bg-surface px-4 pb-6 pt-2 shadow-[var(--shadow-md)] md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
              {user ? (
                <>
                  {user.role === "admin" ? (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-surface-muted px-3 py-2 text-sm font-semibold text-foreground"
                    >
                      <Icon name="edit" size={16} />
                      Admin-paneel
                    </Link>
                  ) : null}
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-surface-muted px-3 py-2 text-sm font-semibold text-foreground"
                  >
                    <Icon name="dashboard" size={16} />
                    Dashboard
                  </Link>
                  <form action="/api/auth/logout" method="post">
                    <button
                      type="submit"
                      className="inline-flex w-full items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-muted"
                    >
                      <Icon name="logout" size={16} />
                      Uitloggen ({user.name})
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
                  >
                    Inloggen
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius)] bg-accent px-4 py-2 text-sm font-semibold uppercase tracking-wider text-accent-foreground"
                  >
                    Account aanmaken
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>

      {/* Brand banner — large site name + slogan placed UNDER the navigation bar */}
      <div className="bg-background pb-3 pt-6 sm:pt-8 text-center px-4">
        <Link href="/" className="inline-block group">
          <span
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors block"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {SITE_NAME}
          </span>
        </Link>
        <p
          className="mt-2 text-base sm:text-lg italic text-muted-foreground sm:text-xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Choose WAIsely – putting humans first
        </p>
      </div>
    </>
  );
}
