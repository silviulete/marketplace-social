"use client";

/**
 * Componentele Tarabei (Etapa 1b):
 *  - `SellerStatusBar` — panou fixat sus: metricile săptămânii + stoc (liber/alocat)
 *    pe fiecare produs publicat + buton „Editează" (deschide editorul complet).
 *  - `OrderRequestCard` — o comandă care a picat: client, adresă, TOATĂ comanda lui
 *    (inclusiv ce nu oferă, marcat „nu ai"), totalul onorabil, accept/refuz.
 *    La stoc insuficient, Accept e blocat și invită la suplimentare.
 * Stocul e ținut pe id de produs (dinamic — vânzătorul își compune oferta).
 */
import type { SellerOrderData, SellerOrderStatus } from "@/lib/artifacts";
import { ArtifactCard, Chip, lei } from "../ui/primitives";
import { Icon } from "../ui/Icon";

export type Stock = Record<string, number>;

export interface ProductStatus {
  id: string;
  name: string;
  emoji: string;
  unit: string;
  available: number;
  allocated: number;
}

export function orderNeeds(order: SellerOrderData): Record<string, number> {
  const needs: Record<string, number> = {};
  for (const it of order.items) if (it.productKey) needs[it.productKey] = (needs[it.productKey] ?? 0) + it.qty;
  return needs;
}

export function canFulfill(order: SellerOrderData, stock: Stock): boolean {
  const n = orderNeeds(order);
  return Object.keys(n).every((k) => (stock[k] ?? 0) >= n[k]);
}

// ——— panoul de status fixat sus ————————————————————————————

