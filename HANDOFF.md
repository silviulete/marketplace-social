# HANDOFF — starea proiectului & următoarea etapă

> Document de predare pentru continuarea într-un chat nou. Rezumă ce e construit,
> cum se rulează/testează și ce presupune **Etapa 11** (următoarea). Sursele de
> adevăr rămân: `analiza/plan-dezvoltare-D.md` (plan) + `DECISIONS.md` (decizii).

## Ce e proiectul (pe scurt)

MVP pentru **„Piața Continuă" (Model D)** — marketplace chat-first între producători
peri-urbani și cumpărători din oraș, cu **livrare la ușă**, alocare în timp real
(„ca la bursă"), zi de livrare fixă per producător și **transport transparent**.
Fondatorul **nu e developer** și validează vizual fiecare etapă, pe telefon, în
**limba română**.

## 🟢 LIVE ÎN PRODUCȚIE: https://marketplace-social.vercel.app (decizia #44)

Etapa 11 §deploy = **livrată**. GitHub `silviulete/marketplace-social` → Vercel
(Hobby), Root Directory `app`, Postgres pe Neon, AI = Gemini Flash Lite
(`gemini-flash-lite-latest`, determinist-întâi). Deploy prin **Deploy Hook**
(POST pe URL-ul din Vercel → Settings → Git). Verificat în prod: pagini 200,
`/api/tick` 401 (protejat), AI `cloud:gemini` corect. Cron zilnic (limita Hobby).
**Rămâne:** onboarding producători + plan de recrutare (amânat de fondator).

## Unde suntem: etapele 1a → 9 LIVRATE ✅

| Etapă | Ce face | Verificare vizibilă |
|---|---|---|
| 1a–1c | Chat scriptat cumpărător + vânzător + simulare densitate | `/`, `/producator`, `/simulare` |
| 2 | Model de date real (Prisma/SQLite, 2 bazine, rază haversine) | `/bazin` |
| 3 | Taraba: oferta vânzătorului prin AI (mock-first) | `/producator`, golden `/golden` (40/40) |
| 4 | Strigarea: cererea cumpărătorului prin AI + matching vizibil + piață continuă | `/`, golden `/golden-cerere` (14/14) |
| 5 | Socoteala: `MatchingEngine` (un vânzător / surse minime, max 5 vânzători) | `/`, regresie `/socoteala` (17/17) |
| 6a | Mașina de stări a Cursei + `SimulatedClock` (pur logică) | regresie `/cursa` (18/18) |
| 6b (+6c) | Countdown live + accept/refuz în Tarabă + expirare la cutoff | `/producator` (după publicare) |
| 7 | Plată simulată + escrow + ledger double-entry + rotunjire la fond | `/` (plată), regresie `/bani` (20/20) |
| 8 | Livrare la ușă: urmărire + confirmare→eliberare escrow; ruta producătorului | `/comenzi`, `/producator/comenzi` |
| 9 | Încredere: profil public + rating de punctualitate + istoric 4 Curse | `/ferma/[id]` |

**Bucla e completă cap-coadă:** cerere → matching → coș cu transport → Cursă
(accept/refuz/expirare) → plată+escrow → livrare → eliberare plată → încredere.

**Esențializare UX (post-9, decizia #39):** Profilul e comun, cu **comutator de
rol „Cumpăr | Vând"** ținut minte pe telefon (`app/src/lib/role.ts`) — schimbă
tabul central (Chat vs. Taraba) și conținutul; uneltele de dezvoltare (simulare,
regresii, test de rază) s-au mutat în hub-ul **`/demo`**; elementele fără funcție
(lupa de căutare, setările-fantomă) au fost scoase.

**Audit user-flow + parcurs esențial (decizia #40):** un singur CTA primar per
moment în chatul cumpărătorului (single-producer sare peste „Potriviri" direct
la coș; lista se strânge în rezumat când coșul e pe ecran; final = un card);
alerta de piață nu întrerupe comanda; **anulare cumpărător până la plată**;
**răzgândire vânzător 2h** (`CursaEngine.revertDecision`, refund amânat până
devine definitiv — regresia `/cursa` = 24/24); limbaj fără jargon
(„escrow"/„cutoff"/„refund" doar în paginile de test); `/bazin` și ruta
vânzătorului au pas următor (fără funduri de sac).

## Cum rulezi & testezi

- **Dev:** în `app/` → `npm run dev` (Next.js 15). Preview pe **viewport de telefon**
  cu Claude Preview MCP, launch **„piata"**, **port 3100** (`http://localhost:3100`).
- **DB curat:** `npm run db:seed` — **rulează asta înainte de demo**, fiindcă
  publicarea din Tarabă (Etapa 3/6b) suprascrie ofertele Ferma Verde în DB.
  ⚠️ **Atenție:** `.env` local pointează acum la **Neon (producția)** — un `db:seed`
  reseeduie baza LIVE. Pentru dev izolat, `npm run pg:off` + un `DATABASE_URL` SQLite.
- **Regresii vizibile** (ca testele, dar pe telefon) — din hub-ul **`/demo`
  („Mod demo & teste", link discret la finalul Profilului — decizia #39)**:
  `/golden` (Taraba), `/golden-cerere` (Strigarea), `/socoteala` (MatchingEngine),
  `/cursa` (mașina de stări), `/bani` (escrow+ledger) + simularea de densitate
  și testul de rază pe două adrese (`/bazin?addr=buc|cluj`).
- **Typecheck:** `npx tsc --noEmit`. Windows, shell PowerShell (Bash sandbox e Linux).

## Stack & cusături (seams) — decizia #14

- **Next.js 15 + TypeScript + Tailwind** (PWA mobil-first, un singur cod).
- **Prisma + SQLite** în dev → **Postgres** la pilot (aceeași schemă).
- `ModelProvider` (`app/src/lib/model-provider.ts`) — **mock determinist acum**,
  Gemma/Ollama → cloud ieftin apoi. Numerele se extrag **determinist cu regex**, NU de LLM.
- `PaymentProvider` (`app/src/lib/payment-provider.ts`) — **simulat acum**, Stripe
  Connect/Netopia split apoi. Escrow pe **ledger append-only double-entry** (`ledger.ts`, invariant suma=0).
- `Clock`/`Scheduler` (`app/src/lib/clock.ts`) — `SimulatedClock` tick-driven acum,
  worker/cron la pilot.
- **Matching** (`matching.ts` discovery + `matching-engine.ts` compunere coș) =
  TypeScript determinist, **fără LLM**.

## Harta codului (fișiere-cheie în `app/src`)

- `lib/artifacts.ts` — contractele de tip ale artefactelor (sursa de adevăr UI).
- `lib/extract.ts` / `request.ts` — parsere deterministe ofertă / cerere.
- `lib/matching.ts` / `matching-engine.ts` — discovery / compunere coș (un vânzător, altfel surse minime, max 5).
- `lib/clock.ts` / `cursa.ts` — ceas simulat / mașina de stări a Cursei.
- `lib/ledger.ts` / `payment-provider.ts` — ledger double-entry / plată+escrow.
- `lib/producer-history.ts` — istoricul public al producătorului (Etapa 9).
- `components/chat/ChatScreen.tsx` — fluxul cumpărătorului (cerere→matching→coș→plată→escrow).
- `components/seller/SellerChatScreen.tsx` — Taraba + Cursa live (countdown, accept/refuz).
- `app/*/page.tsx` — rutele (vezi tabelul de mai sus).

## Decizii-cheie de reținut (detalii în `DECISIONS.md`)

- **Livrare la ușă = mod principal** (#17); Stația/Gazda = viitor.
- **Cursa fără prag** (#18); producătorul decide per comandă.
- **Fără consolidare** — coșul folosește un vânzător sau numărul minim de surse;
  **plafonul de 5 = 5 vânzători la afișare** (#33). Ordonare: **favorit + rating + distanță** (prețul nu decide).
- **La cutoff, comandă neacționată → EXPIRĂ + refund** (#34), NU report automat.
- **Fără hedge mod-eveniment** — doar D pur (#34).
- **Rotunjire voluntară** la fondul comunității (#6); comision procentual = refuzat.
- **Planul > designul Stitch** (#20) — la orice divergență, ÎNTREABĂ fondatorul.

## Note amânate (de făcut la etape viitoare)

- **VIITOR — închiderea livrării o face VÂNZĂTORUL**, nu cumpărătorul; cumpărătorul
  poate doar **reclama** (dispute). Răstoarnă fluxul din Etapa 8. (decizie fondator, notă în DECISIONS)
- **Multi-producător în UI:** acceptarea per Cursă pe partea vânzătorului pentru
  coșuri din 2+ surse + **plata împărțită (escrow split)** — logica există în engine/ledger,
  dar experiența completă în chat/Tarabă e de rafinat.
- **Alegerea manuală per produs** din mai multe oferte (nota amânată #—).

---

## Etapa 11 — LIVRATĂ ✅ (deciziile #41–#44)

**Construit** (2026-07-02/03): telemetrie în DB (`track()`→`Event`) + pagina owner
**`/puls`** (densitate vs prag ~12 + cele 5 ipoteze + feedback); **„Spune-ne"** în
Profil (→`Feedback`); **PWA instalabilă** (`scripts/make-icons.mjs`, `sw.js`);
**AI cloud** = **Gemini Flash Lite** în spatele `ModelProvider`, arhitectură
**determinist-întâi / AI-plasă** (`/api/extract`; #43 — numerele rămân deterministe
#7); cusătura **`NotifyProvider`** (email simulat); **termene reale pe Cursă**
(`cutoffAt`/`deliveryAt` din `lib/termene.ts`) + worker **`/api/tick`** (idempotent,
`CRON_SECRET`) + **test de concurență** (`npm run test:concurrency`, 5/5).

**Publicat & verificat în producție** (2026-07-03, #44) — vezi secțiunea „🟢 LIVE"
de sus. Rămâne din pilot: **onboarding ~10 producători + 1 cartier + planul concret
de recrutare** (amânat de fondator, `analiza/model-D-piata-continua.md` §7);
opțional: cadență cron mai deasă, rotația secretelor, re-rulare concurență pe Neon.

## Cum se operează (pentru un chat NOU)

- **Update în producție = push pe `main`.** Modifici cod în `app/` → commit → push
  la `github.com/silviulete/marketplace-social` → **Vercel publică automat** (1-2 min).
  Nu e nevoie de Deploy Hook (auto-deploy funcționează). Verifici live cu `curl`
  pe rutele din `https://marketplace-social.vercel.app`.
- **Secretele** (Neon `DATABASE_URL`, `GOOGLE_AI_API_KEY`, `AI_MODEL`,
  `NEXT_PUBLIC_MODEL_PROVIDER=cloud`, `CRON_SECRET`) stau în **Vercel → Settings →
  Environment Variables** și în `app/.env` local (gitignored). Șablon: `app/.env.example`.
- **Schema Prisma e pe `postgresql`** (ca producția). Local dev lovește Neon prin
  `app/.env`. Pentru SQLite izolat: `npm run pg:off` — dar **NU comite schema sqlite**
  (auto-deploy-ul cere „postgresql"). `npm run pg:on` o readuce.
- **Migrări de schemă la pilot:** după ce schimbi `schema.prisma`, rulează
  `npx prisma db push` cu `DATABASE_URL` = Neon (nu se face automat la deploy).
- **Cron:** `vercel.json` rulează `/api/tick` **zilnic** (limita planului Hobby).
  Pentru 5-10 min fără Pro: trigger extern cu `Authorization: Bearer CRON_SECRET`.
- **Next.js = 15.5.x** (patch CVE; Vercel blochează versiunile vulnerabile — nu
  coborî sub asta). **Plăți simulate** în pilot (#4).

**De citit întâi (chat nou, în ordine):** `CLAUDE.md` → `analiza/plan-dezvoltare-D.md`
→ `DECISIONS.md` (mai ales #13–#44) → acest HANDOFF → `app/DEPLOY.md` + `README.md`.
