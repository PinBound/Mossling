import { dayKey, inWindow, localHour, nightKey } from './clock';
import { evolutionInputOf, resolveAdultForm } from './evolution';
import { createRng, type RNG } from './rng';
import { MOSSLING, NEXT_STAGE } from './species/mossling';
import { clamp, clonePet, totalMistakes } from './state';
import { DAY, HOUR, MIN, TUNING } from './tuning';
import type {
  AdultForm,
  CallReason,
  MistakeReason,
  PetState,
  SimEvent,
  SleepKind,
  Stage,
  StepResult,
} from './types';

type Grown = Exclude<Stage, 'egg'>;

/**
 * Advance the simulation by `dtMs`, ending at `nowMs`. Pure: never reads the clock.
 * Large steps are broken into ticks of at most `TUNING.tickMs`.
 */
export function step(state: PetState, dtMs: number, nowMs: number, rng?: RNG): StepResult {
  const s = clonePet(state);
  const r = rng ?? createRng(s.rngState);
  const events: SimEvent[] = [];
  let remaining = Math.max(0, dtMs);
  let t = nowMs - remaining;
  while (remaining > 0) {
    const d = Math.min(remaining, TUNING.tickMs);
    t += d;
    tick(s, d, t, r, events);
    remaining -= d;
  }
  s.rngState = r.state;
  return { state: s, events };
}

/** Mutating single tick. Exported for catch-up and tests. */
export function tick(s: PetState, d: number, now: number, r: RNG, ev: SimEvent[]): void {
  if (s.status !== 'alive') return;

  if (s.pause.active) {
    const key = dayKey(now, s.tzOffsetMin);
    if (key !== s.pause.dayKey) {
      s.pause.dayKey = key;
      s.pause.usedMs = 0;
    }
    s.pause.usedMs += d;
    // Paused time is frozen: shift every scheduled timestamp forward so nothing "catches up".
    shiftSchedules(s, d);
    if (s.pause.usedMs >= TUNING.pauseAllowanceMs) {
      s.pause.active = false;
      ev.push({ type: 'PAUSE_EXHAUSTED', at: now });
    }
    return;
  }

  if (s.stage === 'egg') {
    const before = s.eggMs;
    s.eggMs += d;
    if (before < TUNING.stageDuration.egg && s.eggMs >= TUNING.stageDuration.egg) {
      hatch(s, now, r, ev);
    }
    return;
  }

  const prevYears = Math.floor(s.ageMs / DAY);
  s.ageMs += d;
  s.stageMs += d;
  const years = Math.floor(s.ageMs / DAY);
  if (years > prevYears) ev.push({ type: 'BIRTHDAY', at: now, age: years });

  sleepSchedule(s, now, r, ev);
  decay(s, d);
  droppings(s, now, r, ev);
  lightsWhileAsleep(s, d, now, ev);
  zeroTimers(s, d);
  sickness(s, d, now, r, ev);
  calls(s, now, r, ev);
  healthAndBond(s, d);

  if (s.offline) {
    s.offline.elapsedMs += d;
    if (s.offline.elapsedMs < TUNING.offline.leaveAfterMs) {
      s.stats.health = Math.max(s.stats.health, TUNING.offline.healthFloor);
    } else if (s.lifeMode === 'gentle' && s.stats.hunger <= 0) {
      endLife(s, now, 'ranaway', ev);
      return;
    }
  }

  if (s.stats.health <= 0) {
    if (s.lifeMode === 'eternal') {
      s.stats.health = 1;
    } else {
      endLife(s, now, s.lifeMode === 'classic' ? 'passed' : 'ranaway', ev);
      return;
    }
  }

  maybeEvolve(s, now, r, ev);
  maybeLifespanEnd(s, now, ev);
}

function shiftSchedules(s: PetState, d: number) {
  s.nextPoopAt += d;
  s.nextFalseCallAt += d;
  s.nextNapAt += d;
  if (s.call) s.call.since += d;
  if (s.sleep) {
    s.sleep.since += d;
    if (s.sleep.until !== undefined) s.sleep.until += d;
  }
  if (s.disciplineUntil) s.disciplineUntil += d;
  if (s.praiseUntil) s.praiseUntil += d;
  for (const k of Object.keys(s.callCooldownUntil) as CallReason[]) {
    s.callCooldownUntil[k] = (s.callCooldownUntil[k] ?? 0) + d;
  }
  for (const drop of s.droppings) drop.at += d;
}

