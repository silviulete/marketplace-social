"use client";

/**
 * Comenzile vânzătorului — Etapa 8: **ruta de livrare la domiciliu** (Cursa de joi
 * devine rută). Fereastra de livrare + urmărire pas-cu-pas (în așteptare → în drum
 * → livrat) + bară de progres. La fiecare livrare confirmată, plata se eliberează
 * din escrow către producător (decontare simulată — ledger, Etapa 7).
 */
import { useRef, useState } from "react";
import Link from "next/link";
import { SellerShell } from "@/components/seller/SellerShell";
import { ArtifactCard, Button, Chip, lei } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

type StopStatus = "asteptare" | "in-drum" | "livrat";

interface Stop {
  buyer: string;
  address: string;
  summary: string;
  total: number; // marfă + transport (ce se eliberează la livrare)
}

// Ruta de joi: 12 livrări acceptate (simulare rută cu 10–14 opriri).
const ROUTE: Stop[] = [
  { buyer: "Maria P.", address: "Str. Teiului 4", summary: "2 kg roșii", total: 36 },
  { buyer: "Andrei D.", address: "Bd. Unirii 22", summary: "3 kg roșii · 1 kg castraveți", total: 54 },
  { buyer: "Silviu C.", address: "Str. Florilor 12", summary: "2 kg roșii · 1 castraveți · 1 ardei", total: 57 },
  { buyer: "Elena M.", address: "Str. Lalelelor 8", summary: "2 kg roșii", total: 36 },
  { buyer: "Radu I.", address: "Str. Castanilor 3", summary: "1 kg ardei · 2 kg roșii", total: 48 },
  { buyer: "Ana V.", address: "Bd. Timișoara 91", summary: "3 kg castraveți", total: 45 },
  { buyer: "George T.", address: "Str. Salcâmilor 17", summary: "2 kg roșii · 1 kg ardei", total: 48 },
  { buyer: "Ioana M.", address: "Str. Zorilor 5", summary: "1 kg castraveți · 1 kg roșii", total: 36 },
  { buyer: "Mihai R.", address: "Str. Crinilor 22", summary: "3 kg roșii", total: 45 },
  { buyer: "Cristina B.", address: "Bd. Dacia 40", summary: "2 kg ardei · 1 kg roșii", total: 51 },
  { buyer: "Paul N.", address: "Str. Viilor 8", summary: "2 kg castraveți", total: 36 },
  { buyer: "Diana S.", address: "Str. Plopilor 14", summary: "1 kg roșii · 2 kg castraveți", total: 45 },
];

const TOTAL = ROUTE.reduce((s, r) => s + r.total, 0);

export default function SellerComenziPage() {
  const [status, setStatus] = useState<StopStatus[]>(ROUTE.map(() => "asteptare"));
  const [started, setStarted] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const delivered = status.filter((s) => s === "livrat").length;
  const incasat = ROUTE.reduce((s, r, i) => s + (status[i] === "livrat" ? r.total : 0), 0);
  const done = delivered === ROUTE.length;

  function startRoute() {
    if (started) return;
    setStarted(true);
    setStatus((st) => st.map((s, i) => (i === 0 ? "in-drum" : s)));
    timer.current = setInterval(() => {
      setStatus((st) => {
        const cur = st.indexOf("in-drum");
        if (cur === -1) {
          if (timer.current) clearInterval(timer.current);
          return st;
        }
        const next = [...st];
        next[cur] = "livrat"; // livrare confirmată la ușă → escrow eliberat
        if (cur + 1 < next.length) next[cur + 1] = "in-drum";
        else if (timer.current) clearInterval(timer.current);
        return next;
      });
    }, 1100);
  }

  return (
    <SellerShell>
      <div className="px-md pt-md space-y-md">
        <div>
          <h1 className="text-[20px] font-semibold text-on-surface">Ruta de joi</h1>
          <p className="text-[13px] text-on-surface-variant flex items-center gap-1">
            <Icon name="local_shipping" size={15} className="text-primary" />
            fereastră 08:00–12:00 · livrare la ușă
          </p>
        </div>

        {/* progres rută + încasat */}
        <ArtifactCard className="p-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] font-semibold text-on-surface">
              {delivered}/{ROUTE.length} livrate
            </span>
            <Chip tone={done ? "green" : "neutral"} icon={done ? "check_circle" : "near_me"}>
              {done ? "rută încheiată" : started ? "pe rută" : "de pornit"}
            </Chip>
          </div>
          <div className="h-2 rounded-pill bg-surface-container overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(delivered / ROUTE.length) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[13px]">
            <span className="text-on-surface-variant">Încasat (plăți eliberate)</span>
            <span className="font-semibold text-primary">
              {lei(incasat)} <span className="text-on-surface-variant font-normal">/ {lei(TOTAL)}</span>
            </span>
          </div>
        </ArtifactCard>

        {!started && (
          <Button icon="near_me" variant="primary" onClick={startRoute}>
            Pornește ruta
          </Button>
        )}
        {done && (
          <>
            <p className="flex items-center justify-center gap-1.5 h-12 rounded bg-chip-bg text-chip-text text-[14px] font-semibold">
              <Icon name="check_circle" size={18} filled /> Rută încheiată · toate plățile eliberate
            </p>
            {/* pas următor după rută — fără fund de sac (#40) */}
            <Link
              href="/producator"
              className="flex items-center justify-center gap-1 h-10 text-[14px] font-medium text-primary"
            >
              <Icon name="storefront" size={16} /> Înapoi la Taraba — pregătește Cursa următoare
            </Link>
          </>
        )}

        <div className="space-y-2">
          {ROUTE.map((s, i) => {
            const st = status[i];
            const meta =
              st === "livrat"
                ? { tone: "green" as const, icon: "check_circle", label: "livrat" }
                : st === "in-drum"
                  ? { tone: "green" as const, icon: "local_shipping", label: "în drum" }
                  : { tone: "neutral" as const, icon: "schedule", label: "în așteptare" };
            return (
              <ArtifactCard key={s.buyer} className={`p-sm ${st === "in-drum" ? "border-primary" : ""}`}>
                <div className="flex items-center gap-sm">
                  <span
                    className={`w-8 h-8 rounded-pill grid place-items-center text-[13px] font-semibold shrink-0 ${
                      st === "livrat" ? "bg-primary text-on-primary" : "bg-chip-bg text-primary"
                    }`}
                  >
                    {st === "livrat" ? <Icon name="check" size={16} /> : i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-on-surface truncate">{s.buyer}</p>
                    <p className="text-[12px] text-on-surface-variant flex items-center gap-1 truncate">
                      <Icon name="location_on" size={13} className="text-primary" />
                      {s.address} · {s.summary}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-semibold text-on-surface">{lei(s.total)}</p>
                    <Chip tone={meta.tone} icon={meta.icon}>
                      {meta.label}
                    </Chip>
                  </div>
                </div>
              </ArtifactCard>
            );
          })}
        </div>

        <p className="text-[12px] text-on-surface-variant flex items-start gap-1.5 pt-1">
          <Icon name="lock_open" size={15} className="text-primary mt-0.5" />
          La fiecare livrare confirmată la ușă, plata se eliberează către tine (decontare simulată).
        </p>
      </div>
    </SellerShell>
  );
}
