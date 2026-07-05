/**
 * Date demo pentru Etapa 1a (scriptat, fără AI, fără DB).
 * Bazinul = „București + Ilfov" (oraș + peri-urban ~40–50 km, decizia #10).
 * Producătorul tău = Ferma Verde (Ion Marin), care vinde toate produsele din
 * scenariu → fulfillment de la un singur producător.
 */

import type { OrderItem } from "./artifacts";

export const NEIGHBORHOOD = {
  name: "București + Ilfov",
  activeProducers: 12,
  freshOffersToday: 7,
};

export const BUYER = {
  firstName: "Silviu",
};

export const PRODUCERS = {
  fermaVerde: {
    id: "ferma-verde",
    name: "Ferma Verde",
    owner: "Ion Marin",
    tagline: "Legume bio",
    emoji: "🧑‍🌾",
    distanceKm: 12,
    punctuality: 98,
    deliveryDay: "Joi, 14 iun",
    deliveryWindow: "08:00–10:00",
    transport: 18, // taxă de livrare per comandă
  },
} as const;

/**
 * Comanda „de data trecută" (re-comanda cu un tap) — mono-producător (Ferma
 * Verde), ca single-producer-first să se păstreze (#21). Prețurile sunt deja
 * cunoscute (comandă anterioară), spre deosebire de o cerere nouă tastată.
 */
export const DEFAULT_ORDER: OrderItem[] = [
  { id: "rosii", name: "Roșii coapte", emoji: "🍅", amount: 2, unit: "kg", unitPrice: 9, note: "bine coapte" },
  { id: "castraveti", name: "Castraveți", emoji: "🥒", amount: 1, unit: "kg", unitPrice: 9, note: "proaspeți" },
  { id: "ardei", name: "Ardei gras", emoji: "🫑", amount: 1, unit: "kg", unitPrice: 12 },
];

/** Sugestii de start pentru „Strigarea" (Etapa 4/5): cerere clară, multi-producător, vagă. */
export const NEED_SUGGESTIONS = {
  clear: "Caut 2 kg roșii, 1 kg castraveți și niște ardei", // → single-producer (Ferma Verde)
  multi: "Vreau miere, 2 kg roșii și o salată verde", // → multi-producător + consolidare (Etapa 5)
  vague: "Aș vrea ceva proaspăt de gătit diseară",
  clarify: "Roșii și castraveți",
};

/** Produse pe care le poți adăuga rapid în comandă (tot de la Ferma Verde). */
export const QUICK_ADD: OrderItem[] = [
  { id: "ceapa-verde", name: "Ceapă verde", emoji: "🧅", amount: 1, unit: "legătură", unitPrice: 4 },
  { id: "marar", name: "Mărar", emoji: "🌿", amount: 1, unit: "legătură", unitPrice: 3 },
  { id: "oua", name: "Ouă de țară", emoji: "🥚", amount: 1, unit: "zece", unitPrice: 18 },
  { id: "cartofi", name: "Cartofi noi", emoji: "🥔", amount: 1, unit: "kg", unitPrice: 5 },
];
