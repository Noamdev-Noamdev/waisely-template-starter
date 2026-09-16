/**
 * ---------------------------------------------------------------------------
 * Button.tsx — Ghost-first button system (Quiet Warm Minimal)
 * ---------------------------------------------------------------------------
 * Primary variant is now ghost (text-first, no fill). "filled" variant
 * provides the accent-background option when needed. All buttons use
 * generous padding, 16px radius, and capitalized labels.
 * ---------------------------------------------------------------------------
 */

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "filled" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground shadow-[var(--shadow-accent)] hover:bg-accent-strong hover:-translate-y-0.5",
  filled:
    "bg-accent text-accent-foreground shadow-[var(--shadow-accent)] hover:bg-accent-strong hover:-translate-y-0.5",
  secondary:
    "text-accent hover:bg-accent-soft hover:-translate-y-0.5",
  ghost:
    "text-foreground hover:bg-surface-muted hover:-translate-y-0.5",
  danger:
    "bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none";

/** Button as <button> (forms, actions). */
export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: {
  variant?: Variant;
} & ComponentProps<"button">) {
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

/** Button as internal <Link> (navigation). */
export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "children">) {
  return (
    <Link
      href={href}
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

/** Button as external <a> link. */
export function ButtonExternal({
  href,
  variant = "secondary",
  className = "",
  children,
  ...props
}: {
  href: string;
  variant?: Variant;
} & ComponentProps<"a">) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
