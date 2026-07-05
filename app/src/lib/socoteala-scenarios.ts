/**
 * Scenarii de regresie pentru `MatchingEngine` (Etapa 5 — „Socoteala").
 *
 * „Set fix → coșuri rezonabile (assert pe scor)" — rulăm motorul determinist pe
 * fixture-uri controlate și verificăm: un singur vânzător dacă e posibil (#21),
 * altfel **numărul minim de surse** (fără consolidare), transport/zi per vânzător,
 * produse negăsite, plafonul de **5 vânzători la afișare** și ordonarea după scor.
 * Vizibil la `/socoteala`, ca `/golden`.
 */
import type { OrderItem } from "./artifacts";
import type { MatchGroup } from "./matching";
import { composeBasket, producerScore, rankProducers, MAX_SELLERS } from "./matching-engine";

const item = (id: string, name: string, amount: number, unit = "kg"): OrderItem => ({
  id, name, emoji: "🛒", amount, unit, unitPrice: 0,
});

const offer = (key: string, productName: string, price: number, unit = "kg") => ({
  key, productName, emoji: "🥬", price, unit,
});

// ——— bazin-fixture (producători cu transport + zi proprii) ———
const ION: MatchGroup = {
  producerId: "ion", producerName: "Ferma Verde", owner: "Ion Marin", emoji: "🧑‍🌾",
  distanceKm: 14, punctuality: 98, transport: 18, deliveryDay: "Joi", deliveryWindow: "08:00–10:00", isYours: true,
  offers: [offer("rosii", "Roșii coapte", 9), offer("castraveti", "Castraveți", 9), offer("ardei", "Ardei gras", 12)],
};
const GRADINA: MatchGroup = {
  producerId: "gradina", producerName: "Grădina Bunicii", owner: "Vasile Popa", emoji: "🥬",
  distanceKm: 20, punctuality: 92, transport: 20, deliveryDay: "Miercuri", deliveryWindow: "07:00–09:00", isYours: false,
  offers: [offer("salata", "Salată verde", 5, "buc"), offer("ceapa-verde", "Ceapă verde", 4, "legătură"), offer("rosii", "Roșii coapte", 11)],
};
const STUPINA: MatchGroup = {
  producerId: "stupina", producerName: "Stupina Florea", owner: "Maria Florea", emoji: "🐝",
  distanceKm: 23, punctuality: 95, transport: 12, deliveryDay: "Vineri", deliveryWindow: "10:00–13:00", isYours: false,
  offers: [offer("miere", "Miere de salcâm", 25, "borcan")],
};
const BAZIN = [ION, GRADINA, STUPINA];

export interface Check {
  label: string;
  pass: boolean;
  got: string;
}
export interface Scenario {
  name: string;
  desc: string;
  checks: Check[];
}

const check = (label: string, pass: boolean, got: unknown): Check => ({ label, pass, got: String(got) });
const groupOf = (b: ReturnType<typeof composeBasket>, name: string) => b.groups.find((g) => g.producerName === name);

