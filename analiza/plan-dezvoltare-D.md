# Plan de dezvoltare agile — „Piața Continuă" (Model D), MVP pilotabil — v5

> Sursa de adevăr a build-ului. Aprobat de fondator pe 13 iunie 2026. Copie a planului din sesiunea de planificare.

## Context

Faza de analiză s-a încheiat: 4 modele generate și validate independent. Fondatorul (non-developer) a ales **Modelul D — „Piața Continuă"**: alocare în timp real („ca la bursă"), zi de livrare fixă per producător, ofertă cu promisiune de livrare, transport transparent per comandă, teritoriu = bazinul peri-urban în jurul unui oraș mare. Sursa: [model-D-piata-continua.md](model-D-piata-continua.md).

**Ce construim:** un plan de dezvoltare agile, pe etape testabile independent, de la **experiența nouă de chat cu artefacte** (inima aplicației) până la o aplicație pilotabilă de utilizatori reali într-un cartier, cu plăți simulate.

**Decizii confirmate de fondator:** platformă **web mobil-first (PWA)**; linie de sosire **prototip local → pilot publicat** cu plăți simulate; AI **mock-first**, apoi Gemma legat agent cu agent; oferte fictive (legume + neperisabile: ouă, miere, conserve); categoriile animale (lactate/carne) **în afara pilotului** (DSVSA + lanț de frig).

**Riscul cel mai important, tratat din capul locului (consens al ambilor evaluatori):** validarea a arătat că D pur e fragil la cold-start — „o piață continuă cu puțini utilizatori arată mai mort decât târgul lui C la 100". Fondatorul a ales conștient D peste recomandarea de migrare C→D; de aceea **datoria de a valida ieftin și devreme „senzația de piață vie" crește**, nu scade. Validarea e mutată în primele etape (Etapa 1c + test de densitate simulată) și proiectăm intenționat empty-state-ul. Vezi și **Recomandarea strategică** (modul-eveniment ca asigurare ieftină, parametrizat din aceeași mașină de stări).

## Principii agile

1. **O etapă = ceva testabil**, demonstrabil vizual pe telefon, cuiva din afara proiectului, cu demo data.
2. **Experiență înainte de motor**, dar **risc înainte de confort**: atacăm devreme ce poate ucide produsul (lichiditatea fără eveniment), fie și cu date simulate.
3. **Empty-state e ecran de prim rang.** „Paginile goale nu iartă" — proiectăm intenționat cum arată un cartier cu puține oferte ca să NU pară mort.
4. **Cusături de înlocuire doar unde chiar se schimbă ceva:** `ModelProvider` (mock → Gemma local → cloud ieftin), `PaymentProvider` (simulat → Stripe Connect/Netopia split), `Clock`/`Scheduler` (fast-forward în dev → cron/worker în producție). `MatchingEngine` și `StorageProvider` sunt module izolate, nu contracte duble. Telemetria (`track()`) intră devreme.
5. **Ceas simulat tick-driven.** Scheduler-ul e condus de `Clock`, nu de `setTimeout` real — ca fast-forward-ul să declanșeze handler-ele de termen în teste.
6. **Omul confirmă, AI-ul propune.** Orice ieșire AI care contează (preț, cantitate, promisiune) apare ca artefact confirmat de om.
7. **Recurența e teza de retenție a lui D.** „Producătorul tău", re-comanda cu un tap, „urmăresc cursa lui Ion" — prezente din prima felie de experiență, nu doar ca istoric.

## Stack tehnic (ales, explicat ne-tehnic)

