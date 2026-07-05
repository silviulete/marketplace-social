# Model D — „Piața Continuă": bursa cu zile de drum

*Evoluția modelului câștigător „Ziua de Târg" — 13 iunie 2026*

## 1. Numele modelului + esența în 3 fraze

**Piața Continuă** nu se mai deschide trei ore pe săptămână, ci stă deschisă permanent: cererile și ofertele se întâlnesc în chat oricând apar, ca la bursă, cu matching aproximativ non-stop. Ce rămâne fix nu mai e ziua târgului, ci **ziua de drum a fiecărui producător** — fiecare ofertă poartă o promisiune de livrare („miercuri, în prima parte a zilei"), iar comenzile unui producător se strâng pe **Cursa** lui săptămânală spre oraș, ca pasagerii pe un autobuz de marfă. Teritoriul nu mai e satul, ci **bazinul urban**: producători pe o rază de zeci de kilometri în jurul unui oraș mare, consumatori în oraș, ridicare la **Stații** de cartier — pentru că exact orășeanul fără bunici la țară are nevoia cea mai acută și banii ca s-o plătească.

## 2. Problema reală pe care o rezolvă

Modelul C a rezolvat lichiditatea unui sat, dar a lăsat pe masă o întrebare incomodă: **cine are, de fapt, cea mai acută nevoie de produsele micului producător?** Nu vecinul lui din comună — acela are grădina lui, ruda lui, piața lui. Ci orășeanul din Cluj, Brașov sau Sibiu: fără rude la țară, fără timp de piață în program, cu o piață urbană în care taraba „de la producător" vinde prea des marfă de en-gros relabelată. Cererea lui e dovedită, nu presupusă: grupurile de Facebook „produse locale din jurul orașului X" au zeci de mii de membri și zero infrastructură, ASAT funcționează din 2008, iar **Cutia Țăranului** livrează din 2012 coșuri săptămânale de la țărani către orășeni, **în zile fixe de livrare per producător** — exact comportamentul pe care D îl organizează la scară ([cutiataranului.ro](https://cutiataranului.ro/destinatie/cluj-napoca/)).

Cadrul legal e același ca la C: **Legea 145/2014**, atestatul și carnetul de comercializare pentru vânzare directă ([Portal Legislativ](https://legislatie.just.ro/Public/DetaliiDocument/162616)). Problema producătorului de lângă oraș nu e dreptul de a vinde, ci **costul drumului la clientul urban**: curierul costă 17–25 lei pe colet ([e-packet.ro](https://e-packet.ro/blog/cat-costa-sa-trimiti-un-colet-prin-curier/)) — imposibil pe un coș de 70 de lei — iar drumul propriu merită doar cu destule comenzi ferme la capăt. Azi acest drum se face „pe ghicite" sau pe liste de WhatsApp. Diagnosticul lui D: **drumul săptămânal al producătorului spre oraș există deja; lipsește mecanismul care îl umple cu comenzi plătite înainte de plecare.**

## 3. Propunerea de valoare per actor

**Producătorul:** publică oferte oricând, cu promisiunea lui de livrare atașată; vede comenzile adunându-se pe Cursa lui și pleacă spre oraș **doar când drumul e deja plătit** — vinde înainte să recolteze, ca la C, dar fără fereastra de 3 ore. Taxă fixă de 10 lei pe cursă, zero comision, transportul plătit transparent de cumpărător.

**Consumatorul:** comandă oricând — duminică la 23:00, în pauza de prânz — nu doar joia între 19 și 22. Vede înainte de a accepta exact ce primește, când și cu ce cost de transport, per producător. Ridică la o Stație din cartier, la sub 10 minute de casă, de la „producătorul lui", săptămână de săptămână.

**Ownerul / comunitatea:** un model susținut din taxe fixe mici și contribuții voluntare, fără procent din munca nimănui, pe un bazin de cerere de 20–30 de ori mai mare decât o comună — venituri ne-extractive suficiente fără sponsor providențial.

**Actor nou — Gazda Stației:** un comerciant de cartier sau un vecin care găzduiește punctul de ridicare 2×2 ore pe săptămână, plătit 2 lei pe coș din taxa de livrare — moștenitorul urban al Vornicului.

## 4. Cum funcționează: fluxul complet prin chat

Cinci agenți AI, pe modele mici (Gemma), cu matching pe date structurate, nu pe inteligență scumpă: **Taraba** (oferta producătorului, cu promisiunea de livrare), **Strigarea** (cererea consumatorului, oricând apare), **Socoteala** (matching continuu, coș, transport, plată, escrow), **Crainicul** (viața curselor: praguri, închideri, „mai sunt 3 ore până pleacă lista lui Ion") și **Vatra** (chatul de cartier, rețete, istoricul producătorilor).

**Pasul 1 — oferta cu promisiune de livrare.** Ion scrie Tarabei: „am roșii, 8 lei kilu', vreo 100 kg". Taraba cere poza și confirmă promisiunea: „Livrezi tot miercuri, la Stațiile Mărăști și Gheorgheni, ca de obicei?" Oferta publicată conține: produs, preț, stoc, **ziua fixă de livrare, stațiile deservite și taxa de livrare per comandă** (Ion și-a setat 8 lei la stație, 15 lei la ușă), plus minimul de comandă (40 lei).

**Pasul 2 — matching continuu.** Maria scrie duminică seara: „vreau ceva de ciorbă și 2 kg de brânză". Socoteala caută în tot bazinul **pe loc** și propune: legumele de la Ion (miercuri, transport 8 lei), brânza de la Ana (vineri, transport 7 lei). Nu există fereastră de târg — propunerea vine în minute, nu joia viitoare.

**Pasul 3 — transparența transportului per comandă.** Înainte de orice acceptare, Maria vede cartonașul complet: *„Coșul tău vine în 2 livrări: miercuri de la Ion (52 lei marfă + 8 lei transport, Stația Mărăști 17–19) și vineri de la Ana (36 lei + 7 lei, aceeași stație). Total 103 lei. Alternativă: Ion are și telemea — iei tot de la el, totul vine miercuri, economisești 7 lei."* Costul vizibil al transportului împinge natural spre coșuri de la un singur producător — coș mai mare per cursă, mai puține drumuri.

**Pasul 4 — acceptarea bilaterală → plată → coada de livrare.** Maria acceptă. Comanda intră „în așteptarea Cursei de miercuri a lui Ion", care are pragul lui: minimum 8 comenzi ca drumul să merite. Crainicul afișează public bara de progres: „Cursa de miercuri: 6/8 comenzi — se închide marți la 18:00". Când pragul e atins (sau Ion decide să plece oricum), **Ion acceptă lotul — momentul acceptării bilaterale**: Maria primește un singur link de plată, banii intră la procesatorul cu split, comanda intră în coada de livrare pe ziua fixă. Miercuri Ion face un singur drum cu 10–14 comenzi, oprește 15 minute la fiecare Stație, Gazda bifează ridicările cu codul din chat. Confirmarea ridicării eliberează plata — decontare săptămânală, plus raportul public de transparență moștenit de la C.

**Mecanismul ascuns care salvează lichiditatea:** D nu a eliminat târgul — **l-a spart în zeci de târguri mici, câte unul pe cursă.** Cererea nu se mai sincronizează pe calendarul localității, ci se agregă pe ciclul de livrare al fiecărui producător: fiecare Cursă e o „închidere de rundă" rulantă, cu termen, prag și bară de progres — psihologia de eveniment a lui C (urgență, dovadă socială, stoc care scade), distribuită pe toată săptămâna, câte un „clopot" pe producător.

## 5. Mecanismul de comunitate + dimensiunea teritorială

**Bazinul** se definește economic, nu administrativ: orașul plus producătorii aflați la o distanță pentru care drumul săptămânal rămâne viabil — practic o rază de 40–50 km. Un utilizator din alt bazin vede **doar piața bazinului lui**: nu există catalog național, curier sau expediere — singura logistică admisă e drumul producătorului. Nu e o limitare tehnică, e teza modelului: D rămâne local, doar că „local" înseamnă acum bazinul unui oraș, nu un sat.

La scară de zeci de mii de consumatori potențiali, „comunitatea" satului nu poate fi mimată — și ar fi necinstit să pretindem altceva. D o înlocuiește cu trei mecanisme structurale, nu cosmetice:

1. **Chatul pe cartiere, nu pe oraș.** Un chat de 50.000 de oameni e un feed, nu o comunitate. Vatra trăiește la nivel de cartier (2.000–10.000 de oameni), ancorată fizic în Stația lui.
2. **Stația ca micro-val.** Comenzile unei curse aterizează în aceeași fereastră de 2 ore la aceeași Stație — vecinii se văd, Gazda îi cunoaște: micro-evenimentul logistic al lui C supraviețuiește la scară de cartier.
3. **„Producătorul tău".** Relația repetată e unitatea de comunitate a lui D: coșul recurent („în fiecare miercuri, ce-mi pregătește Ion"), istoricul public al producătorului, clienții fideli ai unei curse care se salută la Stație. Cutia Țăranului demonstrează de peste un deceniu că exact această relație 1-la-1, pe zi fixă, ține.

## 6. Modelul economic

**Economia unei Curse** (unitatea atomică a modelului). Producător la 35 km de oraș, dus-întors 70 km: combustibil ~37 lei, uzură ~28 lei, total vehicul **~65 lei**, plus ~3 ore din ziua lui. La 10 comenzi × 8 lei taxă de livrare = 80 lei: **transportul își acoperă costul de vehicul din taxa plătită de cumpărători**, iar timpul producătorului e plătit din marfă: 10 coșuri × 75 lei = **750 lei vânduți într-un singur drum**, garantat înainte de plecare. **Pragul de viabilitate per drum: ~8 comenzi sau ~500 lei marfă** — sub el, cursa nu se confirmă, comenzile se reportează sau se anulează fără cost. Comparativ: aceleași 10 colete prin curier ar costa 170–250 lei.

**Fluxurile de bani:** cumpărător → link unic → procesator cu split → marfă + taxa de livrare către producător, 2 lei/coș către Gazda Stației, rotunjirea voluntară către fondul bazinului. Platforma nu atinge banii și nu ia procent din nimic.

**Veniturile platformei, per bazin matur** (luna 6–9: ~25 producători, ~35 curse/săptămână, ~12 comenzi/cursă, coș mediu 75 lei → GMV ≈ 135.000 lei/lună către producători, ~5.400 lei fiecare):

- **Taxa de cursă:** 10 lei × ~150 curse/lună = **~1.500 lei** (primele 8 curse gratuite pentru producătorii noi);
- **Rotunjirea voluntară:** ~1.800 comenzi × 25% acceptare × 3 lei = **~1.350 lei**;
- **Sponsorul de Stație:** 4 × 150 lei = **~600 lei** — opțional, nu structural (lecția validării lui C: sponsorul nu mai e 42% din venit, ci sub 20%).
- **Total: ~3.450 lei/lună.**

**Costurile platformei:** infrastructură + AI **~400–600 lei/lună** (matching continuu = un server mic permanent, nu rafale — mai scump decât la C, dar matchingul e matematică pe date structurate, LLM-ul doar înțelege fraza la intrare); restul e timpul fondatorului. **Procesarea plăților (~1,5–2 lei/coș) se afișează cumpărătorului ca linie separată „costul plății", la cost, fără adaos** — abatere asumată față de C, care o absorbea: la GMV urban, 2% ar însemna ~2.700 lei/lună, o foarfecă ce crește liniar cu volumul în timp ce veniturile fixe nu cresc. Dacă pilotul arată că linia irită, platforma o absoarbe și pragul de autosusținere urcă. **Surplus: ~2.800 lei/lună per bazin matur** → fondul bazinului și, de la 2–3 bazine, omul care deschide următorul. **Pragul de supraviețuire: ~12 curse/săptămână.**

## 7. Cold-start: primul bazin

**Alegerea:** un oraș mediu-mare cu tradiție de consum local dovedită (Sibiu, Brașov, Cluj — unde Cutia Țăranului sau piețele volante au arat deja terenul). **Regula de aur: nu lansezi pe tot orașul.** Bazinul de start e **un singur cartier + 2 Stații** — densitatea se fabrică prin îngustare, cum C o fabrica prin sincronizare.

**Primii 10 producători** se recrutează dintre cei care **fac deja drumul săptămânal**: cei cu liste de WhatsApp, cei din piețele volante, cei cu abonați tip „cutie". Argumentul de înrolare: „Drumul tău de miercuri rămâne la fel. Noi îți umplem mașina cu comenzi plătite în avans, îți facem încasarea și hârtiile și-ți aducem clienți noi. Primele 8 curse gratis, apoi 10 lei pe drum, fără comision." Ei aduc activul decisiv: **clienții lor existenți**, primii utilizatori cu comportament deja format.

**Primii 100 de consumatori:** ~40 migrați de pe listele producătorilor înrolați, ~30 din grupurile Facebook locale (postare-poveste, nu reclamă), ~30 din traficul fizic al Stațiilor partenere (afiș + QR la casă). **Primul ciclu funcțional:** 4 săptămâni consecutive în care cei 10 producători rulează fiecare cel puțin o cursă peste pragul de 8 comenzi, cu ridicare la Stație ≥95%. Abia apoi al doilea cartier; al doilea oraș abia după ce primul bazin își acoperă singur infrastructura.

## 8. Riscuri principale și contracarare

1. **Lichiditatea fără eveniment — riscul existențial.** C a câștigat runda 1 tocmai prin sincronizare; D o pierde la nivel de localitate și trebuie s-o recâștige la nivel de cursă. Contracarare: pragul public per cursă face din fiecare drum un mic eveniment cu termen și bară de progres; lansarea pe un singur cartier comprimă geografia; producătorii cu cerere proprie preexistentă aduc lichiditate „la pachet". **Onest:** sub ~300 de cumpărători activi în bazin, D arată mai mort decât C la 100 — paginile goale nu iartă. D cere marketing real și răbdare de 6–9 luni acolo unde C avea nevoie doar de un calendar; e prețul renunțării la eveniment.
2. **Costul transportului ucide coșurile mici.** 8–12 lei transport pe un coș de 50 lei înseamnă 20% — psihologic toxic. Contracarare: Stații în loc de livrare la ușă (cost la jumătate), minim de comandă 40 lei per producător, consolidarea coșului spre un singur producător, praguri care anulează drumurile neviabile. **Onest:** C avea logistică aproape gratuită; D nu va avea niciodată. Modelul exclude structural cumpărătura măruntă de 20 de lei — e o piață de coșuri, nu de legături de pătrunjel.
3. **Coșul multi-producător = două livrări, în zile diferite.** Orășeanul obișnuit cu Glovo poate percepe „miercuri și vineri" ca pe un defect. Contracarare: transparență totală înainte de acceptare (nimeni nu descoperă surpriza după plată), optimizarea AI spre coșuri mono-producător, aceeași Stație pentru ambele livrări. **Onest:** ne așteptăm ca majoritatea coșurilor viabile să fie mono-producător; coșul multi-seller e excepția tolerată, nu cazul de bază.
4. **Comunitatea se diluează în marketplace.** La 50.000 de utilizatori potențiali, chatul riscă să devină un magazin cu secțiune de comentarii. Contracarare structurală: Vatra doar pe cartiere, Stația ca micro-val săptămânal, relația recurentă cu producătorul, raportul de transparență per bazin. **Onest:** D va fi mereu mai puțin „sat" decât C; apărarea lui nu e vatra colectivă, ci mii de relații 1-la-1 producător–client — o comunitate de legături, nu de adunări.
5. **Promisiunea de livrare ruptă.** O cursă anulată după plată arde încrederea exact unde doare. Contracarare: banii stau în escrow la procesator până la confirmarea ridicării (refund automat la anulare), rating public de punctualitate, anulări repetate = suspendarea dreptului de a primi comenzi în avans. Invers, la neprezentarea cumpărătorului: coșul stă 2 ore la Gazdă, apoi devine coș suspendat donat, ca la C.

## 9. Fezabilitate România

**Legal:** identic cu C în esență — Legea 145/2014, atestat + carnet, vânzare strict directă producător→consumator, platforma intermediază informația și orchestrează plata prin procesator cu split (Stripe Connect / Netopia / PayU marketplace), fără a deveni comerciant. Specific lui D: transportul propriilor produse de către producător e parte firească a vânzării directe; Stațiile pe spațiu privat partener evită autorizările de domeniu public. **Atenție reală:** lactatele și carnea cer înregistrare DSVSA și lanț de frig pe drumul de 40 km — la început, categoriile animale se admit doar cu dotare verificată (lăzi frigorifice); altfel, legume, fructe, ouă, miere, conserve.

**Operațional:** matchingul continuu cere server permanent, dar rămâne ieftin — potrivirea e matematică pe date structurate (categorie, cantitate, preț, stație, zi), LLM-ul mic doar traduce limbajul natural la intrare și ieșire. Un fondator non-developer poate opera un bazin; Gazdele lucrează 4 ore/săptămână.

**Cultural:** orășeanul plătește online fără reticența ruralului (dispare problema cash-ului de la C); „ziua fixă a lui Ion" e un comportament dovedit ani de zile de Cutia Țăranului; pentru producător, „cursa" și „taxa pe drum" sunt concepte firești. Ce e nou cultural — și de validat în pilot — e disciplina promisiunii de livrare afișate public: o exigență pe care piața fizică nu i-a cerut-o niciodată producătorului român.

## 10. De ce acest model poate câștiga

**Ce pierde D față de „Ziua de Târg", spus fără menajamente:** ritualul colectiv (cel mai puternic activ al lui C), valul logistic unic cu cost aproape zero, AI-ul în rafale ieftine, cold-start-ul fără marketing și — poate cel mai important — anti-copiabilitatea: într-un bazin urban, jucătorii mari pot călca pe teren; în satul lui C nu aveau de ce.

**Ce câștigă:** un bazin de cerere de 20–30 de ori mai mare, exact unde nevoia e cea mai acută și plata online e reflex; comoditatea fără fereastra de 3 ore care la C excludea structural navetiști și părinți; coșuri mai mari; o economie care nu mai atârnă de un sponsor providențial, fiindcă veniturile ne-extractive se înmulțesc cu volumul de curse. Apărarea contra jucătorilor mari nu e geografia, ci ce nu pot ei replica: producători reali cu nume și zi de drum, zero comision, o relație care nu trece prin depozit.

**Argumentul de fond:** D nu abandonează descoperirea centrală a lui C — sincronizarea ca sursă de lichiditate — ci o mută de la nivelul localității la nivelul producătorului. Fiecare Cursă e un mic târg cu clopotul, pragul și termenul lui; piața e continuă doar la suprafață, dedesubt bate în ritmuri săptămânale fixe. Dacă C era târgul satului reconstruit în chat, D e celălalt obicei vechi al locului, la fel de fidel reconstruit: **drumul săptămânal al țăranului la oraș — dar plătit înainte de plecare.** Onest până la capăt: D e mai riscant decât C la pornire și mai valoros la maturitate; alegerea între ele e alegerea între satul de 10.000 și orașul de 200.000 — iar fondatorul a numit deja unde crede că e nevoia.

---

*Surse verificate: [Legea 145/2014 — Portal Legislativ](https://legislatie.just.ro/Public/DetaliiDocument/162616); [Cutia Țăranului — livrări săptămânale în zile fixe, Cluj-Napoca](https://cutiataranului.ro/destinatie/cluj-napoca/) și [introducerea pentru producători](https://cutiataranului.ro/introducere-pentru-tarani/); [tarife curierat România 2025 — e-packet.ro](https://e-packet.ro/blog/cat-costa-sa-trimiti-un-colet-prin-curier/) și [Cargus — cum se calculează tariful](https://www.cargus.ro/blog/cat-costa-sa-trimiti-un-colet-prin-curier-si-cum-se-face-calculul/).*
