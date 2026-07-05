/**
 * Telemetrie minimă (`track`) — cusătură introdusă devreme (plan §4).
 * Etapa 11: evenimentele se persistă în DB (`/api/track`, fire-and-forget) —
 * hrănesc pagina owner „Puls" (densitate + cele 5 ipoteze). Consola rămâne
 * pentru depanare; dacă rețeaua pică, UI-ul nu e blocat.
 */
export function track(event: string, props: Record<string, unknown> = {}): void {
  if (typeof console !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug(`[track] ${event}`, props);
  }
  if (typeof window !== "undefined") {
    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: event, props }),
      keepalive: true, // supraviețuiește navigării (ex. track chiar înainte de redirect)
    }).catch(() => {});
  }
}
