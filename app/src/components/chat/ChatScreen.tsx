"use client";

/**
 * Motorul de chat al cumpărătorului — Etapa 4 („Strigarea", agent #2).
 *
 * Cumpărătorul scrie LIBER ce caută → `ModelProvider.extractRequest` structurează
 * nevoia (produs, cantitate, interval de preț, când). Rafinare doar dacă e neclar:
 * o cerere vagă primește EXACT o întrebare. Lista e editabilă; la „Caută" se face
 * **matching pe bazinul real** (`/api/match`, single-producer-first, #21) și se
 * arată potrivirile. Identitatea de **piață continuă**: o ofertă nouă relevantă
 * pică în chat („a apărut … pe care o căutai").
 *
 * Downstream-ul (coș cu transport transparent → confirmarea fermierului → plată →
 * comandă + cod de livrare) e reluat din Etapa 1a, alimentat acum cu prețurile
 * reale găsite la matching. Coșul cu transport transparent / consolidarea pe mai
 * mulți producători rămân motorul determinist de la Etapa 5.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Artifact, ChatMessage, OffersArtifact, OrderItem } from "@/lib/artifacts";
import { DEFAULT_ORDER, NEED_SUGGESTIONS, PRODUCERS } from "@/lib/demo";
import { getModelProvider } from "@/lib/model-provider";
import type { MatchGroup, MatchResult } from "@/lib/matching";
import { composeBasket, buildPaymentFromBasket, rankProducers, roundTarget, MAX_SELLERS } from "@/lib/matching-engine";
import { createPaymentProvider } from "@/lib/payment-provider";
import { track } from "@/lib/track";
import { AiText, TypingIndicator, UserMessage } from "./messages";
import { ArtifactRenderer } from "../artifacts";
import { OrderEditor } from "./OrderEditor";
import { Composer } from "./Composer";

const fv = PRODUCERS.fermaVerde;
const firstName = (full: string) => full.split(" ")[0];

const FRESH = "Ce e proaspăt azi?"; // → oferte din bazin (date reale, Etapa 2)
const NEW_ORDER = "Comandă nouă";
const REORDER = "Comandă din nou (ca data trecută)";
const SAVE_FAV = "Salvează producătorul ca favorit";

/** Fazele fluxului, în ordine (pentru a marca CTA-urile consumate). */
type Phase = "await" | "clarify" | "intent" | "searched" | "basket" | "sent" | "accepted" | "placed";
const ORDER: Phase[] = ["await", "clarify", "intent", "searched", "basket", "sent", "accepted", "placed"];
const at = (p: Phase) => ORDER.indexOf(p);

type Msg = ChatMessage;

