"use client";

/**
 * Comenzile cumpărătorului (Etapa 8 — livrare la domiciliu + urmărire + eliberare).
 *
 * Comanda activă are o fereastră de livrare + bară de urmărire (preluat → în drum →
 * livrat). La **confirmarea livrării** (spui codul la ușă) escrow-ul se eliberează:
 * `PaymentProvider.release` → banii merg la producător + fond (ledger, Etapa 7).
 * Aici se închide bucla banilor. Ridicarea la Stație cu Gazdă = opțiune viitoare.
 */
import { useRef, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ArtifactRenderer } from "@/components/artifacts";
import { ArtifactCard, Button, Chip, Thumb, lei } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import type { BasketArtifact, OrderStage } from "@/lib/artifacts";
import { createPaymentProvider } from "@/lib/payment-provider";

const CODE = "7 4 2 9";

/** Coșul comenzii active (Ferma Verde) — folosit ca să blocăm escrow-ul la montare. */
const ACTIVE_BASKET: BasketArtifact = {
  type: "basket",
  title: "Coș · Ferma Verde",
  groups: [
    {
      producerId: "p-ferma-verde",
      producerName: "Ferma Verde",
      distanceKm: 12,
      isYourProducer: true,
      lines: [
        { name: "Roșii coapte", qty: "2 kg", price: 18, emoji: "🍅" },
        { name: "Castraveți", qty: "1 kg", price: 9, emoji: "🥒" },
        { name: "Ardei gras", qty: "1 kg", price: 12, emoji: "🫑" },
      ],
      goodsTotal: 39,
      transport: 18,
      deliveryDay: "Joi, 14 iun",
      deliveryWindow: "08:00–10:00",
      available: 3,
      requested: 3,
    },
  ],
  goodsTotal: 39,
  transportTotal: 18,
  grandTotal: 57,
  primaryActionLabel: "",
};

const HISTORY = [
  { id: "FV-2790", title: "Mix legume · Ferma Verde", date: "Livrat 7 iun", total: 64, emoji: "🥬" },
  { id: "SF-2710", title: "Miere & nuci · Stupina Florea", date: "Livrat 31 mai", total: 48, emoji: "🍯" },
  { id: "FV-2698", title: "Coș Săptămânal · Ferma Verde", date: "Livrat 24 mai", total: 72, emoji: "🧺" },
];

export default function ComenziPage() {
  const pp = useRef<ReturnType<typeof createPaymentProvider> | null>(null);
  if (!pp.current) pp.current = createPaymentProvider();
  const [receipt] = useState(() => pp.current!.pay(ACTIVE_BASKET)); // escrow blocat o singură dată
  const [stage, setStage] = useState<OrderStage>("preluat");
  const [released, setReleased] = useState(false);

  function track() {
    setStage("in-drum");
  }

  function confirmDelivery() {
    pp.current!.release(receipt.paymentId); // escrow → producător + fond
    setStage("livrat");
    setReleased(true);
  }

  const r = receipt;
  const note =
    stage === "preluat"
      ? "Ion pregătește coșul pentru joi. Îl vezi pe rută în ziua livrării."
      : stage === "in-drum"
        ? "Ion a pornit pe rută. Spune codul la ușă ca să se elibereze plata."
        : "Coș primit. Plata a fost eliberată către producător.";

  return (
    <AppShell title={<h1 className="text-[18px] font-semibold text-on-surface">Comenzile mele</h1>}>
      <div className="px-md pt-md space-y-lg">
        <section className="space-y-sm">
          <h2 className="text-label-md uppercase text-on-surface-variant px-1">Comandă activă</h2>
          <ArtifactRenderer
            artifact={{
              type: "order",
              title: "Coș · Ferma Verde",
              orderId: "FV-2841",
              deliveryCode: CODE,
              producerName: "Ferma Verde",
              deliveryDay: "Joi, 14 iun",
              deliveryWindow: "08:00–10:00",
              stage,
              note,
            }}
          />

          {/* starea banilor: blocați în escrow → eliberați la confirmare */}
          {released ? (
            <ArtifactCard className="p-md">
              <div className="flex items-center gap-sm">
                <span className="w-11 h-11 rounded-pill bg-chip-bg grid place-items-center shrink-0">
                  <Icon name="task_alt" size={22} className="text-primary" filled />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-on-surface">Plată eliberată · {lei(r.escrowHeld)}</p>
                  <p className="text-[12px] text-on-surface-variant">
                    {r.toProducers.map((p) => `${p.producerName} a primit ${p.amount} lei`).join(" · ")}
                    {r.toFund > 0 ? ` · fond ${r.toFund} lei` : ""}
                  </p>
                </div>
                <Chip tone="green" icon="check_circle">
                  decontat
                </Chip>
              </div>
            </ArtifactCard>
          ) : (
            <ArtifactRenderer
              artifact={{
                type: "escrow",
                held: r.escrowHeld,
                toProducers: r.toProducers.map((p) => ({ name: p.producerName, amount: p.amount })),
                toFund: r.toFund,
                releaseNote: "Se eliberează automat când confirmi la ușă că ai primit coșul.",
              }}
            />
          )}

          {stage === "preluat" && (
            <Button icon="near_me" variant="secondary" onClick={track}>
              Urmărește livrarea
            </Button>
          )}
          {stage === "in-drum" && (
            <Button icon="verified" variant="primary" onClick={confirmDelivery}>
              Confirmă că am primit coșul · cod {CODE}
            </Button>
          )}
          {stage === "livrat" && (
            <p className="flex items-center justify-center gap-1.5 h-12 rounded bg-chip-bg text-chip-text text-[14px] font-semibold">
              <Icon name="check_circle" size={18} filled /> Livrat · plata eliberată
            </p>
          )}
        </section>

        <section className="space-y-sm">
          <h2 className="text-label-md uppercase text-on-surface-variant px-1">Istoric comenzi</h2>
          {HISTORY.map((o) => (
            <ArtifactCard key={o.id} className="p-sm">
              <div className="flex items-center gap-sm">
                <Thumb emoji={o.emoji} size={48} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-on-surface truncate">{o.title}</h3>
                  <p className="text-[13px] text-on-surface-variant">
                    {o.date} · {o.total} lei
                  </p>
                </div>
                <Chip>#{o.id}</Chip>
              </div>
              <Link href="/" className="block mt-sm">
                <Button icon="refresh" variant="secondary">
                  Comandă din nou
                </Button>
              </Link>
            </ArtifactCard>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
