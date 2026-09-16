/**
 * ---------------------------------------------------------------------------
 * /api/admin/services — Diensten-CRUD (alleen admin)
 * ---------------------------------------------------------------------------
 * GET    : alle diensten
 * POST   : nieuwe dienst toevoegen
 * PUT    : dienst bijwerken (id in body)
 * DELETE : dienst verwijderen (?id=...)
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { get, save, uid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Service } from "@/lib/types";

async function guard() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}

export async function GET() {
  if (!(await guard())) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  return NextResponse.json({ services: await get("services") });
}

export async function POST(request: Request) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const services = await get("services");
    const service: Service = {
      id: uid("svc_"),
      title: String(body.title ?? "[Nieuwe dienst]"),
      description: String(body.description ?? ""),
      icon: String(body.icon ?? "spark"),
      duration: String(body.duration ?? ""),
      audience: String(body.audience ?? ""),
      order: services.length + 1,
    };
    await save("services", [...services, service]);
    return NextResponse.json({ ok: true, service });
  } catch {
    return NextResponse.json({ error: "Kon dienst niet toevoegen." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const services = await get("services");
    const updated = services.map((s) =>
      s.id === body.id ? { ...s, ...body, id: s.id } : s
    );
    await save("services", updated);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kon dienst niet bijwerken." }, { status: 500 });
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
    const services = await get("services");
    await save("services", services.filter((s) => s.id !== id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kon dienst niet verwijderen." }, { status: 500 });
  }
}
