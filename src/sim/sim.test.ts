import { describe, expect, it } from 'vitest';
import {
  applyAction,
  catchUp,
  createPet,
  createRng,
  DAY,
  evolve,
  forecast,
  hearts,
  HOUR,
  inWindow,
  lifespanMs,
  localHour,
  migrateSave,
  MIN,
  playBlock,
  resolveAdultForm,
  SAVE_VERSION,
  SaveError,
  seedFrom,
  sicknessRisk,
  step,
  summarize,
  summaryIsEmpty,
  timeOfDay,
  totalMistakes,
  TUNING,
  ageYears,
  bedtimeFor,
  dayKey,
  pickSpecies,
  resolveOutcome,
  speciesOf,
  outcomeOf,
  isEggForm,
  FORM_STAGE,
  FORM_SPECIES,
  SPECIES_IDS,
  ALL_FORMS,
  type PetState,
  type SimEvent,
} from './index';

/** Noon UTC, Jan 1 2026. Tests run with tzOffset 0 so wall-clock = UTC. */
const T0 = Date.UTC(2026, 0, 1, 12, 0, 0);

function egg(seed = 7): PetState {
  return createPet({ now: T0, seed, tzOffsetMin: 0 });
}

/** Return a pet advanced (via Dev-style evolve) to the given stage at `at`. */
function petAt(stage: 'baby' | 'child' | 'teen' | 'adult', at = T0, seed = 7): PetState {
  const s = egg(seed);
  const r = createRng(s.rngState);
  const ev: SimEvent[] = [];
  const order = ['baby', 'child', 'teen', 'adult'];
  for (let i = 0; i <= order.indexOf(stage); i++) evolve(s, at, r, ev);
  s.rngState = r.state;
  s.name = 'Pebble';
  // Keep tests free of random sickness unless they opt in.
  return s;
}

function noRisk(s: PetState) {
  s.droppings = [];
  s.stats.hygiene = 100;
}

function types(events: SimEvent[]) {
  return events.map((e) => e.type);
}

function run(s: PetState, ms: number, from: number, chunk = MIN) {
  let st = s;
  const all: SimEvent[] = [];
  let t = from;
  for (let done = 0; done < ms; done += chunk) {
    t += chunk;
    const res = step(st, chunk, t);
    st = res.state;
    all.push(...res.events);
  }
  return { state: st, events: all, now: t };
}

describe('rng', () => {
  it('is deterministic and covers helpers', () => {
    const a = createRng(42);
    const b = createRng(42);
    const xs = [a.next(), a.int(1, 6), a.range(2, 3), a.chance(0.5), a.pick(['x', 'y'])];
    const ys = [b.next(), b.int(1, 6), b.range(2, 3), b.chance(0.5), b.pick(['x', 'y'])];
    expect(xs).toEqual(ys);
    expect(a.state).toBe(b.state);
    expect(seedFrom('mossling')).toBe(seedFrom('mossling'));
    expect(seedFrom('a')).not.toBe(seedFrom('b'));
  });
});

describe('clock', () => {
  it('computes local hours and windows', () => {
    expect(localHour(T0, 0)).toBe(12);
    expect(localHour(T0, -120)).toBe(14); // UTC+2
    expect(inWindow(22, 20, 8)).toBe(true);
    expect(inWindow(3, 20, 8)).toBe(true);
    expect(inWindow(12, 20, 8)).toBe(false);
    expect(inWindow(10, 9, 17)).toBe(true);
    expect(inWindow(10, 9, 9)).toBe(false);
    expect(timeOfDay(6)).toBe('dawn');
    expect(timeOfDay(12)).toBe('day');
    expect(timeOfDay(19)).toBe('dusk');
    expect(timeOfDay(23)).toBe('night');
    expect(dayKey(T0, 0)).not.toBe(dayKey(T0 + DAY, 0));
  });
  it('hearts rounds up slivers', () => {
    expect(hearts(0)).toBe(0);
    expect(hearts(1)).toBe(1);
    expect(hearts(25)).toBe(1);
    expect(hearts(26)).toBe(2);
    expect(hearts(100)).toBe(4);
  });
});

describe('egg and hatching', () => {
  it('hatches after the egg duration', () => {
    const s = egg();
    const r1 = step(s, 4 * MIN, T0 + 4 * MIN);
    expect(r1.state.stage).toBe('egg');
    const r2 = step(r1.state, 2 * MIN, T0 + 6 * MIN);
    expect(r2.state.stage).toBe('baby');
    expect(r2.state.form).toBe('dewdrop');
    expect(types(r2.events)).toContain('HATCHED');
  });
  it('step is deterministic', () => {
    const a = step(egg(3), 3 * HOUR, T0 + 3 * HOUR);
    const b = step(egg(3), 3 * HOUR, T0 + 3 * HOUR);
    expect(a.state).toEqual(b.state);
    expect(a.events).toEqual(b.events);
  });
  it('names the pet', () => {
    const s = petAt('baby');
    const r = applyAction(s, { type: 'name', name: '  Fennel  ' }, T0);
    expect(r.state.name).toBe('Fennel');
    expect(applyAction(s, { type: 'name', name: '   ' }, T0).events).toEqual([]);
  });
  it('negative dt is a no-op', () => {
    const s = egg();
    expect(step(s, -5, T0).state.eggMs).toBe(0);
  });
});

