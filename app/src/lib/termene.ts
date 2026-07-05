/**
 * Termene reale din etichetele Cursei (Etapa 11, #42).
 * Etichetele rămân sursa afișată („marți, 12:00", „Joi"); aici derivăm
 * momentul calendaristic următor, pe care îl execută `/api/tick`.
 * Etichetă neînțeleasă → null (tick-ul o ignoră; nimic nu se strică).
 */

const DAYS = ["duminica", "luni", "marti", "miercuri", "joi", "vineri", "sambata"];

const strip = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/î/g, "i"); // î nu se descompune ca celelalte diacritice

/**
 * Următoarea apariție a zilei (+ orei) din etichetă, strict după `from`.
 * Ex.: „marți, 12:00" → marțea viitoare la 12:00; „Joi" → joia viitoare la ora fallback.
 */
export function nextOccurrence(label: string, fallbackTime = "12:00", from = new Date()): Date | null {
  const text = strip(label);
  const dayIdx = DAYS.findIndex((d) => text.includes(d));
  if (dayIdx === -1) return null;

  const m = text.match(/(\d{1,2})[:.](\d{2})/);
  const [h, min] = m ? [Number(m[1]), Number(m[2])] : fallbackTime.split(":").map(Number);

  const d = new Date(from);
  d.setHours(h, min, 0, 0);
  let delta = (dayIdx - d.getDay() + 7) % 7;
  if (delta === 0 && d <= from) delta = 7;
  d.setDate(d.getDate() + delta);
  return d;
}
