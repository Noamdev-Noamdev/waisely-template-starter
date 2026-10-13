/**
 * ---------------------------------------------------------------------------
 * /api/admin/content — Content-CMS API (alleen admin)
 * ---------------------------------------------------------------------------
 * PUT/PATCH : siteContent of een onderdeel daarvan bijwerken (teksten,
 *            waarom-punten, contactgegevens, footer, ...).
 * Vul hier later extra velden toe zodra de publieke site uitbreidt.
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { get, save, uid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { seedSiteContent } from "@/lib/seed";
import { normalizeInstagramUrl } from "@/lib/instagram";
import type {
  InstagramPost,
  PressContent,
  Review,
  SiteContent,
} from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  const content = await get("siteContent");
  return NextResponse.json({ content });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Partial<SiteContent>;
    const current = await get("siteContent");

    let press = current.press;
    if (body.press) {
      const result = sanitizePress({ ...current.press, ...body.press });
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      press = result.press;
    }

    // Merge: alleen aangeleverde onderdelen worden overschreven, zodat één
    // formulier veilig kan opslaan zonder de rest van de content te raken.
    const merged: SiteContent = {
      hero: { ...current.hero, ...body.hero },
      intro: { ...current.intro, ...body.intro },
      about: { ...current.about, ...body.about },
      why: { ...current.why, ...body.why },
      contact: { ...current.contact, ...body.contact },
      footer: { ...current.footer, ...body.footer },
      bookTraining: { ...current.bookTraining, ...body.bookTraining },
      servicesSection: body.servicesSection
        ? { ...(current.servicesSection ?? {
            eyebrow: "Modules",
            title: "Stel je workshop samen",
            subtitle: "",
            primaryCtaLabel: "Boek een training",
            secondaryCtaLabel: "Of neem vrijblijvend contact op",
          }), ...body.servicesSection }
        : current.servicesSection,
      newsSection: body.newsSection
        ? { ...(current.newsSection ?? {
            eyebrow: "Nieuws & pers",
            title: "Recent nieuws en persvermeldingen",
            readMoreLabel: "Lees verder",
            externalLabel: "Lees het artikel",
          }), ...body.newsSection }
        : current.newsSection,
      navigation: body.navigation
        ? { links: body.navigation.links ?? current.navigation?.links ?? [] }
        : current.navigation,
      press,
      terms: body.terms
        ? {
            eyebrow: body.terms.eyebrow ?? current.terms?.eyebrow ?? "Juridisch",
            title: body.terms.title ?? current.terms?.title ?? "Algemene Voorwaarden",
            subtitle: body.terms.subtitle ?? current.terms?.subtitle ?? "",
            lastUpdated: body.terms.lastUpdated ?? current.terms?.lastUpdated ?? "",
            sections: body.terms.sections ?? current.terms?.sections ?? [],
          }
        : current.terms,
      privacy: body.privacy
        ? {
            eyebrow: body.privacy.eyebrow ?? current.privacy?.eyebrow ?? "Privacy",
            title: body.privacy.title ?? current.privacy?.title ?? "Privacyverklaring",
            subtitle: body.privacy.subtitle ?? current.privacy?.subtitle ?? "",
            lastUpdated: body.privacy.lastUpdated ?? current.privacy?.lastUpdated ?? "",
            sections: body.privacy.sections ?? current.privacy?.sections ?? [],
          }
        : current.privacy,
    };

    await save("siteContent", merged);
    return NextResponse.json({ ok: true, content: merged });
  } catch {
    return NextResponse.json(
      { error: "Kon de content niet opslaan." },
      { status: 500 }
    );
  }
}

/**
 * Valideert/normaliseert het pers-onderdeel: lege reviews worden geweigerd,
 * Instagram-links worden omgezet naar een canonieke permalink en dubbele
 * posts worden verwijderd.
 */
function sanitizePress(
  press: PressContent
): { press: PressContent } | { error: string } {
  const str = (v: unknown) => (typeof v === "string" ? v : "");

  const reviews: Review[] = [];
  for (const r of Array.isArray(press.reviews) ? press.reviews : []) {
    const review: Review = {
      id: str(r.id) || uid("rev_"),
      name: str(r.name).trim(),
      role: str(r.role).trim(),
      text: str(r.text).trim(),
      visible: r.visible !== false,
    };
    if (!review.name || !review.text) {
      return { error: "Elke review heeft minstens een naam en een tekst nodig." };
    }
    reviews.push(review);
  }

  const posts: InstagramPost[] = [];
  const seen = new Set<string>();
  for (const p of Array.isArray(press.instagramPosts) ? press.instagramPosts : []) {
    const url = normalizeInstagramUrl(str(p.url));
    if (!url) {
      return { error: `Ongeldige Instagram-link: "${str(p.url)}".` };
    }
    if (seen.has(url)) continue;
    seen.add(url);
    posts.push({
      id: str(p.id) || uid("ig_"),
      url,
      note: str(p.note).trim() || undefined,
      visible: p.visible !== false,
    });
  }

  return {
    press: {
      eyebrow: str(press.eyebrow),
      title: str(press.title),
      intro: str(press.intro),
      reviewsTitle: str(press.reviewsTitle),
      reviews,
      pressTitle: str(press.pressTitle),
      instagramTitle: str(press.instagramTitle),
      instagramSubtitle: str(press.instagramSubtitle),
      instagramButtonLabel: str(press.instagramButtonLabel),
      instagramProfileUrl: str(press.instagramProfileUrl).trim(),
      instagramPosts: posts,
    },
  };
}

/** POST herstelt de standaard (seed) content — handig bij demo's/reset. */
export async function POST() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  await save("siteContent", seedSiteContent);
  return NextResponse.json({ ok: true });
}
