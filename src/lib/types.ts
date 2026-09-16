/**
 * ---------------------------------------------------------------------------
 * WAIsely Template — Centrale datamodellen (types.ts)
 * ---------------------------------------------------------------------------
 * Alle entiteiten van de template zijn hier gemodelleerd. Dit is het
 * belangrijkste aanpassingspunt als je de template hergebruikt voor een
 * ander bedrijf: hernoem/vervang velden, en de rest van de code volgt mee
 * (de store, forms en admin-panelen zijn generiek opgezet).
 *
 * Notitie voor productie: deze types beschrijven ook het schema van de
 * JSON-store (src/lib/db/jsonStore.ts). Bij migratie naar Supabase/Prisma
 * map je elk type 1-op-1 op een tabel met dezelfde velden.
 * ---------------------------------------------------------------------------
 */

/** Rollen binnen het accountsysteem. Voeg hier extra rollen toe indien gewenst. */
export type Role = "user" | "admin";

/** Een account (leerkracht/school of admin). */
export interface User {
  id: string;
  email: string;
  /** bcrypt-hash; nooit het plaintext-wachtwoord opslaan. */
  passwordHash: string;
  name: string;
  role: Role;
  /** Naam van school/organisatie (optioneel voor reguliere gebruikers). */
  organization?: string;
  createdAt: string;
}

/** Alle bewerkbare teksten/blokken op de publieke site (admin-CMS). */
export interface SiteContent {
  /** Key = unieke id van het contentblok, b.v. "hero.title". */
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
  intro: {
    title: string;
    body: string;
  };
  about: {
    title: string;
    body: string;
    highlights: { title: string; body: string }[];
  };
  why: {
    title: string;
    items: { title: string; body: string }[];
  };
  contact: {
    title: string;
    body: string;
    email: string;
    phone: string;
    address: string;
  };
  footer: {
    tagline: string;
    instagramUrl: string;
    socialEmail: string;
  };
}

/** Een dienst (workshop/webinar/advies) zoals getoond op de publieke site. */
export interface Service {
  id: string;
  title: string;
  description: string;
  /** Icon-sleutel; zie src/components/ui/Icon.tsx voor beschikbare icons. */
  icon: string;
  duration: string;
  audience: string;
  order: number;
}

/** Artikel of persvermelding in de nieuws/blog-sectie. */
export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  /** ISO-datum; toon met toLocaleDateString("nl-BE"). */
  date: string;
  /** "article" = eigen artikel, "press" = verwijzing naar extern persbericht. */
  type: "article" | "press";
  externalUrl?: string;
}

/**
 * Type aanvraag. "contact" wordt gebruikt door het publieke contactformulier
 * (berichten verschijnen zo bij de admin in hetzelfde overzicht).
 */
export type BookingType = "workshop" | "webinar" | "contact";
/** Status van een aanvraag. "new" ziet de admin als eerste. */
export type BookingStatus = "new" | "confirmed" | "done" | "cancelled";

/** Een aanvraag voor een workshop/webinar (door een gebruiker geboekt). */
export interface Booking {
  id: string;
  userId: string;
  type: BookingType;
  topic: string;
  audience: string;
  date: string;
  participants: string;
  notes: string;
  status: BookingStatus;
  createdAt: string;
}

/** Een materiaal in de kennisbank (enkel zichtbaar voor ingelogde gebruikers). */
export interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  /** Soort bestand; bepaalt het icoon en eventueel uploadgedrag later. */
  kind: "pdf" | "doc" | "link" | "slides" | "video" | "template";
  url: string;
  tag: string;
  order: number;
}

/* ---------------------------------------------------------------------------
 * Intake-formuliersysteem
 * ------------------------------------------------------------------------- */

/** Mogelijke veldtypes in het intake-formulier. */
export type IntakeFieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "select"
  | "radio"
  | "checkbox"
  | "scale";

/** Eén velddefinitie in het intake-formulier (beheert door admin). */
export interface IntakeField {
  id: string;
  /** Sectiekop boven dit veld (optioneel); laat leeg als het veld in dezelfde groep valt. */
  section?: string;
  label: string;
  type: IntakeFieldType;
  /** Opties voor select/radio/checkbox (gescheiden door |). */
  options?: string;
  required: boolean;
  /** Optioneel hulpje onder het veld. */
  help?: string;
  /** Labels voor de uiteinden van een scale (bv. "Geen ervaring|Dagelijks gebruik"). */
  scaleLabels?: string;
  /** Bereik van een scale, bv. "1|5". */
  scaleRange?: string;
  order: number;
}

/** Eén ingevuld intake-formulier (opgeslagen submission). */
export interface IntakeSubmission {
  id: string;
  /** ISO-datum van het insturen. */
  submittedAt: string;
  /** Key-value paren: veld-id → antwoord (string of string[]). */
  answers: Record<string, string | string[]>;
}

/** Volledige databankvorm — één JSON-bestand per entiteit in src/data. */
export interface Database {
  users: User[];
  siteContent: SiteContent;
  services: Service[];
  news: NewsItem[];
  bookings: Booking[];
  knowledge: KnowledgeItem[];
  intakeFields: IntakeField[];
  intakeSubmissions: IntakeSubmission[];
}
