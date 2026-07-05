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

## Etapa 11 — STARE: partea locală LIVRATĂ (decizia #41); rămâne deploy-ul

Construit local (2026-07-02): **telemetrie în DB** (`track()`→`Event`) + pagina
owner **`/puls`** (densitate vs prag ~12 + cele 5 ipoteze + feedback); **„Spune-ne"**
în Profil (→`Feedback`); **PWA instalabilă** (icons PNG generate de
`scripts/make-icons.mjs`, `sw.js`, înregistrare doar în producție); **Gemma/AI
Studio** în spatele `ModelProvider` (`/api/extract` — LLM normalizează, numerele
rămân deterministe #7; fără cheie → mock); cusătura **`NotifyProvider`** (email
simulat; apelată la publicarea ofertei). Config în `app/.env.example`.
Completat (2026-07-03, decizia #42): **termene reale pe Cursă** (`cutoffAt`/
`deliveryAt`, derivate din etichete la publicare — `lib/termene.ts`) + worker-ul
**`/api/tick`** (idempotent, claim atomic, protejat cu `CRON_SECRET`, cron Vercel
în `vercel.json`, agnostic la apelant) + **test de concurență**
(`npm run test:concurrency` — 5/5 pe SQLite; de re-rulat pe Postgres) + **kit
Postgres** (`npm run pg:on/off`) + **ghid de deploy** (`app/DEPLOY.md`, în română,
pentru fondator).
**Rămâne:** fondatorul parcurge `app/DEPLOY.md` (conturi Vercel + Neon + cheia
Gemma), re-rularea testului de concurență pe Postgres, onboarding + planul de
recrutare (amânat de fondator după partea tehnică, #41d).

## Următoarea etapă: ETAPA 11 — Pregătire pilot publicat

> Nu există Etapa 10 în secvența pilotului (numărul e păstrat pentru un modul
> amânat post-pilot: owner dashboard + decontare + raport transparență).

**Ce livrează (din plan §Etapele + §11):**

1. **Deploy:** UI pe **Vercel**, DB **Postgres**, **AI cloud ieftin ca DEFAULT**
   (Gemma via Google AI Studio/Groq sau echivalent — comutare = o setare în `ModelProvider`),
   **worker/cron pe VPS mic** pentru termenele Cursei (cutoff/livrare) + decontare.
2. **PWA instalabilă** — atenție la iOS (instalarea e slabă): **notificările critice
   pe SMS/email**, nu doar push.
3. **SQLite → Postgres** — rulează testele de integrare pe Postgres devreme (tipuri,
   concurență, funcții de timp); **test de concurență pe Curse** („comandă la
   milisecunda de închidere").
4. **Onboarding ~10 producători reali + 1 cartier**, cu **plan concret de recrutare**
   (vezi `analiza/model-D-piata-continua.md` §7).
5. **Feedback calitativ** — interviuri + buton „spune-ne" în app.
6. **Instrumentarea celor 5 ipoteze** (fiecare cu prag go/no-go):
   1. Cerere urbană suficientă → ≥30 coșuri la runda 3 ȘI ≥150 activi în 8 săptămâni.
   2. Lichiditate vie fără eveniment → revenire între runde ≥60%; „viu" calitativ.
   3. Disciplina promisiunii de livrare → onorare ≥95% (sub 90% → activează hedge-ul).
   4. Transportul nu omoară coșul → coș median ≥60 lei (overhead <15%); >40% sub 40 lei → reconsideră.
   5. Venituri non-tranzacționale → rotunjire ≥20% SAU sponsor semnat.
7. **Plăți încă simulate** în pilot (fără bani reali — decizia #4).
8. **Un singur număr de densitate vizibil** pentru owner (Curse/săptămână vs pragul ~12).

**Natura etapei:** infrastructură + go-to-market + măsurare (mai puțin UI nou).
Decizii probabile de confirmat cu fondatorul la kickoff: alegerea concretă a
providerului AI cloud + a hostingului VPS; conținutul planului de recrutare; ce
notificări critice trec pe SMS/email.

**De citit întâi (în ordine):** `CLAUDE.md` → `analiza/plan-dezvoltare-D.md`
→ `DECISIONS.md` (mai ales #13–#38) → acest HANDOFF → `README.md` + `app/README.md`.
