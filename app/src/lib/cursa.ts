/**
 * Mașina de stări a Cursei (Etapa 6a — pur logică, zero UI).
 *
 * Cursa = **fereastră de timp per producător, FĂRĂ prag** (#18):
 *  - comenzile plasate ÎNAINTE de cutoff intră în Cursa curentă (livrare în ziua ei);
 *  - cele plasate DUPĂ cutoff intră în Cursa următoare (cutoff mai îndepărtat).
 *
 * Producătorul decide **per comandă**: accept → coada de livrare; refuz → refund.
 * Decizia e **reversibilă într-o fereastră de răzgândire** (#40, default 2h pe
 * ceasul Cursei, niciodată după cutoff) — refund-ul la refuz devine definitiv
 * abia când fereastra expiră. La cutoff, o comandă ne-acționată **expiră +
 * refund** (decizia fondatorului #34 — NU report automat). Cutoff & ziua de
 * livrare sunt tick-driven pe `Clock`.
 *
 * Fără hedge mod-eveniment (#34): doar Cursa continuă per producător.
 * Banii sunt reprezentați ca evenimente de refund; escrow/ledger real = Etapa 7.
 */
import type { SimulatedClock } from "./clock";

export type CursaStatus = "deschisa" | "inchisa" | "livrata";
export type CursaOrderStatus = "nou" | "acceptat" | "refuzat" | "expirat" | "livrat";

export interface CursaOrder {
  id: string;
  buyer: string;
  total: number; // lei (pentru refund)
  status: CursaOrderStatus;
  placedAt: number;
  decidedAt?: number; // momentul ultimei decizii accept/refuz (fereastra de răzgândire #40)
}

export interface Cursa {
  id: string;
  producerId: string;
  deliveryDay: string; // etichetă „Joi"
  cutoffAt: number; // termenul de primire comenzi
  deliveryAt: number; // momentul livrării
  status: CursaStatus;
  orders: CursaOrder[];
}

export interface RefundEvent {
  orderId: string;
  amount: number;
  reason: "refuzat" | "expirat";
}

export interface PlaceResult {
  cursa: Cursa | null;
  routed: "curenta" | "urmatoare" | "niciuna";
}

/**
 * Motorul Cursei pentru un bazin: ține Cursele deschise, le închide la cutoff și le
 * livrează la zi, condus de `SimulatedClock`. Tranzițiile sunt deterministe.
 */
/** Fereastra de răzgândire a producătorului (#40) — 2h, în ms pe ceasul Cursei. */
export const UNDO_WINDOW_MS = 2 * 3_600_000;

export class CursaEngine {
  curse: Cursa[] = [];
  refunds: RefundEvent[] = [];
  private seq = 0;

  /** `undoWindow` e în unitățile ceasului folosit (ms în produs; testele pot folosi ore). */
  constructor(
    private clock: SimulatedClock,
    private undoWindow = UNDO_WINDOW_MS,
  ) {}

  /** Deschide o Cursă și programează cutoff-ul + livrarea pe ceas. */
  openCursa(producerId: string, deliveryDay: string, cutoffAt: number, deliveryAt: number): Cursa {
    const cursa: Cursa = {
      id: `cursa-${this.seq++}`,
      producerId,
      deliveryDay,
      cutoffAt,
      deliveryAt,
      status: "deschisa",
      orders: [],
    };
    this.curse.push(cursa);
    this.clock.at(cutoffAt, () => this.closeCursa(cursa.id));
    this.clock.at(deliveryAt, () => this.deliverCursa(cursa.id));
    return cursa;
  }

  /**
   * Plasează o comandă: intră în Cursa curentă (cea mai apropiată Cursă deschisă cu
   * cutoff încă în viitor); dacă cutoff-ul curent a trecut → Cursa următoare.
   */
  placeOrder(producerId: string, buyer: string, total: number): PlaceResult {
    const now = this.clock.now();
    const open = this.curse
      .filter((c) => c.producerId === producerId && c.status === "deschisa" && now < c.cutoffAt)
      .sort((a, b) => a.cutoffAt - b.cutoffAt);
    const cursa = open[0] ?? null;
    if (!cursa) return { cursa: null, routed: "niciuna" };

    cursa.orders.push({ id: `ord-${this.seq++}`, buyer, total, status: "nou", placedAt: now });

    // „curentă" dacă e cea mai apropiată din toate Cursele producătorului; altfel „următoarea"
    const earliest = this.curse
      .filter((c) => c.producerId === producerId)
      .sort((a, b) => a.cutoffAt - b.cutoffAt)[0];
    return { cursa, routed: cursa.id === earliest?.id ? "curenta" : "urmatoare" };
  }

