import { createRng } from './rng';
import { speciesOf } from './species';
import type { LifeMode, PetState, SpeciesId, Stats } from './types';

export const SAVE_VERSION = 2;

export interface CreatePetOptions {
  /** defaults to the Mossling */
  species?: SpeciesId;
  now: number;
  seed: number;
  lifeMode?: LifeMode;
  tzOffsetMin?: number;
  id?: string;
}

export function initialStats(): Stats {
  return {
    hunger: 50,
    happiness: 50,
    discipline: 0,
    energy: 100,
    hygiene: 100,
    weight: 5,
    health: 100,
    bond: 0,
  };
}

/** A fresh Dewstone. */
export function createPet(opts: CreatePetOptions): PetState {
  const rng = createRng(opts.seed);
  const lifespanRoll = rng.next();
  return {
    version: SAVE_VERSION,
    id: opts.id ?? `pet-${opts.seed.toString(36)}-${opts.now.toString(36)}`,
    species: speciesOf(opts.species).id,
    name: '',
    form: speciesOf(opts.species).stageForms.egg,
    stage: 'egg',
    status: 'alive',
    lifeMode: opts.lifeMode ?? 'gentle',
    createdAt: opts.now,
    bornAt: 0,
    ageMs: 0,
    stageMs: 0,
    eggMs: 0,
    stats: initialStats(),
    sleep: null,
    lightsOn: true,
    tzOffsetMin: opts.tzOffsetMin ?? 0,
    droppings: [],
    nextDroppingId: 1,
    sick: null,
    call: null,
    callCooldownUntil: {},
    hungerZeroMs: 0,
    happinessZeroMs: 0,
    snackLog: [],
    careMistakes: { baby: 0, child: 0, teen: 0, adult: 0 },
    sleptFullNightLightsOff: false,
    nextPoopAt: Number.POSITIVE_INFINITY,
    nextFalseCallAt: Number.POSITIVE_INFINITY,
    nextNapAt: Number.POSITIVE_INFINITY,
    lastNightKey: '',
    disciplineUntil: 0,
    praiseUntil: 0,
    lastPetAt: 0,
    lifespanRoll,
    pause: { active: false, usedMs: 0, dayKey: '' },
    offline: null,
    rngState: rng.state,
    counters: {
      meals: 0,
      snacks: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      baths: 0,
      pets: 0,
      sicknesses: 0,
      scolds: 0,
      praises: 0,
    },
    history: [{ stage: 'egg', form: speciesOf(opts.species).stageForms.egg, at: opts.now }],
    endedAt: 0,
  };
}

export const clamp = (v: number, lo = 0, hi = 100) => (v < lo ? lo : v > hi ? hi : v);

/** 0–4 hearts for a 0–100 stat (rounded up so a sliver still shows a heart). */
export function hearts(value: number): number {
  return Math.max(0, Math.min(4, Math.ceil(clamp(value) / 25 - 1e-9)));
}

export function totalMistakes(s: PetState): number {
  const m = s.careMistakes;
  return m.baby + m.child + m.teen + m.adult;
}

export function ageYears(s: PetState): number {
  return Math.floor(s.ageMs / 86_400_000);
}

export function clonePet(s: PetState): PetState {
  return structuredClone(s);
}
