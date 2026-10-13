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

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@waisely.biz";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "waisely-admin";
export const DEMO_EMAIL = "demo@waisely.biz";
export const DEMO_PASSWORD = "waisely-demo";

export const seedSiteContent: SiteContent = {
  navigation: {
    links: [
      { href: "/#waarom", label: "Waarom WAIsely?" },
      { href: "/over", label: "Wie is WAIsely?" },
      { href: "/boek-een-training", label: "Boek een training" },
      { href: "/pers", label: "Pers en Sociale Media" },
      { href: "/contact", label: "Contact" },
    ],
  },
  hero: {
    eyebrow: "AI in het onderwijs — met rust en richting",
    title: "Rust in de chaos",
    subtitle:
      "WAIsely begeleidt leerkrachten en scholen bij verantwoord, praktisch AI-gebruik. Via workshops op maat leer je hoe AI je lessen versterkt — zonder de controle te verliezen.",
    primaryCtaLabel: "Bekijk de modules",
    secondaryCtaLabel: "Meer over WAIsely",
    stats: [
      { value: "20+", label: "Jaar onderwijservaring" },
      { value: "7", label: "Modulaire thema's" },
      { value: "Op maat", label: "Elke workshop uniek" },
    ],
    imageUrl: "",
  },
  intro: {
    title: "AI hoeft niet overweldigend te zijn",
    body: "Veel leerkrachten voelen de druk om iets met AI te doen, maar weten niet waar te beginnen. WAIsely brengt daar verandering in. Geen technisch jargon, geen hype — wel concrete handvatten die je morgen al in je les kunt gebruiken. Elke training is afgestemd op jouw vak, je leerlingen en je eigen tempo.",
    badgeText: "Alle trainingen zijn praktisch en direct inzetbaar in de klas.",
  },
  servicesSection: {
    eyebrow: "Modules",
    title: "Stel je workshop samen",
    subtitle:
      "Kies maximaal drie modules die je combineert tot een workshop van 2 tot 3 uur, afhankelijk van hoeveel tijd je wilt overhouden voor oefening.",
    primaryCtaLabel: "Boek een training",
    secondaryCtaLabel: "Of neem vrijblijvend contact op",
  },
  newsSection: {
    eyebrow: "Nieuws & pers",
    title: "Recent nieuws en persvermeldingen",
    readMoreLabel: "Lees verder",
    externalLabel: "Lees het artikel",
  },
  about: {
    eyebrow: "Over",
    title: "Over WAIsely",
    body: "WAIsely, dat ben ik, Sabrina Carota. Ik ben een gepassioneerde leerkracht Engels, taalwetenschap en taaltechnologie met meer dan twintig jaar ervaring op de teller.\n\nToch kon al die ervaring mij niet behoeden voor de schok die ik, net als zoveel andere leerkrachten, ervoer bij de intrede van ChatGPT in 2022. De revolutie die het teweegbracht, veroorzaakte geen kleine deining in het onderwijslandschap, maar een ware tsunami.\n\nNet als jullie kreeg ik plots perfect uitgevoerde (schrijf)opdrachten van mijn leerlingen en kon ik thuis geen oefeningen meer laten afwerken zonder dat er AI aan te pas kwam. Huiswerk werd een maat voor niets, want de leerlingen leerden er niets uit. Ik worstelde niet zozeer met de vraag hoe ik kon bewijzen dat ze AI gebruikt hadden, als wel met de vraag hoe ik ervoor kon zorgen dat ze toch iets bijleerden. Plots moest ik dus mijn lespraktijk en al mijn taken herdenken: schrijfportfolio's, boekverslagen, sollicitatiebrieven, eindejaarsspeeches …\n\nIn 2024 volgde ik daarom een opleiding taaltechnologie aan de Universiteit Antwerpen. Nadien bleef ik volop lezen, studeren en experimenteren. In wezen zijn mijn lessen niet veranderd: ze blijven gestoeld op vakkennis en passie voor de Engelse taal en cultuur. Daar heeft de komst van AI niets aan veranderd, aan de manier waarop ik mijn werktijd invul wel. Het verantwoorde gebruik van GenAI maakte mijn lessen interessanter en verminderde mijn planlast drastisch. Zo houd ik meer tijd over voor wat echt telt: weer in verbinding kunnen treden met mijn leerlingen.\n\nOmdat ik deze kennis met andere leerkrachten wil delen, richtte ik in augustus WAIsely op, een bedrijf waarmee ik workshops en webinars aanbied aan scholen en onderwijsprofessionals. Iedereen kan bij mij terecht: wie al wat ervaring heeft met GenAI, maar ook wie nog zoekende is. Je wordt niet overladen met technische knowhow. Aan de hand van heel wat tips en tricks, en vooral duidelijke praktijkvoorbeelden, leer je hoe je GenAI op een praktische en efficiënte manier kunt inzetten.",
    imageUrl: "",
    name: "Sabrina Carota",
    role: "Leerkracht, taalwetenschapper & AI-trainer",
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
    visionTitle: "Mijn visie",
    visionBody:
      "AI is geen bedreiging voor onderwijs — het is een kans. Maar alleen als we het doordacht en verantwoord inzetten. Ik geloof dat elke leerkracht de ruimte en begeleiding verdient om op eigen tempo te ontdekken wat AI voor hen kan betekenen. Niet vanuit druk, maar vanuit nieuwsgierigheid. Niet vanuit angst, maar vanuit vertrouwen.",
    primaryCtaLabel: "Boek een training",
    secondaryCtaLabel: "Neem contact op",
  },
  why: {
    eyebrow: "Waarom WAIsely",
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
    eyebrow: "Contact",
    title: "Neem contact op",
    body: "Benieuwd wat WAIsely voor jouw school kan betekenen? Stuur een bericht of plan een vrijblijvend kennismakingsgesprek. Ik denk graag mee over een aanpak op maat.",
    email: "info@waisely.biz",
    phone: "",
    address: "Antwerpen, België",
    formTitle: "Stuur een bericht",
    formSubtitle: "Ik reageer doorgaans binnen 2 werkdagen.",
    formSubmitLabel: "Verstuur bericht",
    formSuccessMessage: "Bedankt! Je bericht is verstuurd.",
  },
  footer: {
    tagline: "Verantwoord AI-gebruik in het onderwijs. Rust in de chaos.",
    instagramUrl: "https://www.instagram.com/waisely",
    socialEmail: "sabrina@waisely.biz",
    copyrightText: "Alle rechten voorbehouden.",
    linkedinUrl: "https://www.linkedin.com/company/waisely",
    companyNumber: "BE 0xxx.xxx.xxx",
  },
  bookTraining: {
    eyebrow: "Boek een training",
    title: "Workshop of webinar aanvragen",
    description:
      "Bedankt voor je interesse in een WAIsely-vorming. Vul eerst het intake-formulier in zodat we de inhoud zo goed mogelijk kunnen afstemmen op uw school of instelling. Kies daarna de modules die het beste bij uw situatie passen.",
    contactPrompt: "Liever eerst even persoonlijk afstemmen?",
    contactLinkText: "Neem contact op",
    step1Title: "Intake-formulier",
    step2Title: "Kies uw modules",
    step2Description:
      "Kies tot drie modules die je combineert tot een workshop van 2 tot 3 uur, afhankelijk van hoeveel tijd je wilt overhouden voor oefening.",
    moduleSelectorCta: "Workshop aanvragen",
    intakeSuccessTitle: "Bedankt voor je intake!",
    intakeSuccessMessage:
      "Je formulier is succesvol verstuurd. Sabrina neemt zo snel mogelijk contact met je op om de workshop op maat af te stemmen.",
    bookingEyebrow: "Op maat",
    bookingTitle: "Workshop aanvragen",
    bookingDescription:
      "Beschrijf kort wat je nodig hebt en je ontvangt binnen 2 werkdagen een voorstel op maat, inclusief een passende modulecombinatie.",
    bookingSteps: [
      "Vul het formulier in met je wensen",
      "Ontvang binnen 2 werkdagen een voorstel",
      "We plannen samen een datum",
    ],
    bookingAccountTitle: "Account vereist",
    bookingAccountDescription: "Aanvragen doen vereist een account.",
    bookingSuccessTitle: "Aanvraag verstuurd!",
    bookingSuccessMessage:
      "Bedankt! Je aanvraag staat nu in je dashboard. Je ontvangt binnen 2 werkdagen een reactie.",
  },
  press: {
    eyebrow: "Pers & reviews",
    title: "Wat anderen zeggen",
    intro:
      "Persvermeldingen, ervaringen van deelnemers en de laatste posts van WAIsely op Instagram.",
    reviewsTitle: "Ervaringen van deelnemers",
    reviews: [
      {
        id: "rev_1",
        name: "Lisa D.",
        role: "Leerkracht Engels, 3de graad",
        text: "Eindelijk iemand die begrijpt dat wij leerkrachten geen techneuten zijn. De workshop was concreet, praktisch en ik kon alles meteen gebruiken in mijn lessen.",
        visible: true,
      },
      {
        id: "rev_2",
        name: "Tom V.",
        role: "ICT-coördinator, scholengroep",
        text: "Sabrina's aanpak is uniek: ze vertrekt altijd vanuit de les, niet vanuit de tool. Dat maakt het verschil. Onze leerkrachten voelden zich gehoord.",
        visible: true,
      },
      {
        id: "rev_3",
        name: "An S.",
        role: "Directeur hoger onderwijs",
        text: "We hadden WAIsely uitgenodigd voor een studiedag. De feedback van onze docenten was unaniem positief. Praktisch, duidelijk en inspirerend.",
        visible: true,
      },
    ],
    pressTitle: "In de pers",
    instagramTitle: "Volg WAIsely op Instagram",
    instagramSubtitle:
      "Dagelijkse tips, lesideeën en AI-inspiratie voor leerkrachten.",
    instagramButtonLabel: "Volg op Instagram",
    instagramProfileUrl: "",
    instagramPosts: [],
  },
  terms: {
    eyebrow: "Juridisch",
    title: "Algemene Voorwaarden",
    subtitle:
      "Duidelijke afspraken voor workshops, webinars en begeleiding door WAIsely.",
    lastUpdated: "Oktober 2026",
    sections: [
      {
        id: "sec_1",
        title: "1. Toepasselijkheid",
        body: "Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, offertes, workshops, webinars en overeenkomsten van WAIsely, gevestigd te Antwerpen, tenzij schriftelijk uitdrukkelijk anders is overeengekomen.",
      },
      {
        id: "sec_2",
        title: "2. Aanbod en totstandkoming van de overeenkomst",
        body: "Elk aanbod en elke offerte van WAIsely is vrijblijvend en geldig gedurende 30 dagen, tenzij anders aangegeven. De overeenkomst komt tot stand zodra de opdrachtgever de offerte schriftelijk of elektronisch bevestigt, of wanneer WAIsely met de uitvoering van de opdracht is begonnen.",
      },
      {
        id: "sec_3",
        title: "3. Tarieven en betaling",
        body: "Alle prijzen worden vermeld in euro en zijn exclusief btw (tenzij anders vermeld). Facturen dienen te worden voldaan binnen 30 dagen na factuurdatum. Bij niet-tijdige betaling kan van rechtswege en zonder ingebrekestelling een verwijlintrest worden aangerekend.",
      },
      {
        id: "sec_4",
        title: "4. Annulering en verplaatsing",
        body: "Annulering van een geplande workshop of webinar dient steeds schriftelijk te gebeuren. Bij annulering tot 14 dagen voor de geplande datum worden geen kosten in rekening gebracht. Bij annulering tussen 14 en 7 dagen voor aanvang wordt 50% van het overeengekomen bedrag aangerekend. Bij annulering binnen 7 dagen voor aanvang is het volledige bedrag verschuldigd.",
      },
      {
        id: "sec_5",
        title: "5. Intellectueel eigendom",
        body: "Alle ontwikkelde presentaties, hand-outs, lesmaterialen, prompts en andere cursusmaterialen blijven het exclusieve intellectuele eigendom van WAIsely. Materialen mogen uitsluitend worden gebruikt voor eigen interne educatieve doeleinden en mogen niet zonder voorafgaande schriftelijke toestemming worden verspreid of vermenigvuldigd.",
      },
      {
        id: "sec_6",
        title: "6. Aansprakelijkheid",
        body: "WAIsely spant zich in om de diensten met de nodige zorgvuldigheid en deskundigheid uit te voeren. De aansprakelijkheid van WAIsely is te allen tijde beperkt tot het factuurbedrag van de desbetreffende opdracht. WAIsely is niet aansprakelijk voor indirecte schade of gevolgschade.",
      },
    ],
  },
  privacy: {
    eyebrow: "Privacy",
    title: "Privacyverklaring",
    subtitle:
      "Hoe WAIsely zorgvuldig omgaat met persoonsgegevens conform de AVG / GDPR.",
    lastUpdated: "Oktober 2026",
    sections: [
      {
        id: "sec_p1",
        title: "1. Wie zijn we?",
        body: "WAIsely is verantwoordelijk voor de verwerking van persoonsgegevens zoals weergegeven in deze privacyverklaring. Voor vragen over privacy en gegevensbescherming kun je contact opnemen via info@waisely.biz.",
      },
      {
        id: "sec_p2",
        title: "2. Welke gegevens verzamelen we?",
        body: "Wij verwerken persoonsgegevens die je zelf aan ons verstrekt wanneer je het contactformulier, intakeformulier of boekingsformulier invult. Dit betreft onder meer: naam, school/organisatie, functie, e-mailadres, telefoonnummer (indien verstrekt) en jouw specifieke leervragen of opleidingswensen.",
      },
      {
        id: "sec_p3",
        title: "3. Waarvoor gebruiken we deze gegevens?",
        body: "Jouw gegevens worden uitsluitend gebruikt om contact met je op te nemen over je aanvraag, om workshops en webinars op maat van jouw school voor te bereiden, en voor de administratieve en facturatie-afhandeling.",
      },
      {
        id: "sec_p4",
        title: "4. Bewaartermijn",
        body: "WAIsely bewaart persoonsgegevens niet langer dan strikt noodzakelijk is om de doelen te realiseren waarvoor je gegevens worden verzameld, dan wel op grond van wettelijke bewaarplichten (zoals de fiscale bewaartermijn van 7 jaar voor facturen).",
      },
      {
        id: "sec_p5",
        title: "5. Delen met derden",
        body: "WAIsely verkoopt jouw gegevens nooit aan derden en verstrekt deze uitsluitend indien dit nodig is voor de uitvoering van onze overeenkomst met jou of om te voldoen aan een wettelijke verplichting.",
      },
      {
        id: "sec_p6",
        title: "6. Jouw rechten",
        body: "Je hebt het recht om je persoonsgegevens in te zien, te corrigeren of te laten verwijderen. Daarnaast heb je het recht om je toestemming voor de gegevensverwerking in te trekken of bezwaar te maken tegen de verwerking van jouw persoonsgegevens door WAIsely. Neem hiervoor contact op via info@waisely.biz.",
      },
    ],
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

export function getSeedUsers(): User[] {
  return [
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
}

export function getSeedBookings(): Booking[] {
  return [
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
  { id: "if_session_type", label: "Type sessie (wenst u een workshop of webinar?)", type: "radio", options: "Workshop op maat (3u)|Webinar op maat (2u)|Vrije webinar", required: true, order: 9 },
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
