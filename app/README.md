# app/ — Piața Continuă (MVP)

Aplicația MVP (Model D, „Piața Continuă"). Un singur cod: Next.js + TypeScript, PWA mobil-first. Tokens-urile vizuale provin din designul Stitch „Local AI Supply Assistant".

## Cum o rulezi (non-developer friendly)

```bash
cd app
npm install      # o singură dată
npm run db:reset # o singură dată: creează baza SQLite + date demo (2 bazine)
npm run dev      # pornește la http://localhost:3000
```

> Baza de date (Prisma + SQLite) e în `prisma/`. `npm run db:reset` = recreează schema + rulează seed-ul. `npm run db:seed` doar repopulează.

Pe telefon: deschide `http://<IP-ul-calculatorului>:3000` din aceeași rețea Wi-Fi.
În Chrome/Safari → meniu → „Adaugă la ecranul principal" pentru senzația de aplicație (PWA).

## Ce e gata (Etapa 1a — experiența cumpărătorului, scriptată)

Demo fără AI și fără bază de date: un scenariu scriptat care arată inima produsului.

- **Chat „dezgolit"** (fără bule; AI = iconiță verde mică + etichetă), 3 taburi: Chat · Comenzi · Profil.
- **Vocabular de artefacte** (carduri albe elevate), ca registru pe tip:
  - **lista editabilă** — comanda extrasă de „AI"; corectezi cantitățile (+/−), adaugi și scoți produse — coșul și plata se **recalculează** din ea;
  - `basket` — **coș de la un singur producător când e posibil** (o livrare, un transport), cu transportul și ziua afișate transparent; multi-producător + consolidare doar când niciun producător nu acoperă tot;
  - `confirmation` — **fermierul confirmă comanda înainte de plată** (trimite → acceptă → plată);
  - `payment` — plata cu escrow (simulată);
  - `order` — confirmare + **cod de livrare** + bară de urmărire;
  - `producer` — „producătorul tău"; la final, un singur CTA **„Adaugă la favorite"**;
  - `offers` — cartonașe de ofertă (tip definit, gata de folosit).
- **Igienă chat (#24):** CTA-urile devin inactive după folosire (one-shot), butonul de plată dispare după plată, cardul de empty-state dispare când începe comanda, **comanda e modificabilă până la trimitere** („Modifică comanda"; după plată, nu), iar la final poți începe o **„Comandă nouă"**.
- **Empty-state proiectat** (cartier viu chiar cu puține oferte) + **recurență** (Coș Săptămânal).

### Taraba — călătoria vânzătorului (Etapa 1b) · ruta `/producator`

Producătorul (Ion / Ferma Verde) publică marfa și își gestionează Cursa:

- **Oferta e editabilă înainte de publicare** (#25): schimbi stocul/prețul, **adaugi / scoți produse** (presetate sau scrise liber), apoi publici → devine **stoc disponibil**.
- Meniul vânzătorului: **Comenzi · Taraba · Profil** (pagina `/producator/comenzi` listează comenzile pe statusuri).
- **Panou de status fixat sus**: metricile săptămânii (comenzi · plătite · marfă rezervată) + **stoc liber/alocat**.
- **Comenzile pică una câte una** în chat, fiecare cu **client, adresă, toată comanda lui** (inclusiv produse pe care nu le oferă, marcate „nu ai") și totalul onorabil; **accept/refuz** per comandă (fără prag — #18).
- **Adaugă stoc prin chat** (buton „+ stoc" în panou și „Adaugă stoc" pe comanda blocată, cu ecou în chat).
- La **stoc epuizat**, Accept e **blocat** până suplimentezi.
- Intrare din **Profil → „Deschide Taraba"**.

> Notat pentru mai târziu (DECISIONS #23): urmărirea comenzilor pe statusuri în tab-ul Comenzi al vânzătorului + discuția per-comandă.

### Simulare densitate (Etapa 1c) · ruta `/simulare`

Validarea timpurie a riscului de cold-start (cel mai mare risc al lui D). Un **ceas accelerat** rulează un ciclu de Cursă (~22s) și comenzile pică pe Cursele producătorilor cu ritm ∝ densitatea cartierului:

- **Countdown** la cutoff („se închide în Xh Ym · livrare joi") + bară de ciclu.
- **Comutator 40 vs. 150 utilizatori** → scena se schimbă dramatic (feed, Curse, verdict).
- **Verdict Viu / La limită / Fragil** față de pragul de supraviețuire (~12 comenzi/ciclu).
- Mock scriptat (forma respectă mașina de stări a Cursei); motorul real vine la 6a/6b.
- Intrare din **Profil → „Mod demo"**.

### Model de date + bazin urban (Etapa 2) · ruta `/bazin`

Primul strat de **date reale** (Prisma + SQLite), nu scriptat:

- Schema în `prisma/schema.prisma`: `City`(bazin), `Producer`, `Offer`, `Consumer`, `Cursa`, `Order`, `Basket`, `Request`, `Station`, `Neighborhood`. Seed în `prisma/seed.mjs` (2 bazine: **București+Ilfov**, **Cluj**).
- **Filtrare pe rază** (haversine, ~45 km de la adresă, `src/lib/geo.ts`): un user vede doar producătorii din bazinul lui.
- Pagina `/bazin` (server-backed): comută adresa (București ↔ Cluj) → oferte diferite; producătorii din afara razei nu apar (cu opțiunea „Arată" pentru a dovedi filtrarea). Intrare din **Profil** și din chat („Ce e proaspăt azi?").

### Taraba — oferta reală prin AI (Etapa 3)

Primul AI, în spatele cusăturii `ModelProvider` (mock acum, Gemma/cloud apoi):

- `src/lib/model-provider.ts` — cusătura; `src/lib/extract.ts` — **extractor determinist** (numerele prin regex, nu LLM).
- În Taraba (`/producator`): vânzătorul **scrie liber** ce vinde → ofertă extrasă (produs, preț, stoc, zi + cutoff); **câmp lipsă → Taraba întreabă**; 2 eșecuri → completare manuală. Confirmă → **store în DB** (`/api/publish-offer`) → apare la cumpărători în `/bazin`.
- **Golden set** vizibil la `/golden` (~40 fraze, plasa de regresie când legăm Gemma). `src/lib/track.ts` = telemetrie.

> Poza („urcă poză") + modelul real (Gemma) se leagă la sub-pasul următor, fără a schimba apelantul.

### Strigarea — cererea reală prin AI + matching continuu (Etapa 4) · ruta `/`

Simetricul Tarabei, pe cumpărător — al doilea AI, aceeași cusătură `ModelProvider`:

- `src/lib/request.ts` — **parser determinist de cerere** (produs, cantitate, interval de preț, „când"); numerele prin regex, nu LLM; reutilizează tabela de produse din `extract.ts`. `ModelProvider.extractRequest` (mock acum).
- În chat (`/`): cumpărătorul **scrie liber** ce caută → cerere structurată, editabilă; **cerere vagă → EXACT o întrebare** de clarificare.
- „Caută" → **matching pe bazinul real** (`/api/match` + funcția pură `src/lib/matching.ts`: Prisma + haversine, **single-producer-first** #21). Potrivirile apar ca artefact `offers`.
- **Piață continuă**: o ofertă nouă relevantă pică în chat (artefact `marketAlert`, „a apărut … pe care o căutai").
- **Golden set** vizibil la `/golden-cerere` (~14 fraze, incl. cazuri vagi). Intrare din **Profil → „Regresie AI"**.

> Discovery: matching-ul de aici (`matching.ts`) arată CINE are CE în bazin. Compunerea coșului = `MatchingEngine` (Etapa 5).

### Socoteala — MatchingEngine determinist (Etapa 5) · ruta `/`

Motorul de coș, **fără LLM** (#7/#14) — `src/lib/matching-engine.ts` (funcție pură, testabilă):

- `scoreOffer` — ordonează ofertele după **favorit (producătorul tău) + rating + distanță** (preț ca departajator).
- `composeBasket(items, groups)`:
  - **un singur vânzător dacă e posibil** (#21): un coș, o livrare, un transport;
  - altfel **numărul minim de surse** (`minimalCover`) — fără pas de consolidare (#33); fiecare vânzător cu **transport + zi + fereastră proprii** (transparență înainte de acceptare, #12);
  - produsele negăsite → `unmatched`.
- `rankProducers` — ordonează vânzătorii după **favorit + rating + distanță**; la potriviri se afișează **max 5 vânzători** (#18/#33), grupați, fiecare cu ofertele lui.
- `deliveryFee` + `deliveryWindow` per producător (schema Prisma) = transport real.
- **Regresie** vizibilă la `/socoteala` (set fix → 17 asserturi: single, surse minime, plafon 5 vânzători, negăsit, scor). Intrare din **Profil → „Teste vizibile"**.

> Escrow + plata **împărțită** pe producători + acceptarea per Cursă = Etapele 6–7. Aici plata e simulată pe totalul coșului.

## Harta codului

```
src/
  app/                 rute (App Router)
    layout.tsx         Inter (next/font), metadata PWA, Material Symbols
    page.tsx           Chat (/)
    comenzi/page.tsx   Comenzi
    profil/page.tsx    Profil
    globals.css        token-uri + bază
  components/
    AppShell.tsx       shell mobil + header + bottom nav (3 taburi)
    chat/              ChatScreen (motor AI „Strigarea"), OrderEditor, Composer, mesaje
    artifacts/         registrul de artefacte (componentă pe tip)
    ui/                primitive (buton, chip, thumb, card) + Icon
  lib/
    artifacts.ts       CONTRACTELE DE TIP ale artefactelor (sursa de adevăr)
    model-provider.ts  cusătura AI: extractOffer (vânzător) + extractRequest (cumpărător)
    extract.ts         extractor determinist de OFERTĂ (+ tabela de produse partajată)
    request.ts         parser determinist de CERERE (Etapa 4)
    matching.ts        discovery: cine are ce în bazin (/api/match îl alimentează)
    matching-engine.ts MatchingEngine: compune coșul (un vânzător / surse minime, max 5) — Etapa 5
    clock.ts           SimulatedClock tick-driven (cusătura Clock) — Etapa 6a
    cursa.ts           CursaEngine: mașina de stări a Cursei (cutoff, accept/refuz, expirare) — Etapa 6a
    ledger.ts          Ledger append-only double-entry (invariant suma=0) — Etapa 7
    payment-provider.ts  cusătura PaymentProvider (simulat: escrow/eliberare/refund) — Etapa 7
    golden-set.ts      golden Taraba (/golden) · request-golden.ts golden Strigarea (/golden-cerere)
    socoteala-scenarios.ts /socoteala · cursa-scenarios.ts /cursa · ledger-scenarios.ts /bani
    build.ts           subtotal marfă · demo.ts date demo
tailwind.config.ts     token-urile vizuale Stitch (culori, tipografie, spacing, radius)
public/                manifest.webmanifest + icon.svg (PWA)
```

## Reguli care rămân (din DECISIONS.md / CLAUDE.md)

- Design-as-layer: preluăm vizualul Stitch, **nu** schimbăm logica fără să întrebăm.
- Logica vine în spatele unor cusături injectabile (`ModelProvider`, `PaymentProvider`, `Clock`)
  — introduse la etapele lor. `ModelProvider` e live (mock determinist) pentru ofertă și cerere; `PaymentProvider`/`Clock` urmează.
- Contractele din `lib/artifacts.ts` devin sursa de adevăr și pentru store-ul de la Etapa 2.

### Cursa — mașina de stări + scheduler (Etapa 6a) · logică pură, zero UI

- `src/lib/clock.ts` — `SimulatedClock` tick-driven (cusătura `Clock`, #14): `advance`/`advanceTo` declanșează termenele (cutoff, livrare); în producție = worker/cron.
- `src/lib/cursa.ts` — `CursaEngine`: Cursa = fereastră de timp per producător, fără prag (#18); comandă înainte de cutoff → Cursa curentă, după → următoarea; accept→livrare, refuz→refund; **ne-acționat la cutoff → expiră + refund** (#34); fără hedge mod-eveniment (D pur, #34).
- **Regresie** vizibilă la `/cursa` (18 asserturi). Intrare din **Profil → „Teste vizibile"**.

### Cursa live în Tarabă (Etapa 6b + 6c) · ruta `/producator`

După publicare, Cursa vânzătorului e condusă de mașina de stări 6a:
- `SellerChatScreen` ține un `SimulatedClock` + `CursaEngine`; un driver pe `setInterval` avansează ceasul (48h comprimate la ~45s) → **countdown live** în bara de sus.
- Comenzile pică în Cursă (`placeOrder`); producătorul **acceptă** (→ coada de livrare, scade stocul) / **refuză** (→ refund).
- La cutoff: comenzile ne-acționate **expiră + refund** (#34); **Crainicul Cursei** anunță deschiderea/închiderea.

> Banii = evenimente de refund la nivel de Cursă; plata cumpărătorului + escrow + ledger = Etapa 7.

### Plată + escrow + ledger (Etapa 7) · în chat + `/bani`

- `src/lib/ledger.ts` — `Ledger` append-only double-entry (postări care se închid la 0; conturi cumparator/escrow/producator:<id>/fond; **invariant suma=0**).
- `src/lib/payment-provider.ts` — cusătura `PaymentProvider` (#14); `SimulatedPaymentProvider`: `pay`→escrow, `release`→producători+fond (Etapa 8), `refund`→cumpărător. Mapabil pe Stripe Connect (capture/transfer/refund).
- În chat (cumpărător): toggle de **rotunjire** voluntară (#6) + artefactul **„Unde merg banii"** (escrow: cât la producător, cât la fond, când se eliberează).
- **Regresie** vizibilă la `/bani` (escrow, eliberare, refund, split multi-producător, rotunjire, reconciliere suma=0). Intrare din **Profil → „Teste vizibile"**.

### Livrare la domiciliu + urmărire + eliberare (Etapa 8)

- **Cumpărător** (`/comenzi`): comandă activă cu fereastră + urmărire (preluat→în drum→livrat); **confirmarea livrării** → `PaymentProvider.release` (escrow → producător + fond). Închide bucla banilor.
- **Producător** (`/producator/comenzi`): Cursa devine **rută de livrare** — 12 opriri, fereastră 08:00–12:00, urmărire pas-cu-pas + progres + „încasat (escrow eliberat)".

### Încredere: profil public al producătorului (Etapa 9) · `/ferma/[id]`

- Server-backed: rating de **punctualitate** (real, din DB) + **istoric de 4 Curse** (`src/lib/producer-history.ts`, demo determinist: la timp / întârziat) + ce oferă acum.
- Cardurile din `/bazin` sunt clickabile → profil; link și din Profil („producătorul tău").

## Urmează

Etapa 11 (pregătire pilot: deploy Vercel + Postgres + AI cloud ieftin + worker VPS; PWA instalabilă cu rezervă SMS/email; onboarding ~10 producători + 1 cartier; măsurarea celor 5 ipoteze; plăți încă simulate). *Nu există Etapa 10 în secvența pilotului.*

Pentru preluare într-un chat nou, vezi **`../HANDOFF.md`** (starea completă + brief Etapa 11).
Vezi `analiza/plan-dezvoltare-D.md`.

> Demo curat: pornește de la `npm run db:seed` (publicarea Tarabei suprascrie ofertele Ferma Verde).
