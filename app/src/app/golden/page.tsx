import Link from "next/link";
import { runGolden } from "@/lib/golden-set";
import { Icon } from "@/components/ui/Icon";

/**
 * Golden set vizibil (Etapa 3) — rulează cele ~40 de fraze prin extractorul
 * determinist și arată rata de reușită. Plasa de regresie când legăm Gemma.
 */
export default function GoldenPage() {
  const { passed, total, results } = runGolden();
  const pct = Math.round((passed / total) * 100);
  const ok = passed / total >= 0.9;

  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="w-full max-w-phone relative min-h-dvh flex flex-col bg-background">
        <header className="fixed top-0 z-40 w-full max-w-phone bg-background/85 backdrop-blur-md border-b border-card-border">
          <div className="h-[60px] px-md flex items-center justify-between">
            <div className="flex items-center gap-base min-w-0">
              <Icon name="checklist" className="text-primary" size={24} filled />
              <div className="min-w-0">
                <h1 className="text-[16px] font-semibold text-on-surface leading-tight truncate">Golden set · Taraba</h1>
                <p className="text-[11px] text-on-surface-variant leading-tight truncate">regresie extragere ofertă</p>
              </div>
            </div>
            <Link href="/producator" className="text-[12px] font-medium text-primary flex items-center gap-0.5">
              <Icon name="arrow_back" size={16} /> Taraba
            </Link>
          </div>
        </header>

        <main className="flex-1 pt-[60px] pb-lg px-md">
          <div className={`mt-md rounded-card p-md ${ok ? "bg-chip-bg" : "bg-error-container"}`}>
            <p className={`text-[32px] font-semibold leading-none ${ok ? "text-primary" : "text-on-error-container"}`}>
              {passed}/{total}
            </p>
            <p className="text-[13px] text-on-surface-variant mt-1">
              {pct}% extrase corect {ok ? "· peste pragul de 90%" : "· sub pragul de 90%"}
            </p>
          </div>

          <div className="mt-md space-y-1.5">
            {results.map((r, i) => (
              <div key={i} className="bg-card border border-card-border rounded p-sm flex items-start gap-2">
                <Icon
                  name={r.pass ? "check_circle" : "cancel"}
                  size={18}
                  filled
                  className={r.pass ? "text-primary mt-0.5" : "text-error mt-0.5"}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-on-surface">„{r.text}"</p>
                  {!r.pass && <p className="text-[12px] text-error mt-0.5">{r.issues.join(" · ")}</p>}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