export function hatch(s: PetState, now: number, r: RNG, ev: SimEvent[]) {
  s.stage = 'baby';
  s.form = MOSSLING.stageForms.baby;
  s.bornAt = now;
  s.stageMs = 0;
  s.ageMs = 0;
  s.stats.hunger = 50;
  s.stats.happiness = 50;
  s.stats.energy = 100;
  s.nextPoopAt = now + poopInterval(s, r);
  s.nextNapAt = now + TUNING.babyNap.interval;
  s.history.push({ stage: 'baby', form: s.form, at: now });
  ev.push({ type: 'HATCHED', at: now });
}

function poopInterval(s: PetState, r: RNG): number {
  const baby = s.stage === 'baby';
  const base = baby ? TUNING.poopInterval.baby : TUNING.poopInterval.other;
  const jitter = baby ? TUNING.poopJitter.baby : TUNING.poopJitter.other;
  return base + r.range(-jitter, jitter);
}

export function bedtimeFor(s: PetState): { sleep: number; wake: number } | null {
  if (s.stage === 'egg' || s.stage === 'baby') return null;
  const base = TUNING.bedtime[s.stage];
  if (s.stage !== 'adult') return base;
  const shift = TUNING.adultBedtimeShift[s.form as AdultForm] ?? 0;
  return { sleep: base.sleep + shift, wake: base.wake + shift };
}

export function fallAsleep(s: PetState, now: number, kind: SleepKind, ev: SimEvent[]) {
  s.sleep = {
    kind,
    since: now,
    lightsOnMs: 0,
    mistakeCounted: false,
    until: kind === 'nap' ? now + TUNING.babyNap.duration : undefined,
  };
  if (kind === 'night') s.lastNightKey = nightKey(now, s.tzOffsetMin);
  ev.push({ type: 'FELL_ASLEEP', at: now, kind });
}

function wake(s: PetState, now: number, ev: SimEvent[]) {
  const sl = s.sleep;
  if (!sl) return;
  const fullNight =
    sl.kind === 'night' && !sl.mistakeCounted && !s.lightsOn && now - sl.since >= 8 * HOUR;
  if (fullNight && (s.stage === 'child' || s.stage === 'teen')) s.sleptFullNightLightsOff = true;
  s.sleep = null;
  s.lightsOn = true;
  ev.push({ type: 'WOKE_UP', at: now, kind: sl.kind, fullNightLightsOff: fullNight });
}

function sleepSchedule(s: PetState, now: number, _r: RNG, ev: SimEvent[]) {
  const hour = localHour(now, s.tzOffsetMin);
  const bed = bedtimeFor(s);
  if (s.sleep) {
    const sl = s.sleep;
    if (sl.kind === 'nap' && sl.until !== undefined && now >= sl.until) wake(s, now, ev);
    else if (sl.kind === 'exhausted' && s.stats.energy >= TUNING.exhaustedWakeEnergy)
      wake(s, now, ev);
    else if (sl.kind === 'night' && bed && !inWindow(hour, bed.sleep, bed.wake)) wake(s, now, ev);
    return;
  }
  if (
    bed &&
    inWindow(hour, bed.sleep, bed.wake) &&
    s.lastNightKey !== nightKey(now, s.tzOffsetMin)
  ) {
    fallAsleep(s, now, 'night', ev);
    return;
  }
  if (s.stage === 'baby' && now >= s.nextNapAt) {
    s.nextNapAt = now + TUNING.babyNap.interval + TUNING.babyNap.duration;
    fallAsleep(s, now, 'nap', ev);
    return;
  }
  if (s.stats.energy <= 0) fallAsleep(s, now, 'exhausted', ev);
}

function decay(s: PetState, d: number) {
  const stage = s.stage as Grown;
  const asleep = !!s.sleep;
  const f = asleep ? TUNING.sleepDecayFactor : 1;
  const drain = TUNING.fullDrain;
  s.stats.hunger = clamp(s.stats.hunger - (100 * d * f) / drain.hunger[stage]);
  let happyF = f;
  if (!asleep && !s.lightsOn) happyF *= TUNING.darkAwakeHappinessFactor;
  if (s.sick) happyF *= 1.5;
  s.stats.happiness = clamp(s.stats.happiness - (100 * d * happyF) / drain.happiness[stage]);
  s.stats.hygiene = clamp(s.stats.hygiene - (100 * d * f) / drain.hygiene[stage]);
  if (asleep) {
    const refill = stage === 'baby' ? TUNING.babyEnergyRefill : TUNING.energyRefill;
    s.stats.energy = clamp(s.stats.energy + (100 * d) / refill);
  } else {
    s.stats.energy = clamp(s.stats.energy - (100 * d) / drain.energy[stage]);
  }
}

