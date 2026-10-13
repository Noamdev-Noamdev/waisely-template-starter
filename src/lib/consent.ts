/**
 * ---------------------------------------------------------------------------
 * consent.ts — Cookie consent client utilities
 * ---------------------------------------------------------------------------
 * Beheert de cookievoorkeuren in de browser (waisely_consent cookie),
 * synchroniseert met /api/consent voor bewijsregistratie en verstuurt
 * events naar componenten zoals InstagramEmbeds.
 * ---------------------------------------------------------------------------
 */

export interface ConsentState {
  id: string;
  version: number;
  timestamp: string;
  essential: true;
  social: boolean;
}

const COOKIE_NAME = "waisely_consent";
const CONSENT_VERSION = 1;

/** Haalt de huidige consent-state op uit de cookie. */
export function getStoredConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;

  const matches = document.cookie.match(
    new RegExp("(?:^|; )" + COOKIE_NAME.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)")
  );
  if (!matches) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(matches[1]));
    if (parsed && typeof parsed === "object" && typeof parsed.social === "boolean") {
      return {
        id: String(parsed.id || ""),
        version: Number(parsed.version) || CONSENT_VERSION,
        timestamp: String(parsed.timestamp || ""),
        essential: true,
        social: Boolean(parsed.social),
      };
    }
  } catch {
    // Ongeldige JSON in cookie
  }
  return null;
}

/** Slaat de cookiekeuze op in de cookie en stuurt bewijs naar /api/consent. */
export async function saveConsent(
  social: boolean,
  method: "accept_all" | "reject_all" | "custom"
): Promise<ConsentState> {
  const current = getStoredConsent();
  const id =
    current?.id || `cst_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
  const timestamp = new Date().toISOString();

  const state: ConsentState = {
    id,
    version: CONSENT_VERSION,
    timestamp,
    essential: true,
    social,
  };

  // Cookie zetten (12 maanden geldig, SameSite=Lax, Path=/)
  const maxAge = 365 * 24 * 60 * 60;
  const cookieValue = encodeURIComponent(JSON.stringify(state));
  document.cookie = `${COOKIE_NAME}=${cookieValue}; path=/; max-age=${maxAge}; SameSite=Lax`;

  // Bewijs registreren op de server (asynchroon)
  try {
    fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consentId: id,
        version: CONSENT_VERSION,
        categories: { social },
        method,
      }),
    }).catch(() => {
      // Netwerkfout stil opvangen zodat UX niet blokkeert
    });
  } catch {
    // no-op
  }

  // Notificeer componenten op de pagina
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("waisely-consent-updated", { detail: state })
    );
  }

  return state;
}

/** Helper om het 'Cookie-instellingen' venster te openen vanaf eender waar. */
export function openCookieSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("waisely-open-cookie-settings"));
  }
}

/** Subscribe-functie voor React useSyncExternalStore. */
export function subscribeConsent(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("waisely-consent-updated", callback);
  return () => {
    window.removeEventListener("waisely-consent-updated", callback);
  };
}
