/**
 * ---------------------------------------------------------------------------
 * WAIsely Template — Auth-oplossing (auth.ts)
 * ---------------------------------------------------------------------------
 * Authenticatie met rollen, opgebouwd rond httpOnly-cookies met **stateless
 * sessies**: de sessie-payload (userId + role + vervaldatum) wordt met een
 * HMAC-ondertekening in de cookie zelf bewaard. Dat werkt betrouwbaar in
 * Next.js-productie, waar route-handlers en server-components in aparte
 * bundels draaien en gedeelde in-memory state dus NIET gegarandeerd is.
 *
 * Waarom deze aanpak (en hoe je hem vervangt):
 *   - Wil je Supabase Auth?     → vervang login/register door signInWithPassword
 *     en zet Supabases eigen cookie-sessies; lees de rol uit een "role"-veld.
 *   - Wil je NextAuth/Auth.js?  → vervang dit bestand door de Auth.js-config;
 *     map de rol via callbacks (session.user.role = token.role).
 *   - Wil je server-side sessies (b.v. voor "overal uitloggen")? → bewaar de
 *     sessie-records in de database i.p.v. alleen de cookie.
 *   Alle guards (getCurrentUser/requireAdmin) en UI blijven ongewijzigd.
 *
 * Beveiliging:
 *   - Cookie is httpOnly + sameSite=lax + secure in productie.
 *   - HMAC voorkomt tampering (rol verhogen kan niet zonder het secret).
 *   - De gebruiker wordt bij ELKE request opnieuw uit de store opgehaald,
 *     zodat rolwijzigingen en verwijderde accounts onmiddellijk gelden.
 *   - Wachtwoorden: bcrypt (never plaintext).
 * ---------------------------------------------------------------------------
 */

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { get, save, uid } from "./db";
import type { Role, User } from "./types";

/** Naam van de sessie-cookie. */
const COOKIE_NAME = "waisely_session";
/** Geldigheidsduur van een sessie (7 dagen, in seconden voor de cookie). */
const SESSION_TTL_SEC = 7 * 24 * 60 * 60;

/**
 * Ondertekenings-geheim. In productie: zet SESSION_SECRET in .env (lange
 * random string). De fallback is uitsluitend bedoeld voor de template/dev.
 */
const SECRET =
  process.env.SESSION_SECRET ??
  "d511f3e59cb0207808e7ef8eb0097ac37e064d85142f29c746e37d3649c22d9e";

/** Payload die ondertekend in de cookie zit. */
interface SessionPayload {
  /** Id van de gebruiker (opnieuw gecontroleerd tegen de store bij gebruik). */
  uid: string;
  /** Rol op moment van inloggen; alleen ter info — de actuele rol komt
   *  altijd uit de store (zo gelden rolwijzigingen meteen). */
  role: Role;
  /** Vervaltijd in ms sinds epoch. */
  exp: number;
  /** Versienummer van sessies; wordt verhoogd bij wachtwoordwijziging om andere sessies in te trekken. */
  tokenVersion?: number;
}

/* --------------------------- HMAC-helpers -------------------------------- */

function sign(data: string): string {
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

/** Maakt een ondertekend sessietoken: base64url(payload).hmac */
function createToken(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Verifieert een token en geeft de payload terug, of null bij ongeldig. */
function verifyToken(token: string): SessionPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  // Timing-safe vergelijking zodat de signature niet te brute-forcen is.
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf-8")
    ) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/* ---------------------------- Accounts ----------------------------------- */

/**
 * Registreert een nieuw account. Nieuwe gebruikers krijgen altijd rol "user";
 * de admin-rol ontstaat via de seed (zie seed.ts) — zo kan niemand zichzelf
 * via het publieke formulier admin maken.
 */
export async function register(
  email: string,
  password: string,
  name: string,
  organization?: string
): Promise<{ user?: User; error?: string }> {
  const normalized = email.trim().toLowerCase();
  if (await findUserByEmail(normalized)) {
    return { error: "Er bestaat al een account met dit e-mailadres." };
  }
  const user: User = {
    id: uid("usr_"),
    email: normalized,
    passwordHash: await bcrypt.hash(password, 10),
    name: name.trim(),
    organization: organization?.trim() || undefined,
    role: "user",
    createdAt: new Date().toISOString(),
  };
  const users = await get("users");
  await save("users", [...users, user]);
  return { user };
}

/** Zoekt een gebruiker op e-mail (case-insensitive). */
export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await get("users");
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email === normalized) ?? null;
}

