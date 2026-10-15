# WAIsely — Deployment Handleiding (Cloudflare Workers & Google Business)

Deze handleiding legt stap-voor-stap uit hoe je de WAIsely website deployt naar Cloudflare Workers en je Google Business domein (`waisely.biz`) koppelt, **zonder dat je Google Business e-mail onderbroken wordt**.

---

## 1. Voorbereiding & Cloudflare Account

1. Maak een gratis account aan op [Cloudflare.com](https://dash.cloudflare.com/sign-up) (als je dat nog niet hebt).
2. Log lokaal in op Cloudflare via je terminal:
   ```bash
   npx wrangler login
   ```
   Er opent een browservenster waarin je Cloudflare toestemming geeft.

---

## 2. Cloudflare KV Database Aanmaken (voor live content & accounts)

Cloudflare KV bewaart live CMS-wijzigingen, accounts en boekingen.

Voer in de terminal uit:
```bash
pnpm run cf:kv-create
```
Je krijgt een uitvoer zoals deze te zien:
```bash
[[kv_namespaces]]
binding = "KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```
Kopieer dat `id` en voeg het toe aan [wrangler.json](file:///home/noam/Projects/Site_WAIsely/waisely-template-starter/wrangler.json):
```json
{
  "name": "waisely-site",
  "main": ".open-next/worker.js",
  "compatibility_date": "2024-12-30",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "JOUW_GEKOPIEERDE_KV_ID_HIER"
    }
  ],
  "vars": {
    "SESSION_SECRET": "d511f3e59cb0207808e7ef8eb0097ac37e064d85142f29c746e37d3649c22d9e",
    "ADMIN_EMAIL": "info@waisely.biz"
  }
}
```

---

## 3. Website Deployen naar Cloudflare

Bouw en deploy het project met één commando:
```bash
pnpm run cf:deploy
```
Wrangler bouwt de Next.js applicatie en uploadt deze naar Cloudflare. Na afronding toont de terminal een URL zoals:
`https://waisely-site.<jouw-cloudflare-subdomein>.workers.dev`

Je kunt de site nu direct bezoeken en testen!

---

## 4. Google Business Domein (`waisely.biz`) Koppelen

Omdat je e-mail via Google Workspace / Business loopt, is het belangrijk dat de **MX-records (mail)** intact blijven en alleen het **webverkeer (A/CNAME)** naar Cloudflare wijst.

### Methode A: Custom Domain toevoegen in Cloudflare Workers (Aanbevolen)
1. Ga in het [Cloudflare Dashboard](https://dash.cloudflare.com/) naar **Workers & Pages**.
2. Klik op je worker **`waisely-site`**.
3. Ga naar het tabblad **Settings** → **Domains & Routes**.
4. Klik op **Add** → **Custom Domain**.
5. Vul `waisely.biz` in (en herhaal eventueel voor `www.waisely.biz`).
6. Cloudflare geeft je de exacte DNS-records die je moet instellen bij de registrar van je domein (bijvoorbeeld Google Domains / Squarespace).

### Methode B: DNS instellingen controleren bij Google Domains
Controleer in het beheerpaneel van je domein:
- **Webverkeer:** CNAME-record voor `www` of A-record voor het hoofddomein verwijst naar Cloudflare.
- **E-mailverkeer (NIET wijzigen):** De Google Workspace MX-records moeten behouden blijven:
  - `ASPMX.L.GOOGLE.COM` (Prioriteit 1)
  - `ALT1.ASPMX.L.GOOGLE.COM` (Prioriteit 5)
  - `ALT2.ASPMX.L.GOOGLE.COM` (Prioriteit 5)
  - `ALT3.ASPMX.L.GOOGLE.COM` (Prioriteit 10)
  - `ALT4.ASPMX.L.GOOGLE.COM` (Prioriteit 10)
  *(Hierdoor blijft je Google Business mail 100% ononderbroken werken).*

---

## 5. Inloggen op het Productie Admin-Dashboard

Zodra de site live staat op `https://waisely.biz`:
1. Navigeer naar `https://waisely.biz/login`.
2. Log in met:
   - **E-mail:** `info@waisely.biz`
   - **Wachtwoord:** `WAIsely2026!`
3. Je hebt direct toegang tot het volledige admin dashboard (`/admin`), waar je teksten, de Google Forms link, recensies en instellingen live kunt beheren.
4. *Tip:* Wijzig je wachtwoord direct na de eerste login via het dashboard.
