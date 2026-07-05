"use client";

/**
 * Editorul de comandă (artefactul `intent`, acum editabil).
 * Cumpărătorul corectează ce a „înțeles AI-ul": cantități (+/−), scoate produse,
 * adaugă din sugestii rapide. Coșul și plata se recalculează din această listă.
 */
import { useState } from "react";
import type { OrderItem } from "@/lib/artifacts";
import { QUICK_ADD } from "@/lib/demo";
import { goodsTotal } from "@/lib/build";
import { ArtifactCard, Button, Chip, Thumb, lei } from "../ui/primitives";
import { Icon } from "../ui/Icon";

export function OrderEditor({
  items,
  onChange,
  onConfirm,
  locked,
  searched,
  pricesKnown = true,
  collapsed,
  onExpand,
}: {
  items: OrderItem[];
  onChange: (items: OrderItem[]) => void;
  onConfirm: () => void;
  locked?: boolean; // după trimiterea comenzii, lista rămâne fixă (read-only)
  searched?: boolean; // s-a căutat deja: editabilă, dar fără butonul „Caută" (coșul se recalculează)
  pricesKnown?: boolean; // înainte de matching prețurile sunt necunoscute (Etapa 4): ascunde subtotalul
  collapsed?: boolean; // când coșul e pe ecran, lista se strânge într-un rezumat (un singur artefact viu)
  onExpand?: () => void; // „Modifică" din rezumat — redeschide lista
}) {
  const [adding, setAdding] = useState(false);

  // rezumat pe un rând: un singur CTA viu pe ecran cât timp coșul e dedesubt
  if (collapsed) {
    return (
      <ArtifactCard>
        <div className="px-md py-sm flex items-center gap-sm">
          <Thumb emoji="🧺" size={40} />
          <p className="flex-1 min-w-0 text-[14px] text-on-surface truncate">
            <span className="font-semibold">
              {items.length} {items.length === 1 ? "produs" : "produse"}
            </span>
            {pricesKnown && <span className="text-on-surface-variant"> · marfă {lei(goodsTotal(items))}</span>}
          </p>
          {!locked && onExpand && (
            <button onClick={onExpand} className="flex items-center gap-1 text-[14px] font-medium text-primary shrink-0">
              <Icon name="edit" size={16} /> Modifică
            </button>
          )}
        </div>
      </ArtifactCard>
    );
  }

  const setAmount = (id: string, delta: number) =>
    onChange(
      items.map((it) => (it.id === id ? { ...it, amount: Math.max(1, it.amount + delta) } : it)),
    );
  const remove = (id: string) => onChange(items.filter((it) => it.id !== id));
  const add = (it: OrderItem) => {
    if (!items.some((x) => x.id === it.id)) onChange([...items, it]);
    setAdding(false);
  };

  const available = QUICK_ADD.filter((q) => !items.some((it) => it.id === q.id));

  return (
    <ArtifactCard>
      <div className="p-md">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[18px] font-semibold text-on-surface">Lista ta</h3>
          <Chip tone="green">
            {items.length} {items.length === 1 ? "articol" : "articole"}
          </Chip>
        </div>
        {!locked && (
          <p className="text-[12px] text-on-surface-variant mb-sm">
            AI a interpretat cererea ta — corecteaz-o dacă e nevoie.
          </p>
        )}

        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-start gap-sm p-sm rounded bg-background">
              <Thumb emoji={it.emoji} size={44} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-on-surface truncate">{it.name}</p>
                    {it.note && <p className="text-[12px] text-on-surface-variant truncate">{it.note}</p>}
                  </div>
                  {locked ? (
                    <span className="text-[15px] font-semibold text-primary whitespace-nowrap">
                      {it.amount} {it.unit}
                    </span>
                  ) : (
                    <button
                      onClick={() => remove(it.id)}
                      aria-label={`Scoate ${it.name}`}
                      className="w-8 h-8 -mt-1 grid place-items-center rounded text-on-surface-variant hover:text-error hover:bg-error-container/40 shrink-0"
                    >
                      <Icon name="close" size={18} />
                    </button>
                  )}
                </div>

                {!locked && (
                  <div className="mt-2 flex items-center gap-2">
                    <Stepper onClick={() => setAmount(it.id, -1)} icon="remove" />
                    <span className="min-w-[70px] text-center text-[14px] font-semibold text-on-surface tabular-nums">
                      {it.amount} {it.unit}
                    </span>
                    <Stepper onClick={() => setAmount(it.id, +1)} icon="add" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {!locked && (
          <>
            {/* adăugare rapidă */}
            {adding ? (
              <div className="mt-sm flex flex-wrap gap-2">
                {available.length === 0 && (
                  <span className="text-[13px] text-on-surface-variant">Le-ai adăugat pe toate 🙂</span>
                )}
                {available.map((q) => (
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
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="mt-sm flex items-center gap-1 text-[14px] font-medium text-primary"
              >
                <Icon name="add_circle" size={18} />
                Adaugă produs
              </button>
            )}

            {pricesKnown && (
              <div className="mt-md pt-sm border-t border-card-border flex items-center justify-between">
                <span className="text-[13px] text-on-surface-variant">Subtotal marfă</span>
                <span className="text-[15px] font-semibold text-on-surface">{lei(goodsTotal(items))}</span>
              </div>
            )}

            {searched ? (
              <p className="mt-sm flex items-center gap-1.5 text-[13px] text-on-surface-variant">
                <Icon name="sync" size={15} className="text-primary" />
                Modificările se reflectă în coșul de mai jos.
              </p>
            ) : (
              <Button onClick={onConfirm} icon="search" className={pricesKnown ? "mt-sm" : "mt-md"} variant="primary">
                Caută în zona mea
              </Button>
            )}
          </>
        )}
      </div>
    </ArtifactCard>
  );
}

function Stepper({ onClick, icon }: { onClick: () => void; icon: string }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 grid place-items-center rounded border border-card-border bg-card text-on-surface active:scale-90 transition-transform"
    >
      <Icon name={icon} size={18} />
    </button>
  );
}
