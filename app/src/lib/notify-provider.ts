/**
 * Cusătura `NotifyProvider` (Etapa 11, decizia #41) — notificările critice
 * (deschiderea/închiderea Cursei, ziua livrării) merg pe **email întâi**,
 * fiindcă push-ul PWA e nesigur pe iOS (plan §11).
 *
 * Acum: provider simulat (server-side) — scrie un eveniment `notify.sent` în DB
 * (vizibil la depanare) + log. La deploy: Resend/Brevo în spatele aceleiași
 * interfețe, comutat prin `NOTIFY_PROVIDER=resend` + cheia lui — fără a schimba
 * apelantul. SMS-ul se adaugă doar dacă pilotul arată că emailul nu e citit la timp.
 */
import { db } from "./db";

export interface Notification {
  to: string; // adresă de email (la pilot)
  subject: string;
  body: string;
}

export interface NotifyProvider {
  name: string;
  send(n: Notification): Promise<void>;
}

/** Simulat: nimic nu pleacă în lume; se vede în DB (Event `notify.sent`) + consolă. */
export const simulatedNotifyProvider: NotifyProvider = {
  name: "simulated",
  async send(n: Notification) {
    // eslint-disable-next-line no-console
    console.debug(`[notify] către ${n.to}: ${n.subject}`);
    await db.event.create({
      data: { name: "notify.sent", props: JSON.stringify({ channel: "email", to: n.to, subject: n.subject }) },
    });
  },
};

/** Selectorul de provider — Resend/Brevo la deploy, prin variabilă de mediu. */
export function getNotifyProvider(): NotifyProvider {
  return simulatedNotifyProvider;
}
