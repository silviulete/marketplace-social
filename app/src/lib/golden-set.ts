/**
 * Golden set de regresie (Etapa 3): ~40 fraze românești reale → extragerea
 * așteptată. Țintă: ≥9/10 (≈36/40). Rulat vizibil la `/golden`; e plasa de
 * siguranță când legăm Gemma/cloud în spatele aceluiași `ModelProvider`.
 */
import { parseOffer } from "./extract";

export interface GoldenCase {
  text: string;
  products: { name: string; price?: number; stock?: number }[];
  day?: string;
}

export const GOLDEN: GoldenCase[] = [
  { text: "Am 8 kg roșii la 9 lei și 4 kg castraveți la 9 lei, livrez joi", products: [{ name: "Roșii coapte", price: 9, stock: 8 }, { name: "Castraveți", price: 9, stock: 4 }], day: "Joi" },
  { text: "vând miere de salcâm, 25 lei borcanul, livrare vineri", products: [{ name: "Miere", price: 25 }], day: "Vineri" },
  { text: "ardei gras 12 lei kg", products: [{ name: "Ardei gras", price: 12 }] },
  { text: "cartofi noi 5 lei kilu, am vreo 80 de kile", products: [{ name: "Cartofi", price: 5, stock: 80 }] },
  { text: "roșii cherry la 14 lei, joi", products: [{ name: "Roșii cherry", price: 14 }], day: "Joi" },
  { text: "ouă de țară, 18 lei zecea", products: [{ name: "Ouă de țară", price: 18 }] },
  { text: "salată verde 5 lei bucata și ceapă verde 4 lei legătura", products: [{ name: "Salată verde", price: 5 }, { name: "Ceapă verde", price: 4 }] },
  { text: "usturoi 15 lei kg, livrez miercuri", products: [{ name: "Usturoi", price: 15 }], day: "Miercuri" },
  { text: "morcovi 6 lei, cartofi 5 lei", products: [{ name: "Morcovi", price: 6 }, { name: "Cartofi", price: 5 }] },
  { text: "zacuscă de casă 20 lei borcanul", products: [{ name: "Zacuscă", price: 20 }] },
  { text: "am roșii frumoase, vreo 40 de kile, le dau cu 9 lei kila, le aduc joi", products: [{ name: "Roșii coapte", price: 9, stock: 40 }], day: "Joi" },
  { text: "dovlecei 7 lei kg, vineri", products: [{ name: "Dovlecei", price: 7 }], day: "Vineri" },
  { text: "vinete 8 lei, miercuri, transport 15 lei", products: [{ name: "Vinete", price: 8 }], day: "Miercuri" },
  { text: "mere ionatan 6 lei kg", products: [{ name: "Mere", price: 6 }] },
  { text: "pere 7 lei", products: [{ name: "Pere", price: 7 }] },
  { text: "varză 4 lei bucata", products: [{ name: "Varză", price: 4 }] },
  { text: "fasole verde 10 lei kg, joi", products: [{ name: "Fasole", price: 10 }], day: "Joi" },
  { text: "nuci 30 lei kg", products: [{ name: "Nuci", price: 30 }] },
  { text: "mărar 3 lei legătura, pătrunjel 3 lei", products: [{ name: "Mărar", price: 3 }, { name: "Pătrunjel", price: 3 }] },
  { text: "gem de caise 18 lei borcanul", products: [{ name: "Gem", price: 18 }] },
  { text: "ceapă 4 lei kg", products: [{ name: "Ceapă", price: 4 }] },
  { text: "roșii 9 lei, castraveți 8 lei, ardei 12 lei, livrez joi", products: [{ name: "Roșii coapte", price: 9 }, { name: "Castraveți", price: 8 }, { name: "Ardei gras", price: 12 }], day: "Joi" },
  { text: "am 20 de borcane de miere la 25 lei, vineri", products: [{ name: "Miere", price: 25, stock: 20 }], day: "Vineri" },
  { text: "cartofi 5 lei, minim 30 lei comanda", products: [{ name: "Cartofi", price: 5 }] },
  { text: "vând roșii în zona București, 10 lei kg, joi", products: [{ name: "Roșii coapte", price: 10 }], day: "Joi" },
  { text: "castraveti 9 lei", products: [{ name: "Castraveți", price: 9 }] },
  { text: "rosii 8 lei kg si ardei 11 lei", products: [{ name: "Roșii coapte", price: 8 }, { name: "Ardei gras", price: 11 }] },
  { text: "salata 5 lei, livrare sambata", products: [{ name: "Salată verde", price: 5 }], day: "Sâmbătă" },
  { text: "10 kg cartofi la 5 lei si 5 kg morcovi la 6 lei, joi", products: [{ name: "Cartofi", price: 5, stock: 10 }, { name: "Morcovi", price: 6, stock: 5 }], day: "Joi" },
  { text: "miere 25 lei, ceapă verde 4 lei legătura, vineri", products: [{ name: "Miere", price: 25 }, { name: "Ceapă verde", price: 4 }], day: "Vineri" },
  { text: "am ouă, 18 lei zece bucăți", products: [{ name: "Ouă de țară", price: 18 }] },
  { text: "roșii coapte 9 lei kilogramul", products: [{ name: "Roșii coapte", price: 9 }] },
  { text: "dovlecei 8 lei kg, joi", products: [{ name: "Dovlecei", price: 8 }], day: "Joi" },
  { text: "morcovi 6 lei, livrez marți", products: [{ name: "Morcovi", price: 6 }], day: "Marți" },
  { text: "roșii 9 lei kg, joi, transport 18 lei", products: [{ name: "Roșii coapte", price: 9 }], day: "Joi" },
  { text: "vând cartofi, 5 lei kg, livrare joi, minim 40 lei", products: [{ name: "Cartofi", price: 5 }], day: "Joi" },
  { text: "ardei kapia 12 lei kg", products: [{ name: "Ardei gras", price: 12 }] },
  { text: "prune 7 lei, mere 6 lei, joi", products: [{ name: "Prune", price: 7 }, { name: "Mere", price: 6 }], day: "Joi" },
  { text: "miere poliflora 25 lei borcan, sâmbătă", products: [{ name: "Miere", price: 25 }], day: "Sâmbătă" },
  { text: "roșii 10 lei kg, livrez în Cluj, vineri", products: [{ name: "Roșii coapte", price: 10 }], day: "Vineri" },
];

export interface GradeResult {
  text: string;
  pass: boolean;
  issues: string[];
}

export function gradeCase(c: GoldenCase): GradeResult {
  const r = parseOffer(c.text);
  const issues: string[] = [];

  for (const exp of c.products) {
    const got = r.products.find((p) => p.name === exp.name);
    if (!got) {
      issues.push(`lipsește „${exp.name}"`);
      continue;
    }
    if (exp.price !== undefined && got.price !== exp.price) issues.push(`preț ${exp.name}: ${got.price}≠${exp.price}`);
    if (exp.stock !== undefined && got.stock !== exp.stock) issues.push(`stoc ${exp.name}: ${got.stock}≠${exp.stock}`);
  }
  if (c.day && r.deliveryDay !== c.day) issues.push(`zi: ${r.deliveryDay ?? "—"}≠${c.day}`);

  return { text: c.text, pass: issues.length === 0, issues };
}

export function runGolden(): { passed: number; total: number; results: GradeResult[] } {
  const results = GOLDEN.map(gradeCase);
  return { passed: results.filter((r) => r.pass).length, total: results.length, results };
}