function droppings(s: PetState, now: number, r: RNG, ev: SimEvent[]) {
  if (s.sleep) return;
  if (now < s.nextPoopAt) return;
  const id = s.nextDroppingId++;
  s.droppings.push({ id, at: now, x: r.range(0.15, 0.85) });
  s.stats.hygiene = clamp(s.stats.hygiene - TUNING.poopHygieneHit);
  s.nextPoopAt = now + poopInterval(s, r);
  ev.push({ type: 'POOPED', at: now, id });
}

function lightsWhileAsleep(s: PetState, d: number, now: number, ev: SimEvent[]) {
  const sl = s.sleep;
  if (!sl || sl.kind === 'nap' || !s.lightsOn) return;
  sl.lightsOnMs += d;
  if (!sl.mistakeCounted && sl.lightsOnMs >= TUNING.lightsMistakeMs) {
    sl.mistakeCounted = true;
    careMistake(s, 'lights', now, ev);
  }
}

function zeroTimers(s: PetState, d: number) {
  s.hungerZeroMs = s.stats.hunger <= 0 ? s.hungerZeroMs + d : 0;
  s.happinessZeroMs = s.stats.happiness <= 0 ? s.happinessZeroMs + d : 0;
}

export function careMistake(s: PetState, reason: MistakeReason, now: number, ev: SimEvent[]) {
  if (s.stage === 'egg') return;
  if (s.offline) {
    const o = s.offline;
    if (o.mistakes >= o.maxMistakes) return;
    o.mistakes++;
  }
  s.careMistakes[s.stage]++;
  ev.push({ type: 'CARE_MISTAKE', at: now, reason, stage: s.stage });
}

export function sicknessRisk(s: PetState, now: number): number {
  const k = TUNING.sickness;
  let p = k.base;
  const over = s.droppings.length - TUNING.poopSickThresholdCount;
  if (over > 0) p += over * k.perDroppingOverLimit;
  if (s.droppings.some((dr) => now - dr.at > TUNING.poopSickAgeMs)) p += k.oldDropping;
  if (s.stats.hygiene < k.lowHygieneThreshold) p += k.lowHygiene;
  if (s.stage !== 'egg' && s.stats.weight > TUNING.overweight[s.stage]) p += k.overweight;
  if (s.hungerZeroMs > TUNING.hungerZeroMistakeMs) p += k.starving;
  return p;
}

export function makeSick(s: PetState, now: number, r: RNG, cause: string, ev: SimEvent[]) {
  if (s.sick) return;
  s.sick = {
    dosesNeeded: r.int(TUNING.sickness.minDoses, TUNING.sickness.maxDoses),
    since: now,
    untreatedMs: 0,
  };
  s.counters.sicknesses++;
  ev.push({ type: 'GOT_SICK', at: now, cause });
}

function sickness(s: PetState, d: number, now: number, r: RNG, ev: SimEvent[]) {
  if (s.sick) {
    if (s.sleep) return;
    s.sick.untreatedMs += d;
    if (s.sick.untreatedMs >= TUNING.sickMistakeMs) {
      s.sick.untreatedMs -= TUNING.sickMistakeMs;
      careMistake(s, 'sick', now, ev);
    }
    return;
  }
  if (s.sleep) return;
  const p = sicknessRisk(s, now) * (d / MIN);
  if (r.chance(p)) makeSick(s, now, r, 'risk', ev);
}

function realNeed(s: PetState): CallReason | null {
  if (s.sleep)
    return s.lightsOn && s.sleep.kind !== 'nap' && !s.sleep.mistakeCounted ? 'lights' : null;
  if (s.sick) return 'sick';
  if (s.stats.hunger <= 0) return 'hunger';
  if (s.stats.happiness <= 0) return 'happiness';
  return null;
}

/** End calls whose cause is gone. Also used after actions. */
export function resolveCalls(s: PetState, now: number, ev: SimEvent[]) {
  const c = s.call;
  if (!c || !c.real) return;
  const need = realNeed(s);
  if (need !== c.reason) {
    s.call = null;
    ev.push({ type: 'CALL_ENDED', at: now, reason: c.reason, answered: true });
  }
}

