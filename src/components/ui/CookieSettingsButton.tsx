"use client";

import { openCookieSettings } from "@/lib/consent";
import Icon from "@/components/ui/Icon";

export default function CookieSettingsButton({
  label = "Cookie-instellingen wijzigen",
  className = "",
  showIcon = true,
}: {
  label?: string;
  className?: string;
  showIcon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={
        className ||
        "inline-flex items-center gap-2 rounded-[var(--radius)] bg-accent px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground shadow-[var(--shadow-accent)] transition-all hover:bg-accent-strong"
      }
    >
      {showIcon && <Icon name="shield" size={14} />}
      <span>{label}</span>
    </button>
  );
}
