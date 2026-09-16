/**
 * /api/admin/intake-fields — Intake field CRUD (admin only)
 * GET: all fields
 * POST: add new field
 * PUT: update field (id in body)
 * DELETE: delete field (?id=...)
 */
import { NextResponse } from "next/server";
import { get, save, uid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { IntakeField } from "@/lib/types";

async function guard() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}

export async function GET() {
  if (!(await guard())) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  return NextResponse.json({ fields: await get("intakeFields") });
}

export async function POST(request: Request) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const fields = await get("intakeFields");
    const field: IntakeField = {
      id: uid("if_"),
      section: body.section || undefined,
      label: String(body.label ?? "Nieuw veld"),
      type: body.type ?? "text",
      options: body.options || undefined,
      required: Boolean(body.required),
      help: body.help || undefined,
      scaleLabels: body.scaleLabels || undefined,
      scaleRange: body.scaleRange || undefined,
      order: fields.length + 1,
    };
    await save("intakeFields", [...fields, field]);
    return NextResponse.json({ ok: true, field });
  } catch {
    return NextResponse.json({ error: "Kon veld niet toevoegen." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const fields = await get("intakeFields");
    const updated = fields.map((f) =>
      f.id === body.id ? { ...f, ...body, id: f.id } : f
    );
    await save("intakeFields", updated);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kon veld niet bijwerken." }, { status: 500 });
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
    const fields = await get("intakeFields");
    await save("intakeFields", fields.filter((f) => f.id !== id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kon veld niet verwijderen." }, { status: 500 });
  }
}
