# WAIsely — Deployment Handleiding (Vercel & Google Business)

Deze handleiding legt stap-voor-stap uit hoe je de WAIsely website deployt naar Vercel met Upstash Redis en je Google Business domein (`waisely.biz`) koppelt, **zonder dat je Google Business e-mail onderbroken wordt**.

---

## 1. Project Deployen naar Vercel

1. Zorg dat je code op GitHub staat in een repository.
2. Ga naar [Vercel.com](https://vercel.com/) en log in.
3. Klik op **Add New…** → **Project**.
4. Importeer de repository van WAIsely.
5. Kies als framework preset **Next.js** (dit herkent Vercel automatisch).

---

## 2. Upstash Redis Databank Koppelen

Voor het bewaren van live CMS-teksten, afbeeldingen, accounts, boekingen en intake-formulieren gebruikt de site Upstash Redis.

### Methode A: Direct via de Vercel Marketplace (Aanbevolen)
1. Ga in je Vercel project naar het tabblad **Storage**.
2. Klik op **Connect Database** → selecteer **Upstash** (of Vercel KV / Redis).
3. Kies de gratis tier (Free / Hobby).
4. Vercel voegt de benodigde variabelen (`UPSTASH_REDIS_REST_URL` en `UPSTASH_REDIS_REST_TOKEN`) automatisch toe aan je omgeving!

### Methode B: Zelf aanmaken op Upstash.com
1. Maak een gratis database aan op [console.upstash.com](https://console.upstash.com/).
2. Kopieer de `UPSTASH_REDIS_REST_URL` en `UPSTASH_REDIS_REST_TOKEN` (REST API).
3. Voeg deze toe in Vercel onder **Settings** → **Environment Variables**.

---

## 3. Omgevingsvariabelen (Environment Variables)

Stel onder **Settings** → **Environment Variables** in Vercel de volgende variabelen in voor **Production** (en eventueel **Preview**):

| Variabele | Waarde / Uitleg |
| :--- | :--- |
| `SESSION_SECRET` | Een lange willekeurige geheime tekenreeks (bv. 64 tekens) voor veilige sessie-cookies |
| `ADMIN_EMAIL` | `info@waisely.biz` |
| `ADMIN_PASSWORD` | Jouw initiële beheerwachtwoord (alleen gebruikt bij de eerste start) |
| `UPSTASH_REDIS_REST_URL` | Automatisch ingevuld via Storage, of handmatig van Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | Automatisch ingevuld via Storage, of handmatig van Upstash |

*Zie ook `.env.example` in de repository voor een overzicht van alle variabelen.*

---

## 4. Google Business Domein (`waisely.biz`) Koppelen

Omdat je zakelijke e-mail via Google Workspace / Google Domains loopt, moeten de **MX-records (mail) onaangeroerd blijven** en mag alleen het **webverkeer (A/CNAME)** naar Vercel wijzen.

### Stap 4.1: Domein toevoegen in Vercel
1. Ga in je Vercel project naar **Settings** → **Domains**.
2. Vul in: `waisely.biz` (en voeg ook `www.waisely.biz` toe).
3. Vercel toont de benodigde DNS-records:
   - **A-record** voor `@` (apex domein) wijzend naar `76.76.21.21`
   - **CNAME-record** voor `www` wijzend naar `cname.vercel-dns.com`

### Stap 4.2: DNS Instellen bij je registrar (bv. Squarespace / Google Domains)
Controleer in het beheerpaneel van je domein:
- **Webverkeer:** Stel het A-record en CNAME in conform de Vercel instructies.
- **E-mailverkeer (NIET wijzigen):** Behoud altijd de bestaande Google Workspace MX-records:
  - `ASPMX.L.GOOGLE.COM` (Prioriteit 1)
  - `ALT1.ASPMX.L.GOOGLE.COM` (Prioriteit 5)
  - `ALT2.ASPMX.L.GOOGLE.COM` (Prioriteit 5)
  - `ALT3.ASPMX.L.GOOGLE.COM` (Prioriteit 10)
  - `ALT4.ASPMX.L.GOOGLE.COM` (Prioriteit 10)
  *(Hierdoor blijft je Google Business e-mail 100% ononderbroken werken).*

---

## 5. Inloggen op het Productie Admin-Dashboard

Zodra de site live staat op `https://waisely.biz`:
1. Navigeer naar `https://waisely.biz/login`.
2. Log in met:
   - **E-mail:** `info@waisely.biz`
   - **Wachtwoord:** Het ingestelde `ADMIN_PASSWORD` (standaard `WAIsely2026!`)
3. Je hebt direct toegang tot het volledige dashboard (`/admin`), waar je teksten, modules, nieuws, formulieren en accountgegevens live kunt beheren.
4. **Wachtwoord wijzigen:** Ga naar **Account** in het dashboard om je wachtwoord direct te personaliseren. Dit wachtwoord wordt veilig opgeslagen in Redis en wordt bij latere deployments of herstarts nooit meer overschreven.

---

## 6. Back-up & Restore van Productie-Data

De repository bevat een ingebouwd back-upscript (`scripts/db-backup.mjs`):

### Back-up maken (100% veilig & read-only):
Exporteert alle live gegevens (content, accounts, boekingen, formulieren) naar een JSON-bestand:
```bash
UPSTASH_REDIS_REST_URL="<jouw_url>" UPSTASH_REDIS_REST_TOKEN="<jouw_token>" pnpm run db:export
```
Het bestand wordt opgeslagen in `backups/backup-<datum>.json`.

### Back-up herstellen:
Vereist de vlag `--confirm` zodat data nooit per ongeluk overschreven kan worden:
```bash
UPSTASH_REDIS_REST_URL="<jouw_url>" UPSTASH_REDIS_REST_TOKEN="<jouw_token>" node scripts/db-backup.mjs import --file=backups/backup-2026-10-16.json --confirm
```
