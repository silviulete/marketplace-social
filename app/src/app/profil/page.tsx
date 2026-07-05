"use client";

/**
 * Profil comun, conștient de rol (#39): comutatorul „Cumpăr | Vând" schimbă
 * modul (ținut minte pe telefon) — tabul central devine Chat sau Taraba, iar
 * conținutul profilului se schimbă cu el. Uneltele de dezvoltare (simulare,
 * teste vizibile) au fost mutate în /demo — link discret la finalul paginii.
 * Etapa 11: butonul „Spune-ne" (feedback calitativ → DB, citit în /puls).
 */
import { useState } from "react";
import Link from "next/link";
import { ArtifactRenderer } from "@/components/artifacts";
import { ArtifactCard } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { BottomNav } from "@/components/ui/BottomNav";
import { BUYER_NAV } from "@/components/AppShell";
import { SELLER_NAV } from "@/components/seller/SellerShell";
import { BUYER, NEIGHBORHOOD, PRODUCERS } from "@/lib/demo";
import { SELLER } from "@/lib/seller-demo";
import { setRole, useRole, type Role } from "@/lib/role";
import type { ProducerArtifact } from "@/lib/artifacts";

const fv = PRODUCERS.fermaVerde;

const yourProducer: ProducerArtifact = {
  type: "producer",
  producerName: fv.name,
  tagline: `${fv.tagline} · ${fv.owner}`,
  emoji: fv.emoji,
  punctuality: fv.punctuality,
  distanceKm: fv.distanceKm,
  isYour: true,
  actions: { reorder: true, follow: true },
};

export default function ProfilPage() {
  const role = useRole();

  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="w-full max-w-phone relative min-h-dvh flex flex-col bg-background">
        <header className="fixed top-0 z-40 w-full max-w-phone bg-background/85 backdrop-blur-md border-b border-card-border">
          <div className="h-[60px] px-md flex items-center gap-base">
            <Icon name="spa" className="text-primary" size={24} filled />
            <h1 className="text-[18px] font-semibold text-on-surface">Profil</h1>
          </div>
        </header>

        <main className="flex-1 pt-[60px] pb-[150px]">
          <div className="px-md pt-md space-y-lg">
            <RoleSwitch role={role} />
            {role === "buyer" ? <BuyerProfile /> : <SellerProfile />}

            <FeedbackCard />

            {/* intrare discretă spre uneltele de dezvoltare */}
            <section className="pt-sm">
              <Link
                href="/demo"
                className="flex items-center justify-center gap-1.5 h-10 text-[12px] text-on-surface-variant"
              >
                <Icon name="build" size={14} /> Pentru dezvoltare · Mod demo & teste
              </Link>
            </section>
          </div>
        </main>

        <BottomNav items={role === "buyer" ? BUYER_NAV : SELLER_NAV} />
      </div>
    </div>
  );
}

/** Comutatorul de mod — înlocuiește cardul „Vinzi?" și link-ul „Piață" (#39). */
function RoleSwitch({ role }: { role: Role }) {
  return (
    <section className="space-y-sm">
      <div className="bg-surface-container rounded-pill p-1 flex" role="group" aria-label="Modul tău">
        <RoleTab active={role === "buyer"} icon="shopping_basket" label="Cumpăr" onClick={() => setRole("buyer")} />
        <RoleTab active={role === "seller"} icon="storefront" label="Vând" onClick={() => setRole("seller")} />
      </div>
      <p className="text-[12px] text-on-surface-variant px-1">
        {role === "buyer"
          ? "Ești în modul cumpărător — tabul din mijloc e Chatul pieței."
          : "Ești în modul vânzător — tabul din mijloc e Taraba ta."}
      </p>
    </section>
  );
}

