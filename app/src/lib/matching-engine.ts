/**
 * `MatchingEngine` determinist (Etapa 5 — „Socoteala"). FĂRĂ LLM (#7/#14).
 *
 * Politica de compunere a coșului (decizia fondatorului):
 *  - **un singur vânzător dacă e posibil** (#21) — un coș, o livrare, un transport;
 *  - dacă nu, **numărul MINIM de surse** necesare (2, 3… câte trebuie). Minimizarea
 *    livrărilor e implicită — NU există pas separat de „consolidare".
 *  - fiecare vânzător din coș are **transport + zi + fereastră proprii** (transparență
 *    înainte de acceptare, #12); produsele negăsite → `unmatched`.
 *
 * Ordonarea / departajarea (când mai mulți acoperă la fel): **favorit (producătorul
 * tău) + rating de punctualitate + distanță** (prețul nu decide — nota #—).
 *
 * Plafonul de 5 (#18, clarificat) e pe AFIȘAREA potrivirilor (cel mult 5 vânzători),
 * nu pe coș — vezi `rankProducers` + felierea din chat.
 *
 * Funcție pură (cerere + producători → coș), testabilă cu asserturi (`/socoteala`).
 */
import type { BasketArtifact, BasketGroup, OrderItem, PaymentArtifact, PaymentRow } from "./artifacts";
import type { MatchGroup, MatchOffer } from "./matching";

export const MAX_SELLERS = 5; // câți vânzători se afișează la potriviri (#18)

const firstName = (full: string) => full.split(" ")[0];

/** Scorul unei oferte (pentru alegerea producătorului pe un produs anume). Mai mare = mai bun. */
export function scoreOffer(s: { isYours: boolean; punctuality: number; distanceKm: number; price: number }): number {
  return (s.isYours ? 1000 : 0) + s.punctuality * 2 - s.distanceKm - s.price * 0.5;
}

/** Scorul unui vânzător pentru ordonare/departajare: favorit + rating + distanță. */
export function producerScore(g: MatchGroup): number {
  return (g.isYours ? 1000 : 0) + g.punctuality * 2 - g.distanceKm;
}

/** Vânzătorii ordonați după favorit + rating + distanță (pentru afișarea celor 5). */
export function rankProducers(groups: MatchGroup[]): MatchGroup[] {
  return [...groups].sort((a, b) => producerScore(b) - producerScore(a));
}

interface Candidate {
  group: MatchGroup;
  offer: MatchOffer;
}

/** Pentru fiecare cheie cerută, candidații (producător + ofertă), cel mai bun întâi. */
function candidatesByKey(items: OrderItem[], groups: MatchGroup[]): Map<string, Candidate[]> {
  const byKey = new Map<string, Candidate[]>();
  for (const it of items) {
    const cands: Candidate[] = [];
    for (const g of groups) {
      const offer = g.offers.find((o) => o.key === it.id);
      if (offer) cands.push({ group: g, offer });
    }
    cands.sort(
      (a, b) =>
        scoreOffer({ isYours: b.group.isYours, punctuality: b.group.punctuality, distanceKm: b.group.distanceKm, price: b.offer.price }) -
        scoreOffer({ isYours: a.group.isYours, punctuality: a.group.punctuality, distanceKm: a.group.distanceKm, price: a.offer.price }),
    );
    if (cands.length) byKey.set(it.id, cands);
  }
  return byKey;
}

/** Combinațiile de mărime `k` dintr-o listă (pentru acoperirea minimă). */
function* combinations<T>(arr: T[], k: number): Generator<T[]> {
  if (k === 0) {
    yield [];
    return;
  }
  for (let i = 0; i <= arr.length - k; i++) {
    for (const rest of combinations(arr.slice(i + 1), k - 1)) yield [arr[i], ...rest];
  }
}

/**
 * Numărul MINIM de vânzători care acoperă toate produsele cerute. La egalitate de
 * mărime, alege varianta cu scorul de vânzători cel mai mare (favorit/rating/distanță).
 */
function minimalCover(keys: string[], groups: MatchGroup[]): MatchGroup[] {
  const cands = rankProducers(groups.filter((g) => g.offers.some((o) => keys.includes(o.key)))).slice(0, 8);
  for (let size = 1; size <= cands.length; size++) {
    let best: MatchGroup[] | undefined;
    let bestScore = -Infinity;
    for (const combo of combinations(cands, size)) {
      const covered = new Set<string>();
      for (const g of combo) for (const o of g.offers) if (keys.includes(o.key)) covered.add(o.key);
      if (covered.size === keys.length) {
        const s = combo.reduce((a, g) => a + producerScore(g), 0);
        if (s > bestScore) {
          bestScore = s;
          best = combo;
        }
      }
    }
    if (best) return best;
  }
  return cands;
}

function lineFor(it: OrderItem, offer: MatchOffer) {
  return { name: it.name, qty: `${it.amount} ${offer.unit}`, price: it.amount * offer.price, emoji: it.emoji };
}

