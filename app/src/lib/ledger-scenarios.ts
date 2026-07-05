/**
 * Scenarii de regresie pentru plată + escrow + ledger (Etapa 7). Verifică:
 * plata blochează în escrow, eliberarea trimite la producători + fond, refund-ul
 * întoarce cumpărătorului, split-ul multi-producător, rotunjirea la fond și
 * **invariantul de reconciliere (suma ledger = 0)**. Vizibil la `/bani`.
 */
import type { BasketArtifact, BasketGroup } from "./artifacts";
import { SimulatedPaymentProvider } from "./payment-provider";

function group(producerId: string, producerName: string, goods: number, transport: number): BasketGroup {
  return {
    producerId,
    producerName,
    lines: [{ name: "produs", qty: "1 kg", price: goods }],
    goodsTotal: goods,
    transport,
    deliveryDay: "Joi",
    available: 1,
    requested: 1,
  };
}

function basket(groups: BasketGroup[]): BasketArtifact {
  const goodsTotal = groups.reduce((s, g) => s + g.goodsTotal, 0);
  const transportTotal = groups.reduce((s, g) => s + g.transport, 0);
  return {
    type: "basket",
    title: "Coș",
    groups,
    goodsTotal,
    transportTotal,
    grandTotal: goodsTotal + transportTotal,
    primaryActionLabel: "",
  };
}

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

export function runLedger(): Scenario[] {
  const scenarios: Scenario[] = [];

  // 1) plata blochează în escrow
  {
    const pp = new SimulatedPaymentProvider();
    pp.pay(basket([group("ion", "Ferma Verde", 39, 18)])); // 57
    scenarios.push({
      name: "Plată → escrow",
      desc: "coș 57 lei (39 marfă + 18 transport) — banii se blochează",
      checks: [
        check("escrow = 57 (blocați)", pp.ledger.balance("escrow") === 57, pp.ledger.balance("escrow")),
        check("cumpărător = −57 (a plătit)", pp.ledger.balance("cumparator") === -57, pp.ledger.balance("cumparator")),
        check("producătorul n-a primit încă", pp.ledger.balance("producator:ion") === 0, pp.ledger.balance("producator:ion")),
        check("reconciliere: suma ledger = 0", pp.ledger.total() === 0, pp.ledger.total()),
      ],
    });
  }

  // 2) eliberare la livrare → producător
  {
    const pp = new SimulatedPaymentProvider();
    const r = pp.pay(basket([group("ion", "Ferma Verde", 39, 18)]));
    pp.release(r.paymentId);
    scenarios.push({
      name: "Eliberare → producător",
      desc: "la livrarea confirmată, escrow → producător",
      checks: [
        check("producătorul a primit 57", pp.ledger.balance("producator:ion") === 57, pp.ledger.balance("producator:ion")),
        check("escrow golit (0)", pp.ledger.balance("escrow") === 0, pp.ledger.balance("escrow")),
        check("reconciliere: suma = 0", pp.ledger.total() === 0, pp.ledger.total()),
      ],
    });
  }

  // 3) refund la anulare → cumpărător
  {
    const pp = new SimulatedPaymentProvider();
    const r = pp.pay(basket([group("ion", "Ferma Verde", 39, 18)]));
    pp.refund(r.paymentId);
    scenarios.push({
      name: "Refund → cumpărător",
      desc: "anulare/refuz/expirare — banii se întorc",
      checks: [
        check("cumpărătorul e la 0 (recuperat)", pp.ledger.balance("cumparator") === 0, pp.ledger.balance("cumparator")),
        check("escrow golit (0)", pp.ledger.balance("escrow") === 0, pp.ledger.balance("escrow")),
        check("producătorul NU a primit nimic", pp.ledger.balance("producator:ion") === 0, pp.ledger.balance("producator:ion")),
        check("reconciliere: suma = 0", pp.ledger.total() === 0, pp.ledger.total()),
      ],
    });
  }

  // 4) rotunjire voluntară → fond
  {
    const pp = new SimulatedPaymentProvider();
    const r = pp.pay(basket([group("ion", "Ferma Verde", 39, 18)]), { roundUpTo: 60 }); // +3 fond
    pp.release(r.paymentId);
    scenarios.push({
      name: "Rotunjire → fond (#6)",
      desc: "plătești 60 în loc de 57 — 3 lei merg la fondul comunității",
      checks: [
        check("fond = 3", pp.ledger.balance("fond") === 3, pp.ledger.balance("fond")),
        check("producătorul = 57 (nu ia rotunjirea)", pp.ledger.balance("producator:ion") === 57, pp.ledger.balance("producator:ion")),
        check("reconciliere: suma = 0", pp.ledger.total() === 0, pp.ledger.total()),
      ],
    });
  }

  // 5) split multi-producător
  {
    const pp = new SimulatedPaymentProvider();
    const r = pp.pay(basket([group("gradina", "Grădina Bunicii", 27, 20), group("stupina", "Stupina Florea", 25, 12)])); // 47 + 37 = 84
    pp.release(r.paymentId);
    scenarios.push({
      name: "Split multi-producător",
      desc: "coș din 2 surse — fiecare producător primește partea lui",
      checks: [
        check("Grădina = 47 (27+20)", pp.ledger.balance("producator:gradina") === 47, pp.ledger.balance("producator:gradina")),
        check("Stupina = 37 (25+12)", pp.ledger.balance("producator:stupina") === 37, pp.ledger.balance("producator:stupina")),
        check("escrow golit (0)", pp.ledger.balance("escrow") === 0, pp.ledger.balance("escrow")),
        check("reconciliere: suma = 0", pp.ledger.total() === 0, pp.ledger.total()),
      ],
    });
  }

  // 6) invariant sub operații amestecate
  {
    const pp = new SimulatedPaymentProvider();
    const a = pp.pay(basket([group("ion", "Ferma Verde", 39, 18)]), { roundUpTo: 60 });
    const b = pp.pay(basket([group("stupina", "Stupina Florea", 25, 12)]));
    pp.release(a.paymentId);
    pp.refund(b.paymentId);
    scenarios.push({
      name: "Invariant sub operații amestecate",
      desc: "2 plăți, o eliberare, un refund — ledger-ul rămâne închis",
      checks: [
        check("reconciliere: suma = 0", pp.ledger.total() === 0, pp.ledger.total()),
        check("escrow gol după release+refund", pp.ledger.balance("escrow") === 0, pp.ledger.balance("escrow")),
      ],
    });
  }

  return scenarios;
}
