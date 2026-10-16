/**
 * ---------------------------------------------------------------------------
 * WAIsely Template — Datalaag (db.ts)
 * ---------------------------------------------------------------------------
 * Biedt een uniforme key-value interface (get / save) voor alle collecties:
 *   - In productie op Vercel: Upstash Redis (via Vercel Marketplace)
 *   - Lokaal in development: lokale JSON-bestanden in src/data/ (of Upstash
 *     indien de omgevingsvariabelen ingesteld zijn)
 *
 * Dit zorgt ervoor dat wijzigingen via het admin-dashboard, nieuwe accounts,
 * boekingen en consent-logs blijvend bewaard worden over serverless restarts
 * en nieuwe deployments heen, zonder ooit naar een read-only bestandssysteem
 * te schrijven in productie.
 * ---------------------------------------------------------------------------
 */

import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import defaultSiteContent from "../data/siteContent.json";
import defaultServices from "../data/services.json";
import defaultNews from "../data/news.json";
import defaultKnowledge from "../data/knowledge.json";
import defaultIntakeFields from "../data/intakeFields.json";
import defaultUsers from "../data/users.json";
import defaultBookings from "../data/bookings.json";
import defaultConsentLogs from "../data/consentLogs.json";
import defaultIntakeSubmissions from "../data/intakeSubmissions.json";
import {
  getSeedUsers,
  getSeedBookings,
  seedSiteContent,
  seedServices,
  seedNews,
  seedKnowledge,
  seedIntakeFields,
} from "./seed";
import type { Database } from "./types";

/** Map met JSON-bestanden (binnen de repo, als standaardwaarden en lokale store). */
const DATA_DIR = path.join(process.cwd(), "src", "data");

/** Bestandsnamen per collectie — identiek aan de Database-interface. */
const FILES: Record<keyof Database, string> = {
  users: "users.json",
  siteContent: "siteContent.json",
  services: "services.json",
  news: "news.json",
  bookings: "bookings.json",
  knowledge: "knowledge.json",
  intakeFields: "intakeFields.json",
  intakeSubmissions: "intakeSubmissions.json",
  consentLogs: "consentLogs.json",
} as const;

/** Standaardwaarden direct geladen uit src/data/*.json (single source of truth voor defaults). */
const defaultStore: Database = {
  users: (defaultUsers ?? []) as unknown as Database["users"],
  siteContent: defaultSiteContent as unknown as Database["siteContent"],
  services: (defaultServices ?? []) as unknown as Database["services"],
  news: (defaultNews ?? []) as unknown as Database["news"],
  bookings: (defaultBookings ?? []) as unknown as Database["bookings"],
  knowledge: (defaultKnowledge ?? []) as unknown as Database["knowledge"],
  intakeFields: (defaultIntakeFields ?? []) as unknown as Database["intakeFields"],
  intakeSubmissions: (defaultIntakeSubmissions ?? []) as unknown as Database["intakeSubmissions"],
  consentLogs: (defaultConsentLogs ?? []) as unknown as Database["consentLogs"],
};

/** Fallbackwaarden voor lege/ontbrekende stores (zodat de site altijd start). */
const defaults: Database = defaultStore;

export type AppEnvironment = "development" | "preview" | "production";

/** Bepaalt de huidige runtime-omgeving (Development, Preview of Production). */
export function getAppEnvironment(): AppEnvironment {
  if (process.env.VERCEL_ENV === "production" || process.env.APP_ENV === "production") {
    return "production";
  }
  if (process.env.VERCEL_ENV === "preview" || process.env.APP_ENV === "preview") {
    return "preview";
  }
  if (process.env.NODE_ENV === "production") {
    return "production";
  }
  return "development";
}

/** Productie-check: op Vercel of in production mag nooit naar het bestandssysteem geschreven worden. */
export function isProductionEnvironment(): boolean {
  return (
    getAppEnvironment() === "production" ||
    getAppEnvironment() === "preview" ||
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.VERCEL_ENV)
  );
}

