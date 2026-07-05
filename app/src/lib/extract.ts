/**
 * Extractor determinist de ofertă din text liber românesc (Etapa 3).
 *
 * Principiu de hardening (#7, plan Etapa 3): **numerele (preț, cantitate, taxe)
 * se extrag DETERMINIST cu regex, NU de LLM** — LLM-ul (Gemma, prin
 * `ModelProvider`) ajută doar la structurarea limbajului. Aici, mock-ul ESTE
 * acest parser determinist; el validează contractul `ModelProvider`.
 *
 * Asociere pe proximitate: fiecare produs primește prețul și cantitatea cele mai
 * apropiate (înainte sau după el), ca să meargă și „8 kg roșii la 9 lei și 4 kg
 * castraveți la 9 lei", și „miere de salcâm, 25 lei borcanul".
 */
import type { OfferProductDraft } from "./artifacts";

export interface ExtractionResult {
  products: OfferProductDraft[];
  deliveryDay?: string;
  cutoff?: string;
  deliveryFee?: number;
  minOrder?: number;
  zones?: string[];
  missing: string[];
  confidence: number;
}

export interface ProductDef {
  match: RegExp;
  key: string; // cheia stabilă de stoc (aliniată cu comenzile demo)
  name: string;
  emoji: string;
  unit: string;
}

// Ordinea contează: variantele specifice („ceapă verde") înaintea celor generale.
// Exportat: și parserul de cerere (request.ts) și /api/match folosesc aceeași tabelă.
export const PRODUCTS: ProductDef[] = [
  { match: /ceap[ăa]\s*verde/i, key: "ceapa-verde", name: "Ceapă verde", emoji: "🧅", unit: "legătură" },
  { match: /ro[șs]ii?\s*cherry/i, key: "rosii-cherry", name: "Roșii cherry", emoji: "🍅", unit: "kg" },
  { match: /ro[șs]ii?|tomate/i, key: "rosii", name: "Roșii coapte", emoji: "🍅", unit: "kg" },
  { match: /castrave[țt]i?/i, key: "castraveti", name: "Castraveți", emoji: "🥒", unit: "kg" },
  { match: /ardei/i, key: "ardei", name: "Ardei gras", emoji: "🫑", unit: "kg" },
  { match: /miere/i, key: "miere", name: "Miere", emoji: "🍯", unit: "borcan" },
  { match: /ou[ăa]/i, key: "oua", name: "Ouă de țară", emoji: "🥚", unit: "zece" },
  { match: /cartof/i, key: "cartofi", name: "Cartofi", emoji: "🥔", unit: "kg" },
  { match: /ceap[ăa]/i, key: "ceapa", name: "Ceapă", emoji: "🧅", unit: "kg" },
  { match: /salat[ăa]/i, key: "salata", name: "Salată verde", emoji: "🥬", unit: "buc" },
  { match: /morcov/i, key: "morcovi", name: "Morcovi", emoji: "🥕", unit: "kg" },
  { match: /usturoi/i, key: "usturoi", name: "Usturoi", emoji: "🧄", unit: "kg" },
  { match: /dovlec/i, key: "dovlecei", name: "Dovlecei", emoji: "🥒", unit: "kg" },
  { match: /vinete/i, key: "vinete", name: "Vinete", emoji: "🍆", unit: "kg" },
  { match: /mere/i, key: "mere", name: "Mere", emoji: "🍎", unit: "kg" },
  { match: /pere/i, key: "pere", name: "Pere", emoji: "🍐", unit: "kg" },
  { match: /prune/i, key: "prune", name: "Prune", emoji: "🫐", unit: "kg" },
  { match: /zacusc[ăa]/i, key: "zacusca", name: "Zacuscă", emoji: "🥫", unit: "borcan" },
  { match: /gem|dulcea[țt][ăa]/i, key: "gem", name: "Gem", emoji: "🍓", unit: "borcan" },
  { match: /var[zZ][ăaz]/i, key: "varza", name: "Varză", emoji: "🥬", unit: "buc" },
  { match: /fasole/i, key: "fasole", name: "Fasole", emoji: "🫘", unit: "kg" },
  { match: /nuci/i, key: "nuci", name: "Nuci", emoji: "🌰", unit: "kg" },
  { match: /m[ăa]rar/i, key: "marar", name: "Mărar", emoji: "🌿", unit: "legătură" },
  { match: /p[ăa]trunjel/i, key: "patrunjel", name: "Pătrunjel", emoji: "🌿", unit: "legătură" },
];

export const DAYS = ["luni", "marți", "miercuri", "joi", "vineri", "sâmbătă", "duminică"];
export const DAY_CANON: Record<string, string> = {
  luni: "Luni", marti: "Marți", miercuri: "Miercuri", joi: "Joi",
  vineri: "Vineri", sambata: "Sâmbătă", duminica: "Duminică",
};

export const num = (s: string) => Math.round(parseFloat(s.replace(",", ".")));
export const deburr = (s: string) =>
  s.toLowerCase().replace(/[ăâ]/g, "a").replace(/î/g, "i").replace(/ș/g, "s").replace(/ț/g, "t");

const PRICE_RE = /(\d+(?:[.,]\d+)?)\s*(?:lei|ron)\b/gi;
const QTY_RE = /(\d+(?:[.,]\d+)?)\s*(?:de\s+)?(kg|kile|kil|buc[ăa]?[țt]i?|borcane|borcan|leg[ăa]turi|leg[ăa]tur[ăa]|leg|zeci|zece|litri|litru|l)\b/gi;

const PRICE_CAP = 50; // distanță max (caractere) produs↔preț
const QTY_CAP = 40;

