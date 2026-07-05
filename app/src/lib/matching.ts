/**
 * Matching ușor pe bazinul real (Etapa 4 — „matching continuu vizibil").
 *
 * Funcție PURĂ: primește producătorii (cu oferte + distanță deja calculată) și
 * cheile cerute, întoarce potrivirile. Determinist, fără LLM (#7/#14). E sămânța
 * `MatchingEngine`-ului complet de la Etapa 5 (coș cu transport transparent,
 * consolidare, plafon de 5) — aici doar arătăm CINE are CE în bazin.
 *
 * Single-producer-first (#21): dacă un producător acoperă toată lista, e marcat
 * `singleProducerId` (preferat cel mai apropiat / al tău).
 */
import { productKeyOf } from "./extract";

export interface MatchProducerInput {
  id: string;
  name: string;
  owner: string;
  emoji: string;
  punctuality: number;
  distanceKm: number;
  transport: number; // taxă de livrare per comandă (per producător)
  deliveryWindow: string; // fereastra de livrare în ziua Cursei
  isYours?: boolean;
  offers: { productName: string; emoji: string; price: number; unit: string; deliveryDay: string }[];
}

export interface MatchOffer {
  key: string;
  productName: string;
  emoji: string;
  price: number;
  unit: string;
}

export interface MatchGroup {
  producerId: string;
  producerName: string;
  owner: string;
  emoji: string;
  distanceKm: number;
  punctuality: number;
  transport: number; // taxă de livrare per comandă
  deliveryDay: string;
  deliveryWindow: string;
  isYours: boolean;
  offers: MatchOffer[]; // doar ofertele care potrivesc cheile cerute
}

/** O alternativă „de piață continuă": rudă a unui produs cerut, de la alt producător. */
export interface MatchAlternative {
  producerId: string;
  producerName: string;
  distanceKm: number;
  deliveryDay: string;
  offer: MatchOffer;
  forKey: string; // cheia cerută pentru care e alternativă (ex. „rosii")
}

export interface MatchResult {
  groups: MatchGroup[];
  unmatchedKeys: string[];
  singleProducerId?: string; // un producător care acoperă TOATE cheile cerute
  alternatives: MatchAlternative[];
}

/** Familia unui produs: „rosii-cherry" și „rosii" sunt rude (familia „rosii"). */
const family = (key: string) => key.split("-")[0];

export function matchBasin(producers: MatchProducerInput[], requestedKeys: string[]): MatchResult {
  const requested = new Set(requestedKeys);
  const requestedFamilies = new Set(requestedKeys.map(family));

  // ordine: producătorul tău întâi, apoi cel mai apropiat
  const sorted = [...producers].sort(
    (a, b) => Number(!!b.isYours) - Number(!!a.isYours) || a.distanceKm - b.distanceKm,
  );

  const groups: MatchGroup[] = [];
  const alternatives: MatchAlternative[] = [];
  const coverage = new Map<string, string[]>(); // cheie → producerIds

  for (const p of sorted) {
    const matched: MatchOffer[] = [];
    for (const o of p.offers) {
      const key = productKeyOf(o.productName);
      if (!key) continue;
      const offer: MatchOffer = { key, productName: o.productName, emoji: o.emoji, price: o.price, unit: o.unit };
      if (requested.has(key)) {
        matched.push(offer);
        coverage.set(key, [...(coverage.get(key) ?? []), p.id]);
      } else if (requestedFamilies.has(family(key))) {
        // rudă a unui produs cerut, dar nu fix ce s-a cerut → alternativă
        const forKey = requestedKeys.find((k) => family(k) === family(key))!;
        alternatives.push({
          producerId: p.id,
          producerName: p.name,
          distanceKm: p.distanceKm,
          deliveryDay: p.offers[0]?.deliveryDay ?? "—",
          offer,
          forKey,
        });
      }
    }
    if (matched.length > 0) {
      groups.push({
        producerId: p.id,
        producerName: p.name,
        owner: p.owner,
        emoji: p.emoji,
        distanceKm: p.distanceKm,
        punctuality: p.punctuality,
        transport: p.transport,
        deliveryDay: p.offers[0]?.deliveryDay ?? "—",
        deliveryWindow: p.deliveryWindow,
        isYours: !!p.isYours,
        offers: matched,
      });
    }
  }

  const unmatchedKeys = requestedKeys.filter((k) => !coverage.has(k));

  // un producător care acoperă TOATE cheile cerute (single-producer-first, #21)
  const singleProducerId = groups.find(
    (g) => requestedKeys.every((k) => g.offers.some((o) => o.key === k)),
  )?.producerId;

  return { groups, unmatchedKeys, singleProducerId, alternatives };
}
