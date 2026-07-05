/**
 * Istoricul public al producătorului (Etapa 9 — încredere minimă).
 *
 * Ratingul de **punctualitate** e real (câmpul `Producer.punctuality` din DB) —
 * % de onorare a promisiunii de livrare. Istoricul de **4 Curse** e demo derivat
 * determinist din producător (dată, zi, nr. comenzi, la timp / întârziat), astfel
 * încât profilul să arate viu fără a semăna DB-ul cu Curse istorice.
 */
export interface CursaHistory {
  date: string; // „7 iun"
  deliveryDay: string; // „Joi"
  orders: number; // comenzi livrate în Cursa aceea
  onTime: boolean; // promisiunea de livrare onorată la timp
}

const DATES = ["7 iun", "31 mai", "24 mai", "17 mai"]; // 4 Curse recente

export function buildHistory(producer: { name: string; punctuality: number; deliveryDay: string }): CursaHistory[] {
  // câte din cele 4 Curse au fost la timp, în funcție de rating (cele vechi întârzie)
  const onTimeCount = producer.punctuality >= 96 ? 4 : producer.punctuality >= 93 ? 3 : 2;
  return DATES.map((date, i) => ({
    date,
    deliveryDay: producer.deliveryDay,
    orders: 8 + ((i * 3 + producer.name.length) % 7), // 8–14, determinist
    onTime: i < onTimeCount, // i=0 = cea mai recentă → onorată
  }));
}
