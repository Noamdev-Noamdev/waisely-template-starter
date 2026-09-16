# WAIsely — Websitetemplate voor een freelance AI-trainer

> **Dit is een TEMPLATE, geen productiesite.** Alle content bestaat uit
> duidelijke placeholders (`[zoals deze]`) die later door het echte bedrijf
> worden ingevuld. De structuur, het accountsysteem, het dashboard en het
> admin-paneel zijn volledig functioneel en bedoeld om hergebruikt te worden
> voor vergelijkbare coaching-/consultancybedrijven.

## Wat zit erin?

| Onderdeel | Waar | Korte omschrijving |
|---|---|---|
| Publieke site | `/` | Hero, intro, diensten, "waarom", over, nieuws/pers, contact + footer |
| Account-systeem | `/login`, `/register` | Rollen: `user` (leerkrachten/scholen) en `admin` |
| Gebruikersdashboard | `/dashboard` | Overzicht aanvragen + kennisbank (alleen ingelogd) |
| Boekingsflow | `/boeken` | Workshop/webinar op maat aanvragen |
| Admin-paneel | `/admin` | Content-CMS, aanvragen, kennisbank, nieuws, gebruikers |
| Bewerkmodus-balk | op `/` | Herkenbare admin-indicator met snelkoppelingen |

## Snel starten

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

De JSON-store in `src/data/` wordt bij de **eerste start automatisch gevuld**
met startdata (accounts, placeholder-content, voorbeeldboekingen).

### Template-accounts

| Rol | E-mail | Wachtwoord |
|---|---|---|
| Admin | `admin@waisely.be` | `waisely-admin` |
| Gebruiker (demo) | `demo@waisely.be` | `waisely-demo` |

> Verwijder het blok "Template-accounts" onder het loginformulier
> (`src/app/login/page.tsx`) vóór productie.

### Productie-build

```bash
pnpm build && pnpm start
```

Zet ook een `.env.local` op basis van `.env.example` (admin-gegevens +
`SESSION_SECRET`, zie hieronder).

---

## Architectuur

```
src/
├── app/                      # App Router-pagina's + API-routes
│   ├── page.tsx              # Publieke homepage (alle secties)
│   ├── login/ register/      # Auth-pagina's
│   ├── boeken/               # Boekingsflow
│   ├── dashboard/            # Gebruikersdashboard (auth vereist)
│   ├── admin/                # Admin-paneel (admin-rol vereist)
│   │   ├── layout.tsx        #   ← beveiliging + sidebar-layout
│   │   ├── content/          #   teksten, diensten, waarom, contact
│   │   ├── aanvragen/        #   boekingen & contactformulier-berichten
│   │   ├── kennisbank/ nieuws/ gebruikers/
│   └── api/                  # auth, bookings, contact, admin/*
├── components/
│   ├── site/                 # Publieke secties (Hero, Services, ...)
│   ├── admin/                # Admin-panelen (ContentForm, *Manager, ...)
│   ├── dashboard/           # Kennisbanklijst
│   ├── auth/                 # Login-/registerformulieren
│   ├── layout/               # Navbar, Footer
│   └── ui/                   # Icon, Button, Field, Badge, Reveal
├── lib/
│   ├── db.ts                 # JSON-store (mini-ORM: get/save per collectie)
│   ├── auth.ts               # Stateless sessies (HMAC-cookie) + guards
│   ├── seed.ts               # Startdata & placeholder-content
│   ├── types.ts              # Alle datamodellen (database-schema)
│   ├── siteConfig.ts         # Bedrijfsnaam, navigatie, vaste teksten
│   └── format.ts             # Datumformaten e.d.
└── data/                     # De "database" (één JSON-bestand per collectie)
```

### Datalaag (src/lib/db.ts)

Zes collecties in JSON-bestanden: `users`, `siteContent`, `services`,
`news`, `bookings`, `knowledge`. De API (`get("...")` / `save("...", ...)`)
is bewust opgebouwd als mini-ORM.

