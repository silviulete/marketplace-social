/**
 * Scenariul scriptat al călătoriei vânzătorului (Etapa 1b).
 *
 * Producătorul (Ion / Ferma Verde) publică ce are de vânzare (= adaugă stoc
 * disponibil) prin Taraba, apoi comenzile **pică una câte una** în chat, fiecare
 * cu detalii complete (client, adresă, toată comanda lui). Le acceptă individual;
 * când rămâne fără stoc, Accept e blocat până suplimentează. Cursa = fereastră de
 * timp, fără prag (#18). Starea (stoc, statusuri) e ținută de `SellerChatScreen`,
 * panoul de status fixat sus o reflectă.
 */

export interface SellerAiMessage {
  label?: string;
  text?: string;
  offer?: boolean; // randează editorul de ofertă (din stare)
  orderId?: string; // randează cardul comenzii (din stare)
}

export interface SellerStep {
  user?: string;
  ai: SellerAiMessage[];
  suggestions?: string[];
  autoAdvanceMs?: number; // pasul curge singur (comenzile pică la momente diferite)
}

export const SELLER_SCRIPT: SellerStep[] = [
  // ——— Pas 0: empty-state — ce pui pe tarabă ———————————————————
  {
    ai: [
      {
        text: `Bună, Ion 👋 **Cursa ta de joi** e deschisă — se închide marți, 12:00. Ce pui pe tarabă azi?`,
      },
    ],
    suggestions: ["Pun roșii și castraveți pe tarabă"],
  },

  // ——— Pas 1: Taraba pregătește oferta (editabilă) = stoc disponibil ——
  {
    user: "Am 8 kg roșii la 9 lei/kg și 4 kg castraveți la 9 lei. Livrez joi în zona București + Ilfov.",
    ai: [
      {
        label: "Taraba · ofertă pregătită",
        text: "Am pornit oferta din ce mi-ai spus. Ajusteaz-o — schimbă stocul/prețul, adaugă sau scoate produse — apoi publică. Devine stocul tău disponibil.",
        offer: true,
      },
    ],
  },

  // ——— Pas 2: publicat → ești live, comenzile vor pica pe rând ————
  {
    user: "Publică oferta",
    ai: [
      {
        label: "Ofertă publicată",
        text: "Gata — ești live. Stocul tău e sus, în panoul Cursei. Comenzile pică pe rând, aici în chat; le accepți cum vrei. Fără prag minim — fiecare comandă e a ta dacă o iei.",
      },
    ],
    autoAdvanceMs: 1500,
  },

  // ——— Pașii 3–6: comenzile pică una câte una ————————————————
  {
    ai: [{ label: "Comandă nouă", orderId: "o1" }],
    autoAdvanceMs: 2400,
  },
  {
    ai: [{ label: "Comandă nouă", orderId: "o2" }],
    autoAdvanceMs: 2600,
  },
  {
    ai: [{ label: "Comandă nouă", orderId: "o3" }],
    autoAdvanceMs: 2600,
  },
  {
    ai: [{ label: "Comandă nouă", orderId: "o4" }],
  },
];
