# Community Chat Marketplace

Un concept nou de cumpărare de produse de la mici producători locali din România, construit în jurul unei experiențe de tip chat cu agenți AI. Nu e un marketplace clasic — e o comunitate locală în jurul unui chat: consumatorii își exprimă nevoile, producătorii își pun ofertele, iar agenți AI fac potrivirea și orchestrează comanda. Scopul este utilitatea pentru comunitate (producători + consumatori), nu profitul maxim.

## Structura proiectului

```
README.md        ← acest fișier: harta proiectului și regulile de organizare
DECISIONS.md     ← jurnalul deciziilor de proiect (se actualizează continuu)
analiza/         ← tot ce ține de business: modele, validare, concept final
app/             ← viitorul MVP (se creează când începem construcția)
```

## Reguli de organizare

1. **Un singur fișier per subiect** — actualizăm fișierul existent, nu creăm clone „v2/final/final2".
2. **Nimic nou la rădăcină** — orice fișier nou intră în `analiza/` (business) sau `app/` (produs).
3. **Deciziile importante se scriu în `DECISIONS.md`** în aceeași sesiune în care sunt luate — o linie per decizie, cu motivație.

## Documente cheie

| Document | Conținut |
|---|---|
| [analiza/model-A-piata-inversa.md](analiza/model-A-piata-inversa.md) | Modelul A — piața inversă (cererea pornește de la consumator) |
| [analiza/model-B-cooperativa-digitala.md](analiza/model-B-cooperativa-digitala.md) | Modelul B — cooperativa digitală / comunitate cu membri |
| [analiza/model-C-inedit.md](analiza/model-C-inedit.md) | Modelul C — „Ziua de Târg" (câștigătorul) |
| [analiza/model-D-piata-continua.md](analiza/model-D-piata-continua.md) | Modelul D — „Piața Continuă" (evoluția bursieră, bazin urban) |
| [analiza/validare-modele.md](analiza/validare-modele.md) | Validarea comparativă (runda 2: cele 4 modele, instanță separată) |
| [analiza/concept-final.md](analiza/concept-final.md) | Livrabilul fazei de analiză: modelul ales, Business Model Canvas, structura pe module, costuri, arhitectură AI, plan de pilot |
| [analiza/plan-dezvoltare-D.md](analiza/plan-dezvoltare-D.md) | **Planul de build aprobat** (Model D, agile, etape 1a→11). Sursa de adevăr pentru construcție. |

## Stadiu

Faza de analiză = încheiată. Modelul ales pentru construcție = **D („Piața Continuă")**. Execuția a început, conform [analiza/plan-dezvoltare-D.md](analiza/plan-dezvoltare-D.md).

- ✅ **Etapa 1a** — experiența cumpărătorului, scriptată (Next.js PWA mobil-first + chat cu artefacte + tokens Stitch). Codul în [`app/`](app/README.md); rulează cu `cd app && npm run dev`.
- ✅ **Etapa 1b** — călătoria vânzătorului (Taraba): publică ofertă editabilă, vede comenzile picând, accept/refuz, stoc.
- ✅ **Etapa 1c** — simulare de densitate (`/simulare`): countdown la cutoff + Cursele care se umplu, comutator 40 vs. 150 → „viu sau mort?".
- ✅ **Etapa 2** — model de date real (Prisma + SQLite): bazine urbane + filtrare pe rază. Pagina `/bazin`: București vede alte oferte decât Cluj; producătorii din afara razei (~45 km) nu apar.
- ✅ **Etapa 3** — Taraba: oferta reală prin AI (`ModelProvider` mock + extractor determinist). Vânzătorul scrie liber → ofertă extrasă → confirmă → apare în bazin. Golden set la `/golden` (40/40).
- ✅ **Etapa 4** — Strigarea: cererea reală prin AI (`ModelProvider.extractRequest` + parser determinist `request.ts`) + **matching continuu vizibil** pe bazinul real (`/api/match`, single-producer-first). Cumpărătorul scrie liber → cerere structurată (vag → o întrebare) → potriviri reale → **piață continuă** („a apărut … pe care o căutai"). Golden set la `/golden-cerere` (14/14).
- ✅ **Etapa 5** — Socoteala: `MatchingEngine` determinist (fără LLM) compune **coșul cu transport transparent** — un singur vânzător dacă e posibil (#21), altfel **numărul minim de surse** (transport + zi per vânzător). Potrivirile se afișează grupate pe vânzător, **max 5** (#18/#33). Regresie vizibilă la `/socoteala` (17/17).
- ✅ **Etapa 6a** — mașina de stări a Cursei + scheduler `Clock`-driven (logică pură): fereastră de timp per producător (#18), rutare la cutoff, accept→livrare / refuz→refund, **ne-acționat la cutoff → expiră + refund** (#34), fără hedge (D pur). Regresie vizibilă la `/cursa` (18/18).
- ✅ **Etapa 6b (+6c)** — countdown de Cursă live + acceptare per comandă în Tarabă, condus de mașina de stări 6a (`CursaEngine`+`SimulatedClock`): cutoff care curge, accept→coada de livrare, refuz→refund, ne-acționat la cutoff→expiră+refund (#34); Crainicul anunță ciclul.
- ✅ **Etapa 7** — plată simulată (`PaymentProvider`) + **escrow** + **ledger append-only double-entry** (reconciliere suma=0): plătești un preț, banii se blochează, vezi cât merge la producător; **rotunjire voluntară** la fondul comunității (#6); split multi-producător; refund la anulare. Regresie vizibilă la `/bani` (20/20).
- ✅ **Etapa 8** — livrarea la domiciliu + urmărire + eliberarea plății: cumpărătorul urmărește comanda (preluat→în drum→livrat) și **confirmă livrarea → eliberează escrow** (producător + fond); producătorul are **ruta de livrare** (12 opriri, fereastră, progres, încasat). Bucla banilor e închisă.
- ✅ **Etapa 9** — încredere minimă: profil public al producătorului (`/ferma/[id]`) cu **rating de punctualitate** (real) + **istoric de 4 Curse** (la timp / întârziat); card din `/bazin` clickabil spre profil.
- ⏭️ Urmează **Etapa 11** (pregătire pilot: deploy Vercel + Postgres + AI cloud ieftin + worker VPS + go-to-market + măsurarea celor 5 ipoteze). *(Nu există Etapa 10 în secvența pilotului — vezi plan.)* **Predare pentru un chat nou: [HANDOFF.md](HANDOFF.md).**
