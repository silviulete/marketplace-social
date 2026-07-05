/**
 * Golden set de regresie pentru „Strigarea" (Etapa 4): fraze românești reale de
 * cerere → structurarea așteptată. Oglindește golden set-ul Tarabei (Etapa 3).
 * Țintă: ≥9/10. Include cazuri VAGI (trebuie marcate `unclear` → o întrebare).
 * Plasa de siguranță când legăm Gemma în spatele aceluiași `ModelProvider`.
 */
import { parseRequest } from "./request";

export interface RequestGoldenCase {
  text: string;
  items?: { name: string; amount?: number }[];
  when?: string;
  priceMax?: number;
  unclear?: boolean; // cerere vagă → o singură întrebare
}

export const REQUEST_GOLDEN: RequestGoldenCase[] = [
  { text: "Caut 2 kg roșii, 1 kg castraveți și niște ardei", items: [{ name: "Roșii coapte", amount: 2 }, { name: "Castraveți", amount: 1 }, { name: "Ardei gras", amount: 1 }] },
  { text: "vreau roșii și miere", items: [{ name: "Roșii coapte" }, { name: "Miere" }] },
  { text: "aș vrea 3 kg cartofi până joi", items: [{ name: "Cartofi", amount: 3 }], when: "Joi" },
  { text: "caut castraveți sub 10 lei", items: [{ name: "Castraveți" }], priceMax: 10 },
  { text: "îmi trebuie un borcan de miere", items: [{ name: "Miere", amount: 1 }] },
  { text: "vreau roșii cherry, cât mai repede", items: [{ name: "Roșii cherry" }], when: "Cât mai repede" },
  { text: "2 kg morcovi și 1 kg ceapă", items: [{ name: "Morcovi", amount: 2 }, { name: "Ceapă", amount: 1 }] },
  { text: "caut salată verde și ceapă verde", items: [{ name: "Salată verde" }, { name: "Ceapă verde" }] },
  { text: "vreau ouă de țară, azi", items: [{ name: "Ouă de țară" }], when: "Azi" },
  { text: "îmi trebuie ardei între 8 și 12 lei", items: [{ name: "Ardei gras" }], priceMax: 12 },
  { text: "5 kg roșii pentru bulion", items: [{ name: "Roșii coapte", amount: 5 }] },
  { text: "caut usturoi și mărar", items: [{ name: "Usturoi" }, { name: "Mărar" }] },
  // — cazuri vagi: trebuie să ceară clarificare —
  { text: "aș vrea ceva proaspăt de gătit diseară", unclear: true },
  { text: "vreau niște legume", unclear: true },
];

export interface RequestGradeResult {
  text: string;
  pass: boolean;
  issues: string[];
}

export function gradeRequestCase(c: RequestGoldenCase): RequestGradeResult {
  const r = parseRequest(c.text);
  const issues: string[] = [];

  if (c.unclear) {
    if (!r.unclear) issues.push("ar fi trebuit să ceară clarificare");
    if (r.unclear && !r.question) issues.push("lipsește întrebarea de clarificare");
  } else {
    if (r.unclear) issues.push("a cerut clarificare în loc de card");
    for (const exp of c.items ?? []) {
      const got = r.items.find((p) => p.name === exp.name);
      if (!got) {
        issues.push(`lipsește „${exp.name}"`);
        continue;
      }
      if (exp.amount !== undefined && got.amount !== exp.amount) issues.push(`cant. ${exp.name}: ${got.amount}≠${exp.amount}`);
    }
    if (c.when && r.when !== c.when) issues.push(`când: ${r.when ?? "—"}≠${c.when}`);
    if (c.priceMax !== undefined && r.priceMax !== c.priceMax) issues.push(`preț max: ${r.priceMax ?? "—"}≠${c.priceMax}`);
  }

  return { text: c.text, pass: issues.length === 0, issues };
}

export function runRequestGolden(): { passed: number; total: number; results: RequestGradeResult[] } {
  const results = REQUEST_GOLDEN.map(gradeRequestCase);
  return { passed: results.filter((r) => r.pass).length, total: results.length, results };
}