**Waarom JSON?** De template moet zonder database-keys draaien. Bij migratie
naar Supabase/Prisma vervang je alleen `db.ts` door echte queries; alle
routes, formulieren en componenten blijven ongewijzigd. De types in
`types.ts` dienen direct als tabel-schema.

**Let op bij productie:**
- JSON-files zijn niet geschikt voor meerdere server-instanties of hoge load
  → vervang de laag vóór echte lancering.
- `src/data/` hóort in git (startdata); voeg echte productie-gegevens liever
  toe via een echte database.

### Authenticatie (src/lib/auth.ts)

Stateless sessies in een httpOnly-cookie: de payload (userId, rol, verval)
wordt HMAC-ondertekend en bij elke request opnieuw tegen de store
geverifieerd. Wachtwoorden: bcrypt. Beveiligingsgardes:
- `getCurrentUser()` — huidige gebruiker of `null`
- `requireAdmin()` — alleen geldig met rol `admin`
- Rolwijzigingen/verwijderingen gelden direct (cookie bevat geen autoriteit).

**Vervangen door Supabase Auth / Auth.js:** zie het kopcommentaar in
`auth.ts`. De UI, guards en flows blijven identiek.

### Admin-/bewerkmodus

Eén admin-rol, geen losstaand systeem:
- Op de publieke site verschijnt een gele **bewerkmodus-balk** met
  snelkoppelingen (`AdminBanner.tsx`).
- Het admin-paneel (`/admin`) deelt dezelfde store: opgeslagen wijzigingen
  zijn direct op de publieke pagina's zichtbaar.
- Bewerkbaar: hero/intro-teksten, diensten, waarom-checklist, over-sectie,
  contactgegevens, nieuws, kennisbank, footer.
- Gebruikersbeheer beschermt tegen self-lockout (eigen admin-rol kan niet
  worden weggenomen / verwijderd).

### Design

- Design-tokens in `globals.css` (`:root`) — rebranden = enkel dat blok
  aanpassen; componenten gebruiken uitsluitend tokens.
- Rustig professioneel palet (warm wit + diep petrol), géén neon/cyberpunk.
- Gelaagde secties, subtiele schaduwen (`--shadow-*`), scroll-reveal
  animaties (`Reveal.tsx`), hover-micro-interacties, `prefers-reduced-motion`
  gerespecteerd.
- Volledig responsive (navbar → hamburgermenu; tabellen → kaarten).

---

## Template aanpassen voor een ander bedrijf

1. **Bedrijfsnaam/navigatie** — `src/lib/siteConfig.ts`
2. **Kleuren/typografie** — `:root`-blok in `src/app/globals.css`
3. **Placeholder-content** — `src/lib/seed.ts` (of bewerk live via `/admin`)
4. **Data-velden uitbreiden** — `src/lib/types.ts` (schema) + desbetreffende
   sectiecomponent
5. **Nieuwe publieke sectie** — component in `src/components/site/` +
   toevoegen aan `src/app/page.tsx` (en eventueel aan het admin-formulier in
   `ContentForm.tsx`)

## Belangrijkste scripts

```bash
pnpm dev     # ontwikkelen (hot reload)
pnpm build   # productiebuild (type-checkt ook)
pnpm start   # productieserver
pnpm lint    # ESLint
```

## Environment variables

Zie `.env.example`:

| Variabele | Doel |
|---|---|
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin-account bij eerste seed |
| `SESSION_SECRET` | HMAC-geheim voor sessie-cookies (prod: `openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | canonical/OG-URL |

## Bekende template-beperkingen (bewust)

- JSON-store: geen multi-instance/concurrentie-garanties → vervang vóór
  productie (zie "Datalaag").
- Geen e-mailverzending: het contactformulier slaat berichten op als
  aanvraag; koppel later Resend/SendGrid in `/api/contact`.
- Geen rate limiting / wachtwoord-reset: bewust buiten scope van de template.
- Uploads: kennisbank-items zijn links/URL's; echte file-uploads zijn een
  logische eerste uitbreiding.
