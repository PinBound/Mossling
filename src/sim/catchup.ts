import { createRng } from './rng';
import { clonePet } from './state';
import { tick } from './step';
import { TUNING } from './tuning';
import type { PetState, SimEvent } from './types';

export interface CatchUpResult {
  state: PetState;
  events: SimEvent[];
  /** sim ms actually simulated (after capping) */
  simulatedMs: number;
  /** ms the player was away */
  awayMs: number;
}

/**
 * Fast-forward from the last save to `toMs` in fixed 1-minute ticks, with offline neglect caps.
 */
export function catchUp(state: PetState, fromMs: number, toMs: number): CatchUpResult {
  const awayMs = Math.max(0, toMs - fromMs);
  const simulatedMs = Math.min(awayMs, TUNING.offline.maxCatchUpMs);
  const s = clonePet(state);
  const r = createRng(s.rngState);
  const events: SimEvent[] = [];
  s.offline = {
    mistakes: 0,
    elapsedMs: awayMs - simulatedMs,
    // Long absences (> 48 h) can only cost a handful of care mistakes in total.
    maxMistakes: awayMs > TUNING.offline.capAfterMs ? TUNING.offline.maxMistakes : Infinity,
  };
  let t = toMs - simulatedMs;
  let remaining = simulatedMs;
  while (remaining > 0 && s.status === 'alive') {
    const d = Math.min(TUNING.tickMs, remaining);
    t += d;
    tick(s, d, t, r, events);
    remaining -= d;
  }
  s.offline = null;
  s.rngState = r.state;
  return { state: s, events, simulatedMs, awayMs };
}

export interface AwaySummary {
  poops: number;
  hungerCalls: number;
  happinessCalls: number;
  falseCalls: number;
  gotSick: boolean;
  mistakes: number;
  evolvedTo: string[];
  birthdays: number;
  sleeps: { from: number; to: number }[];
  hatched: boolean;
  ended: 'left' | 'ranaway' | 'passed' | null;
}

export function summarize(events: SimEvent[]): AwaySummary {
  const out: AwaySummary = {
    poops: 0,
    hungerCalls: 0,
    happinessCalls: 0,
    falseCalls: 0,
    gotSick: false,
    mistakes: 0,
    evolvedTo: [],
    birthdays: 0,
    sleeps: [],
    hatched: false,
    ended: null,
  };
  let sleepStart: number | null = null;
  for (const e of events) {
    switch (e.type) {
      case 'POOPED':
        out.poops++;
        break;
      case 'CALLED_ATTENTION':
        if (e.reason === 'hunger') out.hungerCalls++;
        else if (e.reason === 'happiness') out.happinessCalls++;
        else if (e.reason === 'false') out.falseCalls++;
        break;
      case 'GOT_SICK':
        out.gotSick = true;
        break;
      case 'CARE_MISTAKE':
        out.mistakes++;
        break;
      case 'EVOLVED':
        out.evolvedTo.push(e.to);
        break;
      case 'BIRTHDAY':
        out.birthdays++;
        break;
      case 'HATCHED':
        out.hatched = true;
        break;
      case 'FELL_ASLEEP':
        if (e.kind === 'night') sleepStart = e.at;
        break;
      case 'WOKE_UP':
        if (e.kind === 'night' && sleepStart !== null) {
          out.sleeps.push({ from: sleepStart, to: e.at });
          sleepStart = null;
        }
        break;
      case 'LEFT':
        out.ended = 'left';
        break;
      case 'RAN_AWAY':
        out.ended = 'ranaway';
        break;
      case 'PASSED':
        out.ended = 'passed';
        break;
    }
  }
  return out;
}

export function summaryIsEmpty(s: AwaySummary): boolean {
  return (
    s.poops + s.hungerCalls + s.happinessCalls + s.falseCalls + s.birthdays + s.sleeps.length ===
      0 &&
    !s.gotSick &&
    !s.hatched &&
    s.evolvedTo.length === 0 &&
    !s.ended
  );
}