export function ChatScreen() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [phase, setPhase] = useState<Phase>("await");
  const [typing, setTyping] = useState(false);
  const [groups, setGroups] = useState<MatchGroup[]>([]); // potrivirile din bazin (pentru motorul de coș)
  const [roundUp, setRoundUp] = useState(false); // rotunjire voluntară la fond (#6)
  const [editorCollapsed, setEditorCollapsed] = useState(false); // un singur artefact viu când coșul e pe ecran
  const router = useRouter();
  const payProvider = useRef(createPaymentProvider()); // cusătura PaymentProvider (simulat)

  const idc = useRef(0);
  const rawNeed = useRef(""); // text acumulat (pentru rafinarea cererii vagi)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const orderMsgIds = useRef<string[]>([]); // mesajele emise după „Trimite" — se retrag la anulare (#40)
  const pendingAlert = useRef<MatchResult["alternatives"][number] | null>(null); // alerta de piață, amânată după plasare
  const bottomRef = useRef<HTMLDivElement>(null);
  const provider = useRef(getModelProvider()).current;

  const pricesKnown = items.length > 0 && items.every((it) => it.unitPrice > 0);

  function addMsg(m: Omit<Extract<Msg, { role: "ai" }>, "id"> | { role: "user"; text: string }): string {
    const id = `m${idc.current++}`;
    setMessages((x) => [...x, { id, ...m } as Msg]);
    return id;
  }

  useEffect(() => {
    greet();
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  function greet() {
    addMsg({
      role: "ai",
      text: `Bună, Silviu 👋 Ești în **zona București + Ilfov** — 12 producători activi în bazinul tău, 7 cu oferte proaspete azi. Scrie-mi liber ce cauți.`,
    });
    addMsg({
      role: "ai",
      label: "Producătorul tău",
      text: "Săptămâna trecută ai cumpărat de la Ion. Reiei coșul sau cauți altceva?",
      artifact: {
        type: "producer",
        producerName: fv.name,
        tagline: `${fv.tagline} · ${fv.owner}`,
        emoji: fv.emoji,
        punctuality: fv.punctuality,
        distanceKm: fv.distanceKm,
        isYour: true,
        actions: { reorder: true },
      },
    });
  }

  // ——— intrarea din Composer / sugestii / CTA-uri ————————————————————

  function onSend(text: string) {
    if (typing) return;
    if (text === FRESH) return void router.push("/bazin");
    if (text === NEW_ORDER) return restart();
    if (text === REORDER) return reorder();
    if (text === SAVE_FAV) return saveFavorite();
    if (text.trim()) void handleNeed(text.trim());
    else if (phase === "await") greet();
  }

  function saveFavorite() {
    addMsg({ role: "user", text: SAVE_FAV });
    addMsg({ role: "ai", text: `L-am salvat pe ${firstName(fv.owner)} la favorite ✓ Îl găsești mereu în Profil.` });
  }

  /** „Strigarea": structurează cererea din text liber (cu rafinare la nevoie). */
  async function handleNeed(text: string) {
    addMsg({ role: "user", text });
    const combined = phase === "clarify" ? `${rawNeed.current} ${text}` : text;
    rawNeed.current = combined;

    setTyping(true);
    const res = await provider.extractRequest(combined);
    setTyping(false);
    track("strigarea.extract", {
      provider: provider.name,
      items: res.items.length,
      unclear: res.unclear,
      confidence: Number(res.confidence.toFixed(2)),
    });

    if (res.unclear) {
      addMsg({ role: "ai", label: "Hai să te ajut", text: res.question });
      setPhase("clarify");
      return;
    }

    const next: OrderItem[] = res.items.map((it) => ({
      id: it.id,
      name: it.name,
      emoji: it.emoji,
      amount: it.amount,
      unit: it.unit,
      unitPrice: 0, // necunoscut până la matching
    }));
    setItems(next);
    setMessages((m) => m.filter((x) => !(x.role === "ai" && x.artifact?.type === "producer"))); // empty-state dispare

    const bits: string[] = [];
    if (res.when) bits.push(`până ${res.when.toLowerCase()}`);
    if (res.priceMax) bits.push(`sub ${res.priceMax} lei`);
    if (res.cheap) bits.push("cât mai ieftin");
    addMsg({
      role: "ai",
      label: "Am înțeles cererea",
      text:
        `Cauți ${res.items.map((i) => i.name.toLowerCase()).join(", ")}${bits.length ? ` (${bits.join(", ")})` : ""}. ` +
        "Verifică lista — schimbă cantitățile sau adaugă / scoate produse, apoi caut în bazinul tău.",
      live: "intent",
    });
    setPhase("intent");
  }

  /** „Comandă din nou": reia comanda anterioară (mono-producător, deja cu prețuri). */
  function reorder() {
    addMsg({ role: "user", text: REORDER });
    setItems(DEFAULT_ORDER);
    setMessages((m) => m.filter((x) => !(x.role === "ai" && x.artifact?.type === "producer")));
    addMsg({
      role: "ai",
      label: "Comanda ta de data trecută",
      text: "Am pregătit coșul de la Ion ca săptămâna trecută. Ajustează-l și caut disponibilitatea în bazin.",
      live: "intent",
    });
    setPhase("intent");
  }

  // ——— matching pe bazinul real ————————————————————————————————————

  async function search() {
    if (typing || items.length === 0) return;
    setTyping(true);
    let res: MatchResult | null = null;
    try {
      const r = await fetch("/api/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ addr: "buc", keys: items.map((it) => it.id), yourProducerId: "p-ferma-verde" }),
      });
      res = (await r.json()) as MatchResult;
    } catch {
      /* offline → continuăm cu ce avem */
    }
    setTyping(false);
    if (!res || !res.groups) return;
    setGroups(res.groups);

    // completează prețurile din potriviri (preferă producătorul care le are pe toate)
    const single = res.singleProducerId ? res.groups.find((g) => g.producerId === res.singleProducerId) : undefined;
    setItems((prev) =>
      prev.map((it) => {
        const fromSingle = single?.offers.find((o) => o.key === it.id);
        const fromAny = res!.groups.flatMap((g) => g.offers).filter((o) => o.key === it.id).sort((a, b) => a.price - b.price)[0];
        const o = fromSingle ?? fromAny;
        return o ? { ...it, unitPrice: o.price, unit: o.unit } : it;
      }),
    );

    track("strigarea.match", {
      groups: res.groups.length,
      single: !!single,
      unmatched: res.unmatchedKeys.length,
      alternatives: res.alternatives.length,
    });

    // piață continuă: alerta NU întrerupe comanda începută — pică după plasare (#40)
    pendingAlert.current = res.alternatives[0] ?? null;

    if (single) {
      // un singur fermier are tot → direct coșul (un pas mai puțin, #40)
      addMsg({
        role: "ai",
        label: "Am căutat în bazinul tău",
        text: `${firstName(single.owner)} — producătorul tău — are tot ce cauți. Uite coșul: o livrare, un transport.`,
        live: "basket",
      });
      setEditorCollapsed(true);
      setPhase("basket");
      return;
    }

    addMsg({
      role: "ai",
      label: "Am căutat în bazinul tău",
      text: "Iată ce am găsit la producătorii din raza ta.",
      artifact: buildMatches(res),
    });
    setPhase("searched");
  }

  function buildMatches(res: MatchResult): OffersArtifact {
    const single = res.singleProducerId ? res.groups.find((g) => g.producerId === res.singleProducerId) : undefined;
    // cel mult 5 vânzători (#18, clarificat), ordonați după favorit + rating + distanță
    const sellers = rankProducers(res.groups)
      .slice(0, MAX_SELLERS)
      .map((g) => ({
        producerName: g.producerName,
        emoji: g.emoji,
        distanceKm: g.distanceKm,
        deliveryDay: g.deliveryDay,
        punctuality: g.punctuality,
        isYour: g.isYours,
        offers: g.offers.map((o) => ({ productName: o.productName, price: o.price, unit: o.unit, emoji: o.emoji })),
      }));
    const more = res.groups.length - sellers.length;
    const unmatched = res.unmatchedKeys.map((k) => items.find((it) => it.id === k)?.name ?? k);
    return {
      type: "offers",
      title: "Potriviri în bazinul tău",
      sellers,
      note: single
        ? `${firstName(single.owner)} le are pe toate — îți recomand un singur coș: o livrare, un transport.`
        : more > 0
          ? `Îți arăt primii ${MAX_SELLERS} vânzători (din ${res.groups.length}). Coșul folosește cele mai puține surse posibile.`
          : res.groups.length > 1
            ? "Niciun vânzător nu le are pe toate — coșul folosește cele mai puține surse posibile."
            : undefined,
      unmatched: unmatched.length ? unmatched : undefined,
      primaryActionLabel: single ? `Vezi coșul de la ${firstName(single.owner)}` : "Vezi coșul",
    };
  }

  function scheduleMarketAlert(alt: MatchResult["alternatives"][number]) {
    timers.current.push(
      setTimeout(() => {
        setTyping(true);
        timers.current.push(
          setTimeout(() => {
            setTyping(false);
            const forName = items.find((it) => it.id === alt.forKey)?.name.toLowerCase() ?? "ce căutai";
            addMsg({
              role: "ai",
              artifact: {
                type: "marketAlert",
                productName: alt.offer.productName,
                emoji: alt.offer.emoji,
                producerName: alt.producerName,
                price: alt.offer.price,
                unit: alt.offer.unit,
                deliveryDay: alt.deliveryDay,
                distanceKm: alt.distanceKm,
                message: `A apărut ${alt.offer.productName} — o alternativă la ${forName}.`,
                actionLabel: "Vezi în bazin",
              },
            });
          }, 700),
        );
      }, 3400),
    );
  }

  // ——— downstream (reluat din 1a, alimentat de MatchingEngine) ——————————
  // Coșul/plata se compun determinist (matching-engine.ts). Pentru single-producer
  // fluxul e cap-coadă; pentru multi-producător, acceptarea per Cursă + plata
  // împărțită (escrow split) sunt Etapele 6–7 — aici plata e simulată pe grandTotal.

  /** Cine e producătorul recomandat (single-producer) sau câți sunt (multi). */
  function basketWho() {
    const basket = composeBasket(items, groups);
    const single = basket.groups.length === 1;
    const g = single ? groups.find((x) => x.producerId === basket.groups[0].producerId) : undefined;
    return { basket, single, owner: g ? g.owner.split(" ")[0] : "", day: single ? basket.groups[0].deliveryDay : "" };
  }

  function viewBasket() {
    const { single, owner, day } = basketWho();
    addMsg({
      role: "ai",
      label: "Coșul tău",
      text: single
        ? `${owner} le are pe toate — îți recomand un singur coș: o livrare ${day.toLowerCase()}, un transport.`
        : "Iată coșul cu transportul și ziua fiecărui producător. Verifică-l înainte să trimiți.",
      live: "basket",
    });
    setEditorCollapsed(true); // un singur artefact viu: coșul (lista rămâne ca rezumat)
    setPhase("basket");
  }

  function sendOrder() {
    const { single, owner } = basketWho();
    setEditorCollapsed(true);
    orderMsgIds.current = [
      addMsg({ role: "user", text: single ? `Trimite comanda la ${owner}` : "Trimite comenzile" }),
      addMsg({
        role: "ai",
        label: "Comandă trimisă",
        text: single
          ? `I-am trimis comanda lui ${owner}. Îți confirmă disponibilitatea înainte să plătești.`
          : "Am trimis comenzile către producători. Îți confirmă disponibilitatea înainte să plătești.",
        artifact: {
          type: "confirmation",
          producerName: single ? owner : "producătorii tăi",
          status: "pending",
          deliveryDay: single ? basketWho().day : "pe Cursele lor",
          itemCount: items.length,
          note: "Răspund de obicei în ~15 min. Plătești doar după ce acceptă.",
        },
      }),
    ];
    setPhase("sent");
    timers.current.push(setTimeout(accepted, 2400));
  }

  function accepted() {
    const { single, owner } = basketWho();
    orderMsgIds.current.push(
      addMsg({
        role: "ai",
        label: single ? `${owner} a acceptat ✓` : "Acceptat ✓",
        text: single
          ? `${owner} a confirmat tot coșul. Poți plăti — banii rămân blocați până confirmi livrarea.`
          : "Producătorii au confirmat. Poți plăti — banii rămân blocați până confirmi livrarea.",
        live: "payment",
      }),
    );
    setPhase("accepted");
  }

  /** Răzgândire (#40): până la plată, anularea nu costă nimic — banii nu s-au mișcat. */
  function cancelOrder() {
    timers.current.forEach(clearTimeout); // oprește confirmarea scriptată a fermierului
    timers.current = [];
    const retract = orderMsgIds.current; // capturat local: updater-ul rulează după reset
    orderMsgIds.current = [];
    setMessages((m) => m.filter((x) => !retract.includes(x.id))); // retrage trimiterea din chat
    addMsg({ role: "user", text: "Anulează comanda" });
    addMsg({
      role: "ai",
      label: "Comandă anulată",
      text: "Am anulat — nu s-a plătit nimic. Coșul tău rămâne mai sus: modifică-l sau trimite-l din nou.",
    });
    setPhase("basket"); // coșul redevine activ („Trimite" + „Modifică")
  }

  function placed() {
    const { basket, single, owner, day } = basketWho();
    // plata simulată → escrow (cusătura PaymentProvider + ledger, Etapa 7)
    const rt = roundTarget(basket.grandTotal);
    const receipt = payProvider.current.pay(basket, roundUp ? { roundUpTo: rt.target } : undefined);
    track("plata.escrow", { held: receipt.escrowHeld, producers: receipt.toProducers.length, fund: receipt.toFund });

    addMsg({ role: "user", text: "Plătesc" });
    // un singur card la final: comanda + codul + rezumatul banilor (detaliile în Comenzi)
    addMsg({
      role: "ai",
      label: "Comandă confirmată",
      text: single
        ? `Plata e blocată în siguranță. ${owner} îți pregătește coșul.`
        : "Plata e blocată în siguranță. Producătorii îți pregătesc coșurile.",
      artifact: {
        type: "order",
        title: "Comanda ta",
        orderId: "FV-2841",
        deliveryCode: "7 4 2 9",
        producerName: single ? basket.groups[0].producerName : `${basket.groups.length} producători`,
        deliveryDay: single ? day : "pe Cursele lor",
        deliveryWindow: single ? basket.groups[0].deliveryWindow : undefined,
        stage: "preluat",
        held: receipt.escrowHeld,
        note: "Spune codul la ușă când primești coșul, ca să se elibereze plata.",
      },
    });
    setPhase("placed");

    // piață continuă: alerta amânată pică abia acum, când comanda e plasată (#40)
    if (pendingAlert.current) {
      scheduleMarketAlert(pendingAlert.current);
      pendingAlert.current = null;
    }
  }

  function restart() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    rawNeed.current = "";
    orderMsgIds.current = [];
    pendingAlert.current = null;
    setItems([]);
    setGroups([]);
    setRoundUp(false);
    setEditorCollapsed(false);
    payProvider.current = createPaymentProvider();
    setTyping(false);
    setPhase("await");
    setMessages([]);
    idc.current = 0;
    setTimeout(greet, 0);
  }

  function modifyOrder() {
    setEditorCollapsed(false); // redeschide lista din rezumat
    setTimeout(() => document.getElementById("order-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  // ——— rutarea acțiunilor unui artefact către handler-ul potrivit ————

  function artifactAction(a: Artifact) {
    if (a.type === "producer" && a.actions.reorder) reorder();
    else if (a.type === "producer" && a.actions.weeklyBasket) reorder();
    else if (a.type === "offers") viewBasket();
    else if (a.type === "marketAlert") router.push("/bazin");
  }

  // ——— render ————————————————————————————————————————————————————

  const sent = at(phase) >= at("sent");
  const suggestions = !typing ? suggestionsFor(phase) : undefined;
  const atEnd = phase === "placed" && !typing;

  return (
    <div className="flex flex-col">
      <div className="px-md pt-md flex flex-col gap-md">
        {messages.map((m) =>
          m.role === "user" ? (
            <UserMessage key={m.id} text={m.text} />
          ) : (
            <div key={m.id} className="flex flex-col items-start gap-2 w-full">
              {(m.label || m.text) && <AiText label={m.label} text={m.text} />}

              {m.live === "intent" && (
                <div id="order-editor" className="w-full">
                  <OrderEditor
                    items={items}
                    onChange={setItems}
                    onConfirm={search}
                    locked={sent}
                    searched={!sent && at(phase) >= at("searched")}
                    pricesKnown={pricesKnown}
                    collapsed={editorCollapsed || sent}
                    onExpand={modifyOrder}
                  />
                </div>
              )}
              {m.live === "basket" && (
                <div className="w-full">
                  <ArtifactRenderer
                    artifact={composeBasket(items, groups)}
                    onAction={sendOrder}
                    onModify={modifyOrder}
                    spent={at(phase) > at("basket")}
                  />
                </div>
              )}
              {m.live === "payment" &&
                (() => {
                  const basket = composeBasket(items, groups);
                  const rt = roundTarget(basket.grandTotal);
                  return (
                    <div className="w-full">
                      <ArtifactRenderer
                        artifact={buildPaymentFromBasket(basket, { target: rt.target, donation: rt.donation, on: roundUp })}
                        onAction={placed}
                        onToggleRound={() => setRoundUp((v) => !v)}
                        onCancel={cancelOrder}
                        spent={at(phase) >= at("placed")}
                      />
                    </div>
                  );
                })()}
              {m.artifact && (
                <div className="w-full">
                  <ArtifactRenderer
                    artifact={m.artifact}
                    onAction={() => artifactAction(m.artifact!)}
                    onCancel={m.artifact.type === "confirmation" ? cancelOrder : undefined}
                    spent={m.artifact.type === "confirmation" ? phase !== "sent" : undefined}
                  />
                </div>
              )}
            </div>
          ),
        )}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <Composer
        suggestions={suggestions}
        onSend={onSend}
        disabled={typing}
        atEnd={atEnd}
        placeholder="Scrie ce cauți…"
      />
    </div>
  );
}

// maxim două sugestii per moment (#40): un exemplu clar + vitrina bazinului
function suggestionsFor(phase: Phase): string[] | undefined {
  if (phase === "await") return [NEED_SUGGESTIONS.clear, FRESH];
  if (phase === "clarify") return [NEED_SUGGESTIONS.clarify];
  if (phase === "placed") return [SAVE_FAV, NEW_ORDER];
  return undefined;
}
