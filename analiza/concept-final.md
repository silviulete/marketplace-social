# Concept final — „Piața vie": de la Ziua de Târg la Piața Continuă
### O piață locală în chat, care pornește ca eveniment și crește ca bursă

*Livrabilul principal al fazei de analiză — actualizat 13 iunie 2026 (runda 2)*

---

## 0. Cum am ajuns aici

**Patru modele de business** au fost generate **în instanțe separate** (pentru a evita convergența) și evaluate de **instanțe independente de validare**, pe 8 criterii ponderate centrate pe utilitate comunitară, nu pe profit.

| Model | Esența | Scor R1 | Scor R2 |
|---|---|:---:|:---:|
| A — „Piața Inversă" | Cererea consumatorului pornește totul; oferta răspunde; AI potrivește | 6,90 | 6,85 |
| B — „Obștea" | Cooperativă digitală cu membri, cotizații fixe, comision zero, vot în chat | 6,25 | 6,15 |
| **C — „Ziua de Târg"** | **Piața ca eveniment săptămânal de 3 ore în chat, cu un singur val logistic** | **8,15** | **7,85** |
| **D — „Piața Continuă"** | **Alocare în timp real (ca la bursă), zi de livrare fixă per seller, transport transparent** | — | **7,60** |

**Runda 1** a stabilit câștigătorul C: rezolvă prin design problema care omoară piețele hiper-locale la scară mică — lichiditatea — prin sincronizare în timp.

**Runda 2** a apărut din recalibrarea fondatorului: *populația cu nevoia reală de livrare e la oraș, nu în comună; teritoriul corect e bazinul din jurul orașelor mari, nu satul și nu nivelul național.* Modelul D explorează această viziune cu alocare continuă „ca la bursă". Verdictul validării independente:

- **C rămâne câștigător la limită (7,85 vs. 7,60)** dintr-un singur motiv decisiv pentru un fondator cu buget mic: **cold-start-ul**. C produce o piață vie din 30 de coșuri și un calendar; D recunoaște onest că sub ~300 de cumpărători activi „arată mai mort decât C la 100".
- **Dar fondatorul are dreptate pe fond**: cererea reală e la oraș (D câștigă net la utilitate pentru consumatori 9 vs. 7 și pentru producători 9 vs. 8), iar aritmetica lui D se verifică — mai curată decât a oricărui model din runda 1.

**Recomandarea finală nu e „unul sau altul", ci o cale de migrare C→D**: folosim evenimentul lui C drept **rampă de lansare** pe cartiere urbane (unde e cererea, dar fără riscul paginilor goale), și cursa cu zi fixă a lui D drept **motor de scalare** declanșat de densitate. Aceeași platformă, aceiași agenți AI, aceeași Stație de cartier — migrarea se autofinanțează în trepte. Detalii: [validare-modele.md](validare-modele.md). Cele 4 modele complete: [A](model-A-piata-inversa.md) · [B](model-B-cooperativa-digitala.md) · [C](model-C-inedit.md) · [D](model-D-piata-continua.md).

---

## 1. Modelul ales, pe scurt

**„Piața vie"** este o piață locală care trăiește în chatul unui bazin urban și are **două moduri de funcționare, parcurse în această ordine pe măsură ce un cartier se maturizează:**

### Mod Eveniment (rampa de cold-start — preluat din „Ziua de Târg")

La pornirea fiecărui cartier, piața e un **eveniment săptămânal**, exact ca ziua de târg românească: luni–marți consumatorii spun nevoile în chat (agregate de AI), marți–miercuri producătorii pun oferte (foto + cantitate + preț), miercuri se publică **Foaia de Târg**, joi seara e **târgul live** cu matching aproximativ, plata printr-un singur link, iar sâmbătă **valul de ridicare** la o **Stație de cartier** administrată de o **Gazdă** (un vecin de încredere). Insight-ul care face asta să funcționeze din prima zi: *puțini oameni răspândiți pe 7 zile = piață moartă; aceiași oameni în aceleași 3 ore = târg viu.* Lichiditatea nu se cumpără cu marketing — se fabrică prin sincronizare.

### Mod Cursă (motorul de scalare — preluat din „Piața Continuă")