describe('decay', () => {
  it('drains hunger and happiness on the baby schedule', () => {
    const s = petAt('baby');
    s.stats.hunger = 100;
    s.stats.happiness = 100;
    s.nextNapAt = Infinity;
    noRisk(s);
    const { state } = step(s, 1 * HOUR, T0 + HOUR);
    expect(state.stats.hunger).toBeCloseTo(50, 0);
    expect(state.stats.happiness).toBeCloseTo(50, 0);
  });
  it('decays far slower while asleep and refills energy', () => {
    const s = petAt('adult');
    s.stats.hunger = 100;
    s.stats.energy = 20;
    s.lightsOn = false;
    s.sleep = { kind: 'exhausted', since: T0, lightsOnMs: 0, mistakeCounted: false };
    const { state } = step(s, 30 * MIN, T0 + 30 * MIN);
    expect(state.stats.hunger).toBeGreaterThan(98);
    expect(state.stats.energy).toBeGreaterThan(20);
  });
  it('drains happiness faster awake in the dark', () => {
    const lit = petAt('adult');
    const dark = petAt('adult');
    dark.lightsOn = false;
    const a = step(lit, HOUR, T0 + HOUR).state.stats.happiness;
    const b = step(dark, HOUR, T0 + HOUR).state.stats.happiness;
    expect(b).toBeLessThan(a);
  });
});

describe('feeding', () => {
  it('meals raise hunger and weight; full pets refuse', () => {
    let s = petAt('child');
    s.stats.hunger = 50;
    const w = s.stats.weight;
    let r = applyAction(s, { type: 'feed', food: 'mossbread' }, T0);
    expect(r.state.stats.hunger).toBeCloseTo(87.5);
    expect(r.state.stats.weight).toBe(w + 2);
    expect(types(r.events)).toContain('ATE');
    r = applyAction(r.state, { type: 'feed', food: 'dewberry_mash' }, T0);
    s = r.state;
    expect(s.stats.hunger).toBe(100);
    r = applyAction(s, { type: 'feed', food: 'dewberry_mash' }, T0);
    expect(r.events[0]).toMatchObject({ type: 'REFUSED', why: 'full' });
  });
  it('refuses when asleep or an egg', () => {
    const e = egg();
    expect(applyAction(e, { type: 'feed', food: 'mossbread' }, T0).events[0]).toMatchObject({
      why: 'too-young',
    });
    expect(applyAction(e, { type: 'snack' }, T0).events[0]).toMatchObject({ why: 'too-young' });
    const s = petAt('child');
    s.sleep = { kind: 'night', since: T0, lightsOnMs: 0, mistakeCounted: false };
    expect(applyAction(s, { type: 'feed', food: 'mossbread' }, T0).events[0]).toMatchObject({
      why: 'asleep',
    });
    expect(applyAction(s, { type: 'snack' }, T0).events[0]).toMatchObject({ why: 'asleep' });
  });
  it('teens can refuse moodily, which opens a discipline moment', () => {
    let found = false;
    for (let seed = 1; seed < 60 && !found; seed++) {
      const s = petAt('teen', T0, seed);
      s.stats.hunger = 20;
      const r = applyAction(s, { type: 'feed', food: 'mossbread' }, T0);
      if (r.events[0]?.type === 'REFUSED') {
        found = true;
        expect(r.state.disciplineUntil).toBeGreaterThan(T0);
        const sc = applyAction(r.state, { type: 'scold' }, T0 + MIN);
        expect(sc.events).toContainEqual(
          expect.objectContaining({ type: 'SCOLDED', correct: true }),
        );
        expect(sc.state.stats.discipline).toBe(25);
      }
    }
    expect(found).toBe(true);
  });
  it('too many snacks cause a stomachache', () => {
    let s = petAt('child');
    for (let i = 0; i < 3; i++) s = applyAction(s, { type: 'snack' }, T0 + i * MIN).state;
    expect(s.sick).toBeNull();
    const r = applyAction(s, { type: 'snack' }, T0 + 5 * MIN);
    expect(types(r.events)).toEqual(expect.arrayContaining(['STOMACHACHE', 'GOT_SICK']));
    expect(r.state.sick).not.toBeNull();
    // Snacks outside the window don't count.
    let t = petAt('child');
    for (let i = 0; i < 6; i++) t = applyAction(t, { type: 'snack' }, T0 + i * 3 * HOUR).state;
    expect(t.sick).toBeNull();
  });
});

