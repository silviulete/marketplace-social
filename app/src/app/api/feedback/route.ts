import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Feedback calitativ — butonul „Spune-ne" (Etapa 11). Se citește în „Puls". */
export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as { text?: string };
    const clean = (text ?? "").trim().slice(0, 2000);
    if (!clean) return NextResponse.json({ ok: false }, { status: 400 });
    await db.feedback.create({ data: { text: clean } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
