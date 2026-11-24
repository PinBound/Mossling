import { createRng } from './rng';
import { clonePet } from './state';
import { tick } from './step';
import { HOUR, MIN } from './tuning';
import type { PetState, SimEvent } from './types';

export interface Forecast {
  /** next time the pet is likely to call because it's hungry */
  hungryAt: number | null;
  /** next night bedtime */
  bedtimeAt: number | null;
  /** next time it would call for any real reason */
  nextCallAt: number | null;
}

/** Simulate forward with no player input to predict upcoming needs (for reminders). */
export function forecast(state: PetState, now: number, horizonMs = 16 * HOUR): Forecast {
  const s = clonePet(state);
  const r = createRng(s.rngState);
  const out: Forecast = { hungryAt: null, bedtimeAt: null, nextCallAt: null };
  const ev: SimEvent[] = [];
  const step = 5 * MIN;
  for (let t = now + step; t <= now + horizonMs && s.status === 'alive'; t += step) {
    ev.length = 0;
    tick(s, step, t, r, ev);
    for (const e of ev) {
      if (e.type === 'CALLED_ATTENTION' && e.reason !== 'false') {
        out.nextCallAt ??= e.at;
        if (e.reason === 'hunger') out.hungryAt ??= e.at;
      }
      if (e.type === 'FELL_ASLEEP' && e.kind === 'night') out.bedtimeAt ??= e.at;
    }
    if (out.hungryAt !== null && out.bedtimeAt !== null) break;
  }
  return out;
}
