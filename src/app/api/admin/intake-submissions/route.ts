/**
 * ---------------------------------------------------------------------------
 * /api/admin/intake-submissions — Submission overview (admin only)
 * ---------------------------------------------------------------------------
 * GET    : all submissions
 * DELETE : delete submission (?id=...)
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { get, save } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function guard() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}

export async function GET() {
  if (!(await guard())) {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }
  return NextResponse.json({ submissions: await get("intakeSubmissions") });
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
    const submissions = await get("intakeSubmissions");
    await save(
      "intakeSubmissions",
      submissions.filter((s) => s.id !== id)
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Kon inzending niet verwijderen." },
      { status: 500 }
    );
  }
}
