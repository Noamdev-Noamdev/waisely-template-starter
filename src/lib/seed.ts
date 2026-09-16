/**
 * ---------------------------------------------------------------------------
 * WAIsely — Seed & initial data (seed.ts)
 * ---------------------------------------------------------------------------
 */

import bcrypt from "bcryptjs";
import type {
  Booking,
  IntakeField,
  KnowledgeItem,
  NewsItem,
  Service,
  SiteContent,
  User,
} from "./types";
import { save } from "./db";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@waisely.be";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "waisely-admin";
export const DEMO_EMAIL = "demo@waisely.be";
export const DEMO_PASSWORD = "waisely-demo";

export const seedSiteContent: SiteContent = {
  hero: {
    eyebrow: "AI in het onderwijs — met rust en richting",
    title: "Rust in de chaos",
    subtitle:
      "WAIsely begeleidt leerkrachten en scholen bij verantwoord, praktisch AI-gebruik. Via workshops op maat leer je hoe AI je lessen versterkt — zonder de controle te verliezen.",
    primaryCtaLabel: "Bekijk de modules",
    secondaryCtaLabel: "Meer over WAIsely",
  },
  intro: {
    title: "AI hoeft niet overweldigend te zijn",
    body: "Veel leerkrachten voelen de druk om iets met AI te doen, maar weten niet waar te beginnen. WAIsely brengt daar verandering in. Geen technisch jargon, geen hype — wel concrete handvatten die je morgen al in je les kunt gebruiken. Elke training is afgestemd op jouw vak, je leerlingen en je eigen tempo.",
  },
  about: {
    title: "Over WAIsely",
    body: "Achter WAIsely staat Sabrina Carota — leerkracht Engels, taalwetenschapper en AI-enthousiasteling met meer dan 20 jaar ervaring in het onderwijs. Na jarenlang zelf in de klas te staan, weet ze precies waar de uitdagingen liggen. Haar aanpak is altijd praktisch: niet wat AI theoretisch kan, maar hoe jij het morgen in je les inzet.\n\nWAIsely staat voor wijsheid in het gebruik van AI. De naam combineert 'wise' (wijs) met 'AI' — een knipoog naar doordacht, verantwoord gebruik in plaats van blind meegaan in de hype.",
    highlights: [
      {
        title: "20+ jaar onderwijservaring",
        body: "Van secundair tot hoger onderwijs — Sabrina kent de klaspraktijk door en door.",
      },
      {
        title: "Taalwetenschap & taaltechnologie",
        body: "Een unieke achtergrond die de brug slaat tussen taal, technologie en didactiek.",
      },
      {
        title: "Praktijk boven theorie",
        body: "Elke workshop vertrekt vanuit echte lesvoorbeelden, niet vanuit abstracte concepten.",
      },
    ],
  },
  why: {
    title: "Waarom kiezen voor WAIsely?",
    items: [
      {
        title: "Rust in plaats van chaos",
        body: "AI kan overweldigend zijn. WAIsely brengt structuur en duidelijkheid zodat je met vertrouwen aan de slag gaat.",
      },
      {
        title: "Op maat van jouw klas",
        body: "Geen one-size-fits-all. Elke workshop wordt samengesteld op basis van jouw vak, noden en leerlingen.",
      },
      {
        title: "Concrete lesvoorbeelden",
        body: "Je gaat naar huis met kant-en-klare prompts, werkvormen en ideeën die je meteen kunt inzetten.",
      },
      {
        title: "Door een leerkracht, voor leerkrachten",
        body: "Sabrina staat zelf in de klas. Ze begrijpt je uitdagingen en spreekt je taal.",
      },
    ],
  },
  contact: {
    title: "Neem contact op",
    body: "Benieuwd wat WAIsely voor jouw school kan betekenen? Stuur een bericht of plan een vrijblijvend kennismakingsgesprek. Ik denk graag mee over een aanpak op maat.",
    email: "sabrina@waisely.be",
    phone: "+32 486 12 34 56",
    address: "Antwerpen, België",
  },
  footer: {
    tagline: "Verantwoord AI-gebruik in het onderwijs. Rust in de chaos.",
    instagramUrl: "https://www.instagram.com/waisely",
    socialEmail: "sabrina@waisely.be",
  },
};

