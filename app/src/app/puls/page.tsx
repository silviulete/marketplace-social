import Link from "next/link";
import { db } from "@/lib/db";
import { Icon } from "@/components/ui/Icon";
import { ArtifactCard, Chip } from "@/components/ui/primitives";

export const dynamic = "force-dynamic"; // datele owner se citesc mereu proaspete

/**
 * „Puls" — pagina owner-ului (Etapa 11, plan §Etapa 10 amânată: în pilot păstrăm
 * UN număr de densitate vizibil + instrumentarea celor 5 ipoteze go/no-go).
 * Sursa: evenimentele `track()` persistate în DB + feedback-ul „Spune-ne".
 */

const WEEK_MS = 7 * 24 * 3_600_000;
const DENSITY_THRESHOLD = 12; // Curse/săptămână — pragul de supraviețuire (~12)

interface Ev {
  name: string;
  props: Record<string, unknown>;
  createdAt: Date;
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export default async function PulsPage() {
  const since = new Date(Date.now() - WEEK_MS);
  const [rows, feedback] = await Promise.all([
    db.event.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" } }),
    db.feedback.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const events: Ev[] = rows.map((r) => {
    let props: Record<string, unknown> = {};
    try {
      props = JSON.parse(r.props) as Record<string, unknown>;
    } catch {
      /* props corupte → ignorate */
    }
    return { name: r.name, props, createdAt: r.createdAt };
  });

  // ——— numărul de densitate: Curse închise / săptămână vs pragul ~12 ———
  const curse = events.filter((e) => e.name === "cursa.cutoff").length;
  const verdict = curse >= DENSITY_THRESHOLD ? "Viu" : curse >= DENSITY_THRESHOLD / 2 ? "La limită" : "Fragil";
  const verdictTone = curse >= DENSITY_THRESHOLD ? "green" : "neutral";

  // ——— ipotezele (proxy pe evenimentele existente; identitate reală = la pilot) ———
  const plati = events.filter((e) => e.name === "plata.escrow");
  const cosuri = plati.length;
  const helds = plati.map((e) => Number(e.props.held ?? 0)).filter((n) => n > 0);
  const cosMedian = median(helds);
  const sub40 = helds.length ? Math.round((helds.filter((h) => h < 40).length / helds.length) * 100) : 0;
  const cuRotunjire = plati.length
    ? Math.round((plati.filter((e) => Number(e.props.fund ?? 0) > 0).length / plati.length) * 100)
    : 0;

  const cutoffs = events.filter((e) => e.name === "cursa.cutoff");
  const acceptate = cutoffs.reduce((s, e) => s + Number(e.props.acceptate ?? 0), 0);
  const expirate = cutoffs.reduce((s, e) => s + Number(e.props.expirate ?? 0), 0);
  const onorare = acceptate + expirate > 0 ? Math.round((acceptate / (acceptate + expirate)) * 100) : null;

  const cereri = events.filter((e) => e.name === "strigarea.extract").length;

  const hypotheses = [
    {
      n: 1,
      title: "Cerere urbană suficientă",
      target: "≥30 coșuri/rundă și ≥150 activi în 8 săpt.",
      value: `${cosuri} coșuri plătite · ${cereri} cereri (7 zile)`,
      ok: cosuri >= 30 ? true : cosuri === 0 ? null : false,
    },
    {
      n: 2,
      title: "Lichiditate vie fără eveniment",
      target: "revenire între runde ≥60%",
      value: "se măsoară cu utilizatori reali (identitate la pilot)",
      ok: null,
    },
    {
      n: 3,
      title: "Disciplina promisiunii de livrare",
      target: "onorare ≥95% (sub 90% → hedge)",
      value: onorare === null ? "încă fără Curse închise" : `${onorare}% acționate la timp (${acceptate} acceptate · ${expirate} expirate)`,
      ok: onorare === null ? null : onorare >= 95,
    },
    {
      n: 4,
      title: "Transportul nu omoară coșul",
      target: "coș median ≥60 lei · sub 40 lei la <40% din coșuri",
      value: helds.length ? `median ${cosMedian} lei · ${sub40}% sub 40 lei` : "încă fără plăți",
      ok: helds.length ? cosMedian >= 60 && sub40 < 40 : null,
    },
    {
      n: 5,
      title: "Venituri non-tranzacționale",
      target: "rotunjire la ≥20% din plăți SAU sponsor semnat",
      value: plati.length ? `${cuRotunjire}% din plăți cu rotunjire` : "încă fără plăți",
      ok: plati.length ? cuRotunjire >= 20 : null,
    },
  ];

  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="w-full max-w-phone relative min-h-dvh flex flex-col bg-background">
        <header className="fixed top-0 z-40 w-full max-w-phone bg-background/85 backdrop-blur-md border-b border-card-border">
          <div className="h-[60px] px-md flex items-center justify-between">
            <div className="flex items-center gap-base min-w-0">
              <span className="w-7 h-7 rounded-pill bg-primary grid place-items-center shrink-0">
                <Icon name="monitor_heart" className="text-on-primary" size={16} filled />
              </span>
              <div className="min-w-0">
                <h1 className="text-[16px] font-semibold text-on-surface leading-tight truncate">Puls · owner</h1>
                <p className="text-[11px] text-on-surface-variant leading-tight truncate">densitate + cele 5 ipoteze (ultimele 7 zile)</p>
              </div>
            </div>
            <Link href="/demo" className="text-[12px] font-medium text-primary flex items-center gap-0.5">
              <Icon name="arrow_back" size={16} /> Demo
            </Link>
          </div>
        </header>

        <main className="flex-1 pt-[60px] pb-lg px-md space-y-lg">
          {/* NUMĂRUL — Curse/săptămână vs pragul de supraviețuire */}
          <section className="mt-md">
            <ArtifactCard className="p-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-md uppercase text-on-surface-variant">Curse închise · 7 zile</p>
                  <p className="text-[44px] font-semibold text-primary leading-tight">
                    {curse}
                    <span className="text-[16px] text-on-surface-variant font-normal"> / prag ~{DENSITY_THRESHOLD}</span>
                  </p>
                </div>
                <Chip tone={verdictTone as "green" | "neutral"} icon={curse >= DENSITY_THRESHOLD ? "favorite" : "monitor_heart"}>
                  {verdict}
                </Chip>
              </div>
              <p className="mt-1 text-[12px] text-on-surface-variant">
                Sub prag, piața pare moartă — ăsta e singurul număr de urmărit săptămânal.
              </p>
            </ArtifactCard>
          </section>

          {/* cele 5 ipoteze go/no-go */}
          <section className="space-y-sm">
            <h3 className="text-label-md uppercase text-on-surface-variant px-1">Ipotezele pilotului (go/no-go)</h3>
            {hypotheses.map((h) => (
              <ArtifactCard key={h.n} className="p-sm">
                <div className="flex items-start gap-sm">
                  <Icon
                    name={h.ok === null ? "pending" : h.ok ? "check_circle" : "error"}
                    size={20}
                    filled
                    className={h.ok === null ? "text-outline mt-0.5" : h.ok ? "text-primary mt-0.5" : "text-error mt-0.5"}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-on-surface">
                      {h.n}. {h.title}
                    </p>
                    <p className="text-[12px] text-on-surface-variant">țintă: {h.target}</p>
                    <p className="text-[13px] text-on-surface mt-0.5">{h.value}</p>
                  </div>
                </div>
              </ArtifactCard>
            ))}
          </section>

          {/* feedback calitativ („Spune-ne") */}
          <section className="space-y-sm">
            <h3 className="text-label-md uppercase text-on-surface-variant px-1">Ultimul feedback („Spune-ne")</h3>
            {feedback.length === 0 ? (
              <p className="px-1 text-[13px] text-on-surface-variant">Încă nimic — butonul e în Profil.</p>
            ) : (
              feedback.map((f) => (
                <ArtifactCard key={f.id} className="p-sm">
                  <p className="text-[14px] text-on-surface">{f.text}</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    {new Date(f.createdAt).toLocaleDateString("ro-RO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </ArtifactCard>
              ))
            )}
          </section>

          <p className="text-[12px] text-on-surface-variant flex items-start gap-1.5">
            <Icon name="dataset" size={15} className="text-primary mt-0.5" />
            Datele vin din evenimentele reale ale aplicației (track → DB). În demo se umplu pe măsură ce folosești chatul și Taraba.
          </p>
        </main>
      </div>
    </div>
  );
}
