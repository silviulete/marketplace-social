import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { buildHistory } from "@/lib/producer-history";
import { Icon } from "@/components/ui/Icon";
import { ArtifactCard, Button, Chip } from "@/components/ui/primitives";

/**
 * Profilul public al producătorului (Etapa 9 — încredere minimă): rating de
 * punctualitate a promisiunii de livrare + istoric de 4 Curse + ce oferă acum.
 * (Vatra/chat de cartier + raportul de transparență = post-pilot.)
 */
export default async function FermaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const producer = await db.producer.findUnique({ where: { id }, include: { offers: true } });
  if (!producer) notFound();

  const history = buildHistory({
    name: producer.name,
    punctuality: producer.punctuality,
    deliveryDay: producer.offers[0]?.deliveryDay ?? "Joi",
  });
  const onTime = history.filter((h) => h.onTime).length;
  const good = producer.punctuality >= 95;

  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="w-full max-w-phone relative min-h-dvh flex flex-col bg-background">
        <header className="fixed top-0 z-40 w-full max-w-phone bg-background/85 backdrop-blur-md border-b border-card-border">
          <div className="h-[60px] px-md flex items-center justify-between">
            <div className="flex items-center gap-base min-w-0">
              <Icon name="verified_user" className="text-primary" size={24} filled />
              <div className="min-w-0">
                <h1 className="text-[16px] font-semibold text-on-surface leading-tight truncate">Profil producător</h1>
                <p className="text-[11px] text-on-surface-variant leading-tight truncate">încredere · istoric public</p>
              </div>
            </div>
            <Link href="/bazin" className="text-[12px] font-medium text-primary flex items-center gap-0.5">
              <Icon name="arrow_back" size={16} /> Bazin
            </Link>
          </div>
        </header>

        <main className="flex-1 pt-[60px] pb-lg px-md">
          {/* antet producător */}
          <section className="mt-md flex items-center gap-md">
            <span className="w-16 h-16 rounded-pill bg-chip-bg grid place-items-center text-[30px] shrink-0">{producer.emoji}</span>
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold text-on-surface truncate">{producer.name}</h2>
              <p className="text-[13px] text-on-surface-variant">{producer.owner}</p>
              <p className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                <Icon name="local_shipping" size={13} className="text-primary" />
                livrează {producer.offers[0]?.deliveryDay ?? "—"}
              </p>
            </div>
          </section>

          {/* ratingul de punctualitate (hero) */}
          <section className={`mt-md rounded-card p-md ${good ? "bg-chip-bg" : "bg-surface-container"}`}>
            <div className="flex items-center gap-sm">
              <Icon name="schedule" size={28} className="text-primary" filled />
              <div className="flex-1">
                <p className="text-[32px] font-semibold text-primary leading-none">{producer.punctuality}%</p>
                <p className="text-[13px] text-on-surface mt-1">livrări la timp (promisiunea onorată)</p>
              </div>
              {good && (
                <Chip tone="green" icon="verified">
                  de încredere
                </Chip>
              )}
            </div>
            <p className="mt-2 text-[12px] text-on-surface-variant">
              În ultimele 4 Curse: <span className="font-semibold text-on-surface">{onTime} din 4</span> livrate la timp.
              Ratingul crește când onorezi promisiunea de livrare.
            </p>
          </section>

          {/* istoric de Curse */}
          <section className="mt-lg space-y-sm">
            <h3 className="text-label-md uppercase text-on-surface-variant px-1">Istoric Curse</h3>
            {history.map((h, i) => (
              <ArtifactCard key={i} className="p-sm">
                <div className="flex items-center gap-sm">
                  <span className="w-10 h-10 rounded bg-surface-container grid place-items-center shrink-0">
                    <Icon name="event_available" size={20} className="text-primary" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-on-surface">Cursa de {h.deliveryDay.toLowerCase()} · {h.date}</p>
                    <p className="text-[12px] text-on-surface-variant">{h.orders} comenzi livrate</p>
                  </div>
                  {h.onTime ? (
                    <Chip tone="green" icon="check_circle">
                      la timp
                    </Chip>
                  ) : (
                    <Chip icon="schedule">întârziat</Chip>
                  )}
                </div>
              </ArtifactCard>
            ))}
          </section>

          {/* ce oferă acum */}
          {producer.offers.length > 0 && (
            <section className="mt-lg space-y-sm">
              <h3 className="text-label-md uppercase text-on-surface-variant px-1">Ce oferă acum</h3>
              <ArtifactCard className="p-sm">
                <div className="space-y-1.5">
                  {producer.offers.map((o) => (
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
            </section>
          )}

          <Link href="/" className="block mt-lg">
            <Button icon="chat_bubble" variant="primary">
              Comandă de la {producer.owner.split(" ")[0]}
            </Button>
          </Link>

          <p className="mt-md text-[12px] text-on-surface-variant flex items-start gap-1.5">
            <Icon name="info" size={15} className="text-primary mt-0.5" />
            Punctualitatea e reală (din date); istoricul de Curse e demo. Chatul de cartier și raportul de transparență vin
            post-pilot.
          </p>
        </main>
      </div>
    </div>
  );
}
