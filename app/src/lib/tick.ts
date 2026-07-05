/**
 * Tick-ul termenelor Cursei (Etapa 11, #42) — inima worker-ului de producție.
 * Apelabil de oriunde (Vercel Cron / cron pe VPS / manual) prin `/api/tick`;
 * decizia cine îl apelează = la deploy (#41b). Execută pe DB ce face
 * `CursaEngine` în demo:
 *  - Cursă „deschisa" cu `cutoffAt` scadent → „inchisa"; comenzile neatinse
 *    EXPIRĂ (#34; refund-ul real = PaymentProvider la pilot — aici eveniment).
 *  - Cursă „inchisa" cu `deliveryAt` scadent → „livrata"; acceptate → livrate.
 *
 * Idempotent sub apeluri paralele: tranziția se face cu `updateMany` condiționat
 * de statusul vechi (claim atomic) — doar apelul care câștigă procesează urmările.
 * Verificat de `scripts/test-concurrency.mjs` („comandă la milisecunda închiderii").
 */
import { db } from "./db";

export interface TickResult {
  closed: number; // Curse închise la acest tick
  expired: number; // comenzi expirate (refund)
  delivered: number; // comenzi livrate
}

export async function runTick(now = new Date()): Promise<TickResult> {
  const result: TickResult = { closed: 0, expired: 0, delivered: 0 };

  // 0) plasa de siguranță (#34): o comandă strecurată FIX după închidere
  //    (cursa între timp „inchisa"/„livrata") expiră la următorul tick.
  const stragglers = await db.order.updateMany({
    where: { status: "nou", cursa: { is: { status: { in: ["inchisa", "livrata"] } } } },
    data: { status: "expirat" },
  });
  result.expired += stragglers.count;

  // 1) cutoff: închide Cursele scadente
  const dueClose = await db.cursa.findMany({
    where: { status: "deschisa", cutoffAt: { not: null, lte: now } },
    select: { id: true },
  });
  for (const { id } of dueClose) {
    const claim = await db.cursa.updateMany({ where: { id, status: "deschisa" }, data: { status: "inchisa" } });
    if (claim.count !== 1) continue; // a închis-o alt apel paralel
    result.closed++;
    const exp = await db.order.updateMany({ where: { cursaId: id, status: "nou" }, data: { status: "expirat" } });
    result.expired += exp.count;
    const acceptate = await db.order.count({ where: { cursaId: id, status: { in: ["acceptat", "platit"] } } });
    await db.event.create({
      data: { name: "cursa.cutoff", props: JSON.stringify({ cursaId: id, acceptate, expirate: exp.count, source: "tick" }) },
    });
  }

  // 2) ziua livrării: Cursele închise devin livrate
  const dueDeliver = await db.cursa.findMany({
    where: { status: "inchisa", deliveryAt: { not: null, lte: now } },
    select: { id: true },
  });
  for (const { id } of dueDeliver) {
    const claim = await db.cursa.updateMany({ where: { id, status: "inchisa" }, data: { status: "livrata" } });
    if (claim.count !== 1) continue;
    const del = await db.order.updateMany({
      where: { cursaId: id, status: { in: ["acceptat", "platit"] } },
      data: { status: "livrat" },
    });
    result.delivered += del.count;
    await db.event.create({
      data: { name: "cursa.livrata", props: JSON.stringify({ cursaId: id, livrate: del.count, source: "tick" }) },
    });
  }

  return result;
}
