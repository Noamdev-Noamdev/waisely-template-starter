#!/usr/bin/env node

/**
 * ---------------------------------------------------------------------------
 * WAIsely Database Backup & Restore Tool
 * ---------------------------------------------------------------------------
 * Gebruik:
 *   Exporteren (Veilig & Read-Only):
 *     node scripts/db-backup.mjs export [--out=pad/naar/backup.json] [--prefix=waisely:]
 *
 *   Importeren (Herstellen):
 *     node scripts/db-backup.mjs import --file=pad/naar/backup.json --confirm [--prefix=waisely:]
 * ---------------------------------------------------------------------------
 */

import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

// Laad optioneel variabelen uit .env, .env.local of .env.production.local
function loadEnvFiles() {
  const envFiles = [".env.production.local", ".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch {
        // negeer
      }
    }
  }
}

loadEnvFiles();

const COLLECTIONS = [
  "users",
  "siteContent",
  "services",
  "news",
  "bookings",
  "knowledge",
  "intakeFields",
  "intakeSubmissions",
  "consentLogs",
];

// Parseer command-line argumenten
const args = process.argv.slice(2);
const command = args[0];

function getArgValue(name, defaultVal = undefined) {
  const prefix = `--${name}=`;
  const found = args.find((a) => a.startsWith(prefix));
  if (found) return found.slice(prefix.length);
  return defaultVal;
}

const hasFlag = (name) => args.includes(`--${name}`);

const url =
  getArgValue("url") ||
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL;

const token =
  getArgValue("token") ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN;

const prefix = getArgValue("prefix", process.env.REDIS_KEY_PREFIX || "waisely:");

function printHelp() {
  console.log(`
WAIsely Database Back-up & Restore Utility

Gebruik:
  pnpm run db:export [opties]
  pnpm run db:import --file=<pad> --confirm [opties]

Commando's:
  export                      Exporteert alle productiedata uit Redis naar JSON (100% read-only)
  import                      Herstelt data vanuit een JSON-bestand naar Redis (vereist --confirm)

Opties:
  --out=<pad>                 Pad voor het exportbestand (standaard: backups/backup-<datum>.json)
  --file=<pad>                Pad naar het te importeren back-upbestand
  --prefix=<prefix>           Sleutelprefix in Redis (standaard: "waisely:")
  --confirm                   Veiligheidsbevestiging om import daadwerkelijk uit te voeren
  --url=<url>                 Upstash Redis REST URL (overschrijft env)
  --token=<token>             Upstash Redis REST Token (overschrijft env)

Voorbeelden:
  # Exporteren van productie (volledig veilig & read-only):
  UPSTASH_REDIS_REST_URL=https://... UPSTASH_REDIS_REST_TOKEN=... node scripts/db-backup.mjs export

  # Importeren naar test/productie:
  node scripts/db-backup.mjs import --file=backups/backup-2026-10-16.json --confirm
`);
}

async function runExport() {
  if (!url || !token) {
    console.error("Fout: UPSTASH_REDIS_REST_URL en UPSTASH_REDIS_REST_TOKEN zijn vereist.");
    console.error("Stel deze in als omgevingsvariabelen of geef ze mee via --url=... en --token=...");
    process.exit(1);
  }

  const redis = new Redis({ url, token });
  console.log(`Verbinden met Redis (${url.replace(/:\/\/.*@/, "://***@")})...`);
  console.log(`Prefix: "${prefix}"`);

  const backupData = {
    _meta: {
      exportedAt: new Date().toISOString(),
      prefix,
      collections: COLLECTIONS,
    },
    data: {},
  };

  console.log("\nData ophalen (read-only):");
  for (const coll of COLLECTIONS) {
    const redisKey = `${prefix}${coll}`;
    try {
      const val = await redis.get(redisKey);
      let parsed = val;
      if (typeof val === "string") {
        try {
          parsed = JSON.parse(val);
        } catch {
          parsed = val;
        }
      }
      backupData.data[coll] = parsed;
      const count = Array.isArray(parsed) ? `${parsed.length} items` : parsed ? "aanwezig" : "leeg";
      console.log(`  ✓ ${redisKey.padEnd(28)} -> ${count}`);
    } catch (err) {
      console.error(`  ✗ Fout bij ophalen van ${redisKey}:`, err.message);
      backupData.data[coll] = null;
    }
  }

  const defaultFileName = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const outPath = getArgValue("out", path.join("backups", defaultFileName));
  const fullOutPath = path.resolve(process.cwd(), outPath);

  fs.mkdirSync(path.dirname(fullOutPath), { recursive: true });
  fs.writeFileSync(fullOutPath, JSON.stringify(backupData, null, 2), "utf-8");

  console.log(`\nSucces! Back-up veilig opgeslagen in:\n-> ${fullOutPath}\n`);
}

async function runImport() {
  const filePath = getArgValue("file");
  if (!filePath) {
    console.error("Fout: Geef een bestand op met --file=pad/naar/backup.json");
    process.exit(1);
  }

  if (!hasFlag("confirm")) {
    console.error("\nVeiligheidswaarschuwing:");
    console.error("Importeren overschrijft gegevens in de opgegeven database.");
    console.error("Voeg het vlaggetje --confirm toe als je zeker weet dat je wilt importeren:");
    console.error(`node scripts/db-backup.mjs import --file=${filePath} --confirm\n`);
    process.exit(1);
  }

  if (!url || !token) {
    console.error("Fout: UPSTASH_REDIS_REST_URL en UPSTASH_REDIS_REST_TOKEN zijn vereist.");
    process.exit(1);
  }

  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Fout: Bestand niet gevonden: ${fullPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(fullPath, "utf-8");
  const parsed = JSON.parse(raw);
  const data = parsed.data || parsed;

  const redis = new Redis({ url, token });
  console.log(`Verbinden met Redis (${url.replace(/:\/\/.*@/, "://***@")})...`);
  console.log(`Doel-prefix: "${prefix}"`);
  console.log(`Gegevens importeren uit: ${fullPath}\n`);

  for (const coll of COLLECTIONS) {
    if (coll in data && data[coll] !== null && data[coll] !== undefined) {
      const redisKey = `${prefix}${coll}`;
      await redis.set(redisKey, data[coll]);
      const count = Array.isArray(data[coll]) ? `${data[coll].length} items` : "opgeslagen";
      console.log(`  ✓ ${redisKey.padEnd(28)} -> ${count}`);
    }
  }

  console.log("\nImport succesvol voltooid!\n");
}

if (command === "export") {
  runExport().catch((err) => {
    console.error("Fout tijdens export:", err);
    process.exit(1);
  });
} else if (command === "import") {
  runImport().catch((err) => {
    console.error("Fout tijdens import:", err);
    process.exit(1);
  });
} else {
  printHelp();
}
