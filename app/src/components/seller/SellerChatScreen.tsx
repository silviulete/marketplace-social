"use client";

/**
 * Motorul Tarabei — Etapa 3 (oferta prin AI) + Etapa 6b (Cursa live).
 *
 * Etapa 3: vânzătorul scrie liber → Taraba extrage oferta (numere deterministe) →
 * confirmă → publică în DB (apare la cumpărători în /bazin).
 *
 * Etapa 6b: după publicare, **Cursa de joi e condusă de mașina de stări reală**
 * (`CursaEngine` + `SimulatedClock`, Etapa 6a). Bara de sus arată **countdown-ul
 * live până la cutoff**; comenzile pică în Cursă; producătorul **acceptă/refuză
 * fiecare** (accept → coada de livrare; refuz → refund). La cutoff, comenzile
 * ne-acționate **expiră + refund** (#34). **Crainicul** anunță deschiderea și
 * închiderea ciclului. (Plata clientului + escrow = Etapa 7.)
 */
import { useEffect, useRef, useState } from "react";
import type { OfferProductDraft, SellerOrderStatus } from "@/lib/artifacts";
import { SELLER, SELLER_ORDERS } from "@/lib/seller-demo";
import { getModelProvider } from "@/lib/model-provider";
import { SimulatedClock } from "@/lib/clock";
import { CursaEngine } from "@/lib/cursa";
import { track } from "@/lib/track";
import { AiText, TypingIndicator, UserMessage } from "../chat/messages";
import { Composer } from "../chat/Composer";
import { SellerOfferEditor } from "./SellerOfferEditor";
import { OrderRequestCard, SellerStatusBar, canFulfill, orderNeeds, type Stock } from "./SellerCursa";

type SMsg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "ai"; label?: string; text?: string; orderId?: string };

type Phase = "await" | "editing" | "published";
const EXAMPLE = "Am 8 kg roșii la 9 lei și 4 kg castraveți la 9 lei, livrez joi";

// Ceas simulat comprimat pentru demo: cutoff-ul „marți 12:00" (la 48h) atins în ~45s.
const HOUR = 3_600_000;
const CUTOFF_AT = 48 * HOUR;
const DELIVERY_AT = CUTOFF_AT + 48 * HOUR;
const DEMO_MS = 45_000;
const TICK = 200;
const STEP = (CUTOFF_AT * TICK) / DEMO_MS;
// Fereastra de răzgândire (#40): 2h în produs; pe ceasul comprimat al demo-ului
// 2h ≈ 2s reale (neclicabil), așa că demo-ul folosește echivalentul a ~8s reale.
const UNDO_DEMO_MS = Math.round((CUTOFF_AT * 8_000) / DEMO_MS);

const fmtCountdown = (remMs: number) => {
  const rem = Math.max(0, remMs);
  return `${Math.floor(rem / HOUR)}h ${Math.floor((rem % HOUR) / 60_000)}m`;
};

