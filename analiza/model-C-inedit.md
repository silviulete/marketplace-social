# Model C — „Ziua de Târg": piața care trăiește trei ore pe săptămână

## 1. Numele modelului + esența în 3 fraze

**Ziua de Târg** este o piață care nu există ca magazin permanent, ci ca un **eveniment săptămânal de trei ore, în chat**, orchestrat de un agent AI numit „Crainicul" — exact cum satele și orașele românești au avut sute de ani ziua lor de târg, joia sau duminica. Toată oferta și toată cererea unei localități sunt comprimate în aceeași fereastră de timp, iar toată logistica într-un singur „val" de ridicare, sâmbăta, la un punct fix administrat de un om din comunitate — Vornicul. Modelul transformă cea mai mare slăbiciune a oricărei platforme hiper-locale — puțini oameni, volume mici — în avantajul ei central: densitate, viață, vânzare rapidă și costuri de operare aproape de zero.

## 2. Problema reală pe care o rezolvă

În România, piața agroalimentară clasică rămâne canalul principal pentru legume și fructe românești — peste 50% din producție, circa 2,3 milioane de tone pe an, se vinde în piețe (Business Magazin). Dar pentru micul producător, piața fizică e tot mai puțin viabilă: o zi întreagă pierdută la tarabă (adesea la 30–60 km de casă), taxe zilnice de 15–30 de lei, vânzare incertă, marfă rămasă nevândută. Episoade ca închiderea piețelor din pandemie sau desființarea unor piețe de cartier au erodat și mai mult acest canal. Alternativele sunt rele: samsarul care cumpără la poarta fermei la jumătate de preț, sau supermarketul care cere calibru perfect și plătește la 30–90 de zile — imposibil pentru cineva care trăiește din banii de săptămâna asta.

Cadrul legal există: Legea 145/2014 dă persoanei fizice **atestatul de producător** și **carnetul de comercializare**, cu care își poate vinde legal propriile produse, en-gros sau cu amănuntul. Problema nu e dreptul de a vinde, ci **costul vânzării**: timpul, transportul, incertitudinea.

Pe partea cealaltă, cererea există și ea, dar e dezorganizată. Grupurile de Facebook „produse locale din X" au mii de membri și zero infrastructură: anunțuri îngropate în feed, fără plată, fără livrare, fără garanții — comerț de tip „dau mesaj și poate răspunde cineva". Iar modelul ASAT (agricultura susținută de comunitate, pornit la Timișoara în 2008 după modelul CSA) demonstrează că orășenii plătesc pentru legătura directă cu un țăran, dar cere angajament pe un sezon întreg plătit în avans — o barieră care îl ține de nișă.

Diagnosticul acestui model: **nu lipsește nici oferta, nici cererea — lipsește sincronizarea lor.** Un moment și un loc în care toți vin deodată. Exact asta era funcția economică a zilei de târg, instituție care a organizat comerțul românesc secole la rând. Modelul C o reconstruiește digital, în chat.

## 3. Propunerea de valoare per actor

**Producătorul:** vinde în 3 ore, de acasă, în loc de o zi pierdută la tarabă. Mai important: vinde **înainte să recolteze** — joi seara știe exact ce s-a plătit, vineri pregătește doar atât, sâmbătă predă totul într-o oră. Risipă aproape zero, bani garantați în câteva zile, taxă fixă de 10 lei pe târg (nu comision procentual — dacă vinde mai mult, câștigul e integral al lui).

**Consumatorul:** gratuit, și nu e o corvoadă, ci o experiență: miercuri seara citește „Foaia de Târg", joi seara cumpără în chat, în direct, alături de vecini, sâmbătă ridică coșul în 10 minute, lângă casă. Preț corect, fără intermediari, cu chipul și numele producătorului pe fiecare produs.

**Ownerul / comunitatea:** un model pe care îl pot opera 1–2 oameni plus AI ieftin, în care fiecare localitate se autofinanțează, iar surplusul rămâne în „fondul târgului" local. Nu profit maxim, ci infrastructură comunitară care nu costă comunitatea nimic.

**Actor nou — Vornicul:** un om din localitate (numele vine de la vornicelul care organizează nunțile — gospodarul de încredere) care găzduiește punctul de ridicare de sâmbătă. Câștigă ~100 lei pe târg plus jumătate din „rotunjirile" voluntare ale cumpărătorilor — bani corecți pentru ~3 ore pe săptămână, în mediul rural. El e fața umană a platformei și primul ei agent de vânzări local.

## 4. Cum funcționează: fluxul complet prin chat

Patru agenți AI, fiecare cu un rol clar, toate rulând pe modele mici și ieftine (Gemma local), pentru că sarcina e concentrată în câteva ore pe săptămână:

