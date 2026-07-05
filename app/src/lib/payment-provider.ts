/**
 * Cusătura `PaymentProvider` (decizia #14): plata stă în spatele acestei interfețe.
 * Acum: `SimulatedPaymentProvider` (pagină de plată simulată + ledger). Apoi:
 * Stripe Connect / Netopia split, **fără a schimba apelantul**. Semantica escrow
 * (hold/capture/release/refund) e mapată pe ledger-ul append-only (Etapa 7).
 *
 * Flux: **plata** blochează banii în escrow (marfă+transport per producător +
 * rotunjirea voluntară către fond, #6); **eliberarea** (la livrarea confirmată,
 * Etapa 8) trimite banii producătorilor + fondului; **refund**-ul îi întoarce
 * cumpărătorului (anulare / refuz / expirare).
 */
import type { BasketArtifact } from "./artifacts";
import { Ledger } from "./ledger";

export interface ProducerShare {
  producerId: string;
  producerName: string;
  amount: number; // marfă + transport, lei
}

export interface PaymentReceipt {
  paymentId: string;
  escrowHeld: number; // total blocat = marfă+transport (toți) + rotunjire
  toProducers: ProducerShare[];
  toFund: number; // rotunjirea voluntară
  status: "escrow" | "released" | "refunded";
}

export interface PaymentProvider {
  name: string;
  /** Plătește un coș → banii intră în escrow. `roundUpTo` = total rotunjit (opțional). */
  pay(basket: BasketArtifact, opts?: { roundUpTo?: number }): PaymentReceipt;
  /** La livrarea confirmată: escrow → producători + fond. */
  release(paymentId: string): PaymentReceipt | undefined;
  /** Anulare / refuz / expirare: escrow → cumpărător. */
  refund(paymentId: string): PaymentReceipt | undefined;
  receipt(paymentId: string): PaymentReceipt | undefined;
  ledger: Ledger;
}

export class SimulatedPaymentProvider implements PaymentProvider {
  name = "simulat";
  ledger = new Ledger();
  private receipts = new Map<string, PaymentReceipt>();
  private seq = 0;

  pay(basket: BasketArtifact, opts?: { roundUpTo?: number }): PaymentReceipt {
    const donation = opts?.roundUpTo ? Math.max(0, opts.roundUpTo - basket.grandTotal) : 0;
    const escrowHeld = basket.grandTotal + donation;
    const toProducers: ProducerShare[] = basket.groups.map((g) => ({
      producerId: g.producerId,
      producerName: g.producerName,
      amount: g.goodsTotal + g.transport,
    }));
    const paymentId = `pay-${this.seq++}`;

    // capture: banii ies de la cumpărător și se blochează în escrow
    this.ledger.post("plata", `Plată ${paymentId} → escrow`, [
      { account: "cumparator", amount: -escrowHeld },
      { account: "escrow", amount: escrowHeld },
    ]);

    const receipt: PaymentReceipt = { paymentId, escrowHeld, toProducers, toFund: donation, status: "escrow" };
    this.receipts.set(paymentId, receipt);
    return receipt;
  }

  release(paymentId: string): PaymentReceipt | undefined {
    const r = this.receipts.get(paymentId);
    if (!r || r.status !== "escrow") return r;
    const entries = [
      { account: "escrow", amount: -r.escrowHeld },
      ...r.toProducers.map((p) => ({ account: `producator:${p.producerId}`, amount: p.amount })),
    ];
    if (r.toFund > 0) entries.push({ account: "fond", amount: r.toFund });
    this.ledger.post("eliberare", `Eliberare ${paymentId} → producători + fond`, entries);
    r.status = "released";
    return r;
  }

  refund(paymentId: string): PaymentReceipt | undefined {
    const r = this.receipts.get(paymentId);
    if (!r || r.status !== "escrow") return r;
    this.ledger.post("refund", `Refund ${paymentId} → cumpărător`, [
      { account: "escrow", amount: -r.escrowHeld },
      { account: "cumparator", amount: r.escrowHeld },
    ]);
    r.status = "refunded";
    return r;
  }

  receipt(paymentId: string): PaymentReceipt | undefined {
    return this.receipts.get(paymentId);
  }
}

/** Selectorul de provider. Comutarea la Stripe/Netopia = o singură setare aici. */
export function createPaymentProvider(): PaymentProvider {
  return new SimulatedPaymentProvider();
}