export const seedServices: Service[] = [
  {
    id: "mod_1",
    title: "AI-basis voor leerkrachten",
    description: "Wat is AI precies, en wat kan het (niet)? Een heldere, jargonvrije introductie met live demo's. Je leert hoe tools als ChatGPT, Copilot en Gemini werken — en waar de valkuilen liggen.",
    icon: "spark",
    duration: "±40 min",
    audience: "Alle leerkrachten",
    order: 1,
  },
  {
    id: "mod_2",
    title: "Prompts schrijven voor de klas",
    description: "Leer effectieve prompts formuleren die echt bruikbare output opleveren voor lesvoorbereiding, differentiatie en evaluatie. Van rubrics tot remediëringsoefeningen.",
    icon: "pen",
    duration: "±40 min",
    audience: "Alle leerkrachten",
    order: 2,
  },
  {
    id: "mod_3",
    title: "AI en taalonderwijs",
    description: "Specifiek voor taaldocenten: hoe zet je AI in bij leesvaardigheid, schrijfopdrachten, woordenschat en grammatica? Met concrete voorbeelden voor Engels, Frans, Nederlands en andere talen.",
    icon: "book",
    duration: "±40 min",
    audience: "Taaldocenten",
    order: 3,
  },
  {
    id: "mod_4",
    title: "AI-beleid op school",
    description: "Hoe formuleer je als school een helder AI-beleid? Wat mag, wat mag niet, en hoe communiceer je dat naar leerlingen en ouders? Met voorbeeldkaders en checklists.",
    icon: "shield",
    duration: "±40 min",
    audience: "Directies & beleidsmakers",
    order: 4,
  },
  {
    id: "mod_5",
    title: "AI-detectie & academische integriteit",
    description: "Hoe herken je AI-gegenereerd werk? Wat werkt wel en niet bij detectie? En hoe ontwerp je opdrachten die AI-fraude moeilijker maken zonder creativiteit te beperken?",
    icon: "eye",
    duration: "±40 min",
    audience: "Alle leerkrachten",
    order: 5,
  },
  {
    id: "mod_6",
    title: "Differentiëren met AI",
    description: "Ontdek hoe AI je kan helpen om effectiever te differentiëren: van aangepaste oefeningen tot gepersonaliseerde feedback. Praktische werkvormen die je meteen kunt inzetten.",
    icon: "layers",
    duration: "±40 min",
    audience: "Alle leerkrachten",
    order: 6,
  },
  {
    id: "mod_7",
    title: "AI voor evaluatie & feedback",
    description: "Gebruik AI als assistent bij het nakijken, opstellen van rubrics en het geven van formatieve feedback. Bespaar tijd zonder aan kwaliteit in te boeten.",
    icon: "check",
    duration: "±40 min",
    audience: "Alle leerkrachten",
    order: 7,
  },
  {
    id: "mod_8",
    title: "Privacy & ethiek in AI",
    description: "Welke data deel je met AI-tools? Wat zijn de ethische implicaties? Een module over verantwoord gebruik, GDPR-compliance en kritisch denken over technologie.",
    icon: "lock",
    duration: "±40 min",
    audience: "Alle onderwijsprofessionals",
    order: 8,
  },
];