- **Crainicul** — orchestratorul ritualului: calendar, deschidere, închidere, anunțuri live.
- **Taraba** — agentul de ofertă: stă de vorbă cu fiecare producător, îi structurează oferta.
- **Socoteala** — coșul, plata, împărțirea banilor, reconcilierea.
- **Vatra** — viața comunității între târguri.

**Luni–miercuri: strigările.** Producătorul scrie Tarabei, în limbaj natural: „am vreo 30 kg de roșii, 8 lei kilu', și niște zacuscă". Taraba cere ce lipsește: o poză, cantitatea exactă, ziua recoltei. Miercuri la 19:00, Crainicul publică **Foaia de Târg** — catalogul târgului de a doua zi. Consumatorii pot pune întrebări și pot **rezerva cel mult 50% din stocul unei oferte** (ca să nu rateze fereastra de joi, dar fără să golească târgul înainte să înceapă).

**Joi, 19:00–22:00: clopotul.** Crainicul deschide târgul în chatul localității. Tot ce nu e rezervat e la liber. Cumpărătorul scrie natural: „vreau ceva pentru o ciorbă și niște ouă" — Socoteala compune coșul din mai multe tarabe și propune soluții complete sau parțiale. Crainicul ține târgul viu: „Au mai rămas 6 borcane de zacuscă la Maria din Deal". La 21:30 — **Coșul de Seară**: ce nu s-a vândut intră la preț redus (producătorul își setează dinainte limita), iar AI-ul propune pachete de lichidare, exact ca negocierea de la ora închiderii în piața adevărată.

**Joi, 22:00: închiderea și plata.** Fiecare cumpărător primește **un singur link de plată** pentru tot coșul, indiferent de la câți producători a cumpărat. Banii intră la procesatorul de plăți (nu la platformă — detaliu legal esențial, vezi secțiunea 9).

**Vineri:** fiecare producător primește lista finală — doar ce e plătit. Recoltează și pregătește fix atât.

**Sâmbătă, 10:00–12:00: valul.** Toți producătorii aduc lăzile la punctul Vornicului (curtea unei brutării partenere, căminul cultural, curtea bisericii). Cumpărătorii vin cu codul de ridicare din chat; Socoteala bifează predările. Confirmarea ridicării declanșează plata către producători, luni — exact ritmul săptămânal de plăți din viziunea fondatorului.

**Între târguri:** comerțul e închis — nu se vinde nimic. Vatra ține chatul cald: rețete din ce s-a vândut joi, vești din grădini, și întrebarea „ce v-ar trebui joia viitoare?", al cărei rezultat ajunge la producători ca semnal de cerere. Cererea informează oferta, dar nu pornește tranzacții — asta deosebește structural modelul de o piață inversă.

## 5. Mecanismul de comunitate + dimensiunea hiper-locală