export function runSocoteala(): Scenario[] {
  const scenarios: Scenario[] = [];

  // 1) un singur vânzător dacă e posibil (#21)
  {
    const b = composeBasket([item("rosii", "Roșii coapte", 2), item("castraveti", "Castraveți", 1), item("ardei", "Ardei gras", 1)], BAZIN);
    scenarios.push({
      name: "Un singur vânzător (#21)",
      desc: "roșii ×2, castraveți ×1, ardei ×1 — Ion le are pe toate",
      checks: [
        check("un singur grup (o livrare)", b.groups.length === 1, b.groups.length),
        check("vânzătorul = Ferma Verde", b.groups[0]?.producerName === "Ferma Verde", b.groups[0]?.producerName),
        check("un singur transport (18 lei)", b.transportTotal === 18, b.transportTotal),
        check("total corect (39 marfă + 18)", b.grandTotal === 57, b.grandTotal),
      ],
    });
  }

  // 2) surse minime (fără consolidare): 2 vânzători, nu 3
  {
    const b = composeBasket([item("miere", "Miere de salcâm", 1, "borcan"), item("rosii", "Roșii coapte", 2), item("salata", "Salată verde", 1, "buc")], BAZIN);
    scenarios.push({
      name: "Surse minime (fără consolidare)",
      desc: "miere, roșii ×2, salată — nimeni nu le are pe toate → cele mai puține surse",
      checks: [
        check("2 grupuri (nu 3)", b.groups.length === 2, b.groups.length),
        check("roșiile vin de la Grădina (minimizează sursele)", !!groupOf(b, "Grădina Bunicii")?.lines.some((l) => l.name === "Roșii coapte"), groupOf(b, "Grădina Bunicii")?.lines.map((l) => l.name).join("+")),
        check("mierea vine de la Stupina", !!groupOf(b, "Stupina Florea")?.lines.some((l) => l.name.startsWith("Miere")), "verificat"),
        check("Ferma Verde NU e în coș (ar fi a 3-a sursă)", !groupOf(b, "Ferma Verde"), groupOf(b, "Ferma Verde") ? "e" : "nu"),
        check("transport = 20 + 12", b.transportTotal === 32, b.transportTotal),
        check("total = 52 marfă + 32", b.grandTotal === 84, b.grandTotal),
      ],
    });
  }

  // 3) surse minime preferate peste preț
  {
    const b = composeBasket([item("miere", "Miere de salcâm", 1, "borcan"), item("rosii", "Roșii coapte", 1)], BAZIN);
    const rosiiPrice = b.groups.flatMap((g) => g.lines).find((l) => l.name === "Roșii coapte")?.price;
    scenarios.push({
      name: "Mai puține surse > preț",
      desc: "miere + roșii — roșiile sunt mai ieftine la Ion (9), dar Grădina e oricum necesară? Nu (miere e la Stupina)",
      checks: [
        // miere doar la Stupina; roșii la Ion(9)/Grădina(11). 2 surse oricum → alege roșii la Ion (mai bun scor) căci nu reduce sursele
        check("2 grupuri", b.groups.length === 2, b.groups.length),
        check("roșiile la Ion (9 lei, scor mai bun)", rosiiPrice === 9, rosiiPrice),
      ],
    });
  }

  // 4) produs negăsit în bazin → unmatched
  {
    const b = composeBasket([item("rosii", "Roșii coapte", 1), item("usturoi", "Usturoi", 1)], BAZIN);
    scenarios.push({
      name: "Produs negăsit",
      desc: "roșii + usturoi — usturoiul nu există în bazin",
      checks: [
        check("coșul are roșiile", b.groups.some((g) => g.lines.some((l) => l.name === "Roșii coapte")), "da"),
        check("usturoiul e marcat negăsit", !!b.unmatched?.includes("Usturoi"), b.unmatched?.join(", ") ?? "—"),
      ],
    });
  }

  // 5) plafon de 5 vânzători la afișare (#18, clarificat)
  {
    const many: MatchGroup[] = Array.from({ length: 6 }, (_, i) => ({
      ...GRADINA, producerId: `p${i}`, producerName: `Vânzător ${i + 1}`, isYours: i === 3, punctuality: 90 + i, distanceKm: 30 - i,
      offers: [offer("rosii", "Roșii coapte", 9 + i)],
    }));
    const shown = rankProducers(many).slice(0, MAX_SELLERS);
    scenarios.push({
      name: "Plafon de 5 vânzători (#18)",
      desc: "roșii la 6 vânzători → se afișează doar primii 5",
      checks: [
        check("se afișează 5 vânzători", shown.length === 5, shown.length),
        check("favoritul e primul", shown[0]?.isYours === true, shown[0]?.producerName),
      ],
    });
  }

  // 6) ordonare după scor (favorit + rating + distanță)
  {
    scenarios.push({
      name: "Ordonare după scor",
      desc: "Ion (al tău, aproape, 98%) bate Grădina (mai departe, 92%)",
      checks: [check("scor Ion > scor Grădina", producerScore(ION) > producerScore(GRADINA), `${Math.round(producerScore(ION))} > ${Math.round(producerScore(GRADINA))}`)],
    });
  }

  return scenarios;
}