function calls(s: PetState, now: number, r: RNG, ev: SimEvent[]) {
  resolveCalls(s, now, ev);
  const c = s.call;
  if (c) {
    if (now - c.since < (c.real ? TUNING.callTimeoutMs : TUNING.falseCallDurationMs)) return;
    s.call = null;
    ev.push({ type: 'CALL_ENDED', at: now, reason: c.reason, answered: false });
    if (c.reason === 'hunger' || c.reason === 'happiness') careMistake(s, c.reason, now, ev);
    if (c.real) s.callCooldownUntil[c.reason] = now + TUNING.callRearmMs;
    else {
      s.disciplineUntil = 0;
      scheduleFalseCall(s, now, r);
    }
    return;
  }
  const need = realNeed(s);
  if (need && now >= (s.callCooldownUntil[need] ?? 0)) {
    s.call = { reason: need, since: now, real: true };
    ev.push({ type: 'CALLED_ATTENTION', at: now, reason: need });
    return;
  }
  if (!need && !s.sleep && (s.stage === 'child' || s.stage === 'teen')) {
    if (!Number.isFinite(s.nextFalseCallAt)) scheduleFalseCall(s, now, r);
    else if (now >= s.nextFalseCallAt) {
      s.call = { reason: 'false', since: now, real: false };
      s.disciplineUntil = now + TUNING.falseCallDurationMs;
      ev.push({ type: 'CALLED_ATTENTION', at: now, reason: 'false' });
    }
  }
}

export function scheduleFalseCall(s: PetState, now: number, r: RNG) {
  if (s.stage !== 'child' && s.stage !== 'teen') {
    s.nextFalseCallAt = Number.POSITIVE_INFINITY;
    return;
  }
  const base = TUNING.falseCallInterval[s.stage];
  s.nextFalseCallAt = now + base + r.range(-TUNING.falseCallJitter, TUNING.falseCallJitter);
}

function healthAndBond(s: PetState, d: number) {
  const h = d / HOUR;
  const k = TUNING.health;
  let delta = 0;
  if (s.sick) delta -= k.sickDrain * h;
  if (s.stats.hunger <= 0) delta -= k.starvingDrain * h;
  if (delta === 0) delta = k.recover * h;
  s.stats.health = clamp(s.stats.health + delta);
  const st = s.stats;
  if (!s.sick && st.hunger > 50 && st.happiness > 50 && st.hygiene > 50) {
    st.bond = clamp(st.bond + TUNING.bond.contentGain * h);
  }
}

function maybeEvolve(s: PetState, now: number, r: RNG, ev: SimEvent[]) {
  if (s.stage === 'adult' || s.stage === 'egg' || s.sleep) return;
  if (s.stageMs < TUNING.stageDuration[s.stage]) return;
  evolve(s, now, r, ev);
}

/** Move to the next stage now (used by time and by the Dev Panel). */
export function evolve(s: PetState, now: number, r: RNG, ev: SimEvent[], forceForm?: AdultForm) {
  if (s.stage === 'adult') return;
  if (s.stage === 'egg') {
    s.eggMs = TUNING.stageDuration.egg;
    hatch(s, now, r, ev);
    return;
  }
  const from = s.form;
  const next = NEXT_STAGE[s.stage] as Grown;
  s.stage = next;
  s.form =
    next === 'adult'
      ? (forceForm ?? resolveAdultForm(evolutionInputOf(s)))
      : MOSSLING.stageForms[next as Exclude<Grown, 'adult'>];
  s.stageMs = 0;
  s.stats.weight += TUNING.growthWeight[next as keyof typeof TUNING.growthWeight] ?? 0;
  s.stats.weight = Math.max(s.stats.weight, TUNING.minWeight[next]);
  s.nextNapAt = Number.POSITIVE_INFINITY;
  scheduleFalseCall(s, now, r);
  if (s.call && !s.call.real) {
    s.call = null;
    s.disciplineUntil = 0;
  }
  s.history.push({ stage: next, form: s.form, at: now });
  ev.push({ type: 'EVOLVED', at: now, from, to: s.form });
}

/** Natural lifespan in sim ms, weighted by bond and care. */
export function lifespanMs(s: PetState): number {
  const { minDays, maxDays } = TUNING.lifespan;
  const care = 1 - Math.min(1, totalMistakes(s) / 10);
  const score = clamp(0.5 * care + 0.3 * (s.stats.bond / 100) + 0.2 * s.lifespanRoll, 0, 1);
  return (minDays + (maxDays - minDays) * score) * DAY;
}

function maybeLifespanEnd(s: PetState, now: number, ev: SimEvent[]) {
  if (s.stage !== 'adult' || s.lifeMode === 'eternal' || s.sleep) return;
  if (s.ageMs >= lifespanMs(s)) endLife(s, now, 'left', ev);
}

export function endLife(
  s: PetState,
  now: number,
  how: 'left' | 'ranaway' | 'passed',
  ev: SimEvent[],
) {
  s.status = how;
  s.endedAt = now;
  s.call = null;
  s.sleep = null;
  if (how === 'left') ev.push({ type: 'LEFT', at: now, reason: 'lifespan' });
  else if (how === 'ranaway') ev.push({ type: 'RAN_AWAY', at: now });
  else ev.push({ type: 'PASSED', at: now });
}