/**
 * Bepaalt het sleutel-voorvoegsel per omgeving.
 * - Productie: 'waisely:' (behoudt bestaande live data)
 * - Preview: 'waisely:preview:' (strikt gescheiden van productie)
 * - Development: 'waisely:dev:' (strikt gescheiden van productie)
 */
export function getRedisKeyPrefix(): string {
  if (process.env.REDIS_KEY_PREFIX) {
    return process.env.REDIS_KEY_PREFIX;
  }
  const env = getAppEnvironment();
  if (env === "development") return "waisely:dev:";
  if (env === "preview") return "waisely:preview:";
  return "waisely:";
}

/* ---------------------------------------------------------------------------
 * Upstash Redis Client Singleton
 * ---------------------------------------------------------------------------
 * Ondersteunt zowel de standaard Upstash Marketplace variabelen
 * (UPSTASH_REDIS_REST_URL/TOKEN) als Vercel KV aliases (KV_REST_API_URL/TOKEN).
 * ------------------------------------------------------------------------- */

let redisInstance: Redis | null = null;
let lastUrl: string | undefined;
let lastToken: string | undefined;

export function getRedisClient(): Redis | null {
  const env = getAppEnvironment();

  // Veiligheid: In lokale development NOOIT verbinden met de database tenzij
  // expliciet ingeschakeld via ENABLE_DEV_REDIS="true" (met een aparte ontwikkeldatabase).
  // Hierdoor gebruikt lokaal ontwikkelen standaard altijd 100% veilig de lokale fallback!
  if (env === "development" && process.env.ENABLE_DEV_REDIS !== "true") {
    return null;
  }

  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    redisInstance = null;
    return null;
  }

  if (redisInstance && lastUrl === url && lastToken === token) {
    return redisInstance;
  }

  try {
    redisInstance = new Redis({ url, token });
    lastUrl = url;
    lastToken = token;
    return redisInstance;
  } catch (err) {
    console.error("[db.ts] Kon Upstash Redis niet initialiseren:", err);
    redisInstance = null;
    return null;
  }
}

/* ---------------------------------------------------------------------------
 * Deep Merge: combineert opgeslagen waarden met standaardwaarden (src/data/)
 * ------------------------------------------------------------------------- */

function isPlainObject(item: unknown): item is Record<string, unknown> {
  return (
    typeof item === "object" &&
    item !== null &&
    !Array.isArray(item) &&
    !(item instanceof Date) &&
    !(item instanceof RegExp)
  );
}

/**
 * Combineert opgeslagen waarden met de standaardwaarden uit src/data/:
 * - Als een nieuw veld in de standaarddata komt, toont de site dat veld met de standaardwaarde.
 * - Reeds opgeslagen waarden (inclusief lege waarden zoals "", false of 0) worden NOOIT overschreven of verloren.
 * - Geneste objecten worden recursief samengevoegd zodat nieuwe subvelden automatisch beschikbaar komen.
 * - Extra velden die reeds in de store zijn opgeslagen worden intact gehouden.
 */
export function deepMergeWithDefaults<T>(defaultVal: T, storedVal: unknown): T {
  if (storedVal === undefined || storedVal === null) {
    return structuredClone(defaultVal);
  }

  if (isPlainObject(defaultVal) && isPlainObject(storedVal)) {
    const result: Record<string, unknown> = {};

    // 1. Zorg dat alle standaardvelden aanwezig zijn
    for (const key of Object.keys(defaultVal)) {
      if (storedVal[key] === undefined) {
        // Veld ontbreekt in opgeslagen data: gebruik standaardwaarde
        result[key] = structuredClone(defaultVal[key]);
      } else {
        // Veld bestaat al in opgeslagen data: recursief mergen als beiden objecten zijn
        result[key] = deepMergeWithDefaults(defaultVal[key], storedVal[key]);
      }
    }

    // 2. Behoud alle reeds opgeslagen velden die niet in de standaarddata voorkomen
    for (const key of Object.keys(storedVal)) {
      if (!(key in result)) {
        result[key] = storedVal[key];
      }
    }

    return result as T;
  }

  // Identificeerbare arrays (bijvoorbeeld lijsten met objecten die een `id` hebben zoals services)
  if (Array.isArray(defaultVal) && Array.isArray(storedVal)) {
    const isIdentifiable =
      defaultVal.length > 0 &&
      defaultVal.every((item) => isPlainObject(item) && "id" in item);

    if (isIdentifiable) {
      return storedVal.map((storedItem) => {
        if (isPlainObject(storedItem) && typeof storedItem.id === "string") {
          const matchingDefault = defaultVal.find(
            (d) => isPlainObject(d) && d.id === storedItem.id
          );
          if (matchingDefault) {
            return deepMergeWithDefaults(matchingDefault, storedItem);
          }
        }
        return storedItem;
      }) as unknown as T;
    }

    // Voor andere arrays (bijv. tags, foto-urls, steps): behoud de opgeslagen array
    return storedVal as T;
  }

  // Voor primitieve waarden (string, number, boolean): behoud altijd de reeds opgeslagen waarde
  return storedVal as T;
}