describe('play, clean, bath, pet, praise', () => {
  it('play rules', () => {
    expect(playBlock(egg())).toBe('egg');
    const baby = petAt('baby');
    expect(playBlock(baby)).toBe('too-young');
    expect(
      applyAction(baby, { type: 'play', game: 'which-way', won: true }, T0).events[0],
    ).toMatchObject({
      type: 'REFUSED',
      why: 'too-young',
    });
    const c = petAt('child');
    c.stats.happiness = 10;
    const r = applyAction(c, { type: 'play', game: 'firefly-catch', won: true }, T0);
    expect(r.state.stats.happiness).toBe(35);
    expect(r.state.stats.energy).toBe(90);
    expect(r.state.counters.gamesWon).toBe(1);
    const lose = applyAction(c, { type: 'play', game: 'lilypad-hop', won: false }, T0);
    expect(lose.state.stats.happiness).toBe(18);
    c.stats.energy = 5;
    expect(playBlock(c)).toBe('tired');
    c.stats.energy = 100;
    c.sick = { dosesNeeded: 1, since: T0, untreatedMs: 0 };
    expect(playBlock(c)).toBe('sick');
    c.sick = null;
    c.sleep = { kind: 'night', since: T0, lightsOnMs: 0, mistakeCounted: false };
    expect(playBlock(c)).toBe('asleep');
    c.status = 'left';
    expect(playBlock(c)).toBe('gone');
    expect(applyAction(c, { type: 'play', game: 'which-way', won: true }, T0).events).toEqual([]);
  });
  it('tired pets refuse to play', () => {
    const c = petAt('child');
    c.stats.energy = 16;
    const r = applyAction(c, { type: 'play', game: 'which-way', won: true }, T0);
    expect(r.state.stats.energy).toBe(6);
    const again = applyAction(r.state, { type: 'play', game: 'which-way', won: true }, T0);
    expect(again.events[0]).toMatchObject({ type: 'REFUSED', why: 'tired' });
  });
  it('clean removes droppings, bath restores hygiene', () => {
    const s = petAt('child');
    s.droppings = [{ id: 1, at: T0, x: 0.5 }];
    s.stats.hygiene = 40;
    const c = applyAction(s, { type: 'clean' }, T0);
    expect(c.state.droppings).toHaveLength(0);
    expect(c.state.stats.hygiene).toBe(70);
    expect(applyAction(c.state, { type: 'clean' }, T0).state.stats.hygiene).toBe(80);
    const b = applyAction(s, { type: 'bath' }, T0);
    expect(b.state.stats.hygiene).toBe(100);
    expect(applyAction(egg(), { type: 'bath' }, T0).events).toEqual([]);
    let clover = false;
    for (let i = 1; i < 200 && !clover; i++) {
      const p = petAt('child', T0, i);
      clover = types(applyAction(p, { type: 'bath' }, T0).events).includes('FOUND_CLOVER');
    }
    expect(clover).toBe(true);
  });
  it('petting has a cooldown and does not count while asleep', () => {
    const s = petAt('child');
    s.stats.happiness = 50;
    const a = applyAction(s, { type: 'pet', spot: 'sprout' }, T0 + HOUR);
    expect(a.state.stats.happiness).toBe(54);
    const b = applyAction(a.state, { type: 'pet', spot: 'belly' }, T0 + HOUR + 1000);
    expect(b.events[0]).toMatchObject({ counted: false });
    const e = applyAction(egg(), { type: 'pet', spot: 'body' }, T0 + HOUR);
    expect(e.events[0]).toMatchObject({ type: 'PETTED', counted: false });
  });
  it('praise only counts after a good deed; spamming does nothing', () => {
    const s = petAt('child');
    const spam = applyAction(s, { type: 'praise' }, T0);
    expect(spam.events[0]).toMatchObject({ meaningful: false });
    expect(spam.state.stats.discipline).toBe(0);
    const fed = applyAction(s, { type: 'feed', food: 'dewberry_mash' }, T0);
    const p = applyAction(fed.state, { type: 'praise' }, T0 + MIN);
    expect(p.events[0]).toMatchObject({ meaningful: true });
    expect(p.state.stats.discipline).toBe(5);
    expect(applyAction(p.state, { type: 'praise' }, T0 + 2 * MIN).events[0]).toMatchObject({
      meaningful: false,
    });
    expect(applyAction(egg(), { type: 'praise' }, T0).events).toEqual([]);
  });
});

describe('discipline and false calls', () => {
  it('a child makes false calls; correct scolding raises discipline', () => {
    let s = petAt('child');
    noRisk(s);
    s.stats.hunger = 100;
    s.stats.happiness = 100;
    s.nextFalseCallAt = T0 + 10 * MIN;
    const r = step(s, 11 * MIN, T0 + 11 * MIN);
    expect(r.state.call).toMatchObject({ reason: 'false', real: false });
    s = r.state;
    const sc = applyAction(s, { type: 'scold' }, T0 + 12 * MIN);
    expect(sc.state.stats.discipline).toBe(25);
    expect(sc.state.call).toBeNull();
    expect(types(sc.events)).toContain('CALL_ENDED');
  });
  it('scolding without cause hurts happiness', () => {
    const s = petAt('child');
    s.stats.happiness = 60;
    const r = applyAction(s, { type: 'scold' }, T0);
    expect(r.state.stats.happiness).toBe(45);
    expect(r.events[0]).toMatchObject({ correct: false });
    expect(applyAction(egg(), { type: 'scold' }, T0).events).toEqual([]);
  });
  it('an ignored false call expires without a care mistake', () => {
    const s = petAt('child');
    noRisk(s);
    s.stats.hunger = 100;
    s.stats.happiness = 100;
    s.nextFalseCallAt = T0 + MIN;
    const r = step(s, 20 * MIN, T0 + 20 * MIN);
    expect(r.events).toContainEqual(
      expect.objectContaining({ type: 'CALL_ENDED', answered: false }),
    );
    expect(totalMistakes(r.state)).toBe(0);
    expect(r.state.nextFalseCallAt).toBeGreaterThan(T0 + 20 * MIN);
  });
  it('adults do not make false calls', () => {
    const s = petAt('adult');
    expect(s.nextFalseCallAt).toBe(Infinity);
  });
});

