// Seed demo (Etapa 2): 2 bazine (București+Ilfov, Cluj), producători cu coordonate
// reale (unul intenționat în afara razei de 45 km), oferte în scopul pilotului
// (legume + miere/conserve; fără lactate/carne — #11), Curse per producător (#18).

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const PRODUCERS = [
  // ——— București + Ilfov (în rază de la adresa lui Silviu) ———
  {
    id: "p-ferma-verde", name: "Ferma Verde", owner: "Ion Marin", emoji: "🧑‍🌾",
    lat: 44.55, lng: 26.13, punctuality: 98, cityId: "buc",
    deliveryFee: 18, deliveryWindow: "08:00–10:00",
    deliveryDay: "Joi", cutoff: "marți, 12:00",
    offers: [
      { productName: "Roșii coapte", emoji: "🍅", price: 9, unit: "kg", stock: 40 },
      { productName: "Castraveți", emoji: "🥒", price: 9, unit: "kg", stock: 25 },
      { productName: "Ardei gras", emoji: "🫑", price: 12, unit: "kg", stock: 15 },
    ],
  },
  {
    id: "p-stupina", name: "Stupina Florea", owner: "Maria Florea", emoji: "🐝",
    lat: 44.62, lng: 26.20, punctuality: 95, cityId: "buc",
    deliveryFee: 12, deliveryWindow: "10:00–13:00",
    deliveryDay: "Vineri", cutoff: "miercuri, 12:00",
    offers: [{ productName: "Miere de salcâm", emoji: "🍯", price: 25, unit: "borcan", stock: 30 }],
  },
  {
    id: "p-gradina", name: "Grădina Bunicii", owner: "Vasile Popa", emoji: "🥬",
    lat: 44.32, lng: 25.92, punctuality: 92, cityId: "buc",
    deliveryFee: 20, deliveryWindow: "07:00–09:00",
    deliveryDay: "Miercuri", cutoff: "luni, 12:00",
    offers: [
      { productName: "Salată verde", emoji: "🥬", price: 5, unit: "buc", stock: 50 },
      { productName: "Ceapă verde", emoji: "🧅", price: 4, unit: "legătură", stock: 40 },
      { productName: "Roșii coapte", emoji: "🍅", price: 11, unit: "kg", stock: 25 },
    ],
  },
  {
    id: "p-sera", name: "Sera Mariei", owner: "Maria Ile", emoji: "🍅",
    lat: 44.50, lng: 26.05, punctuality: 97, cityId: "buc",
    deliveryFee: 16, deliveryWindow: "09:00–11:00",
    deliveryDay: "Joi", cutoff: "marți, 12:00",
    offers: [{ productName: "Roșii cherry", emoji: "🍅", price: 14, unit: "kg", stock: 20 }],
  },
  {
    // ÎN AFARA RAZEI (~55 km, spre Ploiești) — nu trebuie să apară pentru Silviu.
    id: "p-livada", name: "Livada lui Vasile", owner: "Vasile Lung", emoji: "🍎",
    lat: 44.92, lng: 26.03, punctuality: 90, cityId: "buc",
    deliveryFee: 15, deliveryWindow: "08:00–10:00",
    deliveryDay: "Sâmbătă", cutoff: "joi, 12:00",
    offers: [{ productName: "Mere ionatan", emoji: "🍎", price: 6, unit: "kg", stock: 60 }],
  },
  // ——— Cluj-Napoca (alt bazin) ———
  {
    id: "p-apuseni", name: "Ferma Apuseni", owner: "Dan Crișan", emoji: "🧑‍🌾",
    lat: 46.85, lng: 23.55, punctuality: 96, cityId: "cluj",
    deliveryFee: 15, deliveryWindow: "08:00–10:00",
    deliveryDay: "Vineri", cutoff: "miercuri, 12:00",
    offers: [
      { productName: "Cartofi", emoji: "🥔", price: 5, unit: "kg", stock: 80 },
      { productName: "Morcovi", emoji: "🥕", price: 6, unit: "kg", stock: 40 },
    ],
  },
  {
    id: "p-somesana", name: "Grădina Someșană", owner: "Ioana Mureșan", emoji: "🥬",
    lat: 46.72, lng: 23.78, punctuality: 94, cityId: "cluj",
    deliveryFee: 14, deliveryWindow: "09:00–12:00",
    deliveryDay: "Joi", cutoff: "marți, 12:00",
    offers: [
      { productName: "Roșii de grădină", emoji: "🍅", price: 10, unit: "kg", stock: 30 },
      { productName: "Usturoi", emoji: "🧄", price: 15, unit: "kg", stock: 18 },
    ],
  },
];

async function main() {
  // Ștergere în ordinea dependențelor (copii înainte de părinți).
  await db.order.deleteMany();
  await db.basket.deleteMany();
  await db.request.deleteMany();
  await db.cursa.deleteMany();
  await db.offer.deleteMany();
  await db.station.deleteMany();
  await db.neighborhood.deleteMany();
  await db.producer.deleteMany();
  await db.consumer.deleteMany();
  await db.city.deleteMany();

  await db.city.create({ data: { id: "buc", name: "București + Ilfov", lat: 44.4268, lng: 26.1025, radiusKm: 45 } });
  await db.city.create({ data: { id: "cluj", name: "Cluj-Napoca", lat: 46.7712, lng: 23.6236, radiusKm: 45 } });

  for (const p of PRODUCERS) {
    const { offers, deliveryDay, cutoff, ...pd } = p;
    await db.producer.create({ data: pd });
    for (const o of offers) {
      await db.offer.create({ data: { ...o, deliveryDay, cutoff, producerId: p.id } });
    }
    await db.cursa.create({ data: { deliveryDay, cutoff, status: "deschisa", producerId: p.id } });
  }

  await db.consumer.create({
    data: { id: "c-silviu", name: "Silviu", address: "Str. Florilor 12, București", lat: 44.43, lng: 26.10, cityId: "buc" },
  });
  await db.consumer.create({
    data: { id: "c-ana", name: "Ana", address: "Str. Memorandumului 8, Cluj", lat: 46.77, lng: 23.62, cityId: "cluj" },
  });

  const offers = await db.offer.count();
  const producers = await db.producer.count();
  console.log(`Seed gata: 2 bazine, ${producers} producători, ${offers} oferte.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