- **O singură aplicație: Next.js (React, TypeScript)** — UI mobil-first, PWA, plus „spatele" (API), un singur cod.
- **DB: SQLite + Prisma** în dev (un fișier, zero config) → **Postgres** la pilot (aceeași schemă Prisma). Risc tratat: SQLite→Postgres nu e „doar conexiunea" (tipuri, concurență, funcții de timp) — rulăm testele de integrare pe Postgres devreme (Docker local).
- **AI: în spatele `ModelProvider`.** Dev/prototip: Gemma local prin Ollama (cu `format: json`/grammar). **Pilot: model cloud ieftin ca DEFAULT** (Gemma via Google AI Studio/Groq sau echivalent) — un VPS ieftin nu rulează Gemma la latențe acceptabile; self-host Ollama rămâne obiectiv post-pilot. Comutarea = o setare.
- **Matching: TypeScript pur** (reguli + similaritate ușoară pe câmpuri structurate), cu funcție de scor explicită, testabilă cu assert-uri.
- **Bani: ledger append-only double-entry** (intrări imutabile debit/credit), cu stările hold/capture/release/refund mapate pe semantica Stripe Connect (PaymentIntent→capture→transfer→payout). Reconciliabil prin construcție.
- **Scheduler:** `Clock`-driven; în producție un worker/cron (nu serverless pur — Vercel Cron e limitat, deci job-runner mic pe VPS pentru termenele Cursei și decontare).
- **Publicare pilot:** UI pe Vercel, DB Postgres, AI cloud ieftin, worker pe VPS mic.

## Design — sursă de adevăr vizuală (Stitch „Local AI Supply Assistant")

Modelul de design e proiectul Stitch **„Local AI Supply Assistant"** (`projects/4966229920227707753`), design system **„Sourcing Intelligence System"**, mobil-first. Îl adoptăm ca **sursă de adevăr vizuală**; logica rămâne cea agreată pentru Modelul D.

**Tokens cheie:** tipografie **Inter** (display 48/600; headline 32/600 & 20/500; body 16/400 lh1.6; label 12/600 uppercase); paletă „High-Tech Natural" — primary verde pădure `#0d631b`/`#2e7d32`, secondary verde proaspăt, surface off-white `#f9f9f7`/`#fafaf8`, card alb `#ffffff` cu bordură 1px `#e6e6e4`, text near-black `#1a1c1b`; colțuri 8px (componente) / 16px (carduri); spacing pe bază 8px, whitespace generos; adâncime prin tonal layering, nu umbre grele.

**Limbaj de componente (confirmat în ecranele Stitch):** chat „dezgolit" fără bule (AI = iconiță verde mică); **Artifact Cards** albe elevate; cardul de coș parțial („2 din 3 disponibile" + „Continuă cu restul"); carduri de opțiuni de coș (Local vs Economic) cu preț + buton verde; comenzi cu status + fereastră de livrare + bară de progres; **recurență** („Coș Săptămânal" + „Recomandă din nou").

**Cum ingerăm designul:** la fiecare etapă de UI, se extrage prin Stitch MCP ecranul relevant (HTML/CSS + screenshot) și se traduce în componentele React, păstrând tokens-urile. Designul devine tema aplicației din **Etapa 1a**.

**Reguli (design-as-layer) + deciziile fondatorului pe divergențele de logică:**
1. **Livrare la ușă = mod principal** (fereastră + urmărire), nu ridicarea la Stație. Consecință: Cursa producătorului devine o **rută de livrare la domiciliu** (model Cutia Țăranului); transportul per comandă e mai scump (~15–25 lei vs ~8 lei la Stație) — deci **transparența transportului (Etapa 5) și ipoteza de pilot „transportul nu omoară coșul" devin și mai critice**. Stația + Gazda = opțional/viitor.
2. **Eco/CO2 = doar etichetă vizuală** acum („local", „producători din zonă"); motorul de matching rămâne transport + preț + consolidare.
3. **Chat-first cu taburi minime:** Chat (centru) + Comenzi + Profil. Fără tab separat de Plăți (plata e în chat), fără Favorite deocamdată.
4. **Recurența** („Coș Săptămânal" + „Recomandă din nou") — adoptată ca atare; confirmă teza de retenție „producătorul tău".

## Cusături și infrastructură (definite înainte de cod)

- `ModelProvider`, `PaymentProvider`, `Clock`/`Scheduler` — interfețe injectate; **mock și real validate cu același set de teste de contract** (altfel diverg tăcut).
- `StorageProvider` (FS local → object storage) și `track(event)` (log în DB din dev) — module simple, introduse la Etapa 3.
- **Contractele de tip ale artefactelor** (TypeScript) se definesc o singură dată la Etapa 1a și devin sursa de adevăr și pentru store-ul de la Etapa 2.
- **Diagrama mașinii de stări a Cursei** (enum stări + tranziții + timeout-uri) se desenează ca artefact de design ÎNAINTE de Etapa 1, chiar dacă se implementează la 6 — ca artefactul „bară de Cursă" din 1c să nu fie refăcut.