describe('care mistakes', () => {
  it('an ignored hunger call is one mistake after 15 minutes', () => {
    const s = petAt('child');
    noRisk(s);
    s.stats.hunger = 0;
    s.stats.happiness = 100;
    s.nextFalseCallAt = Infinity;
    const r = step(s, 16 * MIN, T0 + 16 * MIN);
    expect(r.events).toContainEqual(
      expect.objectContaining({ type: 'CALLED_ATTENTION', reason: 'hunger' }),
    );
    expect(r.state.careMistakes.child).toBe(1);
    // The call re-arms only after the cooldown.
    const r2 = step(r.state, 30 * MIN, T0 + 46 * MIN);
    expect(r2.state.careMistakes.child).toBe(1);
  });
  it('answering a call in time avoids the mistake', () => {
    const s = petAt('child');
    noRisk(s);
    s.stats.hunger = 0;
    s.nextFalseCallAt = Infinity;
    const r = step(s, 5 * MIN, T0 + 5 * MIN);
    const fed = applyAction(r.state, { type: 'feed', food: 'mossbread' }, T0 + 5 * MIN);
    expect(fed.events).toContainEqual(
      expect.objectContaining({ type: 'CALL_ENDED', answered: true }),
    );
    const r2 = step(fed.state, 20 * MIN, T0 + 25 * MIN);
    expect(r2.state.careMistakes.child).toBe(0);
  });
  it('an unhappy call also counts', () => {
    const s = petAt('teen');
    noRisk(s);
    s.stats.hunger = 100;
    s.stats.happiness = 0;
    s.nextFalseCallAt = Infinity;
    const r = step(s, 16 * MIN, T0 + 16 * MIN);
    expect(r.state.careMistakes.teen).toBe(1);
  });
});

describe('sleep and lights', () => {
  const evening = Date.UTC(2026, 0, 1, 19, 50);
  it('a child falls asleep at 8 pm and wakes at 8 am with lights back on', () => {
    const s = petAt('child', evening);
    noRisk(s);
    s.stats.hunger = 100;
    s.stats.happiness = 100;
    s.nextFalseCallAt = Infinity;
    const a = step(s, 15 * MIN, evening + 15 * MIN);
    expect(a.state.sleep?.kind).toBe('night');
    expect(types(a.events)).toContain('FELL_ASLEEP');
    const off = applyAction(a.state, { type: 'lights', on: false }, evening + 16 * MIN);
    expect(off.state.lightsOn).toBe(false);
    expect(applyAction(off.state, { type: 'lights', on: false }, evening).events).toEqual([]);
    const morning = Date.UTC(2026, 0, 2, 8, 5);
    const b = step(off.state, morning - (evening + 16 * MIN), morning);
    expect(b.state.sleep).toBeNull();
    expect(b.state.lightsOn).toBe(true);
    expect(b.events).toContainEqual(
      expect.objectContaining({ type: 'WOKE_UP', kind: 'night', fullNightLightsOff: true }),
    );
    expect(b.state.sleptFullNightLightsOff).toBe(true);
    expect(totalMistakes(b.state)).toBe(0);
    // It doesn't fall straight back asleep the same night.
    expect(step(b.state, 10 * MIN, morning + 10 * MIN).state.sleep).toBeNull();
  });
  it('lights left on 15 min after sleep is a care mistake (once per sleep)', () => {
    const s = petAt('child', evening);
    noRisk(s);
    s.stats.hunger = 100;
    s.stats.happiness = 100;
    s.nextFalseCallAt = Infinity;
    const r = step(s, 2 * HOUR, evening + 2 * HOUR);
    expect(r.events).toContainEqual(
      expect.objectContaining({ type: 'CALLED_ATTENTION', reason: 'lights' }),
    );
    expect(r.state.careMistakes.child).toBe(1);
    expect(r.state.sleep?.mistakeCounted).toBe(true);
  });
  it('babies nap and wake by themselves', () => {
    const s = petAt('baby');
    noRisk(s);
    s.stats.hunger = 100;
    s.stats.happiness = 100;
    const r = run(s, 35 * MIN, T0);
    const t = types(r.events);
    expect(t).toContain('FELL_ASLEEP');
    expect(t).toContain('WOKE_UP');
  });
  it('exhausted pets nap until rested', () => {
    const s = petAt('adult');
    s.stats.energy = 0.01;
    s.lightsOn = false;
    const r = run(s, 6 * HOUR, T0, 5 * MIN);
    expect(r.events).toContainEqual(
      expect.objectContaining({ type: 'FELL_ASLEEP', kind: 'exhausted' }),
    );
    expect(r.events).toContainEqual(
      expect.objectContaining({ type: 'WOKE_UP', kind: 'exhausted' }),
    );
  });
  it('adult bedtimes shift by form', () => {
    const s = petAt('adult');
    s.form = 'starwick';
    expect(bedtimeFor(s)).toEqual({ sleep: 23, wake: 10 });
    s.form = 'lanternmoss';
    expect(bedtimeFor(s)).toEqual({ sleep: 21, wake: 8 });
    expect(bedtimeFor(petAt('baby'))).toBeNull();
  });
});

