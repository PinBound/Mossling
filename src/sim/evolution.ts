import { TUNING } from './tuning';
import { speciesOf } from './species';
import type { AdultForm, Outcome, PetState, SpeciesId } from './types';

export interface EvolutionInput {
  childMistakes: number;
  teenMistakes: number;
  discipline: number;
  sleptFullNightLightsOff: boolean;
}

export interface EvolutionThresholds {
  secret: { maxMistakes: number; minDiscipline: number };
  best: { maxMistakes: number; minDiscipline: number };
  average: { maxMistakes: number };
}

/** Which adult the care record earns: the same rule for every species. */
export function resolveOutcome(
  input: EvolutionInput,
  t: EvolutionThresholds = TUNING.evolution,
): Outcome {
  const mistakes = input.childMistakes + input.teenMistakes;
  if (
    mistakes <= t.secret.maxMistakes &&
    input.discipline >= t.secret.minDiscipline &&
    input.sleptFullNightLightsOff
  ) {
    return 'secret';
  }
  if (mistakes <= t.best.maxMistakes && input.discipline >= t.best.minDiscipline) return 'best';
  if (mistakes <= t.average.maxMistakes) return 'average';
  return 'poor';
}

export function resolveAdultForm(
  input: EvolutionInput,
  t: EvolutionThresholds = TUNING.evolution,
  species: SpeciesId = 'mossling',
): AdultForm {
  return speciesOf(species).adults[resolveOutcome(input, t)];
}

export function evolutionInputOf(s: PetState): EvolutionInput {
  return {
    childMistakes: s.careMistakes.child,
    teenMistakes: s.careMistakes.teen,
    discipline: s.stats.discipline,
    sleptFullNightLightsOff: s.sleptFullNightLightsOff,
  };
}
