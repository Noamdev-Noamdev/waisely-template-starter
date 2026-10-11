/**
 * ---------------------------------------------------------------------------
 * instagram.ts — Hulpfuncties voor Instagram-post-URL's
 * ---------------------------------------------------------------------------
 * Instagram-posts worden getoond via de officiële embed (blockquote +
 * https://www.instagram.com/embed.js). Daarvoor is enkel de permalink van
 * een post nodig — geen API-key of Meta-app.
 *
 * Deze helper accepteert alle gangbare varianten die je uit de app/browser
 * kopieert en zet ze om naar één canonieke vorm:
 *   https://instagram.com/p/ABC123            → https://www.instagram.com/p/ABC123/
 *   https://www.instagram.com/reel/ABC123/?igsh=… → https://www.instagram.com/reel/ABC123/
 *   https://www.instagram.com/waise.ly/p/ABC123/ → https://www.instagram.com/p/ABC123/
 * Gedeeld door client (admin-validatie) én server (API-validatie).
 * ---------------------------------------------------------------------------
 */

const POST_PATH = /^\/(?:[A-Za-z0-9._]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)\/?/;

/**
 * Zet een geplakte Instagram-link om naar een canonieke post-permalink.
 * Geeft null terug als het geen geldige post/reel-URL is.
 */
export function normalizeInstagramUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (host !== "instagram.com" && !host.endsWith(".instagram.com")) {
    return null;
  }

  const match = url.pathname.match(POST_PATH);
  if (!match) return null;

  // "reels" (meervoud) is een alias in de app; de embed verwacht "reel".
  const kind = match[1] === "reels" ? "reel" : match[1];
  return `https://www.instagram.com/${kind}/${match[2]}/`;
}

/** Korte code van een post (voor labels in de admin), b.v. "ABC123". */
export function instagramShortcode(url: string): string {
  const match = url.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : url;
}
