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

/** Rollen binnen het accountsysteem: reguliere gebruiker, admin en de superadmin (eigenaar). */
export type Role = "user" | "admin" | "superadmin";

/** Een account (leerkracht/school, admin of superadmin). */
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
  /** Versie van sessie-tokens; wordt opgehoogd bij wachtwoordwijziging om andere actieve sessies in te trekken. */
  tokenVersion?: number;
}

export interface NavigationLink {
  href: string;
  label: string;
}

export interface NavigationContent {
  links: NavigationLink[];
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface ServicesSectionContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
}

export interface NewsSectionContent {
  eyebrow: string;
  title: string;
  readMoreLabel: string;
  externalLabel: string;
}

export interface BookTrainingContent {
  eyebrow: string;
  title: string;
  description: string;
  contactPrompt: string;
  contactLinkText: string;
  step1Title: string;
  /** Link naar Google Forms intake-vragenlijst */
  googleFormsUrl?: string;
  step2Title: string;
  step2Description: string;
  moduleSelectorCta: string;
  intakeSuccessTitle?: string;
  intakeSuccessMessage?: string;
  bookingEyebrow: string;
  bookingTitle: string;
  bookingDescription: string;
  bookingSteps: string[];
  bookingAccountTitle: string;
  bookingAccountDescription: string;
  bookingSuccessTitle: string;
  bookingSuccessMessage: string;
}

/** Alle bewerkbare teksten/blokken op de publieke site (admin-CMS). */
export interface SiteContent {
  /** Navigatiebalk-links */
  navigation?: NavigationContent;
  /** Key = unieke id van het contentblok, b.v. "hero.title". */
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    stats?: HeroStat[];
    imageUrl?: string;
  };
  intro: {
    title: string;
    body: string;
    badgeText?: string;
  };
  servicesSection?: ServicesSectionContent;
  newsSection?: NewsSectionContent;
  about: {
    eyebrow?: string;
    title: string;
    body: string;
    imageUrl?: string;
    name?: string;
    role?: string;
    highlights: { title: string; body: string }[];
    visionTitle?: string;
    visionBody?: string;
    primaryCtaLabel?: string;
    secondaryCtaLabel?: string;
  };
  why: {
    eyebrow?: string;
    title: string;
    items: { title: string; body: string }[];
  };
  contact: {
    eyebrow?: string;
    title: string;
    body: string;
    email: string;
    phone: string;
    address: string;
    formTitle?: string;
    formSubtitle?: string;
    formSubmitLabel?: string;
    formSuccessMessage?: string;
  };
  footer: {
    tagline: string;
    instagramUrl: string;
    socialEmail: string;
    copyrightText?: string;
    linkedinUrl?: string;
    companyNumber?: string;
    /** Impressum: naam van de onderneming / handelsnaam. */
    companyName?: string;
    /** Impressum: adres van de (vestigings)plaats. */
    legalAddress?: string;
    /** Impressum: btw-nummer of vermelding "niet btw-plichtig / vrijgesteld". */
    vatNumber?: string;
  };
  bookTraining: BookTrainingContent;
  /** Alles wat op de /pers-pagina staat (teksten, reviews, Instagram-posts). */
  press: PressContent;
  /** Algemene voorwaarden pagina */
  terms?: LegalPageContent;
  /** Privacyverklaring pagina */
  privacy?: LegalPageContent;
  /** Cookieverklaring pagina + teksten van de cookiebanner */
  cookiePolicy?: CookiePolicyContent;
}

/** Eén rij in de cookietabel op /cookieverklaring. */
export interface CookieRow {
  id: string;
  name: string;
  purpose: string;
  duration: string;
  provider: string;
  /** Soort cookie, b.v. "Strikt noodzakelijk" of "Social media (na toestemming)". */
  category: string;
}

/** Cookieverklaring + bewerkbare teksten van de cookiebanner. */
export interface CookiePolicyContent extends LegalPageContent {
  cookies: CookieRow[];
  bannerTitle: string;
  bannerBody: string;
  /** Label en uitleg van de categorie "social media / externe inhoud". */
  socialLabel: string;
  socialDescription: string;
}

/** Eén paragraaf/sectie op een juridische pagina (algemene voorwaarden / privacy). */
export interface LegalSection {
  id: string;
  title: string;
  body: string;
}

/** Inhoud van een juridische pagina. */
export interface LegalPageContent {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  sections: LegalSection[];
}

/** Eén review/ervaring van een deelnemer (getoond op /pers). */
export interface Review {
  id: string;
  name: string;
  /** Functie/school, b.v. "Leerkracht Engels, 3de graad". */
  role: string;
  text: string;
  /** false = verborgen op de site (blijft bewaard in het admin-paneel). */
  visible: boolean;
}

/**
 * Een Instagram-post die via de officiële Instagram-embed getoond wordt.
 * Alleen de (genormaliseerde) post-URL is nodig — geen API-key.
 */
export interface InstagramPost {
  id: string;
  /** Genormaliseerde permalink, b.v. https://www.instagram.com/p/ABC123/ */
  url: string;
  /** Optionele interne notitie (alleen zichtbaar in admin). */
  note?: string;
  visible: boolean;
}

/** Bewerkbare inhoud van de /pers-pagina. */
export interface PressContent {
  eyebrow: string;
  title: string;
  intro: string;
  reviewsTitle: string;
  reviews: Review[];
  pressTitle: string;
  instagramTitle: string;
  instagramSubtitle: string;
  instagramButtonLabel: string;
  /** Profiel-URL voor de "Volg op Instagram"-knop. Leeg = footer-URL. */
  instagramProfileUrl: string;
  instagramPosts: InstagramPost[];
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
  /** Optioneel gekoppelde gebruikers-id (indien ingelogd bij insturen). */
  userId?: string;
  /** ISO-datum van het insturen. */
  submittedAt: string;
  /** Key-value paren: veld-id → antwoord (string of string[]). */
  answers: Record<string, string | string[]>;
}

/**
 * Bewijs van een cookiekeuze (zie /api/consent). Bevat bewust géén IP-adres
 * of andere identificerende gegevens: enkel een willekeurige id die ook in de
 * consent-cookie van de bezoeker staat, zodat een keuze aantoonbaar is.
 */
export interface ConsentRecord {
  /** Willekeurige id, identiek aan de id in de cookie "waisely_consent". */
  consentId: string;
  /** Versie van de cookieverklaring/banner waarop de keuze betrekking heeft. */
  version: number;
  /** Keuze per (niet strikt noodzakelijke) categorie. */
  categories: Record<string, boolean>;
  /** Hoe de keuze gemaakt werd. */
  method: "accept_all" | "reject_all" | "custom";
  /** ISO-tijdstip (server) van registratie. */
  recordedAt: string;
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
  consentLogs: ConsentRecord[];
}