  /** Producătorul acceptă o comandă (doar dacă Cursa e deschisă și comanda e „nou"). */
  accept(cursaId: string, orderId: string): boolean {
    const o = this.order(cursaId, orderId, "deschisa");
    if (!o || o.status !== "nou") return false;
    o.status = "acceptat";
    o.decidedAt = this.clock.now();
    return true;
  }

  /**
   * Producătorul refuză o comandă. Refund-ul devine definitiv abia când expiră
   * fereastra de răzgândire (sau la cutoff, dacă vine mai devreme) — până atunci
   * refuzul poate fi întors cu `revertDecision` (#40).
   */
  refuse(cursaId: string, orderId: string): boolean {
    const cursa = this.curse.find((c) => c.id === cursaId);
    const o = this.order(cursaId, orderId, "deschisa");
    if (!cursa || !o || o.status !== "nou") return false;
    const decidedAt = this.clock.now();
    o.status = "refuzat";
    o.decidedAt = decidedAt;
    this.clock.at(Math.min(decidedAt + this.undoWindow, cursa.cutoffAt), () => {
      // definitiv doar dacă refuzul n-a fost întors (sau re-decis) între timp
      if (o.status === "refuzat" && o.decidedAt === decidedAt) {
        this.refunds.push({ orderId: o.id, amount: o.total, reason: "refuzat" });
      }
    });
    return true;
  }

  /**
   * Producătorul se răzgândește (#40): o decizie accept/refuz revine la „nou",
   * doar cât fereastra de răzgândire e deschisă și înainte de cutoff.
   */
  revertDecision(cursaId: string, orderId: string): boolean {
    if (this.revertWindowLeft(cursaId, orderId) <= 0) return false;
    const o = this.order(cursaId, orderId, "deschisa");
    if (!o) return false;
    o.status = "nou";
    o.decidedAt = undefined;
    return true;
  }

  /** Cât mai durează fereastra de răzgândire a unei decizii (0 = nu se mai poate). */
  revertWindowLeft(cursaId: string, orderId: string): number {
    const cursa = this.curse.find((c) => c.id === cursaId);
    if (!cursa || cursa.status !== "deschisa") return 0;
    const o = cursa.orders.find((x) => x.id === orderId);
    if (!o || (o.status !== "acceptat" && o.status !== "refuzat") || o.decidedAt === undefined) return 0;
    return Math.max(0, Math.min(o.decidedAt + this.undoWindow, cursa.cutoffAt) - this.clock.now());
  }

  /** La cutoff: Cursa se închide; comenzile ne-acționate expiră + refund (#34). */
  private closeCursa(cursaId: string): void {
    const cursa = this.curse.find((c) => c.id === cursaId);
    if (!cursa || cursa.status !== "deschisa") return;
    cursa.status = "inchisa";
    for (const o of cursa.orders) {
      if (o.status === "nou") {
        o.status = "expirat";
        this.refunds.push({ orderId: o.id, amount: o.total, reason: "expirat" });
      }
    }
  }

  /** La ziua de livrare: comenzile acceptate devin livrate; Cursa e livrată. */
  private deliverCursa(cursaId: string): void {
    const cursa = this.curse.find((c) => c.id === cursaId);
    if (!cursa || cursa.status === "livrata") return;
    cursa.status = "livrata";
    for (const o of cursa.orders) if (o.status === "acceptat") o.status = "livrat";
  }

  private order(cursaId: string, orderId: string, requireStatus?: CursaStatus): CursaOrder | undefined {
    const cursa = this.curse.find((c) => c.id === cursaId);
    if (!cursa || (requireStatus && cursa.status !== requireStatus)) return undefined;
    return cursa.orders.find((o) => o.id === orderId);
  }
}
