import Link from "next/link";
import { db } from "@/lib/db";
import { haversineKm } from "@/lib/geo";
import { Icon } from "@/components/ui/Icon";
import { ArtifactCard, Chip } from "@/components/ui/primitives";

/**
 * Oferte proaspete din bazinul tău (Etapa 2) — server-backed (Prisma/SQLite).
 * Demonstrează modelul de date + filtrarea pe rază: două adrese (București vs
 * Cluj) văd oferte diferite, iar un producător în afara razei (~45 km) nu apare.
 */
export default async function BazinPage({
  searchParams,
}: {
  searchParams: Promise<{ addr?: string; all?: string }>;
}) {
  const sp = await searchParams;
  const addr = sp.addr === "cluj" ? "cluj" : "buc";
  const showAll = sp.all === "1";
  const consumerId = addr === "cluj" ? "c-ana" : "c-silviu";

  const consumer = await db.consumer.findUnique({ where: { id: consumerId }, include: { city: true } });
  const producers = await db.producer.findMany({ include: { offers: true, city: true } });

  const radius = consumer?.city.radiusKm ?? 45;
  const withDist = producers
    .map((p) => ({ p, dist: consumer ? haversineKm(consumer.lat, consumer.lng, p.lat, p.lng) : Infinity }))
    .sort((a, b) => a.dist - b.dist);

  const inRange = withDist.filter((x) => x.dist <= radius);
  const outRange = withDist.filter((x) => x.dist > radius);
  const offerCount = inRange.reduce((s, x) => s + x.p.offers.length, 0);

  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="w-full max-w-phone relative min-h-dvh flex flex-col bg-background">
        <header className="fixed top-0 z-40 w-full max-w-phone bg-background/85 backdrop-blur-md border-b border-card-border">
          <div className="h-[60px] px-md flex items-center justify-between">
            <div className="flex items-center gap-base min-w-0">
              <Icon name="storefront" className="text-primary" size={24} filled />
              <div className="min-w-0">
                <h1 className="text-[16px] font-semibold text-on-surface leading-tight truncate">Oferte în bazinul tău</h1>
                <p className="text-[11px] text-on-surface-variant leading-tight truncate">rază {radius} km de la adresă</p>
              </div>
            </div>
            <Link href="/" className="text-[12px] font-medium text-primary flex items-center gap-0.5">
              <Icon name="arrow_back" size={16} /> Chat
            </Link>
          </div>
        </header>

        <main className="flex-1 pt-[60px] pb-lg px-md">
          {/* adresa activă (comutarea buc/cluj = test de rază, mutat în /demo, #39) */}
          {consumer && (
            <p className="mt-md text-[12px] text-on-surface-variant flex items-center gap-1">
              <Icon name="location_on" size={14} className="text-primary" />
              {consumer.address}
            </p>
          )}

          {/* rezumat */}
          <p className="mt-md text-[14px] text-on-surface">
            <span className="font-semibold text-primary">{inRange.length} producători</span> ·{" "}
            <span className="font-semibold">{offerCount} oferte</span> în bazinul tău
          </p>

          {/* producători în rază (card clickabil → profil public cu istoric + punctualitate) */}
          <div className="mt-sm space-y-2">
            {inRange.map(({ p, dist }) => (
              <Link key={p.id} href={`/ferma/${p.id}`}>
                <ArtifactCard className="p-sm">
                  <div className="flex items-center gap-sm">
                    <span className="w-10 h-10 rounded bg-surface-container grid place-items-center text-[20px] shrink-0">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-on-surface truncate">{p.name}</p>
                      <p className="text-[12px] text-on-surface-variant">
                        {Math.round(dist)} km · livrare {p.offers[0]?.deliveryDay ?? "—"}
                      </p>
                    </div>
                    {p.punctuality >= 95 && (
                      <Chip tone="green" icon="schedule">
                        {p.punctuality}%
                      </Chip>
                    )}
                    <Icon name="chevron_right" size={20} className="text-outline shrink-0" />
                  </div>
                  <div className="mt-2 pt-2 border-t border-card-border space-y-1">
                    {p.offers.map((o) => (
                      <div key={o.id} className="flex items-center gap-2 text-[13px]">
                        <span aria-hidden="true">{o.emoji}</span>
                        <span className="flex-1 text-on-surface">{o.productName}</span>
                        <span className="text-on-surface font-medium whitespace-nowrap">
                          {o.price} lei/{o.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </ArtifactCard>
              </Link>
            ))}
          </div>

          {/* în afara razei */}
          {outRange.length > 0 && (
            <div className="mt-md">
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-on-surface-variant">
                  {outRange.length} {outRange.length === 1 ? "producător nu apare" : "producători nu apar"} (în afara razei)
                </p>
                <Link
                  href={`/bazin?addr=${addr}${showAll ? "" : "&all=1"}`}
                  className="text-[12px] font-semibold text-primary"
                >
                  {showAll ? "Ascunde" : "Arată"}
                </Link>
              </div>
              {showAll && (
                <div className="mt-2 space-y-2 opacity-60">
                  {outRange.map(({ p, dist }) => (
                    <div key={p.id} className="bg-card border border-dashed border-card-border rounded-card p-sm flex items-center gap-sm">
                      <span className="w-9 h-9 rounded bg-surface-container grid place-items-center text-[18px] shrink-0">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-on-surface truncate">{p.name}</p>
                        <p className="text-[12px] text-error">
                          {Math.round(dist)} km · în afara razei de {radius} km
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* pas următor — fără fund de sac (#40): vitrina te întoarce mereu în chat */}
          <Link
            href="/"
            className="mt-md flex items-center justify-center gap-1.5 h-12 rounded bg-primary text-on-primary text-[15px] font-semibold shadow-art active:scale-[0.98] transition-transform"
          >
            <Icon name="chat_bubble" size={18} />
            Nu găsești ceva? Cere în chat
          </Link>
        </main>
      </div>
    </div>
  );
}
