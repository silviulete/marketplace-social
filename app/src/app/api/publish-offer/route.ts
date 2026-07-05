import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getNotifyProvider } from "@/lib/notify-provider";
import { nextOccurrence } from "@/lib/termene";

/**
 * Publică oferta vânzătorului în DB (Etapa 3): om confirmă → store (#7).
 * Înlocuiește ofertele producătorului și asigură o Cursă deschisă. După publicare,
 * ofertele apar la cumpărători în `/bazin`.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const producerId: string = body.producerId ?? "p-ferma-verde";
    const deliveryDay: string = body.deliveryDay ?? "Joi";
    const cutoff: string = body.cutoff ?? "marți, 12:00";
    const products: Array<{ name: string; emoji?: string; price?: number; unit?: string; stock?: number }> =
      Array.isArray(body.products) ? body.products : [];

    await db.offer.deleteMany({ where: { producerId } });
    for (const p of products) {
      await db.offer.create({
        data: {
          productName: p.name,
          emoji: p.emoji ?? "🥬",
          price: p.price ?? 0,
          unit: p.unit ?? "kg",
          stock: p.stock ?? 0,
          deliveryDay,
          cutoff,
          producerId,
        },
      });
    }

    // termenele reale (Etapa 11, #42): derivate din etichete; le execută /api/tick
    const cutoffAt = nextOccurrence(cutoff);
    const deliveryAt = nextOccurrence(deliveryDay, "08:00", cutoffAt ?? undefined);

    const cursa = await db.cursa.findFirst({ where: { producerId } });
    if (cursa) {
      await db.cursa.update({
        where: { id: cursa.id },
        data: { deliveryDay, cutoff, cutoffAt, deliveryAt, status: "deschisa" },
      });
    } else {
      await db.cursa.create({ data: { deliveryDay, cutoff, cutoffAt, deliveryAt, status: "deschisa", producerId } });
    }

    // notificare critică (Etapa 11): Cursa e deschisă — simulat acum, email la pilot
    const producer = await db.producer.findUnique({ where: { id: producerId } });
    await getNotifyProvider().send({
      to: "urmaritori@pilot.local", // la pilot: lista reală de urmăritori ai producătorului
      subject: `${producer?.name ?? "Producătorul tău"} a deschis Cursa de ${deliveryDay.toLowerCase()}`,
      body: `Comenzile se string până ${cutoff}. Intră în chat și cere ce-ți trebuie.`,
    });

    return NextResponse.json({ ok: true, count: products.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
