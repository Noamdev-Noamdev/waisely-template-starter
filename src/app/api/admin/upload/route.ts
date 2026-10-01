/**
 * ---------------------------------------------------------------------------
 * /api/admin/upload — Upload van afbeeldingen (alleen admin)
 * ---------------------------------------------------------------------------
 * Slaat geüploade afbeeldingen op in public/uploads en retourneert de publieke URL.
 * ---------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Admin-toegang vereist." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Geen bestand ontvangen." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Ongeldig bestandstype. Alleen JPG, PNG, WebP, GIF en SVG zijn toegestaan.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "De afbeelding mag maximaal 5 MB groot zijn." },
        { status: 400 }
      );
    }

    const rawExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const ext = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(rawExt)
      ? rawExt
      : "jpg";
    const filename = `upload-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json(
      { error: "Fout bij het uploaden van het bestand." },
      { status: 500 }
    );
  }
}
