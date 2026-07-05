"use client";

/**
 * Registrul de artefacte (componente pe tip). `ArtifactRenderer` mapează
 * `artifact.type` → componenta corespunzătoare. Toate sunt carduri albe
 * elevate, conform limbajului de componente Stitch.
 *
 * Editorul de comandă (`intent`) și coșul/plata „live" sunt randate direct de
 * `ChatScreen` din starea curentă a comenzii — nu trec prin acest registru.
 */
import type {
  Artifact,
  BasketArtifact,
  ConfirmationArtifact,
  EscrowArtifact,
  MarketAlertArtifact,
  OffersArtifact,
  OrderArtifact,
  PaymentArtifact,
  ProducerArtifact,
  SellerOfferArtifact,
} from "@/lib/artifacts";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { ArtifactCard, Button, Chip, MoneyRow, Thumb, lei } from "../ui/primitives";

export function ArtifactRenderer({
  artifact,
  onAction,
  onModify,
  onToggleRound,
  onCancel,
  spent,
}: {
  artifact: Artifact;
  onAction?: () => void;
  onModify?: () => void; // „Modifică comanda" (doar coș, înainte de trimitere)
  onToggleRound?: () => void; // toggle rotunjire voluntară (doar plată)
  onCancel?: () => void; // „Anulează comanda" — răzgândire până la plată (#40)
  spent?: boolean; // artefact consumat → CTA-urile devin inactive
}) {
  switch (artifact.type) {
    case "offers":
      return <OffersCard a={artifact} onAction={onAction} />;
    case "marketAlert":
      return <MarketAlertCard a={artifact} onAction={onAction} />;
    case "basket":
      return <BasketCard a={artifact} onAction={onAction} onModify={onModify} spent={spent} />;
    case "confirmation":
      return <ConfirmationCard a={artifact} onCancel={onCancel} spent={spent} />;
    case "payment":
      return <PaymentCard a={artifact} onAction={onAction} onToggleRound={onToggleRound} onCancel={onCancel} spent={spent} />;
    case "escrow":
      return <EscrowCard a={artifact} />;
    case "order":
      return <OrderCard a={artifact} />;
    case "producer":
      return <ProducerCard a={artifact} onAction={onAction} />;
    case "sellerOffer":
      return <SellerOfferCard a={artifact} onAction={onAction} />;
  }
}

function FavoriteButton() {
  const [fav, setFav] = useState(false);
  return (
    <button
      onClick={() => setFav(true)}
      disabled={fav}
      className={`w-full h-12 rounded font-semibold text-[15px] flex items-center justify-center gap-base transition-all active:scale-[0.98] ${
        fav ? "bg-chip-bg text-chip-text" : "bg-primary text-on-primary shadow-art hover:opacity-95"
      }`}
    >
      <Icon name={fav ? "favorite" : "favorite_border"} size={20} filled={fav} />
      {fav ? "Adăugat la favorite" : "Adaugă la favorite"}
    </button>
  );
}

// ——— sellerOffer (Taraba: oferta extrasă, cu promisiune de livrare) ——

function SellerOfferCard({ a, onAction }: { a: SellerOfferArtifact; onAction?: () => void }) {
  return (
    <ArtifactCard>
      <div className="p-md">
        <div className="flex items-center justify-between mb-sm">
          <h3 className="text-[18px] font-semibold text-on-surface">{a.title}</h3>
          <Chip tone={a.status === "published" ? "green" : "neutral"}>
            {a.status === "published" ? "publicată" : "ciornă"}
          </Chip>
        </div>

        <div className="space-y-2">
          {a.products.map((p) => (
            <div key={p.name} className="flex items-center gap-sm p-2 rounded bg-background">
              <Thumb emoji={p.emoji} size={44} />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-on-surface truncate">{p.name}</p>
                <p className="text-[12px] text-on-surface-variant">stoc {p.stock}</p>
              </div>
              <span className="text-[15px] font-semibold text-primary whitespace-nowrap">
                {p.price} lei/{p.unit}
              </span>
            </div>
          ))}
        </div>

        {/* promisiunea de livrare + cutoff + zone */}
        <div className="mt-sm rounded-card bg-background border border-card-border divide-y divide-card-border text-[13px]">
          <Row icon="local_shipping" label="Livrare" value={a.deliveryDay} />
          <Row icon="schedule" label="Cursă" value={a.cutoff} />
          <Row icon="location_on" label="Zone" value={a.zones.join(", ")} />
        </div>

        <Button onClick={onAction} icon="campaign" className="mt-md">
          {a.primaryActionLabel}
        </Button>
      </div>
    </ArtifactCard>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-sm py-2">
      <Icon name={icon} size={16} className="text-primary" />
      <span className="text-on-surface-variant w-[64px] shrink-0">{label}</span>
      <span className="text-on-surface font-medium flex-1 text-right truncate">{value}</span>
    </div>
  );
}

