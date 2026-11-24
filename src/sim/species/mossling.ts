import type { AdultForm, Form, Stage } from '../types';

/**
 * Species definition. A second species is a new file with this shape,
 * plus its own entry in `SPECIES`.
 */
export interface SpeciesDef {
  id: string;
  displayName: string;
  stageForms: Record<Exclude<Stage, 'adult'>, Form>;
  adultForms: readonly AdultForm[];
  formStage: Record<Form, Stage>;
  formNames: Record<Form, string>;
  /** Adult forms not shown in the Journal until earned once. */
  secretForms: readonly AdultForm[];
}

export const MOSSLING: SpeciesDef = {
  id: 'mossling',
  displayName: 'Mossling',
  stageForms: { egg: 'egg', baby: 'dewdrop', child: 'sprig', teen: 'fernlet' },
  adultForms: ['lanternmoss', 'burrowbun', 'mirefuzz', 'starwick'],
  formStage: {
    egg: 'egg',
    dewdrop: 'baby',
    sprig: 'child',
    fernlet: 'teen',
    lanternmoss: 'adult',
    burrowbun: 'adult',
    mirefuzz: 'adult',
    starwick: 'adult',
  },
  formNames: {
    egg: 'Dewstone',
    dewdrop: 'Dewdrop',
    sprig: 'Sprig',
    fernlet: 'Fernlet',
    lanternmoss: 'Lanternmoss',
    burrowbun: 'Burrowbun',
    mirefuzz: 'Mirefuzz',
    starwick: 'Starwick',
  },
  secretForms: ['starwick'],
};

export const SPECIES: Record<string, SpeciesDef> = { mossling: MOSSLING };

export const ALL_FORMS: readonly Form[] = [
  'egg',
  'dewdrop',
  'sprig',
  'fernlet',
  'lanternmoss',
  'burrowbun',
  'mirefuzz',
  'starwick',
];

export const NEXT_STAGE: Record<Exclude<Stage, 'adult'>, Stage> = {
  egg: 'baby',
  baby: 'child',
  child: 'teen',
  teen: 'adult',
};
