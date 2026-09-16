/**
 * ---------------------------------------------------------------------------
 * /api/admin/news — Nieuws-CRUD (alleen admin)
 * ---------------------------------------------------------------------------
 * POST   : nieuwsitem/persvermelding toevoegen
 * PUT    : item bijwerken
 * DELETE : item verwijderen (?id=...)
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { get, save, uid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { NewsItem } from "@/lib/types";

async function guard() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}

export async function POST(request: Request) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const news = await get("news");
    const type = body.type === "press" ? "press" : "article";
    const item: NewsItem = {
      id: uid("news_"),
      title: String(body.title ?? "[Nieuw bericht]"),
      excerpt: String(body.excerpt ?? ""),
      body: String(body.body ?? ""),
      date: body.date ? String(body.date) : new Date().toISOString(),
      type,
      ...(type === "press" && body.externalUrl
        ? { externalUrl: String(body.externalUrl) }
        : {}),
    };
    await save("news", [...news, item]);
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ error: "Kon bericht niet toevoegen." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const news = await get("news");
    const updated = news.map((n) =>
      n.id === body.id ? { ...n, ...body, id: n.id } : n
    );
    await save("news", updated);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kon bericht niet bijwerken." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Geen id opgegeven." }, { status: 400 });
    }
    const news = await get("news");
    await save("news", news.filter((n) => n.id !== id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kon bericht niet verwijderen." }, { status: 500 });
  }
}