## Etapele (fiecare e testabilă)

### Experiența (scriptată, fără AI) — felii mici, demo separate

| # | Etapa | Ce livrează | Criteriu de validare (vizibil, fără jargon) |
|---|---|---|---|
| **1a** ⭐ | **Călătoria cumpărătorului, scriptată** (primul „wow") | Schela Next.js+PWA mobil-first, suprafața de chat, și artefactele: cartonaș ofertă, **coș cu transport transparent** (livrări/zile/costuri per producător + alternativa „iei tot de la Ion, economisești X"), cartonaș plată, cod de ridicare. Plus **„producătorul tău" + re-comanda cu un tap**. Empty-state proiectat intenționat. | Pe telefon, scenariu scriptat: „simt cum cumpăr de la producătorul meu, văd exact ce vine, când și cu ce transport, și pot re-comanda". |
| **1b** | **Călătoria vânzătorului, scriptată** | Chat din perspectiva producătorului: publică ofertă (cu promisiune de livrare), vede **bara de Cursă urcând**. | „Simt cum îmi public marfa și mi se umple cursa." |
| **1c** | **Cursa ca mini-eveniment + test de densitate simulată** (atacă riscul existențial) | Artefactul de Cursă: countdown până la cutoff („se închide marți 12:00 · livrare joi") + comenzile care se adună pe Cursa producătorului (fără prag). Mod demo cu ceas simulat care rulează un cartier cu **40 vs 150 utilizatori** simulați. **1c folosește un mock scriptat al tranzițiilor Cursei (nu motorul real) — înlocuit de 6b**; forma artefactului respectă diagrama mașinii de stări desenată la kickoff. | Test calitativ cu fondatorul + **2-3 persoane din afara proiectului** (evită bias-ul de complezență): „cursa cu deadline pare vie sau moartă?"; diferența vizuală 40-vs-150 e evidentă. **Aceasta e validarea timpurie a celui mai mare risc al lui D.** |

### Date, AI, motor

| # | Etapa | Ce livrează | Criteriu de validare |
|---|---|---|---|
| **2** | **Model de date + bazin urban** | Schema Prisma (producători, oferte, consumatori, cereri, coșuri, comenzi, Curse, Stații, cartiere) în SQLite. Teritoriu: cartiere + Stații + rază ~40–50 km; un user vede doar bazinul lui. Seed 2 cartiere demo. | Vizibil în chat: „în Cartier Nord văd alte oferte decât în Cartier Vest"; o ofertă în afara razei nu apare. |
| **3** | **Taraba — oferta reală prin AI** (agent #1) | `ModelProvider` (Gemma/Ollama). **Întâi un provider mock care validează contractul, apoi se leagă Gemma.** Vânzătorul scrie liber + urcă poză; Taraba extrage oferta (produs, preț, stoc, zi de livrare + cutoff de comenzi, zona/cartierele deservite, taxă de livrare; minim de comandă opțional), cere ce lipsește, confirmă promisiunea. Om confirmă → store. **Hardening:** `format: json`/grammar; **numerele (preț/cantitate/taxe) extrase determinist (regex/parser), nu de LLM**; fallback la formular clasic după 2 retry-uri; versiune Gemma fixată; **golden set ~40 fraze românești** ca regression. Plus `StorageProvider` + `track()`. | 10 oferte fictive în română → cartonașe corecte (țintă ≥9/10 pe golden set); câmp lipsă → întrebare; eșec model → formular, nu loop infinit. |
| **4** | **Strigarea — cererea reală prin AI** (agent #2) + **matching continuu vizibil** | Cumpărătorul scrie nevoia → structurată (produs, cantitate, interval preț, când); rafinare doar dacă e neclar. Plus identitatea „piață continuă": ofertele noi care pică în bazin → „a apărut brânza pe care o căutai". | 10 nevoi → cartonașe corecte; o nevoie vagă → exact o întrebare; o ofertă nouă relevantă → notificare în chat. |
| **5** | **Socoteala — matching + coș cu transport transparent** (motorul, fără LLM; aha-moment) | `MatchingEngine` determinist: pentru o cerere caută oferte în bazin, compune coșuri (complete/parțiale, mono/multi-producător), calculează transport + zi per producător, randează coșul-cu-transport + alternativa de consolidare. **Dacă mai multe oferte se potrivesc, le include pe toate, plafonat la 5 oferte per coș** (fiecare cu transportul și ziua ei). | Set fix → coșuri rezonabile (assert pe scor); un coș cu mai multe potriviri arată până la 5 oferte (nu depășește 5), fiecare cu livrarea/transportul ei înainte de acceptare; alternativa de consolidare corectă. |

### Cursa (spartă în 3) + bani + livrare

| # | Etapa | Ce livrează | Criteriu de validare |
|---|---|---|---|
| **6a** | **Mașina de stări a Cursei + scheduler** (pur logică, zero UI) | Cursa = **fereastră de timp per producător, fără prag minim**: comenzile plasate înainte de cutoff (ex. marți 12:00) intră în Cursa curentă (livrare joi); cele de după → Cursa următoare. Producătorul **decide per comandă** accept/refuz; dacă acceptă → coada de livrare; dacă refuză → refund automat. Cutoff tick-driven pe `Clock`. | Teste unitare: „comandă înainte de marți 12:00 → Cursa de joi; după → următoarea"; accept→livrare, refuz→refund; toate tranzițiile acoperite. |
| **6b** | **Countdown de Cursă + acceptare per comandă** | Artefactul de Cursă: countdown până la cutoff („se închide marți 12:00 · livrare joi") + lista comenzilor; producătorul acceptă/refuză fiecare comandă. Crainicul anunță ciclul. | Cu ceas simulat: comenzi intră în Cursă → countdown curge → producătorul acceptă/refuză → acceptate intră în coada de livrare. |
| **6c** | **Refuz / neacțiune la cutoff → tratare curată** | Producătorul refuză o comandă → refund automat + mesaj clar; comandă neacționată până la cutoff → trece automat în Cursa următoare. | Comandă refuzată → refund; comandă neacționată la cutoff → reprogramată transparent în Cursa următoare. |
| **7** | **Plata simulată + escrow + ledger** | Un link de plată per coș (pagină simulată) în `PaymentProvider`; split (marfă+transport→producător, rotunjire→fond; taxă Gazdă doar dacă ridicare la Stație); escrow ținut până la livrarea confirmată; comanda în coada de livrare pe ziua fixă. Ledger append-only. | „Plătesc un singur preț, văd banii blocați până ridic, văd cât merge la producător"; refund la anulare. (Reconcilierea = test automat: suma ledger = 0.) |
| **8** | **Livrarea la domiciliu + urmărire + eliberare plată** (mod principal) | Ruta de livrare a producătorului (Cursa devine rută la domiciliu); fereastră de livrare + urmărire în tab-ul „Comenzi" (status + bară de progres); confirmarea livrării → eliberează escrow (decontare simulată). Ridicarea la Stație cu Gazdă = opțiune viitoare. | Simulare rută cu 10–14 livrări: fereastra + urmărirea se văd; confirmarea livrării eliberează plata. |

### Încredere, pilot

| # | Etapa | Ce livrează | Criteriu de validare |
|---|---|---|---|
| **9** | **Încredere minimă: istoric + punctualitate** | Istoric public al producătorului + **rating de punctualitate al promisiunii de livrare**. (Vatra/chat de cartier și raportul de transparență → **post-pilot**. Onboarding+atestat → la pregătirea pilotului.) | Profil demo cu istoric de 4 Curse + punctualitate vizibilă. |
| **11** | **Pregătire pilot publicat: deploy + AI cloud + go-to-market + măsurare** | Deploy (UI Vercel, Postgres, **AI cloud ieftin ca default**, worker VPS). PWA instalabilă (rezerva iOS — notificările critice pe **SMS/email**, nu doar push). Onboarding ~10 producători reali + 1 cartier, **cu plan concret de recrutare** (model-D §7). **Feedback calitativ** (interviuri + buton „spune-ne"). Instrumentarea celor 5 ipoteze. Plăți **încă simulate**. | Test-useri reali parcurg fluxul cap-coadă cu plăți simulate; cele 5 ipoteze se măsoară; primul feedback calitativ colectat. |

> **Numerotare:** nu există Etapa 10 în secvența pilotului — numărul e păstrat pentru trasabilitate cu modulul amânat de mai jos.
>
> **Etapa 10 (owner dashboard + decontare + raport transparență) = amânată post-pilot.** În pilot, owner-ul ești tu și te uiți direct în date; păstrăm doar **un singur număr de densitate vizibil** (Curse/săptămână vs pragul de supraviețuire ~12).

## Provocările tehnice transversale și cum le tratăm

- **Artefacte interactive în chat:** registru de componente pe tip; sigure la streaming. Nucleul experienței (Etapa 1).
- **Ieșire structurată Gemma:** JSON constrâns + numere deterministe + fallback formular + golden set (Etapa 3). Risc de produs: dacă Taraba greșește des, producătorii reali abandonează — măsurăm fricțiunea.
- **Lichiditate fără eveniment:** mecanismul Cursei (deadline de cutoff per producător, fără prag) + lansare pe un singur cartier + validare timpurie 1c. Asigurare: modul-eveniment parametrizat.
- **Mașina de stări a Cursei:** desenată complet înainte de 6a, cu timeout-uri și cazuri-capcană.
- **Concurență pe Curse:** tranzacții DB în jurul tranzițiilor de stare; test explicit „comandă la milisecunda de închidere" pe Postgres.
- **Ceas/scheduler:** tick-driven de la `Clock`; testat că fast-forward declanșează termenele.
- **iOS PWA:** „instalabilă" e slabă pe iOS — notificările critice pe SMS/email, nu push.
- **Ledger:** append-only double-entry, invariant testat (suma = 0); mapabil 1:1 pe procesator real.
- **Cost/hosting AI:** cloud ieftin la pilot (default), self-host post-pilot.

## Recomandarea strategică (hedge mod-eveniment)

D pur e cel mai expus la cold-start. **Asigurare ieftină:** construim mașina de stări a Cursei **parametrizată**, astfel încât un „**mod eveniment**" (o *Cursă colectivă de cartier* cu termen comun — sincronizarea lui C) să fie un **comutator de configurare**. Refolosește ~80% din mecanică. Dacă testul de densitate (1c) arată „viu" → D pur; dacă „mort" → activăm modul-eveniment la lansarea fiecărui cartier și trecem la cursa continuă la prag de densitate. **Decizie deschisă de confirmat: includem hedge-ul?** (recomandat; se activează abia la 1c/6).

## Verificare (cum testăm end-to-end)

- **Per etapă:** rulare locală (`npm run dev`), seed, navigare pe viewport de telefon cu **Claude Preview / Chrome MCP**, captură, confirmarea criteriului + demonstrație fondatorului.
- **Teste automate:** unitare pe `MatchingEngine` (assert pe scor) și pe mașina de stări a Cursei; **teste de contract** mock-vs-real pe cele 3 seam-uri; **test de ceas** (fast-forward declanșează termene); **test de concurență** pe Curse (Postgres); **golden set** Gemma; **invariant ledger** (suma = 0); integrare pe Postgres devreme.
- **Pilot (Etapa 11):** cele 5 ipoteze din [validare-modele.md](validare-modele.md), fiecare cu prag go/no-go:
  1. Cerere urbană suficientă într-un cartier → ≥30 coșuri la runda 3 ȘI ≥150 activi în 8 săptămâni.
  2. Lichiditate vie fără eveniment → revenire între runde ≥60%; „viu" în testul calitativ.
  3. Disciplina promisiunii de livrare → onorare ≥95% (sub 90% → activează hedge-ul).
  4. Transportul nu omoară coșul → coș median ≥60 lei (overhead <15%); dacă >40% coșuri sub 40 lei → reconsideră.
  5. Venituri non-tranzacționale → rotunjire ≥20% SAU sponsor semnat.
  - Plus feedback calitativ.

## Decizii deschise de confirmat (mici, nu blochează startul pe 1a)

1. **Hedge-ul mod-eveniment parametrizat** — îl includem? (recomandat; se activează abia la 1c/6).
2. **Regula la cutoff** (comandă neacționată): default = report automat în Cursa următoare + anulare liberă a cumpărătorului; se confirmă la kickoff-ul Etapei 6a.

## Următorul pas concret

**Etapa 1a** — schela Next.js PWA mobil-first + suprafața de chat + vocabularul de artefacte (scriptat) + tokens-urile din designul Stitch. `app/` se creează aici.
