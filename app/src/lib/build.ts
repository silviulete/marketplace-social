/**
 * Helper de calcul al subtotalului de marfă din comanda editată (`OrderItem[]`).
 *
 * Coșul (cu transport transparent, single/multi-producător, consolidare) și plata
 * se compun acum DETERMINIST de `MatchingEngine` (`matching-engine.ts`, Etapa 5)
 * din ofertele reale ale bazinului — nu mai sunt hardcodate pe un producător.
 */
import type { OrderItem } from "./artifacts";

export const goodsTotal = (items: OrderItem[]) =>
  items.reduce((s, it) => s + it.amount * it.unitPrice, 0);
