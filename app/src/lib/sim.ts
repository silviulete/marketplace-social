/**
 * Simularea de densitate (Etapa 1c) — mock scriptat al Cursei, condus de un ceas
 * accelerat (tick-driven). NU e motorul real (înlocuit de Etapa 6b); forma respectă
 * mașina de stări a Cursei: deschisă → (cutoff) → închisă · livrare.
 *
 * Scop: validarea timpurie a celui mai mare risc al lui D — „o piață continuă pare
 * vie sau moartă?". Diferența vizuală 40 vs. 150 utilizatori trebuie să fie evidentă.
 */

export interface SimProducer {
  id: string;
  name: string;
  emoji: string;
}

export interface SimOrder {
  id: number;
  simMin: number; // momentul (minute de la deschiderea Cursei)
  buyer: string;
  producerId: string;
  producerName: string;
  productEmoji: string;
  product: string;
  qty: number;
  unit: string;
}

export const SIM_PRODUCERS: SimProducer[] = [
  { id: "ferma-verde", name: "Ferma Verde", emoji: "🧑‍🌾" },
  { id: "stupina-florea", name: "Stupina Florea", emoji: "🐝" },
  { id: "gradina-bunicii", name: "Grădina Bunicii", emoji: "🥬" },
  { id: "livada-vasile", name: "Livada lui Vasile", emoji: "🍎" },
  { id: "sera-mariei", name: "Sera Mariei", emoji: "🍅" },
  { id: "doua-mere", name: "Ferma Două Mere", emoji: "🍏" },
];

const BUYERS = [
  "Maria P.", "Andrei D.", "Elena M.", "Vlad C.", "Ioana T.", "Radu S.", "Ana M.",
  "Mihai R.", "Dana L.", "George P.", "Sorina V.", "Paul N.", "Bianca F.", "Cristi B.",
  "Alina G.", "Tudor M.", "Raluca D.", "Ștefan A.",
];

const PRODUCTS = [
  { name: "roșii", emoji: "🍅", unit: "kg" },
  { name: "castraveți", emoji: "🥒", unit: "kg" },
  { name: "miere", emoji: "🍯", unit: "borcan" },
  { name: "ouă", emoji: "🥚", unit: "zece" },
  { name: "cartofi", emoji: "🥔", unit: "kg" },
  { name: "ardei", emoji: "🫑", unit: "kg" },
  { name: "salată", emoji: "🥬", unit: "buc" },
  { name: "mere", emoji: "🍎", unit: "kg" },
];

/** Cele două scenarii cheie din plan. */
export const DENSITIES = [
  { users: 40, label: "Zonă rară" },
  { users: 150, label: "Zonă densă" },
] as const;

export const WINDOW_MIN = 24 * 60; // Luni 12:00 → Marți 12:00 (cutoff)
export const TICK_MS = 250; // cât de des împrospătăm ceasul (vizual)
export const RUN_MS = 22000; // un ciclu de Cursă rulează în ~22s reale
export const CUTOFF_LABEL = "marți, 12:00";
export const DELIVERY_LABEL = "joi";

const YIELD = 0.22; // comenzi ≈ utilizatori × YIELD pe ciclu de Cursă
export const ALIVE_THRESHOLD = 24; // comenzi proiectate → „viu"
export const FRAGILE_THRESHOLD = 12; // pragul de supraviețuire (~12/ciclu)

/** Numărul țintă de comenzi pe ciclu, în funcție de densitate. */
export function targetOrders(users: number): number {
  return users * YIELD;
}

/** Câți producători sunt „atinși" de comenzi (la densitate mică, piața se concentrează). */
function activeProducerCount(users: number): number {
  if (users <= 40) return 3;
  if (users <= 90) return 4;
  return SIM_PRODUCERS.length;
}

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

export function makeOrder(users: number, simMin: number, id: number): SimOrder {
  const producer = pick(SIM_PRODUCERS.slice(0, activeProducerCount(users)));
  const product = pick(PRODUCTS);
  return {
    id,
    simMin,
    buyer: pick(BUYERS),
    producerId: producer.id,
    producerName: producer.name,
    productEmoji: product.emoji,
    product: product.name,
    qty: 1 + Math.floor(Math.random() * 3),
    unit: product.unit,
  };
}

export function projectedTotal(orders: number, progress: number, users: number): number {
  if (progress < 0.06) return Math.round(users * YIELD);
  return Math.round(orders / progress);
}

export type Verdict = "viu" | "limita" | "fragil";
export function verdictOf(projected: number): Verdict {
  if (projected >= ALIVE_THRESHOLD) return "viu";
  if (projected >= FRAGILE_THRESHOLD) return "limita";
  return "fragil";
}

/** „se închide în 18h 30m" din minutele rămase. */
export function formatRemaining(remainingMin: number): string {
  const total = Math.max(0, Math.round(remainingMin));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}
