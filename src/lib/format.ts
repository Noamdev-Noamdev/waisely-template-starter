/**
 * Helper om alle primitieve datums te formatteren naar het Nederlands.
 * Centraal geplaatst zodat formatting overal consistent is.
 */
export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("nl-BE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Idem, maar met tijd erbij (voor aanvragen met eenmoment van boeken). */
export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("nl-BE", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/**
 * Kleine helper om placeholders te detecteren ([...]) zodat de UI ze eventueel
 * kan markeren (n.v.t. in de template, maar handig bij echte content).
 */
export function isPlaceholder(text: string): boolean {
  return /^\s*\[.*\]\s*$/.test(text);
}
