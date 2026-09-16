/**
 * ---------------------------------------------------------------------------
 * WAIsely Template — JSON "database" store (db.ts)
 * ---------------------------------------------------------------------------
 * Eenvoudige, bestandsgebaseerde datalaag voor de template. Per entiteit
 * (users, siteContent, services, ...) is er één JSON-bestand in src/data.
 *
 * Waarom deze aanpak?
 *  - De template moet out-of-the-box draaien zonder Supabase/Postgres-keys.
 *  - De API (get/save per collectie) is bewust gestructureerd als mini-ORM:
 *    bij migratie naar een echte database vervang je alleen dit bestand door
 *    b.v. Supabase-clients of Prisma-queries; routes/forms blijven ongewijzigd.
 *
 * BELANGRIJK voor productie: lees de README (sectie "Datalaag vervangen").
 * Atomic writes via tmp+rename voorkomen half-geschreven bestanden.
 * ---------------------------------------------------------------------------
 */

import { promises as fs } from "fs";
import path from "path";
import { seedAll } from "./seed";
import type { Database } from "./types";

/** Map met JSON-bestanden (binnen de repo, zodat alles lokaal blijft). */
const DATA_DIR = path.join(process.cwd(), "src", "data");

/** Bestandsnamen per collectie — identiek aan de Database-interface. */
const FILES = {
  users: "users.json",
  siteContent: "siteContent.json",
  services: "services.json",
  news: "news.json",
  bookings: "bookings.json",
  knowledge: "knowledge.json",
  intakeFields: "intakeFields.json",
  intakeSubmissions: "intakeSubmissions.json",
} as const;

/**
 * Fallbackwaarden voor lege/ontbrekende bestanden (zodat de site altijd
 * start). siteContent krijgt een expliciete cast omdat het een object is;
 * de self-seeding in get() vult het bij eerste start met echte seed-content.
 */
const defaults = {
  users: [] as Database["users"],
  siteContent: null as unknown as Database["siteContent"],
  services: [] as Database["services"],
  news: [] as Database["news"],
  bookings: [] as Database["bookings"],
  knowledge: [] as Database["knowledge"],
  intakeFields: [] as Database["intakeFields"],
  intakeSubmissions: [] as Database["intakeSubmissions"],
};

/* ---------------------------------------------------------------------------
 * Self-seeding
 * ------------------------------------------------------------------------
 * Next.js rendert layouts en pagina's parallel. Een aparte "seed eerst"-stap
 * in de layout is dus NIET betrouwbaar: een pagina kan de store lezen vóór
 * dat de layout klaar is. Daarom zaait get() zichzelf: ontbreekt een
 * bestand (verse kloon/lege store), dan wordt exact één keer per proces
 * geseed — alle gelijktijdige lezers wachten op dezelfde seed-promise.
 * ------------------------------------------------------------------------- */

/** Seed-promise (per proces); deelt gelijktijdige eerste requests netjes. */
let seedingPromise: Promise<void> | null = null;

/** Zorgt dat de volledige seed één keer geschreven is. */
function ensureData(): Promise<void> {
  if (!seedingPromise) {
    seedingPromise = seedAll().catch((err) => {
      // Bij fout opnieuw proberen bij de volgende eerste lees.
      seedingPromise = null;
      throw err;
    });
  }
  return seedingPromise;
}

/** Leest één bestand; geeft null bij fout zodat de caller het afhandelt. */
async function tryRead<K extends keyof Database>(key: K): Promise<Database[K] | null> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, FILES[key]), "utf-8");
    return JSON.parse(raw) as Database[K];
  } catch {
    return null;
  }
}

/**
 * Leest één collectie, b.v. await get("services").
 *
 * Self-seeding: is het bestand afwezig én is de store nog vers (users.json
 * bestaat ook niet), dan wordt de seed geschreven en opnieuw gelezen. Bestaat
 * users.json wél, dan is het bestand opzettelijk afwezig/verwijderd en geven
 * we de fallback terug — zo overschrijven we nooit bestaande data met seed.
 *
 * Nota over caching: we lezen bewust rechtstreeks van disk (geen in-memory
 * cache). Next.js-productie draait route-handlers en server-components in
 * aparte bundels — een module-level cache zou per bundel verschillen en
 * administratieve writes (API) niet zichtbaar maken aan de publieke pagina's.
 * JSON-lezen is goedkoop; bij migratie naar Supabase/Prisma vervalt dit punt.
 */
export async function get<K extends keyof Database>(key: K): Promise<Database[K]> {
  const direct = await tryRead(key);
  if (direct !== null) return direct;

  // Bestand ontbreekt. Alleen seeden bij een volledig verse store.
  const users = await tryRead("users");
  if (users === null || users.length === 0) {
    await ensureData();
    const retried = await tryRead(key);
    if (retried !== null) return retried;
  }
  return defaults[key];
}

/**
 * Overschrijft één collectie, b.v. await save("services", lijst).
 * Atomic write (tmp+rename) voorkomt half-geschreven bestanden.
 */
export async function save<K extends keyof Database>(
  key: K,
  value: Database[K]
): Promise<void> {
  const fullPath = path.join(DATA_DIR, FILES[key]);
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Uniek per call (pid + tijd + random) om races tussen gelijktijdige
  // requests te voorkomen.
  const tmp = `${fullPath}.${process.pid}.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2, 8)}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf-8");
  await fs.rename(tmp, fullPath);
}

/**
 * Expliciete "zorg dat de store bestaat"-helper (idempotent). Pages/routes
 * die als eerste draaien kunnen dit aanroepen; get() zaait sowieso zelf.
 */
export async function ensureSeeded(): Promise<void> {
  const users = await get("users");
  if (users.length === 0) {
    await ensureData();
  }
}

/** Genereert een korte, unieke id (geen externe dependency nodig). */
export function uid(prefix = ""): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