describe('droppings and sickness', () => {
  it('poops on schedule while awake', () => {
    const s = petAt('child');
    s.stats.hunger = 100;
    s.stats.happiness = 100;
    s.nextFalseCallAt = Infinity;
    s.nextPoopAt = T0 + 5 * MIN;
    const r = step(s, 10 * MIN, T0 + 10 * MIN);
    expect(r.state.droppings).toHaveLength(1);
    expect(types(r.events)).toContain('POOPED');
  });
  it('risk rises with droppings, dirt, weight and starving', () => {
    const s = petAt('adult');
    noRisk(s);
    const base = sicknessRisk(s, T0);
    s.droppings = [1, 2, 3, 4, 5].map((id) => ({ id, at: T0 - 2 * HOUR, x: 0.5 }));
    s.stats.hygiene = 5;
    s.stats.weight = 999;
    s.hungerZeroMs = HOUR;
    expect(sicknessRisk(s, T0)).toBeGreaterThan(base * 100);
  });
  it('neglect gets the pet sick; medicine needs 1–3 doses', () => {
    let s = petAt('adult');
    s.droppings = [1, 2, 3, 4, 5, 6].map((id) => ({ id, at: T0 - 2 * HOUR, x: 0.5 }));
    s.stats.hygiene = 5;
    s.stats.hunger = 100;
    s.stats.happiness = 100;
    const r = run(s, 9 * HOUR, T0, 10 * MIN);
    expect(r.state.sick).not.toBeNull();
    s = r.state;
    const doses = s.sick!.dosesNeeded;
    expect(doses).toBeGreaterThanOrEqual(1);
    expect(doses).toBeLessThanOrEqual(3);
    for (let i = 0; i < doses; i++) s = applyAction(s, { type: 'medicine' }, r.now).state;
    expect(s.sick).toBeNull();
    const refuse = applyAction(s, { type: 'medicine' }, r.now);
    expect(refuse.events[0].type).toBe('MEDICINE_REFUSED');
    expect(applyAction(egg(), { type: 'medicine' }, T0).events).toEqual([]);
  });
  it('untreated sickness is a mistake every hour', () => {
    const s = petAt('adult');
    noRisk(s);
    s.stats.hunger = 100;
    s.stats.happiness = 100;
    s.sick = { dosesNeeded: 2, since: T0, untreatedMs: 0 };
    const r = step(s, 2 * HOUR + MIN, T0 + 2 * HOUR + MIN);
    expect(r.state.careMistakes.adult).toBe(2);
  });
});

describe('evolution', () => {
  it('resolves every branch', () => {
    const base = {
      childMistakes: 0,
      teenMistakes: 0,
      discipline: 100,
      sleptFullNightLightsOff: true,
    };
    expect(resolveAdultForm(base)).toBe('starwick');
    expect(resolveAdultForm({ ...base, sleptFullNightLightsOff: false })).toBe('lanternmoss');
    expect(resolveAdultForm({ ...base, childMistakes: 1, teenMistakes: 1, discipline: 75 })).toBe(
      'lanternmoss',
    );
    expect(resolveAdultForm({ ...base, childMistakes: 2, teenMistakes: 1 })).toBe('burrowbun');
    expect(resolveAdultForm({ ...base, discipline: 50 })).toBe('burrowbun');
    expect(resolveAdultForm({ ...base, childMistakes: 3, teenMistakes: 2, discipline: 0 })).toBe(
      'burrowbun',
    );
    expect(resolveAdultForm({ ...base, childMistakes: 3, teenMistakes: 3 })).toBe('mirefuzz');
  });
  it('thresholds are tunable', () => {
    const t = {
      secret: { maxMistakes: 0, minDiscipline: 100 },
      best: { maxMistakes: 10, minDiscipline: 0 },
      average: { maxMistakes: 20 },
    };
    expect(
      resolveAdultForm(
        { childMistakes: 5, teenMistakes: 5, discipline: 0, sleptFullNightLightsOff: false },
        t,
      ),
    ).toBe('lanternmoss');
  });
  it('grows through stages in real time', () => {
    let s = petAt('baby');
    s.stats.hunger = 100;
    s.stats.happiness = 100;
    s.nextNapAt = Infinity;
    s.stageMs = TUNING.stageDuration.baby - MIN;
    const r = step(s, 2 * MIN, T0 + 2 * MIN);
    expect(r.state.form).toBe('sprig');
    expect(r.events).toContainEqual(
      expect.objectContaining({ type: 'EVOLVED', from: 'dewdrop', to: 'sprig' }),
    );
    s = r.state;
    s.stageMs = TUNING.stageDuration.child;
    s.sleep = null;
    const r2 = step(s, MIN, T0 + 3 * MIN);
    expect(r2.state.form).toBe('fernlet');
  });
  it('teen → adult uses the care record (Mirefuzz on poor care)', () => {
    const s = petAt('teen');
    s.careMistakes.child = 4;
    s.careMistakes.teen = 4;
    s.stageMs = TUNING.stageDuration.teen;
    noRisk(s);
    const r = step(s, MIN, T0 + MIN);
    expect(r.state.form).toBe('mirefuzz');
    expect(r.state.stage).toBe('adult');
  });
  it('a pet does not evolve while asleep', () => {
    const s = petAt('teen');
    s.stageMs = TUNING.stageDuration.teen;
    s.sleep = { kind: 'exhausted', since: T0, lightsOnMs: 0, mistakeCounted: false };
    s.lightsOn = false;
    s.stats.energy = 0;
    expect(step(s, MIN, T0 + MIN).state.stage).toBe('teen');
  });
  it('evolve can be forced and is a no-op for adults; it hatches eggs', () => {
    const s = petAt('teen');
    const r = createRng(1);
    const ev: SimEvent[] = [];
    evolve(s, T0, r, ev, 'starwick');
    expect(s.form).toBe('starwick');
    evolve(s, T0, r, ev);
    expect(s.form).toBe('starwick');
    const e = egg();
    evolve(e, T0, r, ev);
    expect(e.form).toBe('dewdrop');
  });
});