// ——— offers ———————————————————————————————————————————————

function OffersCard({ a, onAction }: { a: OffersArtifact; onAction?: () => void }) {
  const sellers = a.sellers ?? [];
  return (
    <div className="space-y-2">
      <p className="text-label-md uppercase text-on-surface-variant px-1">
        {a.title} · {sellers.length} {sellers.length === 1 ? "vânzător" : "vânzători"}
      </p>

      {/* până la 5 vânzători, fiecare cu ofertele lui pentru produsele cerute */}
      {sellers.map((s) => (
        <ArtifactCard key={s.producerName} className="p-sm">
          <div className="flex items-center gap-sm">
            <Thumb emoji={s.emoji ?? "🧑‍🌾"} size={44} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h4 className="text-[15px] font-semibold text-on-surface truncate">{s.producerName}</h4>
                {s.isYour && <Chip tone="green" icon="favorite">al tău</Chip>}
              </div>
              <p className="text-[12px] text-on-surface-variant flex items-center gap-1.5 flex-wrap">
                {s.distanceKm ? <span>{s.distanceKm} km</span> : null}
                {s.deliveryDay ? <span>· livrare {s.deliveryDay}</span> : null}
                {typeof s.punctuality === "number" && s.punctuality >= 95 ? (
                  <span className="text-primary font-medium flex items-center gap-0.5">
                    <Icon name="schedule" size={12} /> {s.punctuality}%
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-card-border space-y-1.5">
            {s.offers.map((o) => (
              <div key={o.productName} className="flex items-center gap-2 text-[13px]">
                <span aria-hidden="true">{o.emoji}</span>
                <span className="flex-1 text-on-surface">{o.productName}</span>
                <span className="text-on-surface font-medium whitespace-nowrap">
                  {o.price} lei/{o.unit}
                </span>
              </div>
            ))}
          </div>
        </ArtifactCard>
      ))}

      {/* produse cerute pe care nimeni nu le are acum (piață continuă: te anunț) */}
      {a.unmatched && a.unmatched.length > 0 && (
        <p className="px-1 pt-1 flex items-start gap-1.5 text-[13px] text-on-surface-variant">
          <Icon name="notifications_active" size={16} className="text-primary mt-0.5" />
          Momentan nimeni n-are <span className="font-medium text-on-surface">{a.unmatched.join(", ")}</span> în bazin —
          te anunț de îndată ce apare.
        </p>
      )}

      {/* notă single-producer (#21) / surse minime */}
      {a.note && (
        <p className="px-1 flex items-start gap-1.5 text-[13px] text-on-surface-variant">
          <Icon name="check_circle" size={16} className="text-primary mt-0.5" />
          {a.note}
        </p>
      )}

      {a.primaryActionLabel && (
        <Button onClick={onAction} icon="send" className="mt-1" variant="primary">
          {a.primaryActionLabel}
        </Button>
      )}
    </div>
  );
}

// ——— marketAlert (piață continuă: a apărut o ofertă nouă relevantă) ——

function MarketAlertCard({ a, onAction }: { a: MarketAlertArtifact; onAction?: () => void }) {
  return (
    <ArtifactCard highlight className="animate-fade-in-up">
      <div className="p-md">
        <div className="flex items-center gap-1.5 text-primary mb-sm">
          <Icon name="fiber_new" size={20} filled />
          <span className="text-label-md uppercase tracking-wide">Tocmai a apărut în bazin</span>
        </div>
        <div className="flex items-center gap-sm">
          <Thumb emoji={a.emoji} size={48} className="bg-chip-bg" />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-on-surface">{a.message}</p>
            <p className="text-[13px] text-on-surface-variant">
              {a.producerName}
              {a.distanceKm ? ` · ${a.distanceKm} km` : ""} · livrare {a.deliveryDay}
            </p>
          </div>
          <span className="text-[15px] font-semibold text-primary whitespace-nowrap">
            {a.price} lei/{a.unit}
          </span>
        </div>
        <Button onClick={onAction} icon="storefront" variant="secondary" className="mt-md">
          {a.actionLabel}
        </Button>
      </div>
    </ArtifactCard>
  );
}

// ——— basket (single-producer first; transport transparent) ————————

function BasketCard({
  a,
  onAction,
  onModify,
  spent,
}: {
  a: BasketArtifact;
  onAction?: () => void;
  onModify?: () => void;
  spent?: boolean;
}) {
  const single = a.groups.length === 1;
  return (
    <ArtifactCard>
      <div className="p-md">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[18px] font-semibold text-on-surface">{a.title}</h3>
          <Chip>{single ? "o livrare" : `${a.groups.length} livrări`}</Chip>
        </div>
        <p className="text-[13px] text-on-surface-variant mb-md">
          Vezi exact ce vine, când și cu ce transport — înainte să trimiți comanda.
        </p>

        <div className="space-y-sm">
          {a.groups.map((g) => (
            <div key={g.producerId} className="rounded-card border border-card-border bg-background overflow-hidden">
              <div className="flex items-center gap-sm p-sm border-b border-card-border bg-card">
                <Thumb emoji="🧑‍🌾" size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h4 className="text-[15px] font-semibold text-on-surface truncate">{g.producerName}</h4>
                    {g.isYourProducer && <Chip tone="green" icon="favorite">al tău</Chip>}
                  </div>
                  <p className="text-[12px] text-on-surface-variant">
                    {g.distanceKm} km
                    {g.available < g.requested ? (
                      <span className="text-error"> · {g.available} din {g.requested} disponibile</span>
                    ) : null}
                  </p>
                </div>
              </div>

              <div className="px-sm py-2 space-y-1.5">
                {g.lines.map((l) => (
                  <div key={l.name} className="flex items-center gap-2 text-[14px]">
                    <span aria-hidden="true">{l.emoji}</span>
                    <span className="flex-1 text-on-surface">
                      {l.name} <span className="text-on-surface-variant">· {l.qty}</span>
                    </span>
                    <span className="text-on-surface font-medium">{lei(l.price)}</span>
                  </div>
                ))}
              </div>

              <div className="px-sm py-2 border-t border-card-border flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <Icon name="local_shipping" size={16} className="text-primary" />
                  {g.deliveryDay}
                  {g.deliveryWindow ? ` · ${g.deliveryWindow}` : ""}
                </span>
                <span className="font-medium text-on-surface">transport {lei(g.transport)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* notă de transparență (single-producer) / sumar livrări (multi) */}
        {a.note && (
          <p className="mt-sm flex items-start gap-1.5 text-[13px] text-on-surface-variant">
            <Icon name={single ? "check_circle" : "local_shipping"} size={16} className="text-primary mt-0.5" />
            {a.note}
          </p>
        )}

        {/* produse cerute pe care nu le are nimeni în bazin (piață continuă) */}
        {a.unmatched && a.unmatched.length > 0 && (
          <p className="mt-2 flex items-start gap-1.5 text-[13px] text-on-surface-variant">
            <Icon name="notifications_active" size={16} className="text-primary mt-0.5" />
            Momentan nimeni n-are <span className="font-medium text-on-surface">{a.unmatched.join(", ")}</span> — te anunț când apare.
          </p>
        )}

        <div className="mt-md pt-sm border-t border-card-border space-y-1.5">
          <MoneyRow label="Marfă" amount={lei(a.goodsTotal)} tone="muted" />
          <MoneyRow
            label={single ? "Transport (o livrare)" : "Transport (toate livrările)"}
            amount={lei(a.transportTotal)}
            tone="muted"
          />
          <div className="pt-1.5 border-t border-card-border">
            <MoneyRow label="Total" amount={lei(a.grandTotal)} strong />
          </div>
        </div>

        {spent ? (
          <p className="mt-sm flex items-center justify-center gap-1.5 h-12 rounded bg-chip-bg text-chip-text text-[14px] font-semibold">
            <Icon name="check_circle" size={18} filled /> {single ? "Comandă trimisă" : "Comenzi trimise"}
          </p>
        ) : (
          <>
            <Button onClick={onAction} icon="send" className="mt-sm" variant="primary">
              {a.primaryActionLabel}
            </Button>
            {onModify && (
              <button
                onClick={onModify}
                className="mt-2 w-full h-10 rounded text-[14px] font-medium text-on-surface-variant flex items-center justify-center gap-1 active:scale-[0.98] transition-transform"
              >
                <Icon name="edit" size={16} /> Modifică comanda
              </button>
            )}
          </>
        )}
      </div>
    </ArtifactCard>
  );
}

// ——— confirmation (fermierul confirmă înainte de plată) ——————————

function ConfirmationCard({ a, onCancel, spent }: { a: ConfirmationArtifact; onCancel?: () => void; spent?: boolean }) {
  const pending = a.status === "pending";
  return (
    <ArtifactCard>
      <div className="p-md">
        <div className="flex items-center gap-sm">
          <span
            className={`w-11 h-11 rounded-pill grid place-items-center shrink-0 ${
              pending ? "bg-chip-bg" : "bg-primary"
            }`}
          >
            <Icon
              name={pending ? "hourglass_top" : "check"}
              size={22}
              filled
              className={pending ? "text-primary animate-pulse-soft" : "text-on-primary"}
            />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-on-surface">
              {pending ? `Așteaptă confirmarea lui ${a.producerName}` : `${a.producerName} a acceptat`}
            </p>
            <p className="text-[13px] text-on-surface-variant">
              {a.itemCount} {a.itemCount === 1 ? "articol" : "articole"} · livrare {a.deliveryDay}
            </p>
            {a.note && <p className="text-[12px] text-on-surface-variant mt-1">{a.note}</p>}
          </div>
        </div>
        {/* răzgândire (#40): cât aștepți confirmarea, poți anula fără nicio urmare */}
        {pending && !spent && onCancel && (
          <button
            onClick={onCancel}
            className="mt-2 w-full h-10 rounded text-[14px] font-medium text-on-surface-variant flex items-center justify-center gap-1 active:scale-[0.98] transition-transform"
          >
            <Icon name="close" size={16} /> Anulează comanda
          </button>
        )}
      </div>
    </ArtifactCard>
  );
}

// ——— payment ——————————————————————————————————————————————

function PaymentCard({
  a,
  onAction,
  onToggleRound,
  onCancel,
  spent,
}: {
  a: PaymentArtifact;
  onAction?: () => void;
  onToggleRound?: () => void;
  onCancel?: () => void;
  spent?: boolean;
}) {
  return (
    <ArtifactCard>
      <div className="p-md">
        <div className="flex items-start justify-between border-b border-card-border pb-sm mb-sm">
          <div className="flex items-center gap-sm">
            <Thumb emoji={a.emoji} size={48} />
            <div>
              <h3 className="text-[18px] font-semibold text-on-surface">{a.title}</h3>
              <p className="text-[12px] text-on-surface-variant">
                Livrare: {a.deliveryDay}
                {a.deliveryWindow ? ` · ${a.deliveryWindow}` : ""}
              </p>
            </div>
          </div>
          {a.validatedBySeller && (
            <Chip tone="green" icon="verified">
              acceptat
            </Chip>
          )}
        </div>

        <div className="space-y-1.5">
          {a.rows.map((r) => (
            <MoneyRow
              key={r.label}
              label={r.label}
              amount={`${r.amount} lei`}
              tone={r.kind === "transport" ? "muted" : r.kind === "discount" ? "green" : "normal"}
            />
          ))}
          <div className="pt-sm border-t border-card-border">
            <MoneyRow label="Total de plată" amount={lei(a.total)} strong />
          </div>
        </div>

        {/* rotunjire voluntară către fondul comunității (#6) — doar înainte de plată */}
        {a.roundUp && a.roundUp.donation > 0 && !spent && (
          <button
            onClick={onToggleRound}
            className="mt-sm w-full flex items-center gap-sm rounded-card border border-card-border bg-background p-sm text-left active:scale-[0.99] transition-transform"
          >
            <span
              className={`w-5 h-5 rounded grid place-items-center shrink-0 border ${
                a.roundUp.on ? "bg-primary border-primary" : "border-outline"
              }`}
            >
              {a.roundUp.on && <Icon name="check" size={14} className="text-on-primary" />}
            </span>
            <span className="flex-1 text-[13px] text-on-surface">
              Rotunjește la <span className="font-semibold">{a.roundUp.target} lei</span> — {a.roundUp.donation} lei pentru
              fondul comunității
            </span>
            <Icon name="volunteer_activism" size={18} className="text-primary" />
          </button>
        )}

        {a.escrowNote && (
          <div className="mt-sm flex items-start gap-2 rounded bg-background p-sm text-[12px] text-on-surface-variant">
            <Icon name="lock" size={16} className="text-primary mt-0.5" />
            <span>{a.escrowNote}</span>
          </div>
        )}

        {spent ? (
          <p className="mt-md flex items-center justify-center gap-1.5 h-12 rounded bg-chip-bg text-chip-text text-[15px] font-semibold">
            <Icon name="check_circle" size={20} filled /> Plătit · {lei(a.total)}
          </p>
        ) : (
          <>
            <Button onClick={onAction} icon="payments" className="mt-md">
              {a.actionLabel}
            </Button>
            {/* răzgândire (#40): până la plată, anularea nu costă nimic */}
            {onCancel && (
              <button
                onClick={onCancel}
                className="mt-2 w-full h-10 rounded text-[14px] font-medium text-on-surface-variant flex items-center justify-center gap-1 active:scale-[0.98] transition-transform"
              >
                <Icon name="close" size={16} /> Anulează comanda
              </button>
            )}
            <p className="text-center text-[11px] text-outline mt-2">Plată simulată · pilot fără bani reali</p>
          </>
        )}
      </div>
    </ArtifactCard>
  );
}

// ——— escrow („unde merg banii" — blocați până la livrare, Etapa 7) ——

function EscrowCard({ a }: { a: EscrowArtifact }) {
  return (
    <ArtifactCard>
      <div className="p-md">
        <div className="flex items-center gap-sm mb-sm">
          <span className="w-11 h-11 rounded-pill bg-chip-bg grid place-items-center shrink-0">
            <Icon name="lock" size={22} className="text-primary" filled />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-on-surface">Bani blocați până la livrare · {lei(a.held)}</p>
            <p className="text-[12px] text-on-surface-variant">Nimeni nu primește banii până confirmi livrarea.</p>
          </div>
        </div>

        <div className="rounded-card border border-card-border bg-background divide-y divide-card-border">
          {a.toProducers.map((p) => (
            <div key={p.name} className="flex items-center gap-2 px-sm py-2 text-[13px]">
              <Icon name="agriculture" size={16} className="text-primary" />
              <span className="flex-1 text-on-surface">{p.name}</span>
              <span className="font-medium text-on-surface">{lei(p.amount)}</span>
            </div>
          ))}
          {a.toFund > 0 && (
            <div className="flex items-center gap-2 px-sm py-2 text-[13px]">
              <Icon name="volunteer_activism" size={16} className="text-primary" />
              <span className="flex-1 text-on-surface">Fondul comunității</span>
              <span className="font-medium text-secondary">{lei(a.toFund)}</span>
            </div>
          )}
        </div>

        <p className="mt-sm flex items-start gap-1.5 text-[12px] text-on-surface-variant">
          <Icon name="schedule" size={15} className="text-primary mt-0.5" />
          {a.releaseNote}
        </p>
      </div>
    </ArtifactCard>
  );
}

// ——— order (confirmare + cod + urmărire) ————————————————————

const STAGES: { key: OrderArtifact["stage"]; label: string; icon: string }[] = [
  { key: "preluat", label: "Preluat", icon: "agriculture" },
  { key: "in-drum", label: "În drum", icon: "local_shipping" },
  { key: "livrat", label: "Livrat", icon: "home" },
];

function OrderCard({ a }: { a: OrderArtifact }) {
  const activeIdx = STAGES.findIndex((s) => s.key === a.stage);
  return (
    <ArtifactCard>
      <div className="p-md">
        <div className="flex items-center justify-between mb-md">
          <div>
            <Chip tone="green" icon="check_circle">
              confirmată
            </Chip>
            <h3 className="text-[18px] font-semibold text-on-surface mt-1.5">{a.title}</h3>
            <p className="text-[13px] text-on-surface-variant">
              {a.producerName} · {a.deliveryDay}
              {a.deliveryWindow ? ` · ${a.deliveryWindow}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-label-md uppercase text-outline">comandă</p>
            <p className="text-[14px] font-semibold text-on-surface">#{a.orderId}</p>
          </div>
        </div>

        <div className="rounded-card bg-primary/5 border border-primary/20 p-sm mb-md flex items-center gap-sm">
          <Icon name="qr_code_2" size={28} className="text-primary" />
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">Cod de livrare</p>
            <p className="text-[24px] font-semibold tracking-[0.3em] text-primary leading-tight">
              {a.deliveryCode}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {STAGES.map((s, i) => {
            const done = i <= activeIdx;
            const isActive = i === activeIdx;
            return (
              <div key={s.key} className="flex-1 flex flex-col items-center relative">
                {i > 0 && (
                  <div
                    className={`absolute top-5 right-1/2 w-full h-0.5 ${i <= activeIdx ? "bg-primary" : "bg-surface-high"}`}
                  />
                )}
                <div
                  className={`relative z-10 w-10 h-10 rounded-pill grid place-items-center ${
                    isActive
                      ? "bg-primary text-on-primary shadow-art scale-110"
                      : done
                        ? "bg-chip-bg text-primary"
                        : "bg-surface-high text-outline"
                  }`}
                >
                  <Icon name={s.icon} size={20} filled={done} />
                </div>
                <span className={`mt-1.5 text-[10px] font-semibold uppercase ${done ? "text-primary" : "text-on-surface-variant"}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* rezumatul banilor (detaliile complete rămân în Comenzi) */}
        {typeof a.held === "number" && (
          <p className="mt-md pt-sm border-t border-card-border text-[12px] text-on-surface-variant flex items-start gap-1.5">
            <Icon name="lock" size={15} className="text-primary mt-0.5" />
            {lei(a.held)} stau blocați până confirmi livrarea la ușă — detalii în Comenzi.
          </p>
        )}

        {a.note && (
          <p className={`text-[12px] text-on-surface-variant flex items-start gap-1.5 ${typeof a.held === "number" ? "mt-2" : "mt-md pt-sm border-t border-card-border"}`}>
            <Icon name="info" size={15} className="text-primary mt-0.5" />
            {a.note}
          </p>
        )}
      </div>
    </ArtifactCard>
  );
}

// ——— producer („producătorul tău") ——————————————————————————

function ProducerCard({ a, onAction }: { a: ProducerArtifact; onAction?: () => void }) {
  return (
    <ArtifactCard>
      <div className="p-md">
        <div className="flex items-center gap-sm">
          <Thumb emoji={a.emoji} size={56} className="bg-chip-bg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[17px] font-semibold text-on-surface truncate">{a.producerName}</h3>
              {a.isYour && <Chip tone="green" icon="favorite">al tău</Chip>}
            </div>
            {a.tagline && <p className="text-[13px] text-on-surface-variant truncate">{a.tagline}</p>}
            <div className="flex items-center gap-3 mt-1 text-[12px] text-on-surface-variant">
              {typeof a.punctuality === "number" && (
                <span className="flex items-center gap-1 text-primary font-medium">
                  <Icon name="schedule" size={14} />
                  {a.punctuality}% punctualitate
                </span>
              )}
              {a.distanceKm ? <span>{a.distanceKm} km</span> : null}
            </div>
          </div>
        </div>

        <div className="mt-md grid gap-2">
          {a.actions.reorder && (
            <Button onClick={onAction} icon="refresh" variant="secondary">
              Comandă din nou
            </Button>
          )}
          {a.actions.weeklyBasket && (
            <Button onClick={onAction} icon="event_repeat" variant="primary">
              Coș Săptămânal
            </Button>
          )}
          {a.actions.follow && (
            <Button onClick={onAction} icon="notifications" variant="ghost">
              Urmărește cursa lui
            </Button>
          )}
          {a.actions.favorite && <FavoriteButton />}
        </div>
      </div>
    </ArtifactCard>
  );
}
