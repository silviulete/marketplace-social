/**
 * Date demo pentru călătoria vânzătorului (Etapa 1b, scriptat).
 * Vânzătorul = Ion Marin (Ferma Verde). Cursa de joi, cutoff marți 12:00.
 * Stoc mic intenționat la roșii → la ultima comandă trebuie să suplimenteze.
 */

import type { OfferProductDraft, SellerOrderData } from "./artifacts";

export const SELLER = {
  firstName: "Ion",
  farm: "Ferma Verde",
  neighborhood: "București + Ilfov",
  deliveryDay: "Joi, 14 iun",
  cutoff: "marți, 12:00",
};

/** Oferta cu care pleacă Ion azi (editabilă înainte de publicare). */
export const DEFAULT_OFFER: OfferProductDraft[] = [
  { id: "rosii", name: "Roșii coapte", emoji: "🍅", unit: "kg", price: 9, stock: 8 },
  { id: "castraveti", name: "Castraveți", emoji: "🥒", unit: "kg", price: 9, stock: 4 },
];

/** Produse pe care Ion le poate adăuga rapid în ofertă. */
export const OFFER_PRESETS: OfferProductDraft[] = [
  { id: "ardei", name: "Ardei gras", emoji: "🫑", unit: "kg", price: 12, stock: 6 },
  { id: "dovlecei", name: "Dovlecei", emoji: "🥒", unit: "kg", price: 7, stock: 5 },
  { id: "ceapa-verde", name: "Ceapă verde", emoji: "🧅", unit: "legătură", price: 4, stock: 20 },
  { id: "salata", name: "Salată verde", emoji: "🥬", unit: "buc", price: 5, stock: 15 },
];

/** Comenzile care pică una câte una (la momente diferite). */
export const SELLER_ORDERS: SellerOrderData[] = [
  {
    id: "o1",
    buyer: "Maria P.",
    address: "Str. Teiului 4, ap. 2",
    items: [{ name: "Roșii coapte", emoji: "🍅", qty: 2, unit: "kg", productKey: "rosii", price: 18 }],
    fulfillTotal: 18,
  },
  {
    id: "o2",
    buyer: "Andrei D.",
    address: "Bd. Unirii 22, ap. 5",
    items: [
      { name: "Roșii coapte", emoji: "🍅", qty: 3, unit: "kg", productKey: "rosii", price: 27 },
      { name: "Castraveți", emoji: "🥒", qty: 1, unit: "kg", productKey: "castraveti", price: 9 },
    ],
    fulfillTotal: 36,
  },
  {
    // Comanda lui Silviu din 1a — cere și produse pe care Ion NU le oferă.
    id: "o3",
    buyer: "Silviu C.",
    address: "Str. Florilor 12, ap. 3",
    items: [
      { name: "Roșii coapte", emoji: "🍅", qty: 3, unit: "kg", productKey: "rosii", price: 27 },
      { name: "Castraveți", emoji: "🥒", qty: 1, unit: "kg", productKey: "castraveti", price: 9 },
      { name: "Miere de salcâm", emoji: "🍯", qty: 1, unit: "borcan" }, // nu ai
      { name: "Ceapă verde", emoji: "🧅", qty: 1, unit: "legătură" }, // nu ai (dacă n-a adăugat-o)
    ],
    fulfillTotal: 36,
  },
  {
    // Ajunge când roșiile s-au terminat → Accept blocat până suplimentează.
    id: "o4",
    buyer: "Elena M.",
    address: "Str. Lalelelor 8",
    items: [{ name: "Roșii coapte", emoji: "🍅", qty: 2, unit: "kg", productKey: "rosii", price: 18 }],
    fulfillTotal: 18,
  },
];
