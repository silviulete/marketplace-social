"use client";

/**
 * Editorul de ofertă al vânzătorului (Etapa 1b).
 * Oferta e pornită din ce a spus Ion în chat (limbaj natural → produs + preț +
 * stoc). El o poate ajusta: editează **stocul ȘI prețul** (câmpuri editabile),
 * scoate produse și **adaugă alte produse scriind natural** (ex. „usturoi 15 lei
 * 3 kg") — prețul se preia din text, apoi rămâne editabil.
 * Extragerea reală din limbaj natural vine cu agentul Taraba (Etapa 3); aici e un
 * parser simplu, ca demonstrație.
 */
import { useState } from "react";
import type { OfferProductDraft } from "@/lib/artifacts";
import { OFFER_PRESETS, SELLER } from "@/lib/seller-demo";
import { ArtifactCard, Button, Chip } from "../ui/primitives";
import { Icon } from "../ui/Icon";

const normalizeUnit = (u: string) => {
  const x = u.toLowerCase();
  if (x.startsWith("borcan")) return "borcan";
  if (x.startsWith("leg")) return "legătură";
  if (x === "zece") return "zece";
  if (x === "buc") return "buc";
  return "kg";
};

/** Extrage din text {nume, preț, stoc, unitate} (parser simplu; AI-ul vine la Etapa 3). */
function parseProduct(text: string): OfferProductDraft {
  const t = text.trim();
  const priceM = t.match(/(\d+(?:[.,]\d+)?)\s*lei/i);
  const price = priceM ? Math.round(parseFloat(priceM[1].replace(",", "."))) : 10;
  const qtyM = t.match(/(\d+(?:[.,]\d+)?)\s*(kg|buc|borcane?|borcan|legături|legătură|leg|zece)/i);
  const stock = qtyM ? Math.round(parseFloat(qtyM[1].replace(",", "."))) : 5;
  const unit = qtyM ? normalizeUnit(qtyM[2]) : "kg";
  let name = t
    .replace(/(\d+(?:[.,]\d+)?)\s*lei(\s*\/\s*\w+)?/gi, "")
    .replace(/(\d+(?:[.,]\d+)?)\s*(kg|buc|borcane?|borcan|legături|legătură|leg|zece)/gi, "")
    .replace(/\bla\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!name) name = t;
  name = name.charAt(0).toUpperCase() + name.slice(1);
  return { id: `custom-${Date.now()}`, name, emoji: "🧺", unit, price, stock };
}

export function SellerOfferEditor({
  products,
  onChange,
  onPublish,
  published,
  deliveryDay,
  cutoff,
  primaryLabel = "Publică oferta",
}: {
  products: OfferProductDraft[];
  onChange: (p: OfferProductDraft[]) => void;
  onPublish: () => void;
  published?: boolean;
  deliveryDay?: string;
  cutoff?: string;
  primaryLabel?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [custom, setCustom] = useState("");

  const patch = (id: string, d: Partial<OfferProductDraft>) =>
    onChange(products.map((p) => (p.id === id ? { ...p, ...d } : p)));
  const remove = (id: string) => onChange(products.filter((p) => p.id !== id));
  const add = (p: OfferProductDraft) => {
    if (!products.some((x) => x.id === p.id || x.name.toLowerCase() === p.name.toLowerCase())) {
      onChange([...products, p]);
    }
  };
  const addCustom = () => {
    if (!custom.trim()) return;
    add(parseProduct(custom));
    setCustom("");
    setAdding(false);
  };

  const presets = OFFER_PRESETS.filter((q) => !products.some((p) => p.id === q.id));

  return (
    <ArtifactCard>
      <div className="p-md">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[18px] font-semibold text-on-surface">Oferta ta</h3>
          <Chip tone={published ? "green" : "neutral"}>{published ? "publicată" : "ciornă"}</Chip>
        </div>
        {!published && (
          <p className="text-[12px] text-on-surface-variant mb-sm">
            Am preluat oferta din ce mi-ai spus. Verifică stocul și prețul, adaugă sau scoate produse.
          </p>
        )}

        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-start gap-sm p-sm rounded bg-background">
              <span className="w-10 h-10 rounded grid place-items-center bg-surface-container text-[22px] shrink-0">
                {p.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[15px] font-medium text-on-surface truncate">{p.name}</p>
                  {published ? (
                    <span className="text-[14px] font-semibold text-primary whitespace-nowrap">
                      {p.stock} {p.unit}
                    </span>
                  ) : (
                    <button
                      onClick={() => remove(p.id)}
                      aria-label={`Scoate ${p.name}`}
                      className="w-7 h-7 -mt-0.5 grid place-items-center rounded text-on-surface-variant hover:text-error hover:bg-error-container/40 shrink-0"
                    >
                      <Icon name="close" size={18} />
                    </button>
                  )}
                </div>

                {published ? (
                  <p className="text-[12px] text-on-surface-variant">{p.price} lei/{p.unit}</p>
                ) : (
                  <div className="mt-1.5 flex items-center gap-4">
                    <NumField
                      label="stoc"
                      value={p.stock}
                      suffix={p.unit}
                      onChange={(v) => patch(p.id, { stock: v })}
                    />
                    <NumField
                      label="preț"
                      value={p.price}
                      suffix="lei"
                      onChange={(v) => patch(p.id, { price: v })}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {!published && (
          <>
            {adding ? (
              <div className="mt-sm space-y-2">
                {presets.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {presets.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => add(q)}
                        className="px-3 py-1.5 rounded-pill bg-background border border-card-border text-[13px] text-on-surface active:scale-95 transition-transform"
                      >
                        <span className="mr-1">{q.emoji}</span>
                        {q.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustom()}
                    placeholder="Scrie produsul și prețul (ex. usturoi 15 lei)…"
                    className="flex-1 h-10 px-3 rounded border border-card-border bg-background text-[14px] text-on-surface outline-none focus:border-primary"
                  />
                  <button
                    onClick={addCustom}
                    className="h-10 px-4 rounded bg-primary text-on-primary text-[14px] font-semibold active:scale-95 transition-transform"
                  >
                    Adaugă
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="mt-sm flex items-center gap-1 text-[14px] font-medium text-primary"
              >
                <Icon name="add_circle" size={18} />
                Adaugă produs
              </button>
            )}

            <div className="mt-md pt-sm border-t border-card-border space-y-1 text-[13px] text-on-surface-variant">
              <Row icon="local_shipping" label="Livrare" value={deliveryDay ?? SELLER.deliveryDay} />
              <Row icon="schedule" label="Cursă" value={`se închide ${cutoff ?? SELLER.cutoff}`} />
              <Row icon="location_on" label="Zonă" value={SELLER.neighborhood} />
            </div>

            <Button onClick={onPublish} icon="campaign" className="mt-md">
              {primaryLabel}
            </Button>
          </>
        )}
      </div>
    </ArtifactCard>
  );
}

/** Câmp numeric editabil (tap → scrii valoarea), potrivit pentru valori variate. */
function NumField({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="text-[11px] uppercase text-on-surface-variant">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          onChange(Number.isFinite(v) ? Math.max(0, v) : 0);
        }}
        className="w-12 h-8 rounded border border-card-border bg-card text-center text-[14px] font-semibold text-on-surface outline-none focus:border-primary"
      />
      <span className="text-[12px] text-on-surface-variant whitespace-nowrap">{suffix}</span>
    </label>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon name={icon} size={15} className="text-primary" />
      <span className="w-[60px] shrink-0">{label}</span>
      <span className="text-on-surface font-medium flex-1 text-right truncate">{value}</span>
    </div>
  );
}
