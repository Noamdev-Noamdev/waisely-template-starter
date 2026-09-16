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
import { get, save } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { seedSiteContent } from "@/lib/seed";
import type { SiteContent } from "@/lib/types";

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

    // Merge: alleen aangeleverde onderdelen worden overschreven, zodat één
    // formulier veilig kan opslaan zonder de rest van de content te raken.
    const merged: SiteContent = {
      hero: { ...current.hero, ...body.hero },
      intro: { ...current.intro, ...body.intro },
      about: { ...current.about, ...body.about },
      why: { ...current.why, ...body.why },
      contact: { ...current.contact, ...body.contact },
      footer: { ...current.footer, ...body.footer },
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

/** POST herstelt de standaard (seed) content — handig bij demo's/reset. */
export async function POST() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  await save("siteContent", seedSiteContent);
  return NextResponse.json({ ok: true });
}