describe('end of life', () => {
  it('Gentle: an adult returns to the forest at the end of its lifespan', () => {
    const s = petAt('adult');
    noRisk(s);
    s.ageMs = lifespanMs(s) - MIN / 2;
    const r = step(s, MIN, T0 + MIN);
    expect(r.state.status).toBe('left');
    expect(types(r.events)).toContain('LEFT');
    // Nothing happens after leaving.
    expect(step(r.state, HOUR, T0 + HOUR).events).toEqual([]);
    expect(applyAction(r.state, { type: 'feed', food: 'mossbread' }, T0).events).toEqual([]);
  });
  it('lifespan is 6–10 days and better care lives longer', () => {
    const good = petAt('adult');
    good.stats.bond = 100;
    const bad = petAt('adult');
    bad.careMistakes.teen = 12;
    expect(lifespanMs(good)).toBeGreaterThan(lifespanMs(bad));
    expect(lifespanMs(bad)).toBeGreaterThanOrEqual(6 * DAY);
    expect(lifespanMs(good)).toBeLessThanOrEqual(10 * DAY);
  });
  it('Eternal: the adult never leaves and never runs away', () => {
    let s = petAt('adult');
    s = applyAction(s, { type: 'setLifeMode', mode: 'eternal' }, T0).state;
    s.ageMs = 20 * DAY;
    s.stats.health = 0.001;
    s.sick = { dosesNeeded: 3, since: T0, untreatedMs: 0 };
    const r = step(s, 10 * MIN, T0 + 10 * MIN);
    expect(r.state.status).toBe('alive');
    expect(r.state.stats.health).toBeGreaterThan(0);
  });
  it('Gentle: health 0 makes the pet run away', () => {
    const s = petAt('adult');
    s.stats.health = 0.01;
    s.stats.hunger = 0;
    const r = step(s, MIN, T0 + MIN);
    expect(r.state.status).toBe('ranaway');
    expect(types(r.events)).toContain('RAN_AWAY');
  });
  it('Classic: health 0 means the pet passes away', () => {
    let s = petAt('adult');
    s = applyAction(s, { type: 'setLifeMode', mode: 'classic' }, T0).state;
    s.stats.health = 0.01;
    s.stats.hunger = 0;
    const r = step(s, MIN, T0 + MIN);
    expect(r.state.status).toBe('passed');
    expect(types(r.events)).toContain('PASSED');
  });
});

describe('birthdays and ages', () => {
  it('emits a birthday every in-world year', () => {
    const s = petAt('adult');
    noRisk(s);
    s.ageMs = DAY - MIN / 2;
    const r = step(s, MIN, T0 + MIN);
    expect(r.events).toContainEqual(expect.objectContaining({ type: 'BIRTHDAY', age: 1 }));
    expect(ageYears(r.state)).toBe(1);
  });
});

describe('babysitter pause', () => {
  it('freezes time and is capped at 12 h per day', () => {
    const P = Date.UTC(2026, 0, 1, 1, 0); // 1 am, so 12 h stays within one day
    let s = petAt('child', P);
    s.stats.hunger = 80;
    s.nextPoopAt = P + 10 * MIN;
    s = applyAction(s, { type: 'setPaused', active: true }, P).state;
    expect(applyAction(s, { type: 'setPaused', active: true }, P).events).toEqual([]);
    const r = step(s, 2 * HOUR, P + 2 * HOUR);
    expect(r.state.stats.hunger).toBe(80);
    expect(r.state.droppings).toHaveLength(0);
    expect(r.state.nextPoopAt).toBe(P + 10 * MIN + 2 * HOUR);
    const r2 = step(r.state, 11 * HOUR, P + 13 * HOUR);
    expect(r2.state.pause.active).toBe(false);
    expect(types(r2.events)).toContain('PAUSE_EXHAUSTED');
    expect(r2.state.stats.hunger).toBeLessThan(80);
    const again = applyAction(r2.state, { type: 'setPaused', active: true }, P + 13 * HOUR);
    expect(types(again.events)).toContain('PAUSE_EXHAUSTED');
    const unpause = applyAction(s, { type: 'setPaused', active: false }, T0);
    expect(unpause.state.pause.active).toBe(false);
  });
  it('shifts every schedule while paused', () => {
    const s = petAt('child');
    s.pause.active = true;
    s.call = { reason: 'false', since: T0, real: false };
    s.sleep = { kind: 'nap', since: T0, lightsOnMs: 0, mistakeCounted: false, until: T0 + MIN };
    s.disciplineUntil = T0 + MIN;
    s.praiseUntil = T0 + MIN;
    s.callCooldownUntil.hunger = T0;
    s.droppings = [{ id: 1, at: T0, x: 0.3 }];
    const r = step(s, HOUR, T0 + HOUR);
    expect(r.state.call!.since).toBe(T0 + HOUR);
    expect(r.state.sleep!.until).toBe(T0 + MIN + HOUR);
    expect(r.state.droppings[0].at).toBe(T0 + HOUR);
  });
});

