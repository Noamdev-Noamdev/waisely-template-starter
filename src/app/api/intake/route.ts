/**
 * POST: Submit an intake form (public, no auth needed)
 */
import { NextResponse } from "next/server";
import { get, save, uid } from "@/lib/db";
import type { IntakeSubmission } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fields = await get("intakeFields");
    const answers = body.answers as Record<string, string | string[]>;

    // Validate required fields
    for (const field of fields) {
      if (field.required) {
        const val = answers[field.id];
        if (val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) {
          return NextResponse.json(
            { error: `Verplicht veld: ${field.label}` },
            { status: 400 }
          );
        }
      }
    }

    const submission: IntakeSubmission = {
      id: uid("sub_"),
      submittedAt: new Date().toISOString(),
      answers,
    };

    const submissions = await get("intakeSubmissions");
    await save("intakeSubmissions", [...submissions, submission]);
    return NextResponse.json({ ok: true, id: submission.id });
  } catch {
    return NextResponse.json(
      { error: "Formulier kon niet worden verstuurd." },
      { status: 500 }
    );
  }
}
