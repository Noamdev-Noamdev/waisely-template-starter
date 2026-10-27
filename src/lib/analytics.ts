/**
 * ---------------------------------------------------------------------------
 * analytics.ts — Cookieloze, anonieme bezoekersstatistieken
 * ---------------------------------------------------------------------------
 * Telt paginaweergaven, unieke bezoekers, populaire pagina's en verwijzers
 * per dag. Er worden GEEN cookies gezet en GEEN IP-adressen bewaard:
 * een unieke bezoeker is een hash van (geheim + dag + IP + user-agent).
 * Omdat de dag in de hash zit, kan een bezoeker niet over meerdere dagen
 * gevolgd worden (zelfde principe als Plausible / Fathom).
 *
 * Opslag gebeurt met atomische Redis-commando's (INCR, PFADD, HINCRBY) i.p.v.
 * de collectie-blobs uit db.ts, zodat gelijktijdige bezoeken elkaar niet
 * overschrijven. Lokaal zonder Redis valt het terug op src/data/analytics.dev.json.
 * ---------------------------------------------------------------------------
 */

import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { getRedisClient, getRedisKeyPrefix } from "@/lib/db";

const TIME_ZONE = "Europe/Brussels";
/** Hoe lang dagstatistieken bewaard blijven (in seconden). */
const RETENTION_SECONDS = 400 * 24 * 60 * 60;
const DEV_FILE = path.join(process.cwd(), "src", "data", "analytics.dev.json");

export interface PageviewInput {
  path: string;
  /** Hostname van de verwijzer, of "direct". */
  referrer: string;
  ip: string;
  userAgent: string;
}

export interface DailyStat {
  day: string;
  pageviews: number;
  visitors: number;
}

export interface RankedItem {
  label: string;
  count: number;
}

export interface StatsSummary {
  days: DailyStat[];
  totalPageviews: number;
  /** Unieke bezoekers over de hele periode (zonder dubbeltellingen over dagen). */
  totalVisitors: number;
  topPages: RankedItem[];
  topReferrers: RankedItem[];
}

/* ---------------------------------------------------------------------------
 * Datumhulpjes
 * ------------------------------------------------------------------------- */

/** Huidige dag als YYYY-MM-DD in Belgische tijd. */
export function todayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);
}

/** De laatste `count` dagen (oudste eerst), eindigend op vandaag. */
function lastDays(count: number): string[] {
  const [y, m, d] = todayKey().split("-").map(Number);
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    days.push(new Date(Date.UTC(y, m - 1, d - i, 12)).toISOString().slice(0, 10));
  }
  return days;
}

function visitorHash(day: string, ip: string, userAgent: string): string {
  const secret = process.env.SESSION_SECRET || "waisely-analytics";
  return createHash("sha256")
    .update(`${secret}|${day}|${ip}|${userAgent}`)
    .digest("hex")
    .slice(0, 32);
}