describe('offline catch-up', () => {
  it('replays a night away with a summary', () => {
    const evening = Date.UTC(2026, 0, 1, 18, 0);
    const s = petAt('child', evening);
    s.stats.hunger = 100;
    s.stats.happiness = 100;
    const morning = Date.UTC(2026, 0, 2, 9, 0);
    const r = catchUp(s, evening, morning);
    expect(r.awayMs).toBe(15 * HOUR);
    const sum = summarize(r.events);
    expect(sum.sleeps).toHaveLength(1);
    expect(summaryIsEmpty(sum)).toBe(false);
    expect(r.state.offline).toBeNull();
  });
  it('caps neglect after 48 h and keeps health above the floor until 72 h', () => {
    const s = petAt('adult');
    const r = catchUp(s, T0, T0 + 60 * HOUR);
    expect(r.state.status).toBe('alive');
    expect(r.state.stats.health).toBeGreaterThanOrEqual(TUNING.offline.healthFloor);
    expect(totalMistakes(r.state)).toBeLessThanOrEqual(TUNING.offline.maxMistakes);
    // Shorter absences are not capped.
    const short = catchUp(petAt('adult'), T0, T0 + 30 * HOUR);
    expect(totalMistakes(short.state)).toBeGreaterThan(TUNING.offline.maxMistakes);
  });
  it('Gentle: neglected for more than 72 h → runs away', () => {
    const s = petAt('adult');
    const r = catchUp(s, T0, T0 + 80 * HOUR);
    expect(r.state.status).toBe('ranaway');
    expect(summarize(r.events).ended).toBe('ranaway');
  });
  it('Classic: long neglect can end in passing', () => {
    let s = petAt('adult');
    s = applyAction(s, { type: 'setLifeMode', mode: 'classic' }, T0).state;
    const r = catchUp(s, T0, T0 + 10 * DAY);
    expect(r.state.status).toBe('passed');
    expect(summarize(r.events).ended).toBe('passed');
  });
  it('caps catch-up length', () => {
    const r = catchUp(egg(), T0, T0 + 60 * DAY);
    expect(r.simulatedMs).toBe(TUNING.offline.maxCatchUpMs);
  });
  it('summarizes every kind of event', () => {
    const at = T0;
    const sum = summarize([
      { type: 'HATCHED', at },
      { type: 'POOPED', at, id: 1 },
      { type: 'CALLED_ATTENTION', at, reason: 'hunger' },
      { type: 'CALLED_ATTENTION', at, reason: 'happiness' },
      { type: 'CALLED_ATTENTION', at, reason: 'false' },
      { type: 'CALLED_ATTENTION', at, reason: 'sick' },
      { type: 'GOT_SICK', at, cause: 'risk' },
      { type: 'CARE_MISTAKE', at, reason: 'hunger', stage: 'child' },
      { type: 'EVOLVED', at, from: 'sprig', to: 'fernlet' },
      { type: 'BIRTHDAY', at, age: 2 },
      { type: 'WOKE_UP', at, kind: 'night', fullNightLightsOff: false },
      { type: 'LEFT', at, reason: 'lifespan' },
    ]);
    expect(sum).toMatchObject({
      hatched: true,
      poops: 1,
      hungerCalls: 1,
      happinessCalls: 1,
      falseCalls: 1,
      gotSick: true,
      mistakes: 1,
      evolvedTo: ['fernlet'],
      birthdays: 1,
      ended: 'left',
    });
    expect(summaryIsEmpty(summarize([]))).toBe(true);
  });
});

describe('forecast', () => {
  it('predicts hunger and bedtime', () => {
    const s = petAt('child', Date.UTC(2026, 0, 1, 15, 0));
    s.stats.hunger = 30;
    s.stats.happiness = 100;
    const f = forecast(s, Date.UTC(2026, 0, 1, 15, 0));
    expect(f.hungryAt).not.toBeNull();
    expect(f.bedtimeAt).toBe(Date.UTC(2026, 0, 1, 20, 0));
    expect(f.nextCallAt).not.toBeNull();
  });
});

describe('timezone', () => {
  it('uses the local wall clock for bedtime', () => {
    const s = petAt('child');
    const tz = applyAction(s, { type: 'setTimezone', offsetMin: -480 }, T0).state; // UTC+8: 20:00 local
    expect(localHour(T0, tz.tzOffsetMin)).toBe(20);
    noRisk(tz);
    tz.nextFalseCallAt = Infinity;
    tz.stats.hunger = tz.stats.happiness = 100;
    expect(step(tz, MIN, T0 + MIN).state.sleep?.kind).toBe('night');
  });
});

describe('save migrations', () => {
  it('migrates a v1 save to the current version', () => {
    const pet = petAt('child') as unknown as Record<string, unknown>;
    delete pet.pause;
    delete pet.counters;
    const out = migrateSave({ version: 1, savedAt: 5, pet, meta: { a: 1 } });
    expect(out.version).toBe(SAVE_VERSION);
    expect(out.pet.pause).toEqual({ active: false, usedMs: 0, dayKey: '' });
    expect(out.pet.counters.meals).toBe(0);
    expect(out.clockOffsetMs).toBe(0);
    expect(out.meta).toEqual({ a: 1 });
  });
  it('passes current saves through', () => {
    const out = migrateSave({
      version: SAVE_VERSION,
      savedAt: 1,
      clockOffsetMs: 9,
      pet: petAt('baby'),
    });
    expect(out.clockOffsetMs).toBe(9);
    expect(out.meta).toBeNull();
  });
  it('rejects broken saves', () => {
    expect(() => migrateSave(null)).toThrow(SaveError);
    expect(() => migrateSave({})).toThrow(/version/);
    expect(() => migrateSave({ version: 99, pet: {} })).toThrow(/newer/);
    expect(() => migrateSave({ version: 2 })).toThrow(/no Mossling/);
    expect(() => migrateSave({ version: 2, pet: { species: 'cat' } })).toThrow(/unreadable/);
  });
});