export const seedNews: NewsItem[] = [
  {
    id: "news_1",
    title: "WAIsely lanceert modulair workshopaanbod voor scholen",
    excerpt: "Kies zelf welke modules je combineert in een workshop van 2 uur — volledig afgestemd op de noden van jouw team.",
    body: "Vanaf dit schooljaar biedt WAIsely een volledig modulair systeem aan. Scholen kiezen zelf uit acht thematische modules en combineren die tot een workshop op maat. Elke sessie duurt twee uur en bevat concrete lesvoorbeelden die direct inzetbaar zijn. Zo krijgt elk team precies de training die het nodig heeft.",
    date: "2026-09-01T10:00:00.000Z",
    type: "article",
  },
  {
    id: "news_2",
    title: '"Leerkrachten hebben nood aan rust, niet aan meer tools"',
    excerpt: "Sabrina Carota in Het Laatste Nieuws over de AI-druk op leerkrachten.",
    body: "In een interview met HLN bespreekt WAIsely-oprichtster Sabrina Carota hoe scholen omgaan met de snelle opkomst van AI in het onderwijs. 'De technologie gaat sneller dan de meeste leerkrachten kunnen volgen. Wat ze nodig hebben is geen extra tool, maar iemand die hen helpt om rust te vinden in de chaos.'",
    date: "2026-06-15T08:00:00.000Z",
    type: "press",
    externalUrl: "https://www.hln.be",
  },
  {
    id: "news_3",
    title: "Nieuwe module: AI-detectie & academische integriteit",
    excerpt: "Hoe herken je AI-gegenereerd werk? En belangrijker: hoe ontwerp je opdrachten die authentiek leren stimuleren?",
    body: "De nieuwste module van WAIsely richt zich op een van de meest gestelde vragen door leerkrachten: hoe ga je om met AI-gegenereerd werk? In plaats van een strijd tegen de technologie, focust deze module op het ontwerpen van opdrachten die authentiek leren centraal stellen.",
    date: "2026-08-20T09:00:00.000Z",
    type: "article",
  },
];

export const seedKnowledge: KnowledgeItem[] = [
  {
    id: "knw_1",
    title: "Promptgids voor leerkrachten (PDF)",
    description: "Een beknopte gids met de beste prompt-patronen voor lesvoorbereiding, evaluatie en differentiatie.",
    kind: "pdf",
    url: "#",
    tag: "Prompts",
    order: 1,
  },
  {
    id: "knw_2",
    title: "Slides: AI-basis workshop",
    description: "De presentatieslides uit de basismodule, handig als naslagwerk na de training.",
    kind: "slides",
    url: "#",
    tag: "Workshops",
    order: 2,
  },
];

export async function seedUsers(): Promise<User[]> {
  const users: User[] = [
    {
      id: "usr_admin",
      email: ADMIN_EMAIL,
      passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
      name: "Sabrina Carota",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr_demo",
      email: DEMO_EMAIL,
      passwordHash: bcrypt.hashSync(DEMO_PASSWORD, 10),
      name: "Jan De Vries",
      organization: "Sint-Pietersinstituut Gent",
      role: "user",
      createdAt: new Date().toISOString(),
    },
  ];
  await save("users", users);
  return users;
}

export async function seedBookings(): Promise<void> {
  const bookings: Booking[] = [
    {
      id: "bkg_1",
      userId: "usr_demo",
      type: "workshop",
      topic: "AI-basis + Prompts schrijven",
      audience: "Leerkrachten 2de & 3de graad",
      date: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      participants: "25",
      notes: "Graag focus op talige vakken.",
      status: "confirmed",
      createdAt: new Date().toISOString(),
    },
    {
      id: "bkg_2",
      userId: "usr_demo",
      type: "workshop",
      topic: "AI-beleid op school",
      audience: "Directie en coördinatoren",
      date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      participants: "12",
      notes: "We willen een schoolbreed AI-kader opstellen.",
      status: "new",
      createdAt: new Date().toISOString(),
    },
  ];
  await save("bookings", bookings);
}