function rank(totals: Map<string, number>, limit: number): RankedItem[] {
  return [...totals.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function addAll(target: Map<string, number>, source: Record<string, unknown> | null) {
  if (!source) return;
  for (const [key, value] of Object.entries(source)) {
    target.set(key, (target.get(key) ?? 0) + Number(value || 0));
  }
}

/* ---------------------------------------------------------------------------
 * Lokale fallback (development zonder Redis)
 * ------------------------------------------------------------------------- */

interface DevDay {
  pv: number;
  visitors: string[];
  pages: Record<string, number>;
  ref: Record<string, number>;
}

type DevStore = Record<string, DevDay>;

async function readDevStore(): Promise<DevStore> {
  try {
    return JSON.parse(await fs.readFile(DEV_FILE, "utf-8")) as DevStore;
  } catch {
    return {};
  }
}

async function writeDevStore(store: DevStore) {
  await fs.mkdir(path.dirname(DEV_FILE), { recursive: true });
  await fs.writeFile(DEV_FILE, JSON.stringify(store, null, 2), "utf-8");
}

/* ---------------------------------------------------------------------------
 * Schrijven
 * ------------------------------------------------------------------------- */

export async function recordPageview(input: PageviewInput): Promise<void> {
  const day = todayKey();
  const visitor = visitorHash(day, input.ip, input.userAgent);
  const redis = getRedisClient();

  if (!redis) {
    const store = await readDevStore();
    const entry = (store[day] ??= { pv: 0, visitors: [], pages: {}, ref: {} });
    entry.pv += 1;
    if (!entry.visitors.includes(visitor)) entry.visitors.push(visitor);
    entry.pages[input.path] = (entry.pages[input.path] ?? 0) + 1;
    entry.ref[input.referrer] = (entry.ref[input.referrer] ?? 0) + 1;
    await writeDevStore(store);
    return;
  }

  const prefix = `${getRedisKeyPrefix()}stats:`;
  const keys = {
    pv: `${prefix}pv:${day}`,
    uv: `${prefix}uv:${day}`,
    pages: `${prefix}pages:${day}`,
    ref: `${prefix}ref:${day}`,
  };

  const pipe = redis.pipeline();
  pipe.incr(keys.pv);
  pipe.pfadd(keys.uv, visitor);
  pipe.hincrby(keys.pages, input.path, 1);
  pipe.hincrby(keys.ref, input.referrer, 1);
  for (const key of Object.values(keys)) pipe.expire(key, RETENTION_SECONDS);
  await pipe.exec();
}

/* ---------------------------------------------------------------------------
 * Lezen
 * ------------------------------------------------------------------------- */

export async function getStats(dayCount: number, topLimit = 10): Promise<StatsSummary> {
  const days = lastDays(dayCount);
  const pages = new Map<string, number>();
  const referrers = new Map<string, number>();
  const redis = getRedisClient();

  if (!redis) {
    const store = await readDevStore();
    const allVisitors = new Set<string>();
    const daily = days.map((day) => {
      const entry = store[day];
      if (!entry) return { day, pageviews: 0, visitors: 0 };
      entry.visitors.forEach((v) => allVisitors.add(v));
      addAll(pages, entry.pages);
      addAll(referrers, entry.ref);
      return { day, pageviews: entry.pv, visitors: entry.visitors.length };
    });
    return {
      days: daily,
      totalPageviews: daily.reduce((sum, d) => sum + d.pageviews, 0),
      // Lokaal is de hash per dag verschillend, dus dit is een benadering.
      totalVisitors: allVisitors.size,
      topPages: rank(pages, topLimit),
      topReferrers: rank(referrers, topLimit),
    };
  }

  const prefix = `${getRedisKeyPrefix()}stats:`;
  const pipe = redis.pipeline();
  for (const day of days) {
    pipe.get<number>(`${prefix}pv:${day}`);
    pipe.pfcount(`${prefix}uv:${day}`);
    pipe.hgetall<Record<string, number>>(`${prefix}pages:${day}`);
    pipe.hgetall<Record<string, number>>(`${prefix}ref:${day}`);
  }
  const uvKeys = days.map((day) => `${prefix}uv:${day}`);
  pipe.pfcount(uvKeys[0], ...uvKeys.slice(1));
  const results = (await pipe.exec()) as unknown[];

  const daily = days.map((day, i) => {
    const [pv, uv, dayPages, dayRef] = results.slice(i * 4, i * 4 + 4);
    addAll(pages, dayPages as Record<string, number> | null);
    addAll(referrers, dayRef as Record<string, number> | null);
    return { day, pageviews: Number(pv ?? 0), visitors: Number(uv ?? 0) };
  });

  return {
    days: daily,
    totalPageviews: daily.reduce((sum, d) => sum + d.pageviews, 0),
    totalVisitors: Number(results[results.length - 1] ?? 0),
    topPages: rank(pages, topLimit),
    topReferrers: rank(referrers, topLimit),
  };
}
