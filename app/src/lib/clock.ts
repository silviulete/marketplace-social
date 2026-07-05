/**
 * Ceas simulat tick-driven (Etapa 6a, plan §5). Scheduler-ul Cursei e condus de
 * `Clock`, NU de `setTimeout` real — ca fast-forward-ul din teste/demo să declanșeze
 * handler-ele de termen (cutoff, zi de livrare). Cusătura `Clock` (decizia #14):
 * în producție = worker/cron pe timp real, în dev/teste = `SimulatedClock`.
 */
export interface Clock {
  now(): number; // milisecunde (epoch sau relativ — contează doar ordinea)
}

interface Timer {
  at: number;
  fn: () => void;
  id: number;
}

/** Ceas controlat manual: `advance`/`advanceTo` declanșează termenele scadente, în ordine. */
export class SimulatedClock implements Clock {
  private t: number;
  private timers: Timer[] = [];
  private seq = 0;

  constructor(start = 0) {
    this.t = start;
  }

  now(): number {
    return this.t;
  }

  /** Programează un handler la momentul `at` (timp absolut al ceasului). */
  at(at: number, fn: () => void): void {
    this.timers.push({ at, fn, id: this.seq++ });
  }

  /** Avansează ceasul la `target`, declanșând în ordine toate termenele scadente. */
  advanceTo(target: number): void {
    // termenele scadente, în ordine cronologică (la egalitate: ordinea programării)
    const due = this.timers
      .filter((x) => x.at <= target)
      .sort((a, b) => a.at - b.at || a.id - b.id);
    this.timers = this.timers.filter((x) => x.at > target);
    for (const timer of due) {
      this.t = timer.at; // now() în handler reflectă momentul declanșării
      timer.fn();
    }
    this.t = target;
  }

  advance(ms: number): void {
    this.advanceTo(this.t + ms);
  }
}