export const seedIntakeFields: IntakeField[] = [
  // 1. Praktische gegevens
  { id: "if_email", section: "1. Praktische gegevens", label: "E-mailadres", type: "email", required: true, order: 1 },
  { id: "if_school", label: "Naam school", type: "text", required: true, order: 2 },
  { id: "if_contact_name", label: "Naam contactpersoon", type: "text", required: true, order: 3 },
  { id: "if_contact_function", label: "Functie contactpersoon", type: "text", required: true, order: 4 },
  { id: "if_phone", label: "Telefoonnummer", type: "tel", required: true, order: 5 },
  { id: "if_date", label: "Gewenste datum/data (indicatief) voor de workshop(s)/webinar(s)", type: "text", required: true, order: 6 },
  { id: "if_location", label: "Locatie", type: "text", required: true, order: 7 },
  { id: "if_participants", label: "Aantal deelnemers per workshop/webinar", type: "radio", options: "1-10|11-20|21-35", required: true, order: 8 },
  { id: "if_session_type", label: "Type sessie", type: "radio", options: "Workshop op maat (3u)|Webinar op maat (2u)|Vrije webinar", required: true, order: 9 },
  { id: "if_topics", label: "Over welke onderwerpen zou u een workshop/webinar wensen? (max. 3 aanvinken)", type: "checkbox", options: "De werking van taalmodellen|Efficiënt leren werken met een taalmodel (privacy, personalisatie en prompting)|Ethische implicaties en gevolgen voor milieu & klimaat|Een AI-beleid uitwerken voor de school|Een taalmodel inzetten als (schrijf)assistent|Evaluatie en feedback|Administratieve taken uitbesteden en planlast verminderen", required: true, order: 10 },
  // 2. Doelgroep
  { id: "if_audience", section: "2. Doelgroep", label: "Is de sessie bedoeld voor", type: "radio", options: "Leerkrachten|Beleidsmedewerkers/directie|Beide", required: true, order: 11 },
  { id: "if_level", label: "Indien voor leerkrachten, voor welke leerkrachten is de sessie bedoeld?", type: "radio", options: "Kleuter|Lager|Secundair|Alle niveaus|Andere", required: true, order: 12 },
  { id: "if_subjects", label: "Vakgebied(en) van de deelnemers", type: "checkbox", options: "Taal|STEM|Mens & maatschappij|Kunst & creatie|Alle vakken|Andere", required: true, order: 13 },
  { id: "if_experience", label: "Ervaring van deelnemers met AI-tools", type: "scale", scaleRange: "1|5", scaleLabels: "Geen ervaring|Dagelijks gebruik", required: true, order: 14 },
  { id: "if_previous_training", label: "Werden er al eerdere vormingen rond AI of digitale geletterdheid gevolgd op school/in de instelling?", type: "radio", options: "Ja|Nee|Niet zeker", required: true, order: 15 },
  { id: "if_previous_detail", label: "Zo ja, welke?", type: "textarea", required: false, order: 16 },
  // 3. Noden en verwachtingen
  { id: "if_reason", section: "3. Noden en verwachtingen", label: "Wat is de belangrijkste reden om deze workshop te organiseren?", type: "textarea", required: true, order: 17 },
  { id: "if_challenges", label: "Welke concrete vragen of uitdagingen leven er rond AI op school?", type: "textarea", required: true, order: 18 },
  { id: "if_tools_used", label: "Welke AI-tools worden al gebruikt?", type: "radio", options: "ChatGPT|Copilot|Claude|Gemini|Nog geen tools gebruikt", required: true, order: 19 },
  // 4. Schoolcontext
  { id: "if_ai_policy", section: "4. Schoolcontext", label: "Heeft de school al een visie of beleid rond AI-gebruik?", type: "radio", options: "Ja|Nee|In ontwikkeling", required: true, order: 20 },
  { id: "if_guidelines", label: "Zijn er richtlijnen vanuit de scholengroep/koepel waarmee rekening gehouden moet worden?", type: "textarea", required: false, order: 21 },
  { id: "if_infra", label: "Beschikbare infrastructuur", type: "checkbox", options: "Eigen laptop/tablet per deelnemer|Computerlokaal beschikbaar|Wifi voor iedereen|Beamer/scherm aanwezig|Geen van bovenstaande", required: true, order: 22 },
  // 5. Logistiek
  { id: "if_setup", section: "5. Logistiek", label: "Opstelling", type: "radio", options: "Computerlokaal|Klaslokaal met beamer|Andere", required: true, order: 23 },
  { id: "if_onsite_contact", label: "Contactpersoon ter plaatse op de dag zelf", type: "text", required: true, order: 24 },
  // 6. Afsluitend
  { id: "if_remarks", section: "6. Afsluitend", label: "Overige opmerkingen of wensen", type: "textarea", required: false, order: 25 },
];

export async function seedAll(): Promise<void> {
  await seedUsers();
  await save("siteContent", seedSiteContent);
  await save("services", seedServices);
  await save("news", seedNews);
  await save("knowledge", seedKnowledge);
  await seedBookings();
  await save("intakeFields", seedIntakeFields);
  await save("intakeSubmissions", []);
}
