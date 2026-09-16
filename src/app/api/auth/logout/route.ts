/**
 * ---------------------------------------------------------------------------
 * /api/auth/logout — Uitloggen (sessie-cookie verwijderen)
 * ---------------------------------------------------------------------------
 * Stateless sessies (zie src/lib/auth.ts): uitloggen = cookie verwijderen.
 * Werkt voor form-posts (navbar, redirect) én fetch-calls (JSON-response).
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  await clearSessionCookie();

  // Form-posts (navbar) verwachten een redirect; fetch-calls krijgen JSON.
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
