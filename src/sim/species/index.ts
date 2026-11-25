import catalog from './catalog.json';
import type { AdultForm, Form, Outcome, SpeciesId, Stage } from '../types';

/**
 * Species definitions. Data lives in catalog.json (shared with the art scripts); this module
 * gives it types and derived lookups. A new species is a new catalog entry.
 */
export interface SpeciesDef {
  id: SpeciesId;
  displayName: string;
  /** relative chance in the egg draw (only species whose art is complete are drawn) */
  weight: number;
  stageForms: Record<Exclude<Stage, 'adult'>, Form>;
  /** adult form for each care outcome */
  adults: Record<Outcome, AdultForm>;
  adultForms: readonly AdultForm[];
  formNames: Partial<Record<Form, string>>;
  /** Adult forms not shown in the Journal until earned once. */
  secretForms: readonly AdultForm[];
}

interface RawSpecies {
  id: string;
  displayName: string;
  weight: number;
  forms: Record<'egg' | 'baby' | 'child' | 'teen', string>;
  adults: Record<Outcome, string>;
  names: Record<string, string>;
}

const OUTCOMES: readonly Outcome[] = ['best', 'average', 'poor', 'secret'];

function define(raw: RawSpecies): SpeciesDef {
  const adults = raw.adults as Record<Outcome, AdultForm>;
  return {
    id: raw.id as SpeciesId,
    displayName: raw.displayName,
    weight: raw.weight,
    stageForms: raw.forms as Record<Exclude<Stage, 'adult'>, Form>,
    adults,
    adultForms: OUTCOMES.map((o) => adults[o]),
    formNames: raw.names as Partial<Record<Form, string>>,
    secretForms: [adults.secret],
  };
}

const LIST = (catalog.species as unknown as RawSpecies[]).map(define);

export const SPECIES = Object.fromEntries(LIST.map((s) => [s.id, s])) as Record<
  SpeciesId,
  SpeciesDef
>;
export const SPECIES_IDS: readonly SpeciesId[] = LIST.map((s) => s.id);
export const MOSSLING = SPECIES.mossling;

export function speciesOf(id: SpeciesId | undefined): SpeciesDef {
  return SPECIES[id ?? 'mossling'] ?? MOSSLING;
}

/** Every form of every species, in stage order. */
export const ALL_FORMS: readonly Form[] = LIST.flatMap((s) => [
  s.stageForms.egg,
  s.stageForms.baby,
  s.stageForms.child,
  s.stageForms.teen,
  ...s.adultForms,
]);

export const FORM_STAGE = Object.fromEntries(
  LIST.flatMap((s) => [
    ...(['egg', 'baby', 'child', 'teen'] as const).map((st) => [s.stageForms[st], st]),
    ...s.adultForms.map((f) => [f, 'adult']),
  ]),
) as Record<Form, Stage>;

export const FORM_SPECIES = Object.fromEntries(
  LIST.flatMap((s) => [...Object.values(s.stageForms), ...s.adultForms].map((f) => [f, s.id])),
) as Record<Form, SpeciesId>;

export const FORM_NAMES = Object.assign({}, ...LIST.map((s) => s.formNames)) as Record<
  Form,
  string
>;

export const EGG_FORMS: readonly Form[] = LIST.map((s) => s.stageForms.egg);

export function isEggForm(f: Form): boolean {
  return FORM_STAGE[f] === 'egg';
}

/** Which outcome an adult form represents (best/average/poor/secret). */
export function outcomeOf(form: AdultForm): Outcome {
  const s = speciesOf(FORM_SPECIES[form]);
  return OUTCOMES.find((o) => s.adults[o] === form) ?? 'average';
}

export const NEXT_STAGE: Record<Exclude<Stage, 'adult'>, Stage> = {
  egg: 'baby',
  baby: 'child',
  child: 'teen',
  teen: 'adult',
};

/**
 * Choose the species of a new egg. `eligible` lists species allowed right now (the game passes
 * the ones whose art is complete); `roll` is a number in [0, 1).
 */
export function pickSpecies(eligible: readonly SpeciesId[], roll: number): SpeciesId {
  const pool = eligible.map(speciesOf).filter((s) => s.weight > 0);
  if (!pool.length) return 'mossling';
  const total = pool.reduce((a, s) => a + s.weight, 0);
  let r = roll * total;
  for (const s of pool) {
    r -= s.weight;
    if (r < 0) return s.id;
  }
  return pool[pool.length - 1].id;
}