/* ----------------------------- Sessions ---------------------------------- */

/** Resultaat van login: het cookie-token dat de client meekrijgt. */
export interface SessionResult {
  token: string;
  role: Role;
}

/**
 * Verifieert credentials en maakt een sessie-token aan. De cookie zelf wordt
 * gezet door setSessionCookie (kan alleen in route handlers/server actions).
 */
export async function login(
  email: string,
  password: string
): Promise<{ session?: SessionResult; error?: string }> {
  const user = await findUserByEmail(email);
  if (!user) return { error: "Onjuiste combinatie van e-mail en wachtwoord." };
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: "Onjuiste combinatie van e-mail en wachtwoord." };
  const payload: SessionPayload = {
    uid: user.id,
    role: user.role,
    exp: Date.now() + SESSION_TTL_SEC * 1000,
    tokenVersion: user.tokenVersion ?? 1,
  };
  return { session: { token: createToken(payload), role: user.role } };
}

/**
 * "Logt uit": bij stateless sessies is dat simpelweg de cookie verwijderen.
 * (Wil je server-side sessie-intrekking, bewaar dan een sessie-record in de
 * store en verwijder dat hier — zie het kopcommentaar voor de aanpak.)
 */
export async function logout(): Promise<void> {
  await clearSessionCookie();
}

/** Zet de sessie-cookie: httpOnly, sameSite=lax, secure in productie. */
export async function setSessionCookie(session: SessionResult): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
}

/** Verwijdert de sessie-cookie. */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/* ------------------------------- Guards ---------------------------------- */

/**
 * Haalt de volledige User op van wie er nu ingelogd is, of null.
 * Dit is dé functie die alle pagina's/routes gebruiken voor auth-checks.
 * De gebruiker wordt vers uit de store gelezen, zodat rolwijzigingen en
 * verwijderde accounts onmiddellijk effect hebben.
 */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const users = await get("users");
  const user = users.find((u) => u.id === payload.uid);
  if (!user) return null;

  // Sessie-intrekking check: als het wachtwoord gewijzigd is, heeft de gebruiker
  // een hogere tokenVersion gekregen. Oude tokens zijn ongeldig.
  if (
    user.tokenVersion !== undefined &&
    payload.tokenVersion !== undefined &&
    payload.tokenVersion !== user.tokenVersion
  ) {
    return null;
  }

  return user;
}

/** Controleert of een gebruiker beheerder is (admin of superadmin). */
export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === "admin" || user?.role === "superadmin";
}

/** Controleert of een gebruiker de eigenaar/superadmin is. */
export function isSuperadmin(user: User | null | undefined): boolean {
  return user?.role === "superadmin";
}

/** Guard voor server-routes: ingelogd, anders null. */
export async function requireUser(): Promise<User | null> {
  return getCurrentUser();
}

/** Guard voor admin-routes: geldig voor rol "admin" én "superadmin". */
export async function requireAdmin(): Promise<User | null> {
  const user = await getCurrentUser();
  return isAdmin(user) ? user : null;
}

/** Guard voor superadmin-routes: uitsluitend geldig voor de rol "superadmin". */
export async function requireSuperadmin(): Promise<User | null> {
  const user = await getCurrentUser();
  return isSuperadmin(user) ? user : null;
}

/* ------------------------ Wachtwoord wijzigen ----------------------------- */

/**
 * In-memory sliding window voor mislukte wachtwoordpogingen per gebruiker.
 * Voorkomt brute-force pogingen op het huidige wachtwoord.
 */
interface FailedAttemptInfo {
  count: number;
  lockedUntil: number;
}
const failedPasswordAttempts = new Map<string, FailedAttemptInfo>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minuten blokkade na 5 foute pogingen

