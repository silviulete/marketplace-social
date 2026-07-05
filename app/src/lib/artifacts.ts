/**
 * Contractele de tip ale artefactelor — sursa de adevăr (Etapa 1a).
 *
 * Conform planului: „Contractele de tip ale artefactelor se definesc o singură
 * dată la Etapa 1a și devin sursa de adevăr și pentru store-ul de la Etapa 2."
 *
 * Un artefact = un obiect tangibil generat în conversație (card alb elevat).
 * `ArtifactRenderer` mapează `type` → componentă React (registru pe tip).
 *
 * Comanda cumpărătorului (`OrderItem[]`) e editabilă: cantitățile, adăugarea și
 * scoaterea de produse se reflectă apoi în coș și în plată (se recalculează).
 */

export type ArtifactType =
  | "offers" // cartonașe de ofertă (potriviri găsite în bazin — Etapa 4)
  | "marketAlert" // piață continuă: a apărut o ofertă nouă relevantă (Etapa 4)
  | "basket" // coș (de preferință de la un singur producător) cu transport transparent
  | "confirmation" // așteptarea confirmării fermierului (înainte de plată)
  | "payment" // cartonaș de plată (un singur preț, escrow)
  | "escrow" // „unde merg banii" — blocați în escrow până la livrare (Etapa 7)
  | "order" // confirmare comandă + cod de livrare + urmărire
  | "producer" // „producătorul tău" + comandă din nou / coș săptămânal
  | "sellerOffer"; // vânzător: oferta extrasă de Taraba (cu promisiune de livrare)

// ——— comanda editabilă (linie de coș a cumpărătorului) ————————————

export interface OrderItem {
  id: string;
  name: string;
  emoji?: string;
  amount: number; // cantitate numerică (editabilă cu stepper)
  unit: string; // „kg", „buc", „borcan", „legătură"
  unitPrice: number; // lei / unitate (din oferta producătorului)
  note?: string; // ex. „bine coapte"
}

// ——— offers ———————————————————————————————————————————————

/** O ofertă a unui vânzător pentru un produs cerut. */
export interface OfferLine {
  productName: string;
  price: number; // lei
  unit: string; // „kg", „L", „buc", „borcan"
  emoji?: string;
}

/** Un vânzător cu ofertele lui pentru produsele cerute (potrivirile, grupate). */
export interface OfferSeller {
  producerName: string;
  emoji?: string;
  distanceKm?: number;
  deliveryDay?: string;
  punctuality?: number; // % onorare (avanpremieră Etapa 9)
  isYour?: boolean; // „producătorul tău"
  offers: OfferLine[];
}

/**
 * Potrivirile găsite în bazin (Etapa 4/5), GRUPATE pe vânzător. Se afișează cel
 * mult 5 vânzători (#18, clarificat: plafonul e pe vânzători, nu pe produse),
 * ordonați după favorit + rating + distanță.
 */
export interface OffersArtifact {
  type: "offers";
  title: string;
  sellers: OfferSeller[];
  note?: string; // ex. „Ion le are pe toate — o livrare, un transport."
  unmatched?: string[]; // produse cerute pe care nimeni nu le are acum
  primaryActionLabel?: string; // ex. „Vezi coșul de la Ion"
}

// ——— marketAlert (piață continuă: a apărut o ofertă nouă) ————————————

export interface MarketAlertArtifact {
  type: "marketAlert";
  productName: string;
  emoji?: string;
  producerName: string;
  price: number; // lei
  unit: string;
  deliveryDay: string;
  distanceKm?: number;
  message: string; // „A apărut … pe care o căutai"
  actionLabel: string; // „Vezi în bazin" / „Adaugă în listă"
}

// ——— basket (transport transparent, single-producer first) ————————

export interface BasketLine {
  name: string;
  qty: string;
  price: number; // lei
  emoji?: string;
}

/** Un grup = un producător = o Cursă = o livrare (zi + transport proprii). */
export interface BasketGroup {
  producerId: string;
  producerName: string;
  distanceKm?: number;
  isYourProducer?: boolean; // „producătorul tău"
  lines: BasketLine[];
  goodsTotal: number; // suma mărfii din acest grup
  transport: number; // taxa de livrare a producătorului (per comandă)
  deliveryDay: string; // ex. „Joi, 14 iun"
  deliveryWindow?: string; // ex. „08:00–10:00"
  available: number; // câte din articolele cerute sunt disponibile aici
  requested: number; // câte au fost cerute (pentru „2 din 3 disponibile")
}

/**
 * Coșul: un SINGUR vânzător dacă e posibil (#21); altfel numărul MINIM de surse
 * necesare (fără consolidare ca pas separat — minimizarea livrărilor e implicită).
 */
export interface BasketArtifact {
  type: "basket";
  title: string;
  groups: BasketGroup[];
  goodsTotal: number;
  transportTotal: number;
  grandTotal: number;
  note?: string; // ex. „Tot de la Ion — o singură livrare, fără transport dublu."
  unmatched?: string[]; // produse cerute pe care niciun producător din bazin nu le are
  primaryActionLabel: string; // „Trimite comanda la Ion" / „Trimite comenzile"
}

