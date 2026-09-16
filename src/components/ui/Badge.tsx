/**
 * ---------------------------------------------------------------------------
 * Badge.tsx — kleine status-/label-chips met consistente kleuren
 * ---------------------------------------------------------------------------
 * Gebruik voor boekingsstatussen, rollen, nieuws-types, enz. Kleuren per
 * status zijn bewust rustig gehouden (geen felle neon-tinten).
 * ---------------------------------------------------------------------------
 */

export type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-muted-foreground border-border",
  accent: "bg-accent-soft text-accent-strong border-accent/25",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
};

export default function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Mapt boekingsstatussen op badge-tones (gedeeld door dashboard + admin). */
export function bookingStatusTone(status: string): BadgeTone {
  switch (status) {
    case "new":
      return "info";
    case "confirmed":
      return "success";
    case "done":
      return "neutral";
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

/** Nederlandstalige labels voor boekingsstatussen. */
export function bookingStatusLabel(status: string): string {
  switch (status) {
    case "new":
      return "Nieuw";
    case "confirmed":
      return "Bevestigd";
    case "done":
      return "Afgelopen";
    case "cancelled":
      return "Geannuleerd";
    default:
      return status;
  }
}