Argumentul economic central: **sincronizare în timp × concentrare în spațiu = lichiditate.** O sută de cumpărători răspândiți pe 7 zile și 3 comune înseamnă o piață moartă: nimeni nu vede pe nimeni, producătorul nu știe cât să recolteze, rafturile par goale. Aceiași o sută de oameni, în aceleași 3 ore, în aceeași comună, înseamnă un târg viu: stoc care scade la vedere, dovadă socială („vecina mea cumpără de la Ion de ani de zile"), conversație, chiar puțină febră a momentului. Lichiditatea nu se cumpără cu marketing — se obține cu un calendar și un clopot.

Hiper-localul mai face posibil un lucru decisiv: **valul logistic unic.** Un singur punct de ridicare la sub 10 minute de toată lumea reduce costul logistic la practic zero — prin comparație, un curier costă 15–20 lei pe colet, ceea ce ucide economic orice coș de 50–70 de lei. La scară de județ, modelul ăsta e imposibil; la scară de comună, e banal. Modelul devine **mai bun cu cât teritoriul e mai mic** — exact invers decât platformele clasice.

Comunitatea nu e un slogan, ci mecanică: chatul târgului e al localității, cumpărăturile vecinilor sunt vizibile (opt-in), Vornicul e un vecin, nu un call-center. Iar „coșul suspendat" — poți plăti un coș pentru o familie nevoiașă indicată de Vornic sau de parohie — transformă târgul într-o instituție, nu într-o aplicație.

## 6. Modelul economic

Ipoteză de lucru: o comună periurbană sau un oraș mic de 8.000–15.000 de locuitori. La maturitate locală (luna 4–6): 12 producători activi, 70 de coșuri pe târg, coș mediu 65 lei → **GMV ≈ 4.550 lei/târg ≈ 18.200 lei/lună** care curg către producători locali (~1.500 lei/lună în plus pentru fiecare — semnificativ pentru o gospodărie rurală).

**Venituri platformă, pe lună, per localitate (~1.420 lei):**
- **Taxa de tarabă:** 10 lei × 12 producători × 4 târguri = **480 lei**. E echivalentul cultural al taxei din piața fizică, dar mai mică și fără ziua pierdută. Fixă, nu procentuală: câștigul producătorului crește, taxa nu. Primele 4 târguri sunt gratuite pentru orice producător nou.
- **Rotunjirea de târg:** la plată, opțional: „susții târgul cu 2–4 lei?" — cu transparență totală: jumătate la Vornic, jumătate la fondul târgului. La ~40% acceptare: ≈ **340 lei**.
- **Foaia de Târg susținută de…:** un singur sponsor local pe săptămână (brutăria, magazinul agricol, pensiunea) — 150 lei/săptămână = **600 lei**. Vizibilitate reală, în fața exactă a clienților lui.

**Costuri, pe lună, per localitate (~915 lei):**
- Vornicul: 100 lei/târg = **400 lei** (plus ~170 lei din rotunjiri).
- Procesarea plăților: ~2% din GMV ≈ **365 lei**.
- Infrastructură AI + server: ~**150 lei** — ieftină tocmai pentru că piața e un eveniment, nu un serviciu non-stop: inferența rulează câteva ore pe săptămână, pe modele mici.

**Surplus: ~500 lei/lună**, vărsat în **fondul târgului**: lăzi, cântar, prelată, tipărirea Foii pentru avizierul din centru. **Pragul de viabilitate: ~8 producători și ~45 de coșuri pe târg.**

De ce e corect așa: producătorul plătește puțin și fix (taxa de tarabă e un concept pe care îl înțelege și îl acceptă de o viață), consumatorul nu plătește nimic obligatoriu, sponsorul plătește pentru valoare reală, iar ownerul nu extrage procent din munca nimănui. Scalarea e prin replicare de ritual: 20 de localități generează ~10.000 lei/lună surplus agregat — salariul omului care deschide următoarele târguri, nu dividende.

## 7. Cold-start: prima localitate

**Săptămânile 0–2 — alegerea și Vornicul.** Criterii de selecție: primărie cooperantă, grup local de Facebook cu peste 3.000 de membri, minimum 15 atestate de producător în evidența primăriei, un partener pentru punctul de ridicare. Vornicul se recrutează **înaintea oricărui producător** — el e cel care îi aduce, pentru că îi cunoaște.

**Primii 10 producători** — vizită fizică, nu mesaj. Oferta în trei propoziții: „Vinzi de acasă, în 3 ore, ce-ai vândut deja înainte să recoltezi. Sâmbătă aduci lăzile la X, într-o oră ai terminat. Primele 4 târguri gratis." Mixul țintă, gândit anti-sezonier: 4 legumicultori, 1 cu ouă, 1 cu lactate (cu înregistrare DSVSA), 1 cu miere, 1 cu pâine/patiserie, 2 cu fructe și conserve.

**Târgurile 1–2 = exact MVP-ul fondatorului:** „târguri de probă" cu oferte fictive de legume și plăți simulate. Comunitatea învață ritualul fără niciun risc, agenții AI sunt testați pe conversații reale, iar Crainicul anunță deschis: „Joia viitoare, pe bune."

**Primii 100 de consumatori:** o postare-poveste în grupul de Facebook al localității („se întoarce ziua de târg"), afiș cu cod QR la biserică, școală și magazinul din centru, Foaia de Târg tipărită la avizier. Ținte: 30 de coșuri la primul târg real, 50 la al patrulea, 70 în luna a treia.

**Primul ciclu funcțional** = 6 târguri consecutive cu minimum 8 producători și 40 de coșuri. Abia după acest prag se discută a doua localitate.

## 8. Riscuri principale și contracarare

1. **Ritualul nu prinde — oamenii ratează fereastra de 3 ore.** Contracarare în straturi: rezervarea de miercuri (max. 50% din stoc) lasă o supapă celor ocupați fără să golească târgul; Crainicul trimite memento personalizat („joia trecută ai luat ouă de la Ion"); iar dacă după 8 târguri media e sub 30 de coșuri, fereastra se mută prin votul chatului — poate acolo ziua corectă e duminica după biserică, nu joia seara.
2. **Lichiditate subțire iarna și în golurile de sezon.** De aceea mixul de recrutare include ancore non-sezoniere (ouă, lactate, miere, pâine, murături, conserve). Regulă dură: târgul se ține doar cu minimum 5 tarabe — altfel Crainicul anunță transparent „săptămâna asta târgul stă". Mai bine un târg rar și viu decât unul des și mort: un eveniment poate sări o săptămână fără să moară; un magazin gol moare.
3. **Neprezentarea la ridicare.** Banii sunt încasați de joi, deci riscul financiar e nul. Coșul neridicat stă 2 ore la Vornic, apoi devine „coș suspendat" donat. Două neridicări consecutive = utilizatorul trece pe regim „ridici întâi, apoi rezervi".
4. **Ocolirea platformei — relația continuă pe WhatsApp.** Taxa fixă elimină motivul clasic al ocolirii (nu există comision de evitat). Valoarea reală — valul logistic, plata garantată, Foaia de Târg, clienții noi din fiecare joi — nu poate fi replicată bilateral. Iar filosofic: dacă doi vecini ajung să-și vândă direct, misiunea comunitară e împlinită, nu trădată; istoric însă, taraba din târg aduce mereu clienți noi pe care relația bilaterală nu-i aduce niciodată.
5. **Riscul legal-fiscal pe fluxul de bani.** Platforma nu atinge banii: un procesator cu split de plăți (Stripe Connect sau soluțiile marketplace Netopia/PayU) ține banii și îi împarte automat — platforma facturează doar taxa de tarabă și sponsorizarea, fără să aibă nevoie de licență de instituție de plată. Atestatul de producător se verifică la onboarding (număr + fotografie, confirmabil la primărie).

## 9. Fezabilitate România

**Legal.** Legea 145/2014 permite persoanei fizice cu atestat de producător și carnet de comercializare să-și vândă propriile produse cu amănuntul; vânzarea în model rămâne strict directă, producător → consumator — platforma intermediază informația și orchestrează plata prin procesator, nu cumpără și nu revinde (esențial pentru a nu deveni comerciant). Punctul de ridicare pe spațiu privat partener evită autorizările de domeniu public; o primărie care oferă căminul cultural e un bonus, nu o condiție. Produsele de origine animală cer înregistrare DSVSA — filtrare pe categorii la onboarding. Cum primăriile raportează atestatele către ANAF, platforma poate chiar ajuta producătorul: export lunar al vânzărilor, gata de trecut în carnetul de comercializare.

**Operațional.** Un fondator plus Vornici locali; AI pe modele mici (Gemma rulat local pentru Taraba și Vatra, eventual un model ieftin prin API pentru Socoteala), cu sarcină concentrată în câteva ore pe săptămână — costuri de inferență minime prin însăși natura modelului. Chatul: o aplicație web minimalistă; punte spre WhatsApp posibilă ulterior.

**Cultural.** „Ziua de târg" nu trebuie explicată nimănui în România — e memorie vie, nu concept de pitch deck. Joia 19:00–22:00 se potrivește ritmului navetiștilor; „Crainicul", „Foaia de Târg", „Vornicul" sunt cuvinte care sună a acasă, nu a Silicon Valley. Reticența rurală la plata online se tratează cu opțiunea tranzitorie „plata la Vornic" (cash la ridicare, înregistrată de Socoteală), cu migrare blândă spre link în 2–3 luni.

## 10. De ce acest model poate câștiga

Argumentul cel mai puternic: **rezolvă prin design, nu prin bani, singura problemă care omoară toate platformele hiper-locale — lichiditatea.** Orice marketplace permanent într-o comună de 10.000 de oameni e condamnat aritmetic: prea puțini utilizatori în orice moment dat, deci rafturi care par goale, deci nimeni nu se întoarce. O piață inversă trebuie să spere că cererea și oferta se nimeresc în timp; o cooperativă trebuie să cumpere angajament cu birocrație de membru. Ziua de Târg nu are nevoie de mulți oameni — are nevoie de **aceiași puțini oameni în același moment**, iar asta se obține cu un calendar, un clopot și un obicei vechi de secole, gratis. Formatul de eveniment face AI-ul ieftin (ore de inferență, nu serviciu permanent), logistica aproape gratuită (un singur val pe săptămână) și marketingul inutil (ritualul e retenția). Și pentru că modelul devine mai valoros cu cât localitatea e mai mică, niciun jucător mare nu are de ce să-l copieze — terenul lui de joc e exact terenul pe care giganții nu pot și nu vor să calce.

---

*Surse verificate: [Legea 145/2014 — Portal Legislativ](https://legislatie.just.ro/Public/DetaliiDocument/162616); [Business Magazin — peste 50% din legume-fructe se vând în piețe](https://www.businessmagazin.ro/actualitate/scandalul-inchiderii-pietelor-agroalimentare-peste-50-din-productia-19737197); [CRIES — Agricultura susținută de comunitate / ASAT](https://cries.ro/agricultura-sustinuta-de-comunitate/).*
