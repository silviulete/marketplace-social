import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ArtifactCard } from "@/components/ui/primitives";

/**
 * Mod demo & teste (#39) — hub separat pentru uneltele de dezvoltare, mutat
 * din Profil: simularea de densitate, testul de rază pe două adrese și cele
 * 5 regresii vizibile. Nu face parte din experiența cumpărător/vânzător.
 */
export default function DemoPage() {
  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="w-full max-w-phone relative min-h-dvh flex flex-col bg-background">
        <header className="fixed top-0 z-40 w-full max-w-phone bg-background/85 backdrop-blur-md border-b border-card-border">
          <div className="h-[60px] px-md flex items-center justify-between">
            <div className="flex items-center gap-base min-w-0">
              <span className="w-7 h-7 rounded-pill bg-primary grid place-items-center shrink-0">
                <Icon name="build" className="text-on-primary" size={16} filled />
              </span>
              <div className="min-w-0">
                <h1 className="text-[16px] font-semibold text-on-surface leading-tight truncate">Mod demo & teste</h1>
                <p className="text-[11px] text-on-surface-variant leading-tight truncate">unelte de dezvoltare · nu fac parte din produs</p>
              </div>
            </div>
            <Link href="/profil" className="text-[12px] font-medium text-primary flex items-center gap-0.5">
              <Icon name="arrow_back" size={16} /> Profil
            </Link>
          </div>
        </header>

        <main className="flex-1 pt-[60px] pb-lg px-md space-y-lg">
          {/* pagina owner-ului (Etapa 11): densitate + cele 5 ipoteze */}
          <section className="mt-md space-y-sm">
            <h3 className="text-label-md uppercase text-on-surface-variant px-1">Owner</h3>
            <Link href="/puls">
              <ArtifactCard className="p-md">
                <div className="flex items-center gap-sm">
                  <span className="w-11 h-11 rounded bg-primary grid place-items-center shrink-0">
                    <Icon name="monitor_heart" className="text-on-primary" size={22} filled />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-on-surface">Puls · densitate + ipoteze</p>
                    <p className="text-[13px] text-on-surface-variant">Curse/săptămână vs prag ~12 · cele 5 praguri go/no-go</p>
                  </div>
                  <Icon name="chevron_right" size={20} className="text-outline" />
                </div>
              </ArtifactCard>
            </Link>
          </section>

          {/* simulare densitate (Etapa 1c) */}
          <section className="space-y-sm">
            <h3 className="text-label-md uppercase text-on-surface-variant px-1">Simulare</h3>
            <Link href="/simulare">
              <ArtifactCard className="p-md">
                <div className="flex items-center gap-sm">
                  <span className="w-11 h-11 rounded bg-primary grid place-items-center shrink-0">
                    <Icon name="speed" className="text-on-primary" size={22} filled />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-on-surface">Simulare densitate cartier</p>
                    <p className="text-[13px] text-on-surface-variant">40 vs. 150 utilizatori · pare viu sau mort?</p>
                  </div>
                  <Icon name="chevron_right" size={20} className="text-outline" />
                </div>
              </ArtifactCard>
            </Link>
          </section>

          {/* testul de rază pe două adrese (Etapa 2) */}
          <section className="space-y-sm">
            <h3 className="text-label-md uppercase text-on-surface-variant px-1">Bazinul pe două adrese (raza ~45 km)</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/bazin?addr=buc">
                <ArtifactCard className="p-md h-full">
                  <Icon name="location_on" className="text-primary" size={22} filled />
                  <p className="text-[14px] font-semibold text-on-surface mt-1.5">Silviu · București</p>
                  <p className="text-[12px] text-on-surface-variant">bazinul București + Ilfov</p>
                </ArtifactCard>
              </Link>
              <Link href="/bazin?addr=cluj">
                <ArtifactCard className="p-md h-full">
                  <Icon name="location_on" className="text-primary" size={22} filled />
                  <p className="text-[14px] font-semibold text-on-surface mt-1.5">Ana · Cluj</p>
                  <p className="text-[12px] text-on-surface-variant">alt bazin, alte oferte</p>
                </ArtifactCard>
              </Link>
            </div>
          </section>

          {/* teste vizibile (regresie) */}
          <section className="space-y-sm">
            <h3 className="text-label-md uppercase text-on-surface-variant px-1">Teste vizibile (regresie)</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/golden-cerere">
                <ArtifactCard className="p-md h-full">
                  <Icon name="checklist" className="text-primary" size={22} filled />
                  <p className="text-[14px] font-semibold text-on-surface mt-1.5">Golden · Strigarea</p>
                  <p className="text-[12px] text-on-surface-variant">cererea cumpărătorului</p>
                </ArtifactCard>
              </Link>
              <Link href="/golden">
                <ArtifactCard className="p-md h-full">
                  <Icon name="checklist" className="text-primary" size={22} filled />
                  <p className="text-[14px] font-semibold text-on-surface mt-1.5">Golden · Taraba</p>
                  <p className="text-[12px] text-on-surface-variant">oferta vânzătorului</p>
                </ArtifactCard>
              </Link>
              <Link href="/socoteala" className="col-span-2">
                <ArtifactCard className="p-md">
                  <div className="flex items-center gap-sm">
                    <Icon name="calculate" className="text-primary" size={22} filled />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-on-surface">Socoteala · MatchingEngine</p>
                      <p className="text-[12px] text-on-surface-variant">coș determinist: un vânzător / surse minime, plafon 5</p>
                    </div>
                    <Icon name="chevron_right" size={20} className="text-outline" />
                  </div>
                </ArtifactCard>
              </Link>
              <Link href="/cursa" className="col-span-2">
                <ArtifactCard className="p-md">
                  <div className="flex items-center gap-sm">
                    <Icon name="schedule" className="text-primary" size={22} filled />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-on-surface">Cursa · mașina de stări</p>
                      <p className="text-[12px] text-on-surface-variant">cutoff, accept/refuz, expirare (Clock-driven)</p>
                    </div>
                    <Icon name="chevron_right" size={20} className="text-outline" />
                  </div>
                </ArtifactCard>
              </Link>
              <Link href="/bani" className="col-span-2">
                <ArtifactCard className="p-md">
                  <div className="flex items-center gap-sm">
                    <Icon name="account_balance" className="text-primary" size={22} filled />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-on-surface">Bani · escrow + ledger</p>
                      <p className="text-[12px] text-on-surface-variant">plată→escrow, split, refund, reconciliere (suma=0)</p>
                    </div>
                    <Icon name="chevron_right" size={20} className="text-outline" />
                  </div>
                </ArtifactCard>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
