import { NextResponse } from "next/server";
import { runTick } from "@/lib/tick";

/**
 * Endpoint-ul de tick (Etapa 11, #42) — agnostic la cine îl apelează:
 * Vercel Cron (vezi vercel.json), cron pe VPS (`curl`) sau manual în dev.
 * Cu `CRON_SECRET` setat, cere antetul `Authorization: Bearer <secret>`
 * (exact ce trimite Vercel Cron automat); fără secret (dev) e liber.
 */
async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const result = await runTick();
    return NextResponse.json({ ok: true, ...result, at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