export function normalizeUnit(u: string): string {
  const x = u.toLowerCase();
  if (x.startsWith("kil") || x === "kg") return "kg";
  if (x.startsWith("borcan")) return "borcan";
  if (x.startsWith("leg")) return "legătură";
  if (x.startsWith("zec")) return "zece";
  if (x === "l" || x.startsWith("litr")) return "L";
  if (x.startsWith("buc")) return "buc";
  return "kg";
}

function inferCutoff(canonDay: string): string {
  const idx = DAYS.indexOf(canonDay.toLowerCase());
  if (idx < 0) return "";
  return `${DAYS[(idx - 2 + 7) % 7]}, 12:00`;
}

export interface ProductMatch {
  def: ProductDef;
  start: number;
  end: number;
}

/**
 * Găsește produsele dintr-un text (cu poziții; fără suprapuneri — „ceapă verde"
 * exclude „ceapă"). Partajat de `parseOffer` (vânzător) și `parseRequest`
 * (cumpărător), ca ambii să recunoască exact același vocabular de produse.
 */
export function findProducts(text: string): ProductMatch[] {
  const matches: ProductMatch[] = [];
  for (const def of PRODUCTS) {
    const m = def.match.exec(text);
    if (!m) continue;
    const start = m.index;
    const end = start + m[0].length;
    if (matches.some((x) => start < x.end && end > x.start)) continue;
    matches.push({ def, start, end });
  }
  matches.sort((a, b) => a.start - b.start);
  return matches;
}

/** Numele unei oferte din DB („Roșii coapte") → cheia de produs („rosii"). */
export function productKeyOf(productName: string): string | undefined {
  return findProducts(productName)[0]?.def.key;
}

export function parseOffer(text: string): ExtractionResult {
  // 1) produsele (cu poziții; fără suprapuneri — „ceapă verde" exclude „ceapă")
  const matches = findProducts(text);

  // 2) toate prețurile și cantitățile, cu poziții
  const prices = [...text.matchAll(PRICE_RE)].map((m) => ({ value: num(m[1]), at: m.index ?? 0 }));
  const qtys = [...text.matchAll(QTY_RE)].map((m) => ({ value: num(m[1]), unit: normalizeUnit(m[2]), at: m.index ?? 0 }));

  // 3) asociere: PREȚUL e primul care apare DUPĂ produs, în segmentul lui (prețul
  //    vine de obicei după produs: „cartofi 5 lei"); CANTITATEA = cea mai apropiată
  //    din segment (poate fi înainte: „8 kg roșii").
  const products: OfferProductDraft[] = matches.map(({ def, start }, i) => {
    const nextStart = matches[i + 1]?.start ?? text.length;
    const prevEnd = i > 0 ? matches[i - 1].end : 0;

    const forwardPrice = prices.filter((p) => p.at >= start && p.at < nextStart).sort((a, b) => a.at - b.at)[0];
    const price = forwardPrice ?? nearest(prices, start, PRICE_CAP);
    const qtyInSeg = qtys.filter((q) => q.at >= prevEnd && q.at < nextStart);
    const qty = nearest(qtyInSeg, start, QTY_CAP);

    return {
      id: def.key,
      name: def.name,
      emoji: def.emoji,
      unit: qty?.unit ?? def.unit,
      price: price?.value ?? 0,
      stock: qty?.value ?? 0,
    };
  });

  // 4) livrare (zi normalizată, cutoff implicit cu 2 zile înainte)
  const dayM = deburr(text).match(/\b(luni|marti|miercuri|joi|vineri|sambata|duminica)\b/);
  const deliveryDay = dayM ? DAY_CANON[dayM[1]] : undefined;
  const cutoffM = deburr(text).match(/se inchide[^a-z]*?(luni|marti|miercuri|joi|vineri|sambata|duminica)/);
  const cutoff = cutoffM
    ? `${DAY_CANON[cutoffM[1]].toLowerCase()}, 12:00`
    : deliveryDay
      ? inferCutoff(deliveryDay)
      : undefined;

  // 5) taxe / minim / zone (opționale)
  const feeM = text.match(/transport[^\d]{0,12}(\d+)\s*lei|(\d+)\s*lei[^\d]{0,12}(?:transport|livrare)/i);
  const deliveryFee = feeM ? num(feeM[1] ?? feeM[2]) : undefined;
  const minM = text.match(/minim[^\d]{0,12}(\d+)\s*lei/i);
  const minOrder = minM ? num(minM[1]) : undefined;
  const zones = [...deburr(text).matchAll(/\b(bucuresti|ilfov|cluj|timisoara|iasi|brasov|constanta|sibiu)\b/g)].map(
    (m) => m[1].charAt(0).toUpperCase() + m[1].slice(1),
  );

  // 6) ce lipsește + încredere
  const missing: string[] = [];
  if (products.length === 0) missing.push("ce produse vinzi");
  for (const p of products) if (!p.price) missing.push(`prețul pentru ${p.name.toLowerCase()}`);
  if (products.length > 0 && !deliveryDay) missing.push("ziua de livrare");

  const withPrice = products.filter((p) => p.price > 0).length;
  const confidence = products.length === 0 ? 0 : (withPrice / products.length) * 0.7 + (deliveryDay ? 0.3 : 0);

  return {
    products,
    deliveryDay,
    cutoff,
    deliveryFee,
    minOrder,
    zones: zones.length ? [...new Set(zones)] : undefined,
    missing,
    confidence,
  };
}

function nearest<T extends { at: number }>(items: T[], pos: number, cap: number): T | undefined {
  let best: T | undefined;
  let bestD = Infinity;
  for (const it of items) {
    const d = Math.abs(it.at - pos);
    if (d < bestD && d <= cap) {
      bestD = d;
      best = it;
    }
  }
  return best;
}
