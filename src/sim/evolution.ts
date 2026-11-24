import { TUNING } from './tuning';
import type { AdultForm, PetState } from './types';

export interface EvolutionInput {
  childMistakes: number;
  teenMistakes: number;
  discipline: number;
  sleptFullNightLightsOff: boolean;
}

export interface EvolutionThresholds {
  starwick: { maxMistakes: number; minDiscipline: number };
  lanternmoss: { maxMistakes: number; minDiscipline: number };
  burrowbun: { maxMistakes: number };
}

export function resolveAdultForm(
  input: EvolutionInput,
  t: EvolutionThresholds = TUNING.evolution,
): AdultForm {
  const mistakes = input.childMistakes + input.teenMistakes;
  if (
    mistakes <= t.starwick.maxMistakes &&
    input.discipline >= t.starwick.minDiscipline &&
    input.sleptFullNightLightsOff
  ) {
    return 'starwick';
  }
  if (mistakes <= t.lanternmoss.maxMistakes && input.discipline >= t.lanternmoss.minDiscipline) {
    return 'lanternmoss';
  }
  if (mistakes <= t.burrowbun.maxMistakes) return 'burrowbun';
  return 'mirefuzz';
}

export function evolutionInputOf(s: PetState): EvolutionInput {
  return {
    childMistakes: s.careMistakes.child,
    teenMistakes: s.careMistakes.teen,
    discipline: s.stats.discipline,
    sleptFullNightLightsOff: s.sleptFullNightLightsOff,
  };
}
