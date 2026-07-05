import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Telemetrie (Etapa 11): persistă evenimentele `track()` în DB.
 * Fire-and-forget dinspre client — răspunsul nu blochează UI-ul.
 */
export async function POST(req: Request) {
  try {
    const { name, props } = (await req.json()) as { name?: string; props?: Record<string, unknown> };
    if (!name || typeof name !== "string") return NextResponse.json({ ok: false }, { status: 400 });
    await db.event.create({ data: { name, props: JSON.stringify(props ?? {}) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
