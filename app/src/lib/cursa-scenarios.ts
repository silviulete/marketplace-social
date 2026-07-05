/**
 * Scenarii de regresie pentru mașina de stări a Cursei (Etapa 6a) — rulate prin
 * `SimulatedClock` (fast-forward declanșează cutoff & livrarea). Verifică rutarea
 * la cutoff, accept→livrare, refuz→refund, expirarea la cutoff (#34) și gărzile.
 * Vizibil la `/cursa`, ca `/golden` și `/socoteala`.
 */
import { SimulatedClock } from "./clock";
import { CursaEngine } from "./cursa";

const H = 1;
const DAY = 24 * H;
const WEEK = 7 * DAY;
const TUE = 1 * DAY;
const WED = 2 * DAY;
const THU = 3 * DAY;
const CUTOFF1 = TUE + 12; // marți 12:00
const DELIVERY1 = THU + 8; // joi 08:00
const CUTOFF2 = CUTOFF1 + WEEK;
const DELIVERY2 = DELIVERY1 + WEEK;
const MON_AM = 0 + 8; // luni dimineață

const UNDO = 2 * H; // fereastra de răzgândire (#40): 2 ore, în unitățile ceasului de test

/** Mediu izolat: un producător cu Cursa „de joi" + Cursa următoare. */
function setup() {
  const clock = new SimulatedClock(MON_AM);
  const engine = new CursaEngine(clock, UNDO);
  const c1 = engine.openCursa("ion", "Joi", CUTOFF1, DELIVERY1);
  const c2 = engine.openCursa("ion", "Joi (următoarea)", CUTOFF2, DELIVERY2);
  return { clock, engine, c1, c2 };
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

export function runCursa(): Scenario[] {
  const scenarios: Scenario[] = [];

  // 1) comandă înainte de cutoff → Cursa curentă (de joi)
  {
    const { engine, c1 } = setup();
    const r = engine.placeOrder("ion", "Silviu", 57);
    scenarios.push({
      name: "Înainte de cutoff → Cursa de joi",
      desc: "luni dimineață, înainte de marți 12:00",
      checks: [
        check("rutat în Cursa curentă", r.routed === "curenta", r.routed),
        check("comanda e în Cursa de joi", r.cursa?.id === c1.id, r.cursa?.deliveryDay),
        check("statusul comenzii = nou", c1.orders[0]?.status === "nou", c1.orders[0]?.status),
      ],
    });
  }

  // 2) comandă după cutoff → Cursa următoare
  {
    const { clock, engine, c2 } = setup();
    clock.advanceTo(WED + 9); // miercuri, după ce marți 12:00 a trecut
    const r = engine.placeOrder("ion", "Silviu", 40);
    scenarios.push({
      name: "După cutoff → Cursa următoare",
      desc: "miercuri, după marți 12:00 — sare în Cursa următoare",
      checks: [
        check("rutat în Cursa următoare", r.routed === "urmatoare", r.routed),
        check("comanda e în Cursa următoare", r.cursa?.id === c2.id, r.cursa?.deliveryDay),
      ],
    });
  }

  // 3) accept → livrare în ziua de joi
  {
    const { clock, engine, c1 } = setup();
    engine.placeOrder("ion", "Silviu", 57);
    const ok = engine.accept(c1.id, c1.orders[0].id);
    clock.advanceTo(DELIVERY1 + 1); // trece cutoff-ul, apoi ziua de livrare
    scenarios.push({
      name: "Accept → livrare",
      desc: "producătorul acceptă; la ziua de joi comanda devine livrată",
      checks: [
        check("acceptarea a reușit", ok, ok),
        check("comanda = livrat", c1.orders[0].status === "livrat", c1.orders[0].status),
        check("Cursa = livrata", c1.status === "livrata", c1.status),
      ],
    });
  }

  // 4) refuz → refund (definitiv după fereastra de răzgândire, #40)
  {
    const { clock, engine, c1 } = setup();
    engine.placeOrder("ion", "Ana", 84);
    const ok = engine.refuse(c1.id, c1.orders[0].id);
    const noRefundYet = engine.refunds.length === 0;
    clock.advanceTo(MON_AM + UNDO); // fereastra expiră → refund definitiv
    scenarios.push({
      name: "Refuz → refund (după fereastră)",
      desc: "producătorul refuză; refundul devine definitiv când expiră fereastra de 2h",
      checks: [
        check("refuzul a reușit", ok, ok),
        check("comanda = refuzat", c1.orders[0].status === "refuzat", c1.orders[0].status),
        check("refund NU e emis imediat", noRefundYet, noRefundYet),
        check("refund emis după fereastră (84 lei)", engine.refunds.some((r) => r.reason === "refuzat" && r.amount === 84), engine.refunds.length),
      ],
    });
  }

  // 4b) răzgândire (#40): decizia se poate întoarce în fereastra de 2h
  {
    const { clock, engine, c1 } = setup();
    engine.placeOrder("ion", "Silviu", 57);
    const o = c1.orders[0];
    engine.accept(c1.id, o.id);
    clock.advance(1 * H); // în fereastră
    const revertAccept = engine.revertDecision(c1.id, o.id) && o.status === "nou";
    engine.refuse(c1.id, o.id);
    const revertRefuse = engine.revertDecision(c1.id, o.id) && o.status === "nou";
    clock.advanceTo(CUTOFF1 + 1); // refuzul întors nu mai lasă refund nici la final
    const noRefund = engine.refunds.filter((r) => r.reason === "refuzat").length === 0;
    scenarios.push({
      name: "Răzgândire în fereastră (#40)",
      desc: "accept sau refuz se pot întoarce la „nou” în primele 2h; refuzul întors nu emite refund",
      checks: [
        check("accept întors → nou", revertAccept, revertAccept),
        check("refuz întors → nou", revertRefuse, revertRefuse),
        check("refuzul întors nu emite refund", noRefund, noRefund),
      ],
    });
  }

  // 4c) răzgândirea e blocată după fereastră și după cutoff
  {
    const { clock, engine, c1 } = setup();
    engine.placeOrder("ion", "Silviu", 57);
    engine.accept(c1.id, c1.orders[0].id);
    clock.advance(3 * H); // fereastra de 2h a expirat
    const blockedAfterWindow = engine.revertDecision(c1.id, c1.orders[0].id) === false;

    const { clock: clk2, engine: eng2, c1: cc1 } = setup();
    eng2.placeOrder("ion", "Ana", 40);
    clk2.advanceTo(CUTOFF1 - 1);
    eng2.accept(cc1.id, cc1.orders[0].id); // decis chiar înainte de închidere
    clk2.advanceTo(CUTOFF1 + 1);
    const blockedAfterCutoff = eng2.revertDecision(cc1.id, cc1.orders[0].id) === false;
    scenarios.push({
      name: "Răzgândirea are limite",
      desc: "după 2h sau după închiderea Cursei, decizia rămâne definitivă",
      checks: [
        check("blocată după fereastra de 2h", blockedAfterWindow, blockedAfterWindow),
        check("blocată după cutoff", blockedAfterCutoff, blockedAfterCutoff),
      ],
    });
  }

  // 5) ne-acționată la cutoff → expiră + refund (decizia fondatorului #34)
  {
    const { clock, engine, c1 } = setup();
    engine.placeOrder("ion", "Silviu", 57);
    clock.advanceTo(CUTOFF1 + 1); // trece cutoff-ul fără accept/refuz
    scenarios.push({
      name: "Cutoff ne-acționat → expiră (#34)",
      desc: "producătorul nu atinge comanda până la marți 12:00",
      checks: [
        check("comanda = expirat (nu reportată)", c1.orders[0].status === "expirat", c1.orders[0].status),
        check("Cursa = inchisa", c1.status === "inchisa", c1.status),
        check("refund emis (expirat)", engine.refunds.some((r) => r.reason === "expirat"), engine.refunds.length),
      ],
    });
  }

  // 6) fast-forward-ul ceasului declanșează cutoff-ul
  {
    const { clock, engine, c1 } = setup();
    const before = c1.status;
    clock.advanceTo(CUTOFF1 + 1);
    scenarios.push({
      name: "Ceasul declanșează cutoff-ul",
      desc: "scheduler tick-driven: fast-forward închide Cursa la termen",
      checks: [
        check("Cursa era deschisă înainte", before === "deschisa", before),
        check("Cursa s-a închis la cutoff", c1.status === "inchisa", c1.status),
      ],
    });
  }

  // 7) gărzi: nu accepți după cutoff; nu refuzi o comandă deja acceptată
  {
    const { clock, engine, c1 } = setup();
    engine.placeOrder("ion", "Silviu", 57);
    const okAcceptThenRefuse = engine.accept(c1.id, c1.orders[0].id) && !engine.refuse(c1.id, c1.orders[0].id);
    const { clock: clk2, engine: eng2, c1: cc1 } = setup();
    eng2.placeOrder("ion", "Ana", 40);
    clk2.advanceTo(CUTOFF1 + 1); // comanda expiră
    const cannotAcceptAfterCutoff = eng2.accept(cc1.id, cc1.orders[0].id) === false;
    void clock;
    scenarios.push({
      name: "Gărzi de tranziție",
      desc: "tranziții invalide blocate",
      checks: [
        check("nu poți refuza o comandă acceptată", okAcceptThenRefuse, okAcceptThenRefuse),
        check("nu poți accepta după cutoff", cannotAcceptAfterCutoff, cannotAcceptAfterCutoff),
      ],
    });
  }

  return scenarios;
}