/* ---------------------------------------------------------------------------
 * Self-seeding & Lezen
 * ------------------------------------------------------------------------- */

async function seedAll(): Promise<void> {
  await save("users", getSeedUsers());
  await save("siteContent", seedSiteContent);
  await save("services", seedServices);
  await save("news", seedNews);
  await save("knowledge", seedKnowledge);
  await save("bookings", getSeedBookings());
  await save("intakeFields", seedIntakeFields);
  await save("intakeSubmissions", []);
  await save("consentLogs", []);
}

let seedingPromise: Promise<void> | null = null;

function ensureData(): Promise<void> {
  if (!seedingPromise) {
    seedingPromise = seedAll().catch((err) => {
      seedingPromise = null;
      throw err;
    });
  }
  return seedingPromise;
}

/**
 * Leest één collectie:
 * 1. Kijkt eerst in Upstash Redis (indien geconfigureerd en toegestaan).
 * 2. Valt terug op het lokale JSON-bestand in src/data/.
 * 3. Als Redis actief is maar de sleutel ontbrak nog in productie/preview, zaait hij Redis.
 */
async function tryRead<K extends keyof Database>(key: K): Promise<Database[K] | null> {
  const redis = getRedisClient();
  const prefix = getRedisKeyPrefix();

  // 1. Probeer Upstash Redis
  if (redis) {
    try {
      const data = await redis.get<Database[K] | string>(`${prefix}${key}`);
      if (data !== null && data !== undefined) {
        if (typeof data === "string") {
          try {
            return JSON.parse(data) as Database[K];
          } catch {
            return data as unknown as Database[K];
          }
        }
        return data as Database[K];
      }
    } catch (err) {
      console.error(`[db.ts] Fout bij ophalen van ${prefix}${key} uit Upstash Redis:`, err);
    }
  }

  // 2. Val terug naar het lokale JSON-bestand in src/data/
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, FILES[key]), "utf-8");
    const parsed = JSON.parse(raw) as Database[K];

    // Alleen in productie/preview initialiseren als de sleutel nog ontbreekt (nooit lokaal)
    if (redis && getAppEnvironment() !== "development") {
      redis.set(`${prefix}${key}`, parsed).catch((err) => {
        console.error(`[db.ts] Kon standaarddata voor ${key} niet in Redis zetten:`, err);
      });
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Leest één collectie, b.v. await get("services") of await get("siteContent").
 */
export async function get<K extends keyof Database>(key: K): Promise<Database[K]> {
  const direct = await tryRead(key);
  if (direct !== null) return withDefaults(key, direct);

  // Bestand/sleutel ontbreekt (bv. verse installatie)
  const users = await tryRead("users");
  if (users === null || (Array.isArray(users) && users.length === 0)) {
    await ensureData();
    const retried = await tryRead(key);
    if (retried !== null) return withDefaults(key, retried);
  }
  return withDefaults(key, defaults[key]);
}

/**
 * Combineert de opgeslagen waarden met de standaardwaarden uit src/data/.
 * Zo blijft een bestaande store werken wanneer er later nieuwe velden aan de
 * standaarddata toegevoegd worden — zonder reeds opgeslagen teksten te overschrijven.
 */
function withDefaults<K extends keyof Database>(key: K, value: Database[K]): Database[K] {
  // Alleen content- en configuratiecollecties worden gemerged met standaardwaarden.
  // Runtime data (gebruikers, boekingen, formulierinzendingen, cookie-logs)
  // mag NOOIT gemerged worden met defaults om data- en wachtwoordverlies te voorkomen.
  const contentKeys: (keyof Database)[] = [
    "siteContent",
    "services",
    "news",
    "knowledge",
    "intakeFields",
  ];

  let merged = value;
  if (contentKeys.includes(key)) {
    const defaultVal = defaultStore[key];
    if (defaultVal !== undefined && defaultVal !== null) {
      merged = deepMergeWithDefaults(defaultVal, value);
    }
  }

  if (key === "users") {
    // Zorg ervoor dat het eigenaarsaccount (info@waisely.biz) bij deploy automatisch
    // de rol "superadmin" krijgt zonder enig gegevensverlies. Het wachtwoord wordt NOOIT aangeraakt.
    const users = (value as Database["users"]) ?? [];
    let migrated = false;
    const updatedUsers = users.map((u) => {
      if (
        u.email.toLowerCase().trim() === "info@waisely.biz" &&
        u.role !== "superadmin"
      ) {
        migrated = true;
        return { ...u, role: "superadmin" as const };
      }
      return u;
    });

    if (migrated) {
      // Direct wegschrijven zodat Redis/store permanent de geüpdatete rol heeft
      save("users", updatedUsers).catch((err) => {
        console.error("[db.ts] Kon superadmin-migratie niet wegschrijven:", err);
      });
      return updatedUsers as unknown as Database[K];
    }
    return users as unknown as Database[K];
  }

  return merged;
}

/**
 * Overschrijft één collectie, b.v. await save("services", lijst).
 * - Schrijft naar Upstash Redis indien geconfigureerd en toegestaan.
 * - Schrijft in lokale ontwikkeling (en als Redis niet actief is) veilig naar disk.
 * - Schrijft in productie NOOIT naar het bestandssysteem.
 * - Schrijft vanuit lokaal ontwikkelen NOOIT naar de productie-database.
 */
export async function save<K extends keyof Database>(
  key: K,
  value: Database[K]
): Promise<void> {
  const redis = getRedisClient();
  const prefix = getRedisKeyPrefix();

  // 1. Schrijf naar Upstash Redis indien actief (in dev enkel bij ENABLE_DEV_REDIS="true", met prefix waisely:dev:)
  if (redis) {
    try {
      await redis.set(`${prefix}${key}`, value);
    } catch (err) {
      console.error(`[db.ts] Kon ${key} niet wegschrijven naar Upstash Redis:`, err);
      throw new Error(`Kon ${key} niet opslaan in de database.`);
    }
  }

  // 2. Schrijf naar het lokale bestand (ALLEEN in development en wanneer Redis niet gebruikt wordt).
  // Schrijf in productie NOOIT naar het bestandssysteem (Vercel serverless read-only).
  const inProd = isProductionEnvironment();
  if (!inProd && !redis) {
    try {
      const fullPath = path.join(DATA_DIR, FILES[key]);
      await fs.mkdir(DATA_DIR, { recursive: true });
      const tmp = `${fullPath}.${Date.now()}.${Math.random()
        .toString(36)
        .slice(2, 8)}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf-8");
      await fs.rename(tmp, fullPath);
    } catch (err) {
      console.warn(`[db.ts] Lokale bestandswrite mislukt voor ${key}:`, err);
    }
  } else if (inProd && !redis) {
    console.warn(
      `[db.ts] Let op: ${key} kon niet persistent worden opgeslagen omdat Upstash Redis nog niet is geconfigureerd en het bestandssysteem in productie read-only is. Koppel Upstash Redis in Vercel om persistentie in te schakelen.`
    );
  }
}

/**
 * Expliciete "zorg dat de store bestaat"-helper (idempotent).
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
