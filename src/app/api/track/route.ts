/**
 * ---------------------------------------------------------------------------
 * /api/track — Anonieme paginaweergave registreren
 * ---------------------------------------------------------------------------
 * Wordt aangeroepen door PageviewTracker (sendBeacon) bij elke route.
 * Cookieloos: er wordt geen IP bewaard, enkel een dagelijks wisselende hash
 * (zie src/lib/analytics.ts). Bots, admin-routes, ingelogde admins en
 * bezoekers met Global Privacy Control / Do Not Track worden niet geteld.
 * ---------------------------------------------------------------------------
 */

import { recordPageview } from "@/lib/analytics";
import { getCurrentUser, isAdmin } from "@/lib/auth";

const BOT_PATTERN =
  /bot|crawl|spider|slurp|headless|lighthouse|preview|fetch|curl|wget|python|monitor/i;

const IGNORED_PREFIXES = ["/admin", "/api", "/dashboard", "/login", "/register"];

const noContent = () => new Response(null, { status: 204 });

function normalizePath(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.startsWith("/")) return null;
  const clean = raw.split(/[?#]/)[0].slice(0, 200);
  return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
}

function normalizeReferrer(raw: unknown, ownHost: string | null): string {
  if (typeof raw !== "string" || !raw) return "direct";
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    if (!host || (ownHost && host === ownHost.replace(/^www\./, "").split(":")[0])) {
      return "direct";
    }
    return host.slice(0, 100);
  } catch {
    return "direct";
  }
}

export async function POST(request: Request) {
  try {
    const headers = request.headers;
    const userAgent = headers.get("user-agent") ?? "";

    if (!userAgent || BOT_PATTERN.test(userAgent)) return noContent();
    if (headers.get("sec-gpc") === "1" || headers.get("dnt") === "1") return noContent();

    const body = await request.json().catch(() => null);
    const path = normalizePath(body?.path);
    if (!path || IGNORED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
      return noContent();
    }

    // Eigen bezoeken van beheerders tellen niet mee.
    if (isAdmin(await getCurrentUser())) return noContent();

    const ip =
      headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      headers.get("x-real-ip") ||
      "unknown";

    await recordPageview({
      path,
      referrer: normalizeReferrer(body?.referrer, headers.get("host")),
      ip,
      userAgent,
    });
  } catch (err) {
    console.error("Fout bij registreren pageview:", err);
  }
  return noContent();
}