Când un cartier depășește un prag de densitate (~150 cumpărători activi) și un producător are clienți fideli recurenți, se „deschide" trecerea la **alocare continuă**: cererile și ofertele se întâlnesc oricând, nu doar joia. Mecanismul-cheie care păstrează lichiditatea fără eveniment: **fiecare producător își are ziua (sau zilele) fixe de livrare**, iar comenzile se agregă pe **„Cursa" lui săptămânală** spre oraș — o închidere de rundă rulantă, cu prag minim (ca un drum să fie viabil), termen-limită și bară de progres. Practic, târgul colectiv se sparge în zeci de micro-târguri, câte un „clopot" pe producător.

În modul cursă:
- **Oferta conține promisiunea de livrare** (ex. „livrez miercuri, în prima parte a zilei").
- **La comenzile onorate de mai mulți selleri**, dacă există cost de transport, fiecare comandă **afișează prețul de transport și ziua de livrare per seller, înainte de acceptare** — un coș de la 2 producători poate însemna 2 livrări, în zile diferite, cu 2 costuri de transport, totul vizibil dinainte.
- **Odată acceptată oferta de ambele părți**, comanda poate fi plătită și **intră la livrare în ziua fixă a sellerului** (sau, în viitor, ridicare de la un târg fizic / Stație).

### De ce migrarea, nu alegerea

Evenimentul (C) și cursa (D) **nu se contrazic — operează la stadii diferite de maturitate ale aceluiași cartier.** Evenimentul rezolvă cold-start-ul (unde C e imbatabil). Cursa rezolvă comoditatea și scalarea la maturitate (unde D e imbatabil). Stația de cartier e comună ambelor: micro-valul lui D *este* valul redus al lui C. Gazda Stației e același rol ca Vornicul. Agenții AI (Crainicul, Taraba, Socoteala, Vatra, Strigarea) servesc ambele moduri — diferă doar dacă tranzacțiile se deschid joi colectiv sau rulant per cursă. Nu există dublă infrastructură, iar faza-eveniment (cost minim) finanțează trecerea la cursă (server permanent).

### Actorii

- **Producătorul** (cu atestat, Legea 145/2014) — vinde înainte să recolteze; taxă fixă per târg/cursă, fără comision procentual; în modul cursă, își setează ziua fixă de livrare și promisiunea.
- **Consumatorul** — în Mod Eveniment, cumpără gratuit joi seara; în Mod Cursă, comandă oricând, cu transport transparent și ridicare la Stația de cartier.
- **Gazda Stației** (fostul Vornic) — vecinul care găzduiește punctul de ridicare; venit per ciclu + parte din rotunjiri; fața umană a platformei.
- **Ownerul** — operează ritualul și deschide cartiere noi; nu extrage procent din munca nimănui.

### Cum răspunde la „cum integrez ideea de comunitate?"

În Mod Eveniment, comunitatea **e chiar mecanismul economic**: sincronizarea produce simultan lichiditate și viață socială. La trecerea în Mod Cursă, la scară urbană, comunitatea de „adunare" slăbește — de aceea o păstrăm structural prin trei mecanisme: **chat pe cartiere** (nu un chat-oraș anonim), **Stația de cartier ca micro-val săptămânal** (oamenii tot se întâlnesc la ridicare) și **relația repetată „producătorul tău"** (cumperi de la Ion, nu de la un raft). Plus elementele care rămân din C: coșul suspendat (plătești un coș pentru o familie nevoiașă) și raportul public de transparență de luni. Teritorialitatea are sens economic, nu doar geografic: raza bazinului (~40–50 km) e exact distanța pentru care cursa săptămânală a producătorului rămâne rentabilă.

---

## 2. Business Model Canvas

| Bloc | Conținut |
|---|---|
| **1. Segmente de clienți** | **(a) Mici producători** cu atestat, pe raza bazinului (~40–50 km de oraș): legumicultori + ancore non-sezoniere (ouă, lactate cu DSVSA, miere, pâine, conserve). **(b) Consumatori urbani** — segmentul-cheie recalibrat: orășeanul fără rude la țară, fără timp de piață, cu bani și reflex de plată online (cererea dovedită de Cutia Țăranului, ASAT, grupurile urbane de zeci de mii). **(c) Secundari:** sponsori de Stație (brutăria, magazinul agricol), Gazdele. |
| **2. Propunerea de valoare** | **Producător:** vinde înainte să recolteze (risipă zero); în Mod Cursă, drumul la oraș se face organizat, nu „pe ghicite", cu comenzi garantate înainte de plecare. **Consumator:** hrană locală proaspătă, preț corect fără intermediari; în Mod Eveniment, apartenență la un ritual; în Mod Cursă, comandă oricând + transport transparent + ridicare la Stația de cartier. **Gazdă:** venit corect pentru câteva ore/săptămână + statut. **Sponsor:** vizibilitate exact în fața clienților lui. |
| **3. Canale** | Chatul pe cartiere (aplicație web minimalistă); grupurile urbane de Facebook; afiș cu QR la Stație, școală, magazin; Foaia de Târg (digital + tipărită); Gazda ca recrutor uman local. |
| **4. Relația cu clienții** | Mod Eveniment: ritual săptămânal (retenția e obiceiul). Mod Cursă: relația repetată cu „producătorul tău" + cursele lui previzibile. Agenți AI cu nume de acasă; chat comunitar, nu tichete de suport; raport public de transparență săptămânal. |
| **5. Fluxuri de venituri** (ne-extractive) | **Taxa fixă** per târg (Mod Eveniment, ~10 lei) sau per cursă (Mod Cursă, ~10 lei/producător/cursă) — fixă, nu procentuală: dacă producătorul vinde mai mult, câștigul e integral al lui. **Rotunjirea voluntară** la plată (2–4 lei, transparentă, împărțită cu Gazda și fondul cartierului). **Sponsorul Foii de Târg / Stației** (~150 lei/săptămână). **Transportul** (Mod Cursă) e plătit de consumator către producător, afișat la cost — NU e venit al platformei. **Explicit refuzate:** comisionul procentual (motivează ocolirea) și cotizațiile de membru (ucid cold-start-ul). |
| **6. Resurse cheie** | Ritualul/calendarul (activul de cold-start); motorul de matching + cele 5 agenți AI mici; rețeaua de Gazde și Stații de cartier; încrederea + istoricul public al producătorilor (inclusiv rata de onorare a promisiunii de livrare); aplicația de chat cu cele două moduri. |
| **7. Activități cheie** | Orchestrarea săptămânală (eveniment sau curse); recrutarea și verificarea producătorilor (atestat la onboarding); operarea Stației; decontarea + raportul; **lansarea de cartiere noi ca evenimente** și **declanșarea migrării spre cursă la atingerea densității**. |
| **8. Parteneri cheie** | Gazdele; procesatorul de plăți cu split (Stripe Connect / Netopia / PayU marketplace — banii nu trec prin platformă); primăriile (evidența atestatelor); spațiile-gazdă (Stația de cartier); grupurile urbane de Facebook; DSVSA pentru categoriile animale. |
| **9. Structura de costuri** | **Faza eveniment** (per cartier, ~915 lei/lună): Gazda ~400, procesare plăți ~2% din GMV ~365, infrastructură + AI în rafale ~150. **Faza cursă** adaugă un server permanent (~+500 lei/lună pe bazin) pentru matchingul continuu. Surplus → fondul cartierului și, agregat, salariul omului care deschide cartiere noi. Prag de viabilitate eveniment: ~8 producători și ~45 de coșuri/târg; cursă: ~prag minim de comenzi per drum ca să fie rentabil. |

---

## 3. Structura aplicației — module validabile individual

Principiul (decizia #3 din [DECISIONS.md](../DECISIONS.md)): fiecare modul se **validează de sine stătător, vizual, cu demo data**, înainte de următorul. Începem cu experiența core în **Mod Eveniment** (rampa de cold-start); modulele de **Mod Cursă** sunt o etapă de maturitate, construită doar după ce evenimentul e validat. Niciun modul din Etapa 1 nu are nevoie de conturi, plăți sau hărți ca să fie validat.

### Etapa 1 — Experiența core, Mod Eveniment (se construiește și se validează prima)

| # | Modul | Actor | Ce validăm | Validare vizuală + demo data | Depinde de |
|---|---|---|---|---|---|
| M1 | **Chatul cererii** (Strigarea) | Consumator | Nevoia scrisă natural devine cartonaș structurat: produs, cantitate, interval de preț. AI întreabă DOAR dacă e neclar | 10 nevoi-test tastate liber → ≥8 cartonașe corecte; chat + artefact afișat | — |
| M2 | **Chatul ofertei** (Taraba) | Producător | Foto + cantitate + preț în limbaj natural devin cartonaș de ofertă; AI cere ce lipsește | 10 oferte fictive de legume → cartonașe complete; conversația de calificare vizibilă | — |
| M3 | **Foaia de Târg + matching** (Socoteala) | Ambii | Cererile + ofertele produc catalogul și propuneri de coș aproximative (complete/parțiale, din mai multe tarabe) | 15 oferte + 10 cereri fictive → Foaia + ≥7 propuneri „rezonabile" judecate de un om | M1, M2 |
| M4 | **Târgul live** (Crainicul) | Ambii | Ritualul de 3 ore: deschidere, stoc care scade la vedere, acceptare, Coșul de Seară, închidere | Simulare cu 10 participanți-test: deschiderea, anunțurile, rezumatul la acceptare | M3 |

**Criteriul de ieșire din Etapa 1:** un târg complet simulat, cap-coadă, cu legume fictive — exact MVP-ul din brief — parcurs de utilizatori-test care înțeleg ce se întâmplă **fără explicație externă** (testul experienței minimaliste).

### Etapa 2 — Dependențe (susțin experiența core)

| # | Modul | Actor | Ce validăm | Validare vizuală + demo data | Depinde de |
|---|---|---|---|---|---|
| M5 | **Ciclul comenzii** | Producător + consumator | Acceptare → comandă la seller → seller acceptă → cod de ridicare | Comenzile din M4 trec prin toate stările, vizibil în ambele chaturi | M4 |
| M6 | **Plăți simulate** | Consumator | Un singur link per coș; „escrow" simulat; împărțirea pe producători corectă; rotunjire opțională | Pagină de plată fictivă + registru: cine ce primește; 10 coșuri demo cu 2–3 tarabe | M5 |
| M7 | **Identitate + teritoriu (bazin urban)** | Toți | Cartiere distincte într-un bazin; un user dintr-un cartier vede altă piață; verificarea atestatului la onboarding (simulată) | Două cartiere demo („Cartier Nord", „Cartier Vest") cu piețe diferite, comutabile | M1–M4 |
| M8 | **Ritmul + notificările** | Toți | Calendarul săptămânii orchestrat de Crainic: mementouri, deschidere/închidere automată | Cronologia unei săptămâni simulate, derulată accelerat, cu mesajele la momentele corecte | M4, M5 |

### Etapa 3 — Module administrative (owner și operare)

| # | Modul | Actor | Ce validăm | Validare vizuală + demo data | Depinde de |
|---|---|---|---|---|---|
| M9 | **Panoul Gazdei** | Gazdă | Lista de ridicare, bifarea predărilor, coșuri neridicate → coș suspendat | 30 de coșuri bifate într-o simulare de val; cazul neridicării vizibil | M5, M6 |
| M10 | **Panoul ownerului** | Owner | Sănătatea fiecărui cartier: coșuri/ciclu, GMV, taxe, **pragul de densitate care declanșează migrarea la cursă** | Dashboard cu 2 cartiere demo, unul sub prag, unul peste — semnalul de „deschide cursa" vizibil | M6, M7 |
| M11 | **Decontarea + raportul de transparență** | Owner + comunitate | Plățile săptămânale către producători (simulate) + raportul public generat automat | Raport demo publicat în chat, cu cifre reconciliate cu registrul M6 | M6 |
| M12 | **Încredere + comunitate** (Vatra) | Toți | Istoric public al producătorului (inclusiv onorarea promisiunii), coș suspendat, „ce v-ar trebui?" → semnal de cerere | Profil demo de producător cu istoric de 4 cicluri; un coș suspendat donat cap-coadă | M7 |

### Etapa 4 — Mod Cursă (maturitate; doar după ce Mod Eveniment e validat și un cartier atinge densitatea)

| # | Modul | Actor | Ce validăm | Validare vizuală + demo data | Depinde de |
|---|---|---|---|---|---|
| M13 | **Oferta cu promisiune de livrare + zi fixă** | Producător | Producătorul își setează ziua/zilele fixe de livrare; fiecare ofertă poartă promisiunea („miercuri dimineața") | 6 producători demo cu zile fixe diferite; promisiunea afișată pe fiecare ofertă | M2, M7 |
| M14 | **Matching continuu + Cursa** (bursa) | Ambii | Cererile și ofertele se întâlnesc oricând; comenzile se agregă pe cursa producătorului, cu prag minim, termen și bară de progres | Simulare „bursă" cu fluxuri intrând în timp real; o cursă care se umple până la prag, vizibil | M3, M13 |
| M15 | **Transport transparent multi-seller** | Consumator | La un coș de la mai mulți selleri: cost de transport + ziua de livrare afișate PER seller, înainte de acceptare | Coș demo de la 2 producători cu zile și costuri de transport diferite, afișate înainte de plată | M6, M13, M14 |
| M16 | **Acceptare bilaterală → plată → coada de livrare** | Ambii | Oferta acceptată de ambele părți → plătită → intră la livrare pe ziua fixă a sellerului | Comenzi demo parcurgând: acceptare ambele părți → plată simulată → programare pe ziua fixă | M5, M6, M14, M15 |

**Harta dependențelor, pe scurt:** M1 și M2 pornesc în paralel (fără dependențe) → M3 → M4 încheie core-ul eveniment → M5 → M6 deblochează administrativul (M9–M11) → M7, M8, M12 oricând după core → **Mod Cursă (M13–M16) se construiește ultimul, ca etapă de maturitate**, și reutilizează M2 (oferta), M3 (matchingul), M5/M6 (comandă + plată). În orice moment, ce e construit e demonstrabil vizual cuiva din afara proiectului.

---

## 4. Ce costuri generează aplicația? (răspunsul la întrebarea din brief)

Concluzia onestă: **AI-ul nu e costul acestei aplicații.** Sarcinile agenților sunt mici. Costurile reale sunt procesarea plăților (proporțională cu vânzările, acoperită din economia locală) și, la scară, **oamenii**. În Mod Cursă apare și transportul — dar acela e plătit de consumator către producător, la cost, nu de platformă. Estimări lunare, în lei:

| Categorie | **Pilot** (~100 utilizatori, 1 cartier, plăți simulate) | **~1.000 utilizatori** (un bazin urban, câteva cartiere) | **~10.000 utilizatori** (mai multe bazine urbane) |
|---|---|---|---|
| Server + infrastructură | 0–50 (PC-ul fondatorului) | 100–250 (VPS; +server permanent dacă s-a deschis Mod Cursă) | 500–900 (servere + backup pe mai multe bazine) |
| AI — varianta recomandată | **0** (Gemma local) | 50–200 (Gemma pe server SAU model ieftin cloud; Mod Cursă cere inferență continuă, nu în rafale) | 800–1.200 (server GPU propriu pentru toate bazinele) |
| Procesarea plăților (~2% din vânzări) | 0 (simulate) | ~365/cartier — acoperită din venitul local | ~365/cartier — acoperită din venitul local |
| Gazdele (~400 lei/Stație) | 0 (pilot simulat) | acoperite din venitul local | acoperite din venitul local |
| Transport (Mod Cursă) | 0 | plătit consumator → producător, la cost (nu e cost de platformă) | idem |
| Oameni (echipa centrală) | 0 (timpul fondatorului) | 0–2.500 (fondator ± o jumătate de normă) | 9.000–16.000 (1–2 oameni: „deschizătorul de cartiere" + suport) |
| **Cost central total** | **sub 100 lei/lună** | **200–3.100 lei/lună** | **10.000–18.000 lei/lună** |
| Acoperire | bugetul fondatorului | surplus câteva cartiere | surplus agregat al bazinelor |

Observația structurală: fiecare cartier își acoperă singur costurile variabile (Gazdă + procesare + felia de AI) din veniturile proprii. Centrul costă puțin și e plătit din surplusul agregat — modelul se autosusține fără profit maxim. **Migrarea la Mod Cursă (server permanent) se face doar după ce un cartier-eveniment e deja pe profit operațional**, deci nu cere capital pe care fondatorul nu-l are.

### Comparativ AI (la ~10.000 utilizatori)

| Drum | Cost lunar estimat | Observații |
|---|---|---|
| LLM premium cloud (clasă Fable / Opus) | 2.000–7.000 lei | Inutil: sarcinile sunt simple |
| Modele ieftine cloud (Haiku / Gemini Flash-Lite / Mistral Small) | 100–500 lei | Volume mici de text; dependență de furnizor |
| **Gemma self-hosted (recomandat la scară)** | **800–1.200 lei, fix** | Cost fix indiferent de creștere; datele rămân la comunitate; zero dependență |

---

## 5. Cum rulează fără un LLM scump în cloud (explicat ne-tehnic)

Patru principii fac AI-ul ieftin:

**1. Agenți specializați, nu un creier universal.** Fiecare agent face o singură treabă mică (extrage produs-cantitate-preț, cere câmpul lipsă, anunță după calendar). Treburile mici sunt exact ce modelele mici (clasa Gemma) fac bine și ieftin.

**2. Matching-ul nu e treabă de LLM.** Potrivirea cerere-ofertă (și agregarea pe cursă, în Mod Cursă) se face pe date structurate — categorie, cantitate, interval de preț, zi de livrare, aceeași zonă — cu reguli simple plus similaritate de text. Matematică ieftină. LLM-ul mic intervine doar la margini: înțelege fraza la intrare, formulează frumos propunerea la ieșire. Cea mai mare economie din arhitectură.

**3. Modul de funcționare dictează costul AI.** În Mod Eveniment, inferența rulează în rafale scurte (câteva ore/săptămână) — un PC obișnuit ține un cartier. În Mod Cursă, matchingul e continuu, deci cere un server care răspunde permanent — de aceea migrarea la cursă e și o decizie de cost, luată doar când densitatea o justifică. Trucul de scalare: bazinele/cartierele cu eveniment pot avea seri diferite, ca să nu se calce pe sarcină.

**4. Omul confirmă, AI-ul propune.** Orice ieșire care contează (preț, cantitate, comandă, promisiune de livrare) apare ca un cartonaș pe care omul îl confirmă în chat. Un model mic care greșește ocazional nu strică nimic — greșeala e vizibilă înainte să coste bani. Asta permite folosirea modelelor ieftine fără risc.

**Drumul de creștere** (fără rescriere, doar reconfigurare): pilotul rulează cu Gemma pe calculatorul fondatorului (Ollama / LM Studio, instalare „next-next-finish"); la câteva cartiere, același software pe un server închiriat sau model ieftin cloud; la mai multe bazine, server GPU propriu. Agenții vorbesc cu modelul printr-o interfață standard, deci schimbarea modelului e o setare.

---

## 6. Planul de pilot MVP

Ca în brief: pilotăm **experiența**, cu oferte fictive de legume și plăți simulate — fără bani reali. **Pilotăm Mod Eveniment** (rampa); Mod Cursă se validează ulterior, după ce un cartier atinge densitatea.

**Formatul:** alegem **un cartier dintr-un oraș mare** (2.000–10.000 locuitori în cartier) — nu o comună. 2 „cicluri de probă" cu date fictive (utilizatorii parcurg fluxul cap-coadă, agenții se calibrează), apoi 6 cicluri consecutive în ritm real, tot cu plăți simulate. Criterii de alegere: grup Facebook urban activ, producători disponibili pe raza bazinului (~40–50 km), un partener pentru Stație, un candidat de Gazdă recrutat **înaintea** producătorilor.

**Cele 5 ipoteze riscante de validat** (din raportul rundei 2 — acestea decid dacă modelul ține):

| # | Ipoteza | Cum o măsurăm | Pragul de decizie |
|---|---|---|---|
| 1 | Cererea urbană e suficientă într-un singur cartier (teza fondatorului) | Coșuri până la plata simulată/ciclu; utilizatori activi în 8 săptămâni | ≥30 coșuri la ciclul 3; ≥150 activi în 8 săpt. Sub prag: cartier prea subțire, testează altul |
| 2 | Evenimentul sincron produce lichiditate vie la oraș, nu doar la sat | Densitatea în fereastră (utilizatori simultani); revenirea între cicluri | revenire ≥60%; fereastra colectivă bate o piață continuă lansată în paralel |
| 3 | Disciplina promisiunii de livrare per producător (riscul-cheie al Mod Cursă) | Rata de onorare a promisiunii afișate public; câți producători acceptă zi fixă + bară publică | onorare ≥95% (sub 90% → amână Mod Cursă) |
| 4 | Costul transportului nu omoară coșul perceput | Distribuția mărimii coșurilor; abandonul la afișarea transportului | coș median ≥60 lei (overhead <15%); dacă >40% coșuri sub 40 lei → rămâi pe eveniment cu val unic |
| 5 | Veniturile non-tranzacționale se țin la oraș | Rata reală de acceptare a rotunjirii; semnarea unui sponsor de Stație | rotunjire ≥20% (modelul D presupune 25%); altfel recalibrează pragul de autosusținere |

**Ce urmează după acest document:** construcția modulului M1 + M2 (cele două chaturi, fără dependențe), validate vizual cu demo data — primul pas concret al MVP-ului, în Mod Eveniment.

---

*Documente-suport: [model-A](model-A-piata-inversa.md) · [model-B](model-B-cooperativa-digitala.md) · [model-C](model-C-inedit.md) · [model-D](model-D-piata-continua.md) · [validare-modele.md](validare-modele.md). Deciziile de proiect: [DECISIONS.md](../DECISIONS.md).*
