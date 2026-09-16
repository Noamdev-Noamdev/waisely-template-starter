/**
 * ---------------------------------------------------------------------------
 * /api/admin/knowledge — Kennisbank-CRUD (alleen admin)
 * ---------------------------------------------------------------------------
 * POST   : nieuw materiaal toevoegen
 * PUT    : materiaal bijwerken
 * DELETE : materiaal verwijderen (?id=...)
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { get, save, uid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { KnowledgeItem } from "@/lib/types";

async function guard() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}

const KINDS: KnowledgeItem["kind"][] = [
  "pdf",
  "doc",
  "link",
  "slides",
  "video",
  "template",
];

export async function POST(request: Request) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const knowledge = await get("knowledge");
    const kind = KINDS.includes(body.kind) ? body.kind : "pdf";
    const item: KnowledgeItem = {
      id: uid("knw_"),
      title: String(body.title ?? "[Nieuw materiaal]"),
      description: String(body.description ?? ""),
      kind,
      url: String(body.url ?? "#"),
      tag: String(body.tag ?? ""),
      order: knowledge.length + 1,
    };
    await save("knowledge", [...knowledge, item]);
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ error: "Kon materiaal niet toevoegen." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const knowledge = await get("knowledge");
    const updated = knowledge.map((k) =>
      k.id === body.id ? { ...k, ...body, id: k.id } : k
    );
    await save("knowledge", updated);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kon materiaal niet bijwerken." }, { status: 500 });
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
    const knowledge = await get("knowledge");
    await save("knowledge", knowledge.filter((k) => k.id !== id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kon materiaal niet verwijderen." }, { status: 500 });
  }
}
