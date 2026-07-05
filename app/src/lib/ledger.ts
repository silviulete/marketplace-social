/**
 * Ledger append-only double-entry (Etapa 7, decizia #14).
 *
 * Fiecare **postare** = un set de intrări debit/credit care se închid la 0 (dublă
 * partidă). Postările sunt imutabile (append-only) → reconciliabil prin construcție:
 * suma tuturor intrărilor din tot ledger-ul e MEREU 0 (invariant testat la `/bani`).
 *
 * Conturi: `cumparator` (banii intră), `escrow` (blocați până la livrare),
 * `producator:<id>` (marfă+transport), `fond` (rotunjirea voluntară, #6).
 * Sumele sunt în lei întregi (prețurile aplicației sunt întregi).
 *
 * Mapabil 1:1 pe un procesator real (Stripe Connect): capture→escrow,
 * transfer/payout→release, refund→refund.
 */
export interface Entry {
  account: string;
  amount: number; // lei, semnat (+ credit în cont, − debit din cont)
}

export interface Posting {
  id: string;
  kind: "plata" | "eliberare" | "refund";
  memo: string;
  entries: Entry[];
}

export class Ledger {
  private postings: Posting[] = [];
  private seq = 0;

  /** Adaugă o postare. Aruncă dacă intrările nu se închid la 0 (dublă partidă). */
  post(kind: Posting["kind"], memo: string, entries: Entry[]): Posting {
    const sum = entries.reduce((s, e) => s + e.amount, 0);
    if (sum !== 0) throw new Error(`Postare dezechilibrată (suma ${sum} ≠ 0): ${memo}`);
    const posting: Posting = { id: `p${this.seq++}`, kind, memo, entries };
    this.postings.push(posting);
    return posting;
  }

  /** Soldul unui cont = suma intrărilor lui în tot ledger-ul. */
  balance(account: string): number {
    let b = 0;
    for (const p of this.postings) for (const e of p.entries) if (e.account === account) b += e.amount;
    return b;
  }

  /** Soldurile tuturor conturilor. */
  balances(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const p of this.postings) for (const e of p.entries) out[e.account] = (out[e.account] ?? 0) + e.amount;
    return out;
  }

  /** Invariantul de reconciliere: suma tuturor intrărilor = 0. */
  total(): number {
    return this.postings.reduce((s, p) => s + p.entries.reduce((t, e) => t + e.amount, 0), 0);
  }

  all(): Posting[] {
    return this.postings;
  }
}
