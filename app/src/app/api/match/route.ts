import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { haversineKm } from "@/lib/geo";
import { matchBasin, type MatchProducerInput } from "@/lib/matching";

/**
 * Matching pe bazinul real (Etapa 4): cererea structurată (chei de produs) →
 * producătorii din raza cumpărătorului care au ce caută. Single-producer-first
 * (#21) + alternative de „piață continuă". Date reale din DB (Prisma/SQLite).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const addr: string = body.addr === "cluj" ? "cluj" : "buc";
    const requestedKeys: string[] = Array.isArray(body.keys) ? body.keys : [];
    const yourProducerId: string = body.yourProducerId ?? "p-ferma-verde";
    const consumerId = addr === "cluj" ? "c-ana" : "c-silviu";

    const consumer = await db.consumer.findUnique({ where: { id: consumerId }, include: { city: true } });
    const producers = await db.producer.findMany({ include: { offers: true } });
    const radius = consumer?.city.radiusKm ?? 45;

    const inRange: MatchProducerInput[] = producers
      .map((p) => ({
        p,
        dist: consumer ? haversineKm(consumer.lat, consumer.lng, p.lat, p.lng) : Infinity,
      }))
      .filter((x) => x.dist <= radius)
      .map(({ p, dist }) => ({
        id: p.id,
        name: p.name,
        owner: p.owner,
        emoji: p.emoji,
        punctuality: p.punctuality,
        distanceKm: Math.round(dist),
        transport: p.deliveryFee,
        deliveryWindow: p.deliveryWindow,
        isYours: p.id === yourProducerId,
        offers: p.offers.map((o) => ({
          productName: o.productName,
          emoji: o.emoji,
          price: o.price,
          unit: o.unit,
          deliveryDay: o.deliveryDay,
        })),
      }));

    const result = matchBasin(inRange, requestedKeys);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
