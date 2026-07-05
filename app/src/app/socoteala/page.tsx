import Link from "next/link";
import { runSocoteala } from "@/lib/socoteala-scenarios";
import { Icon } from "@/components/ui/Icon";

/**
 * Regresie vizibilă a `MatchingEngine` (Etapa 5) — rulează scenariile fixe prin
 * motorul determinist și arată asserturile (single-producer, multi + consolidare,
 * plafon 5, negăsit, scor). Ca `/golden`, dar pentru motorul de coș.
 */
export default function SocotealaPage() {
  const scenarios = runSocoteala();
  const checks = scenarios.flatMap((s) => s.checks);
  const passed = checks.filter((c) => c.pass).length;
  const total = checks.length;
  const ok = passed === total;

  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="w-full max-w-phone relative min-h-dvh flex flex-col bg-background">
        <header className="fixed top-0 z-40 w-full max-w-phone bg-background/85 backdrop-blur-md border-b border-card-border">
          <div className="h-[60px] px-md flex items-center justify-between">
            <div className="flex items-center gap-base min-w-0">
              <Icon name="calculate" className="text-primary" size={24} filled />
              <div className="min-w-0">
                <h1 className="text-[16px] font-semibold text-on-surface leading-tight truncate">Socoteala · MatchingEngine</h1>
                <p className="text-[11px] text-on-surface-variant leading-tight truncate">regresie compunere coș (determinist)</p>
              </div>
            </div>
            <Link href="/" className="text-[12px] font-medium text-primary flex items-center gap-0.5">
              <Icon name="arrow_back" size={16} /> Chat
            </Link>
          </div>
        </header>

        <main className="flex-1 pt-[60px] pb-lg px-md">
          <div className={`mt-md rounded-card p-md ${ok ? "bg-chip-bg" : "bg-error-container"}`}>
            <p className={`text-[32px] font-semibold leading-none ${ok ? "text-primary" : "text-on-error-container"}`}>
              {passed}/{total}
            </p>
            <p className="text-[13px] text-on-surface-variant mt-1">
              asserturi trecute {ok ? "· motorul se comportă conform planului" : "· verifică eșecurile"}
            </p>
          </div>

          <div className="mt-md space-y-md">
            {scenarios.map((s) => (
              <div key={s.name} className="bg-card border border-card-border rounded-card p-md">
                <div className="flex items-center gap-1.5">
                  <Icon
                    name={s.checks.every((c) => c.pass) ? "check_circle" : "cancel"}
                    size={18}
                    filled
                    className={s.checks.every((c) => c.pass) ? "text-primary" : "text-error"}
                  />
                  <h3 className="text-[15px] font-semibold text-on-surface">{s.name}</h3>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-0.5 mb-sm">{s.desc}</p>
                <div className="space-y-1">
                  {s.checks.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-[13px]">
                      <Icon
                        name={c.pass ? "check" : "close"}
                        size={16}
                        className={c.pass ? "text-primary mt-0.5" : "text-error mt-0.5"}
                      />
                      <span className="flex-1 text-on-surface">{c.label}</span>
                      <span className={`tabular-nums ${c.pass ? "text-on-surface-variant" : "text-error font-medium"}`}>{c.got}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