describe('full life', () => {
  it('a well-cared-for Mossling lives a full life at 600× and leaves an egg-worthy record', () => {
    // Simulate a diligent player: feeds, plays, cleans, doctors and turns lights off each tick.
    let s = createPet({ now: T0, seed: 99, tzOffsetMin: 0 });
    let t = T0;
    const seen = new Set<string>();
    for (let i = 0; i < 12 * 24 * 60 && s.status === 'alive'; i++) {
      t += MIN;
      const r = step(s, MIN, t);
      s = r.state;
      for (const e of r.events) seen.add(e.type === 'EVOLVED' ? `EVOLVED:${e.to}` : e.type);
      if (s.stage === 'egg') continue;
      if (s.sleep && s.lightsOn) s = applyAction(s, { type: 'lights', on: false }, t).state;
      if (s.sleep) continue;
      if (s.call?.reason === 'false') s = applyAction(s, { type: 'scold' }, t).state;
      if (s.stats.hunger < 60) s = applyAction(s, { type: 'feed', food: 'dewberry_mash' }, t).state;
      if (s.stats.happiness < 60) s = applyAction(s, { type: 'pet', spot: 'head' }, t).state;
      if (s.stats.happiness < 50 && !playBlock(s))
        s = applyAction(s, { type: 'play', game: 'which-way', won: true }, t).state;
      if (s.droppings.length) s = applyAction(s, { type: 'bath' }, t).state;
      if (s.sick) s = applyAction(s, { type: 'medicine' }, t).state;
      if (s.stats.weight > 25 && s.stage !== 'adult') s.stats.weight = 25;
    }
    expect(seen.has('HATCHED')).toBe(true);
    expect(seen.has('EVOLVED:sprig')).toBe(true);
    expect(seen.has('EVOLVED:fernlet')).toBe(true);
    expect([...seen].some((x) => /EVOLVED:(starwick|lanternmoss)/.test(x))).toBe(true);
    expect(s.status).toBe('left');
  });
});

describe('species', () => {
  it('every species has an egg, three young stages and four adults', () => {
    expect(SPECIES_IDS).toEqual(['mossling', 'capling', 'ripplet']);
    for (const id of SPECIES_IDS) {
      const sp = speciesOf(id);
      expect(isEggForm(sp.stageForms.egg)).toBe(true);
      expect(new Set(sp.adultForms).size).toBe(4);
      for (const f of [...Object.values(sp.stageForms), ...sp.adultForms]) {
        expect(FORM_SPECIES[f]).toBe(id);
        expect(sp.formNames[f]).toBeTruthy();
      }
    }
    expect(new Set(ALL_FORMS).size).toBe(ALL_FORMS.length);
    expect(speciesOf(undefined).id).toBe('mossling');
  });

  it('a Capling egg hatches and grows through Capling forms', () => {
    let s = createPet({ now: T0, seed: 5, tzOffsetMin: 0, species: 'capling' });
    expect(s.form).toBe('sporepod');
    s = step(s, 6 * MIN, T0 + 6 * MIN).state;
    expect(s.form).toBe('puffkin');
    const r = createRng(s.rngState);
    const ev: SimEvent[] = [];
    evolve(s, T0, r, ev);
    expect(s.form).toBe('caplet');
    evolve(s, T0, r, ev);
    expect(s.form).toBe('glimcap');
    s.careMistakes.child = 9;
    evolve(s, T0, r, ev);
    expect(s.form).toBe('mudpuff');
    expect(FORM_STAGE[s.form]).toBe('adult');
  });

  it('a Ripplet reaches the matching adult for each care outcome', () => {
    const base = {
      childMistakes: 0,
      teenMistakes: 0,
      discipline: 100,
      sleptFullNightLightsOff: true,
    };
    expect(resolveAdultForm(base, undefined, 'ripplet')).toBe('moonripple');
    expect(
      resolveAdultForm({ ...base, sleptFullNightLightsOff: false }, undefined, 'ripplet'),
    ).toBe('lotusong');
    expect(resolveAdultForm({ ...base, childMistakes: 4 }, undefined, 'ripplet')).toBe('bogbelly');
    expect(resolveAdultForm({ ...base, childMistakes: 9 }, undefined, 'ripplet')).toBe(
      'muckbottom',
    );
    expect(resolveOutcome({ ...base, childMistakes: 9 })).toBe('poor');
    expect(outcomeOf('auroracap')).toBe('secret');
  });

  it('adult bedtimes shift by care outcome for every species', () => {
    const s = petAt('adult');
    s.species = 'capling';
    s.form = 'moonmorel';
    expect(bedtimeFor(s)).toEqual({ sleep: 21, wake: 8 });
    s.form = 'auroracap';
    expect(bedtimeFor(s)).toEqual({ sleep: 23, wake: 10 });
  });

  it('pickSpecies draws by weight from the eligible list only', () => {
    expect(pickSpecies(['mossling'], 0.99)).toBe('mossling');
    expect(pickSpecies([], 0.5)).toBe('mossling');
    expect(pickSpecies(['mossling', 'capling', 'ripplet'], 0)).toBe('mossling');
    expect(pickSpecies(['mossling', 'capling', 'ripplet'], 0.5)).toBe('capling');
    expect(pickSpecies(['mossling', 'capling', 'ripplet'], 0.99)).toBe('ripplet');
    expect(pickSpecies(['capling', 'ripplet'], 0.2)).toBe('capling');
  });

  it('saves of any species load; unknown species are rejected', () => {
    const pet = createPet({ now: T0, seed: 2, species: 'ripplet' });
    expect(migrateSave({ version: SAVE_VERSION, pet }).pet.form).toBe('pondpearl');
    expect(() =>
      migrateSave({ version: SAVE_VERSION, pet: { ...pet, species: 'dragon' } }),
    ).toThrow(/unreadable/);
  });
});
