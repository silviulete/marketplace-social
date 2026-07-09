# Ghid de deploy — Piața Continuă pe internet (Etapa 11)

> Ghid pas-cu-pas pentru publicarea pilotului. Nu cere cunoștințe de programare —
> doar conturi (gratuite la scara pilotului) și copiere de valori. Unde scrie
> „terminal", înseamnă PowerShell deschis în folderul `app/`.
> Plățile rămân SIMULATE în pilot (decizia #4) — nu se leagă niciun ban real.

## Ce îți trebuie (toate gratuite la început)

| Cont | Pentru ce | Unde |
|---|---|---|
| **Vercel** | găzduirea aplicației (UI + API + cron) | vercel.com — înregistrare cu email |
| **Neon** | baza de date Postgres | neon.tech — înregistrare cu email |
| **Google AI Studio** | cheia pentru Gemma (AI-ul din chat) | aistudio.google.com/apikey |
| *(mai târziu)* Resend | emailurile de notificare | resend.com — abia când activăm notificările reale |

## Pasul 1 — Baza de date (Neon)

1. Intră pe **neon.tech** → „New project" → nume: `piata-continua`, regiune: **Frankfurt (eu-central-1)**.
2. După creare, apasă **„Connect"** și copiază șirul care începe cu `postgresql://...`
   — acesta e **DATABASE_URL**. Păstrează-l într-un loc sigur.

## Pasul 2 — Cheia AI (Google AI Studio)

1. Intră pe **aistudio.google.com/apikey** → „Create API key".
2. Copiază cheia — acesta e **GOOGLE_AI_API_KEY**.

## Pasul 3 — Pregătește baza de date (o singură dată, din terminal)

```powershell
# în folderul app/
npm run pg:on                      # comută schema pe Postgres
$env:DATABASE_URL = "postgresql://...(șirul de la Neon)..."
npx prisma db push                 # creează tabelele în Neon
npm run db:seed                    # populează datele demo (2 bazine, producători)
```

## Pasul 4 — Publică pe Vercel (din terminal)

```powershell
# tot în app/
npx vercel login                   # deschide browserul, loghează-te
npx vercel                         # răspunde cu Enter la întrebări (nume: piata-continua)
```

Apoi, în **vercel.com → proiectul tău → Settings → Environment Variables**, adaugă:

| Nume | Valoare |
|---|---|
| `DATABASE_URL` | șirul de la Neon (Pasul 1) |
| `NEXT_PUBLIC_MODEL_PROVIDER` | `cloud` |
| `GOOGLE_AI_API_KEY` | cheia de la Pasul 2 |
| `AI_MODEL` | `gemini-flash-lite-latest` |
| `CRON_SECRET` | un șir lung inventat de tine (ex. 30+ caractere amestecate) |

La final rulează **`npx vercel --prod`** — primești adresa publică (ex. `piata-continua.vercel.app`).

## Pasul 5 — Cron-ul (termenele Cursei)

`vercel.json` apelează **`/api/tick` o dată pe zi** (06:00 UTC) — închide Cursele
la cutoff, expiră comenzile neatinse, marchează livrările. **De ce o dată pe zi:**
planul gratuit **Hobby** permite cron doar zilnic (nu mai des). E suficient pentru
pilotul mic; termenele se procesează la următoarea rulare.
*Pentru cadență mai strânsă (la 5-10 min), fără Pro: orice mașină/serviciu poate
apela periodic `curl -H "Authorization: Bearer CRON_SECRET" https://adresa-ta/api/tick`
(ex. un workflow GitHub Actions sau cron-job.org). #41b.*

## Pasul 6 — Verificarea de după publicare (pe telefon)

1. Deschide adresa publică pe telefon → chatul se încarcă, scrii o cerere → AI-ul răspunde (acum prin Gemma).
2. **Instalează aplicația**: Android/Chrome → „Adaugă pe ecranul principal"; iPhone/Safari → Share → „Add to Home Screen". Apare iconița verde cu vlăstar.
3. `adresa-ta/puls` → pagina owner cu densitatea și ipotezele.
4. `adresa-ta/api/tick` în browser → trebuie să răspundă `401` (secretul te protejează — e semn bun).
5. Profil → „Spune-ne" → trimite un mesaj de test → apare în `/puls`.

## Testul de concurență (recomandat înainte de pilot, pe Postgres)

```powershell
# cu DATABASE_URL setat pe Neon și serverul local pornit (npm run dev):
npm run test:concurrency
```
Trebuie să vezi `5/5 asserturi trecute ✓` — „comandă la milisecunda închiderii" e sigură.

## Înapoi la lucrul local (după deploy)

```powershell
npm run pg:off                     # schema înapoi pe SQLite
npx prisma generate
```

## Dacă ceva nu merge

- **Build eșuat pe Vercel** → vezi tab-ul „Deployments" → click pe build → citește ultima linie roșie; de regulă lipsește o variabilă de mediu.
- **Chatul nu extrage produse** → verifică `GOOGLE_AI_API_KEY` în Vercel; fără cheie aplicația cade elegant pe extractorul determinist (tot funcționează).
- **Cursele nu se închid** → Vercel → Cron Jobs → vezi ultima rulare a `/api/tick`.
- Orice altceva: spune-mi și investighez cu tine.
