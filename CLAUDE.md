# CLAUDE.md — ghid pentru sesiunile de execuție

Acest proiect construiește un MVP pe baza unui plan deja aprobat. Fondatorul **nu e developer** și validează vizual fiecare etapă, pe telefon. Toate livrabilele și conversația sunt în **limba română**.

## Citește întâi (în ordinea asta)

1. **`analiza/plan-dezvoltare-D.md`** — planul de build aprobat (Model D „Piața Continuă", agile, etape 1a→11). **Sursa de adevăr pentru construcție.**
2. **`DECISIONS.md`** — toate deciziile luate (vezi în special #13–#18: Model D pur, stack, design Stitch, livrare la ușă, Cursa fără prag, matching plafonat la 5).
3. `analiza/model-D-piata-continua.md` — modelul de business din spate (context).
4. `README.md` — harta proiectului.

## De unde începi

**Etapa 1a** din plan: schela Next.js (PWA, mobil-first) + suprafața de chat „dezgolită" + vocabularul de artefacte (scriptat, fără AI) + tokens-urile de design. Codul se creează în **`app/`** (nu există încă).

## Reguli ferme (din decizii)

- **Stack:** Next.js + TypeScript (un singur cod, PWA mobil-first), SQLite+Prisma în dev → Postgres la pilot. AI în spatele interfeței `ModelProvider` (mock acum; Gemma/Ollama apoi; cloud ieftin = default la pilot). Plăți simulate în spatele `PaymentProvider`. `Clock`/`Scheduler` injectabil (ceas simulat tick-driven). Matching = TypeScript determinist, NU LLM. Bani = ledger append-only double-entry.
- **Design = sursă vizuală de adevăr:** proiectul Stitch **„Local AI Supply Assistant"** (`projects/4966229920227707753`), design system „Sourcing Intelligence System". Conectorul Stitch MCP e legat — extrage ecranele relevante (`get_screen` → HTML/CSS + screenshot) și tradu-le în React păstrând tokens-urile (Inter; verde pădure `#0d631b`/`#2e7d32`; off-white `#f9f9f7`; card alb cu bordură 1px `#e6e6e4`; colțuri 8px/16px; spacing pe 8px). **Design-as-layer: preia vizualul, NU schimba logica fără să întrebi.**
- **Logica produsului (confirmată):** livrare la ușă = mod principal; Eco/CO2 = doar etichetă vizuală; chat-first cu taburi minime (Chat + Comenzi + Profil); recurență („Coș Săptămânal" + „Recomandă din nou"). **Cursa = fereastră de timp per producător, FĂRĂ prag minim** (cutoff → zi de livrare; după cutoff → Cursa următoare); fermierul decide per comandă accept/refuz. **Matching plafonat la 5 oferte** per coș.
- **Agile:** o etapă = ceva testabil vizual cu demo data. Verifică fiecare etapă rulând local (`npm run dev`) + Claude Preview/Chrome MCP pe viewport de telefon, apoi demonstrează fondatorului. Nu trece mai departe fără validare.
- **Organizare:** `analiza/` = business; `app/` = produs; un singur fișier per subiect; deciziile noi se scriu în `DECISIONS.md` în aceeași sesiune.

## Două decizii (confirmate la kickoff-ul Etapei 6a — vezi DECISIONS #34)

1. **Fără hedge „mod-eveniment"** — doar D pur. (Fondatorul a respins asigurarea contra cold-start.)
2. **La cutoff, comandă neacționată → EXPIRĂ + refund**, NU report automat în Cursa următoare.

## Mediu

Windows, Node v24 / npm 11 disponibile. Shell PowerShell (sandbox-ul Bash e Linux și nu are `claude` pe PATH). Conectori MCP legați: Stitch, Figma.