export function SellerChatScreen() {
  const [messages, setMessages] = useState<SMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [phase, setPhase] = useState<Phase>("await");
  const [offer, setOffer] = useState<OfferProductDraft[]>([]);
  const [meta, setMeta] = useState<{ deliveryDay?: string; cutoff?: string }>({});
  const [stock, setStock] = useState<Stock>({});
  const [editingPublished, setEditingPublished] = useState(false);

  // Cursa live (Etapa 6b): mașina de stări reală + ceasul simulat.
  const clock = useRef<SimulatedClock | null>(null);
  const engine = useRef<CursaEngine | null>(null);
  const cursaId = useRef("");
  const orderMap = useRef<Record<string, string>>({}); // demoId → engineOrderId
  const driver = useRef<ReturnType<typeof setInterval> | null>(null);
  const closedRef = useRef(false);
  const [nowMs, setNowMs] = useState(0);
  const [closed, setClosed] = useState(false);

  const idc = useRef(0);
  const attempts = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const provider = useRef(getModelProvider()).current;

  const addMsg = (m: Omit<Extract<SMsg, { role: "ai" }>, "id"> | Omit<Extract<SMsg, { role: "user" }>, "id">) =>
    setMessages((x) => [...x, { id: `m${idc.current++}`, ...m } as SMsg]);

  useEffect(() => {
    addMsg({
      role: "ai",
      text: `Bună, ${SELLER.firstName} 👋 Scrie-mi liber ce ai de vânzare azi (produs, preț, ziua de livrare) și îți pregătesc oferta.`,
    });
    return () => {
      timers.current.forEach(clearTimeout);
      if (driver.current) clearInterval(driver.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing, phase]);

  async function handleSend(text: string) {
    if (!text.trim() || phase === "published" || typing) return;
    addMsg({ role: "user", text });
    setTyping(true);
    const res = await provider.extractOffer(text);
    setTyping(false);
    track("taraba.extract", {
      provider: provider.name,
      products: res.products.length,
      confidence: Number(res.confidence.toFixed(2)),
      missing: res.missing,
    });

    if (res.products.length === 0) {
      attempts.current += 1;
      if (attempts.current >= 2) {
        addMsg({
          role: "ai",
          label: "Hai pe formular",
          text: "N-am reușit să prind produsele din text. Completează oferta manual mai jos — adaugi produse cu „+ Adaugă produs”.",
        });
        setPhase("editing");
      } else {
        addMsg({ role: "ai", text: "N-am prins niciun produs. Scrie de exemplu: „roșii 9 lei, castraveți 8 lei, joi”." });
      }
      return;
    }

    setOffer((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      for (const p of res.products) if (!map.has(p.id)) map.set(p.id, p);
      return [...map.values()];
    });
    setMeta((m) => ({ deliveryDay: res.deliveryDay ?? m.deliveryDay, cutoff: res.cutoff ?? m.cutoff }));
    addMsg({
      role: "ai",
      label: "Taraba · ofertă pregătită",
      text: res.missing.length
        ? `Am pregătit oferta. Îmi mai spui ${res.missing.join(", ")}? (Poți completa și direct în card.)`
        : "Am pregătit oferta din ce mi-ai spus. Verific-o și publică.",
    });
    setPhase("editing");
  }

  async function publish() {
    try {
      await fetch("/api/publish-offer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          producerId: "p-ferma-verde",
          deliveryDay: meta.deliveryDay ?? "Joi",
          cutoff: meta.cutoff ?? "marți, 12:00",
          products: offer,
        }),
      });
    } catch {
      /* offline → demo continuă oricum */
    }
    track("taraba.publish", { products: offer.length });
    setStock(Object.fromEntries(offer.map((p) => [p.id, p.stock])));
    setPhase("published");
    addMsg({
      role: "ai",
      label: "Ofertă publicată",
      text: "Gata — ești live. Oferta a apărut și la cumpărători, în „Oferte în bazin”.",
    });
    startCursa();
  }

  // ——— Cursa live (Etapa 6b) ————————————————————————————————————

  function startCursa() {
    const c = new SimulatedClock(0);
    const e = new CursaEngine(c, UNDO_DEMO_MS);
    clock.current = c;
    engine.current = e;
    const cursa = e.openCursa("p-ferma-verde", meta.deliveryDay ?? "Joi", CUTOFF_AT, DELIVERY_AT);
    cursaId.current = cursa.id;
    closedRef.current = false;

    addMsg({
      role: "ai",
      label: "Crainicul Cursei 📣",
      text: `Cursa de ${(meta.deliveryDay ?? "joi").toLowerCase()} e deschisă — comenzile se string până ${meta.cutoff ?? "marți, 12:00"}. Acceptă sau refuză fiecare comandă (te poți răzgândi în primele 2 ore); ce rămâne neatins la închidere expiră.`,
    });

    driver.current = setInterval(() => {
      const cl = clock.current;
      if (!cl) return;
      cl.advanceTo(Math.min(CUTOFF_AT, cl.now() + STEP));
      setNowMs(cl.now());
      if (cl.now() >= CUTOFF_AT && !closedRef.current) onCutoff();
    }, TICK);

    emitOrders();
  }

  function onCutoff() {
    closedRef.current = true;
    setClosed(true);
    if (driver.current) clearInterval(driver.current);
    const orders = currentCursaOrders();
    const acceptate = orders.filter((o) => o.status === "acceptat" || o.status === "livrat").length;
    const expirate = orders.filter((o) => o.status === "expirat").length;
    addMsg({
      role: "ai",
      label: "Crainicul Cursei 📣",
      text: `Cursa s-a închis. ${acceptate} ${acceptate === 1 ? "comandă acceptată intră" : "comenzi acceptate intră"} în coada de livrare de joi${
        expirate > 0 ? `; ${expirate} neatinse au expirat (banii se întorc automat la clienți)` : ""
      }.`,
    });
    track("cursa.cutoff", { acceptate, expirate });
  }

  function currentCursaOrders() {
    return engine.current?.curse.find((c) => c.id === cursaId.current)?.orders ?? [];
  }

  /** Statusul unei comenzi demo, citit din mașina de stări. */
  function statusOf(demoId: string): SellerOrderStatus {
    const eid = orderMap.current[demoId];
    const o = currentCursaOrders().find((x) => x.id === eid);
    return (o?.status as SellerOrderStatus) ?? "nou";
  }

  function emitOrders() {
    let d = 1300;
    for (const o of SELLER_ORDERS) {
      timers.current.push(
        setTimeout(() => {
          if (closedRef.current) return; // după cutoff nu mai pică în Cursa curentă
          const placed = engine.current?.placeOrder("p-ferma-verde", o.buyer, o.fulfillTotal);
          if (placed?.cursa) orderMap.current[o.id] = placed.cursa.orders[placed.cursa.orders.length - 1].id;
          setTyping(true);
          timers.current.push(
            setTimeout(() => {
              setTyping(false);
              addMsg({ role: "ai", label: "Comandă nouă", orderId: o.id });
            }, 600),
          );
        }, d),
      );
      d += 2300;
    }
  }

  function accept(id: string) {
    const order = SELLER_ORDERS.find((o) => o.id === id);
    if (!order || !canFulfill(order, stock)) return;
    const ok = engine.current?.accept(cursaId.current, orderMap.current[id]);
    if (!ok) return;
    const n = orderNeeds(order);
    setStock((s) => {
      const next = { ...s };
      for (const k of Object.keys(n)) next[k] = (next[k] ?? 0) - n[k];
      return next;
    });
    setNowMs(clock.current?.now() ?? 0); // re-randează statusurile
  }

  function refuse(id: string) {
    engine.current?.refuse(cursaId.current, orderMap.current[id]);
    setNowMs(clock.current?.now() ?? 0);
  }

  /** Răzgândire (#40): decizia revine la „nou"; stocul alocat se întoarce la accept-revert. */
  function revert(id: string) {
    const order = SELLER_ORDERS.find((o) => o.id === id);
    if (!order) return;
    const was = statusOf(id);
    const ok = engine.current?.revertDecision(cursaId.current, orderMap.current[id]);
    if (!ok) return;
    if (was === "acceptat") {
      const n = orderNeeds(order);
      setStock((s) => {
        const next = { ...s };
        for (const k of Object.keys(n)) next[k] = (next[k] ?? 0) + n[k];
        return next;
      });
    }
    setNowMs(clock.current?.now() ?? 0);
  }

  /** Mai e deschisă fereastra de răzgândire pentru comanda asta? (re-evaluat la fiecare tick) */
  function canRevert(id: string): boolean {
    return (engine.current?.revertWindowLeft(cursaId.current, orderMap.current[id]) ?? 0) > 0;
  }

  function addStock(productId: string, qty: number) {
    const m = offer.find((p) => p.id === productId);
    const name = m?.name.toLowerCase() ?? "produs";
    const unit = m?.unit ?? "";
    const next = (stock[productId] ?? 0) + qty;
    setStock((s) => ({ ...s, [productId]: (s[productId] ?? 0) + qty }));
    addMsg({ role: "user", text: `Mai adaug ${qty} ${unit} ${name}` });
    addMsg({ role: "ai", label: "Stoc actualizat", text: `Am adăugat ${qty} ${unit} ${name}. Acum ai ${next} ${unit} disponibil.` });
  }

  function openEdit() {
    setOffer((prev) => prev.map((p) => ({ ...p, stock: stock[p.id] ?? p.stock })));
    setEditingPublished(true);
  }

  async function saveEdits() {
    try {
      await fetch("/api/publish-offer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          producerId: "p-ferma-verde",
          deliveryDay: meta.deliveryDay ?? "Joi",
          cutoff: meta.cutoff ?? "marți, 12:00",
          products: offer,
        }),
      });
    } catch {
      /* offline */
    }
    track("taraba.edit", { products: offer.length });
    setStock(Object.fromEntries(offer.map((p) => [p.id, p.stock])));
    setEditingPublished(false);
    addMsg({ role: "ai", label: "Ofertă actualizată", text: "Modificările sunt live — și la cumpărători, în „Oferte în bazin”." });
  }

  // metrici + stoc alocat (din mașina de stări)
  const acceptedDemo = SELLER_ORDERS.filter((o) => ["acceptat", "livrat"].includes(statusOf(o.id)));
  const allocated: Record<string, number> = {};
  for (const o of acceptedDemo) {
    const n = orderNeeds(o);
    for (const k of Object.keys(n)) allocated[k] = (allocated[k] ?? 0) + n[k];
  }
  const productMeta: Record<string, { name: string; unit: string }> = Object.fromEntries(
    offer.map((p) => [p.id, { name: p.name, unit: p.unit }]),
  );
  const statusProducts = offer.map((p) => ({
    id: p.id,
    name: p.name,
    emoji: p.emoji,
    unit: p.unit,
    available: stock[p.id] ?? 0,
    allocated: allocated[p.id] ?? 0,
  }));
  const metrics = {
    comenzi: messages.filter((m) => m.role === "ai" && m.orderId).length,
    acceptate: acceptedDemo.length,
    rezervat: acceptedDemo.reduce((s, o) => s + o.fulfillTotal, 0),
  };
  const countdown = fmtCountdown(CUTOFF_AT - nowMs);

  return (
    <div className="flex flex-col">
      {phase === "published" && (
        <SellerStatusBar
          products={statusProducts}
          metrics={metrics}
          onEdit={openEdit}
          deliveryDay={meta.deliveryDay ?? "Joi"}
          cutoff={meta.cutoff ?? "marți, 12:00"}
          countdown={countdown}
          closed={closed}
        />
      )}

      <div className="px-md pt-md flex flex-col gap-md">
        {messages.map((m) =>
          m.role === "user" ? (
            <UserMessage key={m.id} text={m.text} />
          ) : (
            <div key={m.id} className="flex flex-col items-start gap-2 w-full">
              {(m.label || m.text) && <AiText label={m.label} text={m.text} />}
              {m.orderId &&
                (() => {
                  const order = SELLER_ORDERS.find((o) => o.id === m.orderId);
                  if (!order) return null;
                  return (
                    <div className="w-full">
                      <OrderRequestCard
                        order={order}
                        status={statusOf(order.id)}
                        stock={stock}
                        productMeta={productMeta}
                        onAccept={accept}
                        onRefuse={refuse}
                        onAddStock={addStock}
                        canRevert={canRevert(order.id)}
                        onRevert={revert}
                      />
                    </div>
                  );
                })()}
            </div>
          ),
        )}

        {(phase === "editing" || editingPublished) && (
          <div className="w-full">
            <SellerOfferEditor
              products={offer}
              onChange={setOffer}
              onPublish={editingPublished ? saveEdits : publish}
              primaryLabel={editingPublished ? "Salvează modificările" : "Publică oferta"}
              deliveryDay={meta.deliveryDay}
              cutoff={meta.cutoff}
            />
          </div>
        )}

        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <Composer
        onSend={handleSend}
        disabled={typing}
        placeholder="Scrie ce vinzi…"
        suggestions={phase === "await" ? [EXAMPLE] : undefined}
        endNote="✓ Demo încheiat — ți-ai publicat oferta și ți-ai condus Cursa"
        atEnd={false}
      />
    </div>
  );
}