function groupFor(g: MatchGroup, picks: { it: OrderItem; offer: MatchOffer }[]): BasketGroup {
  const lines = picks.map((p) => lineFor(p.it, p.offer));
  return {
    producerId: g.producerId,
    producerName: g.producerName,
    distanceKm: g.distanceKm,
    isYourProducer: g.isYours,
    lines,
    goodsTotal: lines.reduce((s, l) => s + l.price, 0),
    transport: g.transport,
    deliveryDay: g.deliveryDay,
    deliveryWindow: g.deliveryWindow,
    available: lines.length,
    requested: lines.length,
  };
}

export function composeBasket(items: OrderItem[], groups: MatchGroup[]): BasketArtifact {
  const byKey = candidatesByKey(items, groups);
  const matched = items.filter((it) => byKey.has(it.id));
  const unmatched = items.filter((it) => !byKey.has(it.id)).map((it) => it.name);
  const matchedKeys = matched.map((it) => it.id);

  // ——— un singur vânzător dacă e posibil (#21); altfel surse minime ———
  const single = rankProducers(groups.filter((g) => matchedKeys.every((k) => g.offers.some((o) => o.key === k))))[0];
  const cover = single ? [single] : minimalCover(matchedKeys, groups);
  const coverIds = new Set(cover.map((g) => g.producerId));

  // fiecare produs → cel mai bun ofertant DIN acoperire
  const assign = new Map<string, { it: OrderItem; offer: MatchOffer }[]>();
  const groupById = new Map<string, MatchGroup>();
  for (const it of matched) {
    const inCover = byKey.get(it.id)!.filter((c) => coverIds.has(c.group.producerId));
    const chosen = inCover[0] ?? byKey.get(it.id)![0];
    groupById.set(chosen.group.producerId, chosen.group);
    const arr = assign.get(chosen.group.producerId) ?? [];
    arr.push({ it, offer: chosen.offer });
    assign.set(chosen.group.producerId, arr);
  }

  // grupurile în ordinea vânzătorilor (favorit/rating/distanță)
  const basketGroups = rankProducers([...groupById.values()]).map((g) => groupFor(g, assign.get(g.producerId)!));

  const goodsTotal = basketGroups.reduce((s, g) => s + g.goodsTotal, 0);
  const transportTotal = basketGroups.reduce((s, g) => s + g.transport, 0);
  const n = basketGroups.length;
  const owner = single ? firstName(single.owner) : "";

  return {
    type: "basket",
    title: "Coșul tău",
    groups: basketGroups,
    goodsTotal,
    transportTotal,
    grandTotal: goodsTotal + transportTotal,
    note:
      n === 1 && single
        ? `Tot de la ${owner} — o singură livrare ${single.deliveryDay.toLowerCase()}, fără transport dublu.`
        : n > 1
          ? `Nimeni din bazin nu le are pe toate — ${n} producători, ${n} livrări (numărul minim). Vezi transportul și ziua fiecăruia.`
          : undefined,
    unmatched: unmatched.length ? unmatched : undefined,
    primaryActionLabel: n === 1 && single ? `Trimite comanda la ${owner}` : "Trimite comenzile",
  };
}

/** Ținta de rotunjire în sus (la următorul multiplu de 5 lei) + donația către fond. */
export function roundTarget(grandTotal: number): { target: number; donation: number } {
  const target = grandTotal % 5 === 0 ? grandTotal + 5 : Math.ceil(grandTotal / 5) * 5;
  return { target, donation: target - grandTotal };
}

/** Plata dintr-un coș compus (Etapa 5/7), cu escrow + rotunjire voluntară la fond. */
export function buildPaymentFromBasket(
  basket: BasketArtifact,
  roundUp?: { target: number; donation: number; on: boolean },
): PaymentArtifact {
  const single = basket.groups.length === 1;
  const rows: PaymentRow[] = [];
  for (const g of basket.groups) {
    for (const l of g.lines) rows.push({ label: `${l.name} · ${l.qty}`, amount: l.price, kind: "goods" });
    rows.push({
      label: single ? "Transport (o livrare)" : `Transport · ${g.producerName}`,
      amount: g.transport,
      kind: "transport",
    });
  }
  if (roundUp?.on) rows.push({ label: "Rotunjire → fondul comunității", amount: roundUp.donation });
  const total = basket.grandTotal + (roundUp?.on ? roundUp.donation : 0);
  return {
    type: "payment",
    title: single ? `Coș · ${basket.groups[0].producerName}` : "Coș · mai mulți producători",
    orderId: "FV-2841",
    producerName: single ? basket.groups[0].producerName : `${basket.groups.length} producători`,
    deliveryDay: single ? basket.groups[0].deliveryDay : "pe Cursele fiecăruia",
    deliveryWindow: single ? basket.groups[0].deliveryWindow : undefined,
    validatedBySeller: true,
    emoji: "🧺",
    rows,
    total,
    escrowNote: "Banii rămân blocați în siguranță până confirmi că ai primit coșul.",
    roundUp,
    actionLabel: `Plătește ${total} lei`,
  };
}
