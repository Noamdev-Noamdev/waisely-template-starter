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
import {
  getSeedUsers,
  getSeedBookings,
  seedSiteContent,
  seedServices,
  seedNews,
  seedKnowledge,
  seedIntakeFields,
} from "./seed";
import type { Database, SiteContent } from "./types";

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

/** Fallbackwaarden voor lege/ontbrekende stores (zodat de site altijd start). */
const defaults: Database = {
  users: [] as Database["users"],
  siteContent: seedSiteContent,
  services: [] as Database["services"],
  news: [] as Database["news"],
  bookings: [] as Database["bookings"],
  knowledge: [] as Database["knowledge"],
  intakeFields: [] as Database["intakeFields"],
  intakeSubmissions: [] as Database["intakeSubmissions"],
  consentLogs: [] as Database["consentLogs"],
};

/** Productie-check: op Vercel of in production mag nooit naar het bestandssysteem geschreven worden. */
export function isProductionEnvironment(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.VERCEL_ENV)
  );
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
 * 1. Kijkt eerst in Upstash Redis (indien geconfigureerd).
 * 2. Valt terug op het lokale JSON-bestand in src/data/.
 * 3. Als Redis actief is maar de sleutel ontbrak nog, zaait hij Redis direct
 *    met de standaardinhoud, zodat toekomstige updates in Redis bewaard blijven.
 */
async function tryRead<K extends keyof Database>(key: K): Promise<Database[K] | null> {
  const redis = getRedisClient();

  // 1. Probeer Upstash Redis
  if (redis) {
    try {
      const data = await redis.get<Database[K] | string>(`waisely:${key}`);
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
      console.error(`[db.ts] Fout bij ophalen van waisely:${key} uit Upstash Redis:`, err);
    }
  }

  // 2. Val terug naar het lokale JSON-bestand in src/data/
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, FILES[key]), "utf-8");
    const parsed = JSON.parse(raw) as Database[K];

    // Als Redis actief is maar nog geen data had voor deze sleutel, initialiseer Redis
    if (redis) {
      redis.set(`waisely:${key}`, parsed).catch((err) => {
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
 * Vult ontbrekende siteContent-onderdelen aan met de seed-standaard.
 * Zo blijft een bestaande siteContent in Redis werken wanneer er later nieuwe
 * onderdelen aan SiteContent toegevoegd worden — zonder bestaande teksten te overschrijven.
 */
function withDefaults<K extends keyof Database>(key: K, value: Database[K]): Database[K] {
  if (key === "siteContent") {
    if (!value) return seedSiteContent as unknown as Database[K];
    const stored = value as Database["siteContent"];
    const merged = { ...seedSiteContent } as Record<string, unknown>;
    for (const section of Object.keys(seedSiteContent) as (keyof SiteContent)[]) {
      merged[section] = { ...seedSiteContent[section], ...(stored[section] ?? {}) };
    }
    return merged as unknown as Database[K];
  }

  if (key === "users") {
    // Zorg ervoor dat het eigenaarsaccount (info@waisely.biz) bij deploy automatisch
    // de rol "superadmin" krijgt zonder enig gegevensverlies.
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
  }

  return value;
}

/**
 * Overschrijft één collectie, b.v. await save("services", lijst).
 * - Schrijft naar Upstash Redis indien geconfigureerd.
 * - Schrijft in lokale ontwikkeling (en als Redis niet actief is) ook naar disk.
 * - Schrijft in productie NOOIT naar het bestandssysteem.
 */
export async function save<K extends keyof Database>(
  key: K,
  value: Database[K]
): Promise<void> {
  const redis = getRedisClient();

  // 1. Schrijf naar Upstash Redis indien actief
  if (redis) {
    try {
      await redis.set(`waisely:${key}`, value);
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
