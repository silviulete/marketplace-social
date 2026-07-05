/**
 * Test de concurență pe Curse (plan §11): „comandă la milisecunda de închidere".
 * Verifică pe DB-ul REAL (SQLite în dev; rulează-l identic pe Postgres la pilot,
 * cu DATABASE_URL setat) că tick-ul e corect sub apeluri paralele:
 *   1. 10 tick-uri simultane + 20 de comenzi inserate în timpul închiderii;
 *   2. Cursa se închide EXACT o dată (un singur eveniment cursa.cutoff);
 *   3. după tick-ul final, nicio comandă „nou" nu rămâne într-o Cursă închisă.
 *
 * Cere serverul pornit: `npm run dev` (alt terminal), apoi `node scripts/test-concurrency.mjs`.
 * Curăță după el (inclusiv evenimentele de test — nu murdărește /puls).
 */
import { PrismaClient } from "@prisma/client";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const db = new PrismaClient();

const results = [];
const check = (label, pass, got) => {
  results.push(pass);
  console.log(`${pass ? "✓" : "✗"} ${label}${pass ? "" : ` — am primit: ${got}`}`);
};

async function main() {
  const city = await db.city.findFirst();
  const consumer = await db.consumer.findFirst();
  if (!city || !consumer) throw new Error("DB fără seed — rulează întâi `npm run db:seed`.");

  // mediu de test izolat: producător + Cursă cu cutoff-ul DEJA scadent
  const producer = await db.producer.create({
    data: { name: "TEST Concurență", owner: "robot", lat: city.lat, lng: city.lng, cityId: city.id },
  });
  const cursa = await db.cursa.create({
    data: {
      deliveryDay: "Joi",
      cutoff: "test",
      cutoffAt: new Date(Date.now() - 1000),
      deliveryAt: new Date(Date.now() + 3_600_000),
      producerId: producer.id,
    },
  });

  // 30 de comenzi „nou" înainte de închidere
  await db.order.createMany({
    data: Array.from({ length: 30 }, (_, i) => ({
      status: "nou",
      total: 40 + i,
      consumerId: consumer.id,
      cursaId: cursa.id,
    })),
  });

  // focul încrucișat: 10 tick-uri paralele + 20 de comenzi care pică FIX la închidere
  const ticks = Array.from({ length: 10 }, () => fetch(`${BASE}/api/tick`, { method: "POST" }).then((r) => r.json()));
  const lateOrders = Array.from({ length: 20 }, (_, i) =>
    db.order.create({ data: { status: "nou", total: 20 + i, consumerId: consumer.id, cursaId: cursa.id } }),
  );
  const [tickResults] = await Promise.all([Promise.all(ticks), Promise.all(lateOrders)]);

  // măturarea finală: orice a scăpat printre milisecunde se expiră acum
  await fetch(`${BASE}/api/tick`, { method: "POST" });

  const closedTotal = tickResults.reduce((s, t) => s + (t.closed ?? 0), 0);
  const events = await db.event.findMany({ where: { name: "cursa.cutoff", props: { contains: cursa.id } } });
  const after = await db.cursa.findUnique({ where: { id: cursa.id } });
  const orphanNoi = await db.order.count({ where: { cursaId: cursa.id, status: "nou" } });
  const expirate = await db.order.count({ where: { cursaId: cursa.id, status: "expirat" } });
  const totalOrders = await db.order.count({ where: { cursaId: cursa.id } });

  console.log("\nTest de concurență pe Curse (comandă la milisecunda închiderii)\n");
  check("10 tick-uri paralele închid Cursa EXACT o dată", closedTotal === 1, `closed=${closedTotal}`);
  check("un singur eveniment cursa.cutoff", events.length === 1, `${events.length} evenimente`);
  check("Cursa e închisă la final", after?.status === "inchisa", after?.status);
  check("nicio comandă „nou” într-o Cursă închisă", orphanNoi === 0, `${orphanNoi} rămase`);
  check("toate cele 50 de comenzi contabilizate (expirate)", totalOrders === 50 && expirate === 50, `total=${totalOrders}, expirate=${expirate}`);

  // curățenie completă (inclusiv evenimentele — /puls rămâne curat)
  await db.order.deleteMany({ where: { cursaId: cursa.id } });
  await db.event.deleteMany({ where: { props: { contains: cursa.id } } });
  await db.cursa.delete({ where: { id: cursa.id } });
  await db.producer.delete({ where: { id: producer.id } });

  const passed = results.filter(Boolean).length;
  console.log(`\n${passed}/${results.length} asserturi trecute ${passed === results.length ? "✓" : "✗"}`);
  process.exitCode = passed === results.length ? 0 : 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