export function SellerStatusBar({
  products,
  metrics,
  onEdit,
  deliveryDay = "Joi",
  cutoff = "marți, 12:00",
  countdown,
  closed = false,
}: {
  products: ProductStatus[];
  metrics: { comenzi: number; acceptate: number; rezervat: number };
  onEdit: () => void;
  deliveryDay?: string;
  cutoff?: string;
  countdown?: string; // timpul rămas până la cutoff (live, Clock-driven)
  closed?: boolean; // cutoff atins → Cursa închisă
}) {
  return (
    <div className="sticky top-[60px] z-30 px-md pt-2 pb-1 bg-background/95 backdrop-blur-md">
      <div className="bg-card border border-card-border rounded-card shadow-art p-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`w-2 h-2 rounded-pill shrink-0 ${closed ? "bg-outline" : "bg-primary animate-pulse-soft"}`} />
            <span className="text-[14px] font-semibold text-on-surface truncate">Cursa de {deliveryDay.toLowerCase()}</span>
            <span className="text-[11px] text-on-surface-variant truncate">
              {closed ? `· s-a închis (${cutoff})` : countdown ? `· se închide în ${countdown}` : `· se închide ${cutoff}`}
            </span>
          </div>
          {closed ? (
            <Chip icon="lock">închisă</Chip>
          ) : (
            <Chip tone="green" icon="bolt">live</Chip>
          )}
        </div>

        {/* metricile pe un singur rând (#40 — densitate mică, nicio informație pierdută) */}
        <p className="mt-1.5 text-[13px] text-on-surface-variant">
          <span className="font-semibold text-primary">{metrics.comenzi}</span> comenzi ·{" "}
          <span className="font-semibold text-primary">{metrics.acceptate}</span> acceptate ·{" "}
          <span className="font-semibold text-primary">{metrics.rezervat} lei</span> rezervat
        </p>

        <div className="mt-2 pt-2 border-t border-card-border">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {products.map((p) => (
                <span key={p.id} className="text-[12px] text-on-surface">
                  {p.emoji}{" "}
                  <span className={p.available === 0 ? "text-error font-semibold" : "font-semibold"}>
                    {p.available} {p.unit}
                  </span>{" "}
                  <span className="text-on-surface-variant">liber{p.allocated > 0 ? ` · ${p.allocated} alocat` : ""}</span>
                </span>
              ))}
            </div>
            <button
              onClick={onEdit}
              className="text-[12px] font-semibold text-primary flex items-center gap-0.5 shrink-0"
            >
              <Icon name="edit" size={16} /> Editează
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ——— cardul unei comenzi ————————————————————————————————————

export function OrderRequestCard({
  order,
  status,
  stock,
  productMeta,
  onAccept,
  onRefuse,
  onAddStock,
  canRevert,
  onRevert,
}: {
  order: SellerOrderData;
  status: SellerOrderStatus;
  stock: Stock;
  productMeta: Record<string, { name: string; unit: string }>;
  onAccept: (id: string) => void;
  onRefuse: (id: string) => void;
  onAddStock: (id: string, qty: number) => void;
  canRevert?: boolean; // în fereastra de răzgândire (#40) și înainte de închidere
  onRevert?: (id: string) => void;
}) {
  const needs = orderNeeds(order);
  const ok = canFulfill(order, stock);
  const shortKey = Object.keys(needs).find((k) => (stock[k] ?? 0) < needs[k]);
  const shortBy = shortKey ? needs[shortKey] - (stock[shortKey] ?? 0) : 0;
  const shortName = shortKey ? (productMeta[shortKey]?.name ?? "produs").toLowerCase() : "";

  return (
    <ArtifactCard>
      <div className="p-md">
        <div className="flex items-center gap-sm">
          <span className="w-10 h-10 rounded-pill bg-chip-bg grid place-items-center text-[15px] font-semibold text-primary shrink-0">
            {order.buyer.charAt(0)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-on-surface truncate">{order.buyer}</p>
            <p className="text-[12px] text-on-surface-variant flex items-center gap-1 truncate">
              <Icon name="location_on" size={14} className="text-primary" />
              {order.address}
            </p>
          </div>
        </div>

        <div className="mt-sm rounded-card border border-card-border bg-background divide-y divide-card-border">
          {order.items.map((it) => {
            const offered = !!it.productKey;
            return (
              <div key={it.name} className="flex items-center gap-2 px-sm py-2 text-[14px]">
                <span aria-hidden="true">{it.emoji}</span>
                <span className={`flex-1 ${offered ? "text-on-surface" : "text-on-surface-variant"}`}>
                  {it.name} <span className="text-on-surface-variant">· {it.qty} {it.unit}</span>
                </span>
                {offered ? (
                  <span className="text-on-surface font-medium">{lei(it.price ?? 0)}</span>
                ) : (
                  <span className="text-[11px] uppercase tracking-wide text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-pill">
                    nu ai
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-sm flex items-center justify-between">
          <span className="text-[13px] text-on-surface-variant">Tu onorezi</span>
          <span className="text-[16px] font-semibold text-primary">{lei(order.fulfillTotal)}</span>
        </div>

        {status === "nou" && (
          <div className="mt-sm">
            {!ok && shortKey && (
              <div className="mb-2 flex items-center justify-between gap-2 rounded bg-error-container/40 p-sm">
                <span className="text-[12px] text-on-error-container">
                  Stoc insuficient — îți mai trebuie {shortBy} {productMeta[shortKey]?.unit ?? ""} {shortName}.
                </span>
                <button
                  onClick={() => onAddStock(shortKey, Math.max(5, shortBy))}
                  className="shrink-0 px-3 h-9 rounded bg-primary text-on-primary text-[13px] font-semibold active:scale-95 transition-transform"
                >
                  Adaugă stoc
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => ok && onAccept(order.id)}
                disabled={!ok}
                className="flex-1 h-11 rounded bg-primary text-on-primary text-[14px] font-semibold flex items-center justify-center gap-1 active:scale-[0.98] transition-transform disabled:opacity-40"
              >
                <Icon name="check" size={18} /> Acceptă
              </button>
              <button
                onClick={() => onRefuse(order.id)}
                className="h-11 px-4 rounded border border-card-border text-on-surface-variant text-[14px] font-medium active:scale-[0.98] transition-transform"
              >
                Refuză
              </button>
            </div>
          </div>
        )}

        {status === "acceptat" && (
          <StatusLine icon="local_shipping" tone="primary" text="Acceptată · intră în coada de livrare de joi" strong />
        )}
        {status === "livrat" && <StatusLine icon="home" tone="primary" text="Livrată" strong />}
        {status === "platit" && (
          <StatusLine icon="paid" tone="primary" text="Plătită · în coada de livrare de joi" strong />
        )}
        {status === "refuzat" && (
          <StatusLine icon="cancel" tone="muted" text="Refuzată · banii se întorc automat la client" />
        )}
        {status === "expirat" && (
          <StatusLine icon="timer_off" tone="muted" text="Expirată la închidere · banii s-au întors la client (n-ai acționat la timp)" />
        )}

        {/* răzgândire (#40): decizia se poate schimba în primele 2h, până la închidere */}
        {(status === "acceptat" || status === "refuzat") && canRevert && onRevert && (
          <button
            onClick={() => onRevert(order.id)}
            className="mt-2 w-full h-10 rounded text-[14px] font-medium text-on-surface-variant flex items-center justify-center gap-1 active:scale-[0.98] transition-transform"
          >
            <Icon name="undo" size={16} /> Schimbă decizia
          </button>
        )}
      </div>
    </ArtifactCard>
  );
}

function StatusLine({
  icon,
  text,
  tone,
  strong,
}: {
  icon: string;
  text: string;
  tone: "primary" | "muted";
  strong?: boolean;
}) {
  return (
    <p
      className={`mt-sm flex items-center gap-1.5 text-[13px] font-medium ${
        tone === "primary" ? "text-primary" : "text-on-surface-variant"
      } ${strong ? "bg-chip-bg rounded px-2 py-1.5" : ""}`}
    >
      <Icon name={icon} size={16} filled={tone === "primary"} />
      {text}
    </p>
  );
}