// ——— confirmation (fermierul confirmă înainte de plată) ——————————

export interface ConfirmationArtifact {
  type: "confirmation";
  producerName: string;
  status: "pending" | "accepted";
  deliveryDay: string;
  itemCount: number;
  note?: string; // ex. „Ion răspunde de obicei în ~15 min."
}

// ——— payment ——————————————————————————————————————————————

export interface PaymentRow {
  label: string;
  amount: number; // lei
  kind?: "goods" | "transport" | "discount";
}

export interface PaymentArtifact {
  type: "payment";
  title: string;
  orderId: string;
  producerName: string;
  deliveryDay: string;
  deliveryWindow?: string;
  validatedBySeller?: boolean;
  emoji?: string;
  rows: PaymentRow[];
  total: number;
  escrowNote?: string;
  roundUp?: { target: number; donation: number; on: boolean }; // rotunjire voluntară la fond (#6)
  actionLabel: string; // „Plătește 68 lei"
}

// ——— escrow („unde merg banii" — blocați până la livrare, Etapa 7) ——

export interface EscrowShare {
  name: string;
  amount: number; // lei
}

export interface EscrowArtifact {
  type: "escrow";
  held: number; // total blocat în escrow
  toProducers: EscrowShare[]; // marfă + transport per producător
  toFund: number; // rotunjirea voluntară
  releaseNote: string; // când se eliberează banii
}

// ——— order (confirmare + urmărire) ————————————————————————————

export type OrderStage = "preluat" | "in-drum" | "livrat";

export interface OrderArtifact {
  type: "order";
  title: string;
  orderId: string;
  deliveryCode: string; // cod de livrare (îl spui la ușă)
  producerName: string;
  deliveryDay: string;
  deliveryWindow?: string;
  stage: OrderStage;
  held?: number; // lei blocați până la confirmarea livrării (rezumat; detaliile în Comenzi)
  note?: string;
}

// ——— producer („producătorul tău") ——————————————————————————

export interface ProducerArtifact {
  type: "producer";
  producerName: string;
  tagline?: string;
  emoji?: string;
  punctuality?: number; // % onorare promisiune de livrare (avanpremieră Etapa 9)
  distanceKm?: number;
  isYour?: boolean;
  actions: {
    weeklyBasket?: boolean; // „Coș Săptămânal"
    reorder?: boolean; // „Comandă din nou"
    follow?: boolean; // „Urmărește cursa"
    favorite?: boolean; // „Adaugă la favorite" (secțiunea finală)
  };
}

// ——— vânzător: ofertă extrasă de Taraba (cu promisiune de livrare) ——

export interface OfferProduct {
  name: string;
  emoji?: string;
  stock: string; // ex. „40 kg"
  price: number; // lei
  unit: string; // „kg", „borcan"
}

export interface SellerOfferArtifact {
  type: "sellerOffer";
  title: string;
  products: OfferProduct[];
  deliveryDay: string; // promisiunea de livrare (ziua)
  cutoff: string; // „se închide marți, 12:00" (cutoff-ul Cursei)
  zones: string[]; // cartierele deservite
  status: "draft" | "published";
  primaryActionLabel: string; // „Publică oferta"
}

// ——— vânzător: oferta editabilă (produse cu stoc) ————————————————

/** Un produs din oferta vânzătorului (editabil înainte de publicare). */
export interface OfferProductDraft {
  id: string; // cheia de stoc (ex. „rosii")
  name: string;
  emoji: string;
  unit: string; // „kg", „buc", „borcan", „legătură"
  price: number; // lei / unitate
  stock: number; // cantitate disponibilă
}

// ——— vânzător: comanda unui client (pică individual în Taraba) ————

export interface OrderReqItem {
  name: string;
  emoji?: string;
  qty: number;
  unit: string;
  productKey?: string; // id-ul produsului din ofertă; absent = vânzătorul „nu ai"
  price?: number; // lei pentru linia onorabilă
}

export interface SellerOrderData {
  id: string;
  buyer: string;
  address: string; // adresa de livrare
  items: OrderReqItem[]; // TOATĂ comanda clientului (inclusiv ce nu oferă vânzătorul)
  fulfillTotal: number; // lei pentru partea pe care vânzătorul o poate onora
}

export type SellerOrderStatus = "nou" | "acceptat" | "platit" | "refuzat" | "expirat" | "livrat";

// ——— uniunea (artefacte randate prin ArtifactRenderer) ——————————

export type Artifact =
  | OffersArtifact
  | MarketAlertArtifact
  | BasketArtifact
  | ConfirmationArtifact
  | PaymentArtifact
  | EscrowArtifact
  | OrderArtifact
  | ProducerArtifact
  | SellerOfferArtifact;

// ——— mesaje de chat ———————————————————————————————————————

/**
 * Componente „live" randate din starea curentă a comenzii (`OrderItem[]`):
 * editorul de listă, coșul și plata se calculează din comanda editată.
 */
export type LiveKind = "intent" | "basket" | "payment";

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "ai"; label?: string; text?: string; artifact?: Artifact; live?: LiveKind; step?: number };