function RoleTab({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 h-11 rounded-pill flex items-center justify-center gap-2 transition-colors ${
        active ? "bg-card text-primary shadow-art" : "text-on-surface-variant"
      }`}
    >
      <Icon name={icon} size={18} filled={active} />
      <span className="text-[14px] font-semibold">{label}</span>
    </button>
  );
}

// ——— feedback calitativ („Spune-ne", Etapa 11) ————————————————————

function FeedbackCard() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  async function send() {
    const clean = text.trim();
    if (!clean) return;
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: clean }),
      });
    } catch {
      /* offline → feedback-ul se pierde, dar UI-ul confirmă oricum (pilot) */
    }
    setSent(true);
  }

  return (
    <section className="space-y-sm">
      <h3 className="text-label-md uppercase text-on-surface-variant px-1">Părerea ta</h3>
      <ArtifactCard className="p-md">
        {sent ? (
          <p className="flex items-center gap-2 text-[14px] font-medium text-primary">
            <Icon name="check_circle" size={18} filled /> Mulțumim — am primit. Citim tot.
          </p>
        ) : open ? (
          <div className="space-y-sm">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ce nu merge? Ce ți-ar face viața mai ușoară?"
              rows={3}
              className="w-full rounded border border-card-border bg-background p-sm text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
            />
            <button
              onClick={send}
              disabled={!text.trim()}
              className="w-full h-11 rounded bg-primary text-on-primary text-[14px] font-semibold disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              Trimite
            </button>
          </div>
        ) : (
          <button onClick={() => setOpen(true)} className="w-full flex items-center gap-sm text-left">
            <span className="w-11 h-11 rounded bg-chip-bg grid place-items-center shrink-0">
              <Icon name="rate_review" className="text-primary" size={22} />
            </span>
            <span className="flex-1">
              <span className="block text-[15px] font-semibold text-on-surface">Spune-ne</span>
              <span className="block text-[13px] text-on-surface-variant">Ce nu merge sau ce lipsește — 30 de secunde</span>
            </span>
            <Icon name="chevron_right" size={20} className="text-outline" />
          </button>
        )}
      </ArtifactCard>
    </section>
  );
}

// ——— modul cumpărător ————————————————————————————————————————————

function BuyerProfile() {
  return (
    <>
      {/* antet utilizator */}
      <section className="flex items-center gap-md">
        <div className="w-16 h-16 rounded-pill bg-chip-bg grid place-items-center text-[28px]">🙂</div>
        <div>
          <h2 className="text-[20px] font-semibold text-on-surface">{BUYER.firstName}</h2>
          <p className="text-[13px] text-on-surface-variant flex items-center gap-1">
            <Icon name="location_on" size={15} className="text-primary" />
            {NEIGHBORHOOD.name}
          </p>
        </div>
      </section>

      {/* coș săptămânal activ */}
      <section className="space-y-sm">
        <h3 className="text-label-md uppercase text-on-surface-variant px-1">Recurență</h3>
        <ArtifactCard className="p-md">
          <div className="flex items-center gap-sm">
            <span className="w-11 h-11 rounded bg-chip-bg grid place-items-center">
              <Icon name="event_repeat" className="text-primary" size={22} />
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-on-surface">Coș Săptămânal</p>
              <p className="text-[13px] text-on-surface-variant">Miercuri îți cer confirmarea · livrare joi</p>
            </div>
            <span className="px-2.5 py-1 rounded-pill bg-chip-bg text-chip-text text-label-md uppercase">activ</span>
          </div>
        </ArtifactCard>
      </section>

      {/* producătorii tăi */}
      <section className="space-y-sm">
        <h3 className="text-label-md uppercase text-on-surface-variant px-1">Producătorii tăi</h3>
        <ArtifactRenderer artifact={yourProducer} />
        <Link
          href="/ferma/p-ferma-verde"
          className="flex items-center justify-center gap-1 h-10 text-[13px] font-medium text-primary"
        >
          <Icon name="verified_user" size={16} /> Vezi profilul & punctualitatea
        </Link>
      </section>

      {/* oferte din bazin */}
      <section className="space-y-sm">
        <h3 className="text-label-md uppercase text-on-surface-variant px-1">Bazinul tău</h3>
        <Link href="/bazin">
          <ArtifactCard className="p-md">
            <div className="flex items-center gap-sm">
              <span className="w-11 h-11 rounded bg-primary grid place-items-center shrink-0">
                <Icon name="storefront" className="text-on-primary" size={22} filled />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-on-surface">Oferte proaspete în bazin</p>
                <p className="text-[13px] text-on-surface-variant">Producătorii din raza ta (~45 km)</p>
              </div>
              <Icon name="chevron_right" size={20} className="text-outline" />
            </div>
          </ArtifactCard>
        </Link>
      </section>
    </>
  );
}

// ——— modul vânzător ————————————————————————————————————————————

function SellerProfile() {
  return (
    <>
      {/* antet fermă */}
      <section className="flex items-center gap-md">
        <div className="w-16 h-16 rounded-pill bg-chip-bg grid place-items-center text-[28px]">{fv.emoji}</div>
        <div>
          <h2 className="text-[20px] font-semibold text-on-surface">{SELLER.farm}</h2>
          <p className="text-[13px] text-on-surface-variant flex items-center gap-1">
            <Icon name="person" size={15} className="text-primary" />
            {SELLER.firstName} · {SELLER.neighborhood}
          </p>
        </div>
      </section>

      {/* cursa curentă */}
      <section className="space-y-sm">
        <h3 className="text-label-md uppercase text-on-surface-variant px-1">Cursa ta</h3>
        <ArtifactCard className="p-md">
          <div className="flex items-center gap-sm">
            <span className="w-11 h-11 rounded bg-chip-bg grid place-items-center">
              <Icon name="schedule" className="text-primary" size={22} />
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-on-surface">Livrare {SELLER.deliveryDay}</p>
              <p className="text-[13px] text-on-surface-variant">comenzile se string până {SELLER.cutoff}</p>
            </div>
          </div>
        </ArtifactCard>
      </section>

      {/* profilul public — cum te văd cumpărătorii */}
      <section className="space-y-sm">
        <h3 className="text-label-md uppercase text-on-surface-variant px-1">Încredere</h3>
        <Link href="/ferma/p-ferma-verde">
          <ArtifactCard className="p-md">
            <div className="flex items-center gap-sm">
              <span className="w-11 h-11 rounded bg-primary grid place-items-center shrink-0">
                <Icon name="verified_user" className="text-on-primary" size={22} filled />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-on-surface">Cum te văd cumpărătorii</p>
                <p className="text-[13px] text-on-surface-variant">profilul public · punctualitate · istoric</p>
              </div>
              <Icon name="chevron_right" size={20} className="text-outline" />
            </div>
          </ArtifactCard>
        </Link>
      </section>
    </>
  );
}
