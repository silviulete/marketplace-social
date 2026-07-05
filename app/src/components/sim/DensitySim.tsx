"use client";

/**
 * Simularea de densitate (Etapa 1c). Un ceas accelerat rulează un ciclu de Cursă
 * (Luni 12:00 → cutoff Marți 12:00) și comenzile pică pe Cursele producătorilor cu
 * un ritm proporțional cu densitatea cartierului. Comutatorul 40 vs. 150 schimbă
 * dramatic scena — întrebarea de validat: „pare viu sau mort?".
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CUTOFF_LABEL,
  DELIVERY_LABEL,
  DENSITIES,
  FRAGILE_THRESHOLD,
  RUN_MS,
  SIM_PRODUCERS,
  WINDOW_MIN,
  formatRemaining,
  makeOrder,
  projectedTotal,
  targetOrders,
  verdictOf,
  type SimOrder,
} from "@/lib/sim";
import { Icon } from "../ui/Icon";

export function DensitySim() {
  const [users, setUsers] = useState<number>(150);
  const [running, setRunning] = useState(true);
  const [simMin, setSimMin] = useState(0);
  const [orders, setOrders] = useState<SimOrder[]>([]);

  const idRef = useRef(0);
  const spawnedRef = useRef(0); // câte comenzi s-au generat (dedup)
  const usersRef = useRef(150);
  const runningRef = useRef(true);
  const elapsedRef = useRef(0); // ms reali acumulați în rulare (fără pauze)
  const startRef = useRef(performance.now()); // începutul segmentului curent

  const SPEED = WINDOW_MIN / RUN_MS; // minute simulate / ms real

  function setRunningBoth(v: boolean) {
    runningRef.current = v;
    setRunning(v);
  }

  // Ceas simulat derivat din timpul real monoton (mock-ul Clock-ului; cel real la
  // Etapa 6a). simMin = timp real scurs × viteză → idempotent și robust (rAF, o
  // singură buclă; chiar și mai multe ar da același rezultat).
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (runningRef.current) {
        const elapsed = elapsedRef.current + (performance.now() - startRef.current);
        const sm = Math.min(WINDOW_MIN, elapsed * SPEED);
        setSimMin(sm);

        const target = Math.round(targetOrders(usersRef.current) * (sm / WINDOW_MIN));
        if (target > spawnedRef.current) {
          const emit: SimOrder[] = [];
          for (let i = spawnedRef.current; i < target; i++) emit.push(makeOrder(usersRef.current, sm, idRef.current++));
          spawnedRef.current = target;
          setOrders((o) => [...emit.reverse(), ...o]);
        }
        if (sm >= WINDOW_MIN) setRunningBoth(false);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reset(nextUsers: number, run = true) {
    idRef.current = 0;
    spawnedRef.current = 0;
    elapsedRef.current = 0;
    startRef.current = performance.now();
    usersRef.current = nextUsers;
    setSimMin(0);
    setOrders([]);
    setUsers(nextUsers);
    setRunningBoth(run);
  }

  function togglePause() {
    if (runningRef.current) {
      elapsedRef.current += performance.now() - startRef.current;
      setRunningBoth(false);
    } else {
      startRef.current = performance.now();
      setRunningBoth(true);
    }
  }

  const progress = simMin / WINDOW_MIN;
  const closed = simMin >= WINDOW_MIN;
  const remaining = WINDOW_MIN - simMin;
  const projected = projectedTotal(orders.length, progress, users);
  const verdict = verdictOf(projected);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const o of orders) c[o.producerId] = (c[o.producerId] ?? 0) + 1;
    return c;
  }, [orders]);
  const activeProducers = Object.keys(counts).length;
  const maxCount = Math.max(1, ...Object.values(counts));

  const verdictStyle =
    verdict === "viu"
      ? { chip: "bg-chip-bg text-chip-text", word: "Viu", note: "piață activă, peste prag" }
      : verdict === "limita"
        ? { chip: "bg-amber-100 text-amber-800", word: "La limită", note: "aproape de pragul de supraviețuire" }
        : { chip: "bg-error-container text-on-error-container", word: "Fragil", note: "sub pragul de supraviețuire" };

  return (
    <div className="px-md pt-md pb-lg space-y-md">
      {/* comutatorul de densitate */}
      <div className="bg-surface-container rounded-pill p-1 flex">
        {DENSITIES.map((d) => (
          <button
            key={d.users}
            onClick={() => reset(d.users)}
            className={`flex-1 h-10 rounded-pill text-[13px] font-semibold transition-colors ${
              users === d.users ? "bg-card text-primary shadow-art" : "text-on-surface-variant"
            }`}
          >
            {d.label} · {d.users}
          </button>
        ))}
      </div>

      {/* countdown + verdict */}
      <div className="bg-card border border-card-border rounded-card shadow-art p-md">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[13px] font-medium text-on-surface-variant">
            <span className={`w-2 h-2 rounded-pill ${closed ? "bg-outline" : "bg-primary animate-pulse-soft"}`} />
            {closed ? "Cursă închisă" : "Cursă deschisă"}
          </span>
          <span className={`px-2.5 py-1 rounded-pill text-label-md uppercase ${verdictStyle.chip}`}>
            {verdictStyle.word}
          </span>
        </div>

        <p className="mt-2 text-[28px] font-semibold text-on-surface leading-none">
          {closed ? (
            <span className="text-[22px]">Se livrează {DELIVERY_LABEL}</span>
          ) : (
            <>se închide în {formatRemaining(remaining)}</>
          )}
        </p>
        <p className="text-[13px] text-on-surface-variant mt-1">
          cutoff {CUTOFF_LABEL} · livrare {DELIVERY_LABEL}
        </p>

        {/* bara ciclului */}
        <div className="mt-sm h-1.5 rounded-pill bg-surface-container overflow-hidden">
          <div className="h-full bg-primary rounded-pill transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* metrici */}
        <div className="mt-md grid grid-cols-3 gap-2">
          <Metric value={orders.length} label="comenzi în Cursă" big />
          <Metric value={activeProducers} label="Curse active" />
          <Metric value={`~${projected}`} label="proiectat la cutoff" />
        </div>
        <p className="mt-2 text-[12px] text-on-surface-variant flex items-center gap-1.5">
          <Icon name="info" size={14} className="text-primary" />
          {verdictStyle.note} (prag de supraviețuire ~{FRAGILE_THRESHOLD} comenzi/ciclu).
        </p>
      </div>

      {/* controale */}
      <div className="flex gap-2">
        <button
          onClick={() => (closed ? reset(users) : togglePause())}
          className="flex-1 h-11 rounded border border-card-border bg-card text-on-surface text-[14px] font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
        >
          <Icon name={closed ? "replay" : running ? "pause" : "play_arrow"} size={18} />
          {closed ? "Reia" : running ? "Pauză" : "Continuă"}
        </button>
        <button
          onClick={() => reset(users)}
          className="h-11 px-4 rounded border border-card-border bg-card text-on-surface-variant text-[14px] font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
        >
          <Icon name="restart_alt" size={18} /> Restart
        </button>
      </div>

      {/* Cursele producătorilor */}
      <div>
        <h2 className="text-label-md uppercase text-on-surface-variant px-1 mb-2">Cursele din cartier</h2>
        <div className="space-y-2">
          {SIM_PRODUCERS.map((p) => {
            const n = counts[p.id] ?? 0;
            return (
              <div key={p.id} className="bg-card border border-card-border rounded-card p-sm flex items-center gap-sm">
                <span className="w-9 h-9 rounded bg-surface-container grid place-items-center text-[18px] shrink-0">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-medium text-on-surface truncate">{p.name}</p>
                    <span className={`text-[14px] font-semibold ${n > 0 ? "text-primary" : "text-outline"}`}>{n}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-pill bg-surface-container overflow-hidden">
                    <div className="h-full bg-primary/70 rounded-pill transition-[width] duration-300" style={{ width: `${(n / maxCount) * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* feed de activitate */}
      <div>
        <h2 className="text-label-md uppercase text-on-surface-variant px-1 mb-2">Activitate live</h2>
        {orders.length === 0 ? (
          <p className="text-[13px] text-on-surface-variant px-1">Se așteaptă primele comenzi…</p>
        ) : (
          <div className="space-y-1.5">
            {orders.slice(0, 12).map((o) => (
              <div
                key={o.id}
                className="animate-fade-in-up bg-card border border-card-border rounded p-sm flex items-center gap-2 text-[13px]"
              >
                <span aria-hidden="true">{o.productEmoji}</span>
                <span className="flex-1 min-w-0 truncate text-on-surface">
                  <span className="font-medium">{o.buyer}</span>
                  <span className="text-on-surface-variant"> → {o.producerName}</span>
                </span>
                <span className="text-on-surface-variant whitespace-nowrap">
                  {o.qty} {o.unit} {o.product}
                </span>
              </div>
            ))}
            {orders.length > 12 && (
              <p className="text-[12px] text-on-surface-variant px-1">+ {orders.length - 12} mai devreme</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ value, label, big }: { value: string | number; label: string; big?: boolean }) {
  return (
    <div className="rounded bg-background border border-card-border px-2 py-2">
      <p className={`font-semibold text-primary leading-none ${big ? "text-[24px]" : "text-[18px]"}`}>{value}</p>
      <p className="text-[10px] text-on-surface-variant mt-1 leading-tight">{label}</p>
    </div>
  );
}