/**
 * Wijzigt het wachtwoord van de ingelogde gebruiker.
 * - Vereist het huidige wachtwoord ter verificatie.
 * - Controleert dat het nieuwe wachtwoord minstens 8 tekens lang is en verschilt van het oude.
 * - Verhoogt het versienummer van de tokens (tokenVersion) zodat alle andere actieve
 *   sessies van deze gebruiker per direct ongeldig worden.
 * - Retourneert een nieuw sessietoken voor de huidige client.
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success?: boolean; session?: SessionResult; error?: string }> {
  const now = Date.now();
  const attemptInfo = failedPasswordAttempts.get(userId);

  if (attemptInfo && attemptInfo.lockedUntil > now) {
    const remainingMinutes = Math.ceil((attemptInfo.lockedUntil - now) / 60000);
    return {
      error: `Te veel mislukte pogingen. Probeer het over ${remainingMinutes} ${remainingMinutes === 1 ? "minuut" : "minuten"} opnieuw.`,
    };
  }

  // 1. Validatie van nieuw wachtwoord
  if (!newPassword || typeof newPassword !== "string") {
    return { error: "Voer een nieuw wachtwoord in." };
  }
  if (newPassword.length < 8) {
    return { error: "Het nieuwe wachtwoord moet minstens 8 tekens bevatten." };
  }
  if (currentPassword === newPassword) {
    return {
      error: "Het nieuwe wachtwoord mag niet hetzelfde zijn als je huidige wachtwoord.",
    };
  }

  // 2. Haal gebruiker op en verifieer huidig wachtwoord
  const users = await get("users");
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return { error: "Gebruiker niet gevonden." };
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    const newCount = (attemptInfo?.count ?? 0) + 1;
    if (newCount >= MAX_FAILED_ATTEMPTS) {
      failedPasswordAttempts.set(userId, {
        count: newCount,
        lockedUntil: now + LOCKOUT_MS,
      });
      return {
        error:
          "Het huidige wachtwoord is onjuist. Je account is uit veiligheid 15 minuten vergrendeld voor wachtwoordwijzigingen.",
      };
    } else {
      failedPasswordAttempts.set(userId, {
        count: newCount,
        lockedUntil: 0,
      });
      const remaining = MAX_FAILED_ATTEMPTS - newCount;
      return {
        error: `Het huidige wachtwoord is onjuist. (Nog ${remaining} ${remaining === 1 ? "poging" : "pogingen"} over)`,
      };
    }
  }

  // Succesvolle verificatie: wis foutenteller
  failedPasswordAttempts.delete(userId);

  // 3. Hash nieuw wachtwoord en verhoog tokenVersion
  const newHash = await bcrypt.hash(newPassword, 10);
  const nextVersion = (user.tokenVersion ?? 1) + 1;

  const updatedUsers = users.map((u) =>
    u.id === userId
      ? {
          ...u,
          passwordHash: newHash,
          tokenVersion: nextVersion,
        }
      : u
  );
  await save("users", updatedUsers);

  // 4. Maak een nieuw sessie-token aan met de nieuwe tokenVersion voor de huidige browser
  const newPayload: SessionPayload = {
    uid: user.id,
    role: user.role,
    exp: Date.now() + SESSION_TTL_SEC * 1000,
    tokenVersion: nextVersion,
  };

  return {
    success: true,
    session: { token: createToken(newPayload), role: user.role },
  };
}

/**
 * Superadmin reset-functie: stelt een nieuw wachtwoord in voor een andere gebruiker.
 * Verhoogt tevens tokenVersion zodat openstaande sessies van de doelgebruiker worden beëindigd.
 */
export async function adminResetPassword(
  targetUserId: string,
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
    return { error: "Het nieuwe wachtwoord moet minstens 8 tekens bevatten." };
  }

  const users = await get("users");
  const targetUser = users.find((u) => u.id === targetUserId);
  if (!targetUser) {
    return { error: "Gebruiker niet gevonden." };
  }

  if (targetUser.role === "superadmin") {
    return { error: "Het wachtwoord van de superadmin kan hier niet overschreven worden." };
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  const nextVersion = (targetUser.tokenVersion ?? 1) + 1;

  const updatedUsers = users.map((u) =>
    u.id === targetUserId
      ? {
          ...u,
          passwordHash: newHash,
          tokenVersion: nextVersion,
        }
      : u
  );
  await save("users", updatedUsers);

  // Wis eventuele blokkade op het doelaccount
  failedPasswordAttempts.delete(targetUserId);

  return { success: true };
}
