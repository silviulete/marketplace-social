/**
 * Parser determinist de CERERE din text liber românesc (Etapa 4 — „Strigarea",
 * agent #2). Simetric cu `extract.ts` (oferta vânzătorului): aici structurăm
 * NEVOIA cumpărătorului — produs, cantitate, interval de preț, „când".
 *
 * Principiu de hardening (#7): numerele (cantitate, interval de preț) se extrag
 * DETERMINIST cu regex, NU de LLM. Mock-ul ESTE acest parser; el validează
 * contractul `ModelProvider.extractRequest`. LLM-ul real (Gemma) va ajuta doar
 * la structurarea limbajului, păstrând numerele deterministe.
 *
 * Rafinare doar dacă e neclar (plan Etapa 4): dacă nu prindem niciun produs sau
 * cererea e prea vagă („ceva de gătit"), punem EXACT o întrebare de clarificare.
 */
import {
  DAYS,
  DAY_CANON,
  deburr,
  findProducts,
  normalizeUnit,
  num,
} from "./extract";

export interface RequestItem {
  id: string; // cheia de produs (ex. „rosii")
  name: string;
  emoji: string;
  amount: number; // cantitate cerută (implicit 1 dacă nu e specificată)
  unit: string; // „kg", „buc", „borcan", „legătură"
}

export interface RequestExtraction {
  items: RequestItem[];
  priceMin?: number; // „de la 8 lei" / „între 8 și 12"
  priceMax?: number; // „sub 12 lei" / „maxim 12" / „până în 12"
  cheap?: boolean; // „ieftin" / „cât mai ieftin"
  when?: string; // „azi", „mâine", o zi anume, „săptămâna asta", „cât mai repede"
  unclear: boolean; // cerere vagă → o singură întrebare
  question?: string; // întrebarea de clarificare (exact una)
  confidence: number;
}

// Termeni vagi (fără produs concret) — declanșează o singură întrebare.
const VAGUE_RE = /\b(legume|fructe|verde[țt]uri|ceva|de toate|c[âa]te ceva|nimic anume|de g[ăa]tit)\b/i;

const PRICE_MAX_RE = /(?:sub|maxim|max|p[âa]n[ăa]\s*[îi]n|cel mult|cel mai mult|nu mai mult de)\s*(\d+(?:[.,]\d+)?)\s*(?:lei|ron)?/i;
const PRICE_MIN_RE = /(?:peste|de la|minim|cel pu[țt]in)\s*(\d+(?:[.,]\d+)?)\s*(?:lei|ron)?/i;
const PRICE_RANGE_RE = /[îi]ntre\s*(\d+(?:[.,]\d+)?)\s*(?:[șs]i|-)\s*(\d+(?:[.,]\d+)?)\s*(?:lei|ron)?/i;
const QTY_RE = /(\d+(?:[.,]\d+)?)\s*(?:de\s+)?(kg|kile|kil|buc[ăa]?[țt]i?|borcane|borcan|leg[ăa]turi|leg[ăa]tur[ăa]|leg|zeci|zece|litri|litru|l)\b/gi;

const QTY_CAP = 40; // distanță max (caractere) produs↔cantitate

function parseWhen(text: string): string | undefined {
  const d = deburr(text);
  if (/\b(c[âa]t mai repede|urgent|imediat|acum)\b/.test(d)) return "Cât mai repede";
  if (/\bast[ăa]zi\b|\bazi\b/.test(d)) return "Azi";
  if (/\bm[âa]ine\b/.test(d)) return "Mâine";
  if (/\bs[ăa]pt[ăa]m[âa]na asta\b|\bz[ii]lele astea\b/.test(d)) return "Săptămâna asta";
  const day = d.match(/\b(luni|marti|miercuri|joi|vineri|sambata|duminica)\b/);
  if (day) return DAY_CANON[day[1]];
  void DAYS;
  return undefined;
}

export function parseRequest(text: string): RequestExtraction {
  const matches = findProducts(text);

  // cantitatea: cea mai apropiată din segmentul produsului (poate fi înainte:
  // „2 kg roșii"). Dacă nu se specifică, amount = 1 (cumpărătorul rafinează în card).
  const qtys = [...text.matchAll(QTY_RE)].map((m) => ({
    value: num(m[1]),
    unit: normalizeUnit(m[2]),
    at: m.index ?? 0,
  }));

  // fiecare cantitate aparține UNUI singur produs — cel mai apropiat (evită dubla
  // numărare: „miere, 2 kg roșii" → „2 kg" e al roșiilor, nu și al mierii).
  const ownerOf = qtys.map((q) => {
    let best = -1;
    let bestD = Infinity;
    matches.forEach((m, idx) => {
      const d = Math.abs(q.at - m.start);
      if (d < bestD && d <= QTY_CAP) {
        bestD = d;
        best = idx;
      }
    });
    return best;
  });

  const items: RequestItem[] = matches.map(({ def, start }, i) => {
    const owned = qtys.filter((_, qi) => ownerOf[qi] === i).sort((a, b) => Math.abs(a.at - start) - Math.abs(b.at - start));
    const q = owned[0];
    return {
      id: def.key,
      name: def.name,
      emoji: def.emoji,
      amount: q?.value ?? 1,
      unit: q?.unit ?? def.unit,
    };
  });

  // interval de preț
  let priceMin: number | undefined;
  let priceMax: number | undefined;
  const range = text.match(PRICE_RANGE_RE);
  if (range) {
    priceMin = num(range[1]);
    priceMax = num(range[2]);
  } else {
    const maxM = text.match(PRICE_MAX_RE);
    if (maxM) priceMax = num(maxM[1]);
    const minM = text.match(PRICE_MIN_RE);
    if (minM) priceMin = num(minM[1]);
  }
  const cheap = /\b(ieftin|cel mai ieftin|c[âa]t mai ieftin|economic)\b/i.test(text);

  const when = parseWhen(text);

  // vag → exact o întrebare
  let unclear = false;
  let question: string | undefined;
  if (items.length === 0) {
    unclear = true;
    question = VAGUE_RE.test(text)
      ? "Sigur — ce anume cauți mai exact? (ex. roșii, castraveți, ardei, miere)"
      : "Spune-mi ce produse cauți și îți găsesc producătorii din zona ta. (ex. „2 kg roșii și niște ardei”)";
  }

  // încredere: produse găsite + măcar un detaliu (cantitate/preț/când)
  const hasDetail = items.some((it) => it.amount > 1) || priceMax !== undefined || priceMin !== undefined || when !== undefined;
  const confidence = items.length === 0 ? 0 : 0.7 + (hasDetail ? 0.3 : 0);

  return { items, priceMin, priceMax, cheap, when, unclear, question, confidence };
}
