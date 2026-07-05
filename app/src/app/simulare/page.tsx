import Link from "next/link";
import { DensitySim } from "@/components/sim/DensitySim";
import { Icon } from "@/components/ui/Icon";

/**
 * Mod demo · Simulare densitate (Etapa 1c).
 * Vedere de observator (nu cumpărător/vânzător) — fără bottom nav.
 */
export default function SimularePage() {
  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="w-full max-w-phone relative min-h-dvh flex flex-col bg-background">
        <header className="fixed top-0 z-40 w-full max-w-phone bg-background/85 backdrop-blur-md border-b border-card-border">
          <div className="h-[60px] px-md flex items-center justify-between">
            <div className="flex items-center gap-base min-w-0">
              <span className="w-7 h-7 rounded-pill bg-primary grid place-items-center shrink-0">
                <Icon name="speed" className="text-on-primary" size={16} filled />
              </span>
              <div className="min-w-0">
                <h1 className="text-[16px] font-semibold text-on-surface leading-tight truncate">Mod demo · Densitate</h1>
                <p className="text-[11px] text-on-surface-variant leading-tight truncate">București + Ilfov · ceas accelerat</p>
              </div>
            </div>
            <Link href="/demo" className="text-[12px] font-medium text-primary flex items-center gap-0.5">
              <Icon name="arrow_back" size={16} /> Înapoi
            </Link>
          </div>
        </header>

        <main className="flex-1 pt-[60px]">
          <DensitySim />
        </main>
      </div>
    </div>
  );
}
