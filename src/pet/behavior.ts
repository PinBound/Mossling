import type { PetState } from '../sim';

export type BehaviorKind =
  | 'wander'
  | 'look'
  | 'butterfly'
  | 'sniff'
  | 'yawn'
  | 'sneeze'
  | 'pond'
  | 'fall'
  | 'stretch'
  | 'spin'
  | 'dance'
  | 'sulk'
  | 'hungryStare'
  | 'splash'
  | 'rest'
  | 'rare';

export interface Mood {
  happy: boolean;
  ecstatic: boolean;
  unhappy: boolean;
  hungry: boolean;
  sleepy: boolean;
  sick: boolean;
  dirty: boolean;
  veryDirty: boolean;
  overweight: boolean;
}

export function moodOf(p: PetState, overweightAt: number): Mood {
  const s = p.stats;
  return {
    happy: s.happiness >= 70 && s.hunger >= 50,
    ecstatic: s.happiness >= 90 && s.hunger >= 70,
    unhappy: s.happiness < 25,
    hungry: s.hunger < 25,
    sleepy: s.energy < 25,
    sick: !!p.sick,
    dirty: s.hygiene < 45 || p.droppings.length > 2,
    veryDirty: s.hygiene < 20,
    overweight: s.weight > overweightAt,
  };
}

/** Weighted pick of what to do next while idle, by stage and mood. */
export function chooseBehavior(
  p: PetState,
  mood: Mood,
  rnd: () => number,
  raining: boolean,
): BehaviorKind {
  if (mood.sick) return rnd() < 0.8 ? 'rest' : 'look';
  const baby = p.stage === 'baby';
  const w: [BehaviorKind, number][] = [
    ['wander', 5],
    ['look', 4],
    ['butterfly', mood.unhappy ? 0.5 : 2],
    ['sniff', 2],
    ['yawn', mood.sleepy ? 5 : 0.8],
    ['sneeze', 0.7],
    ['pond', 1.5],
    ['fall', baby ? 2.5 : 0],
    ['stretch', 1.2],
    ['spin', mood.happy ? 1.5 : 0.2],
    ['dance', mood.ecstatic ? 3 : mood.happy ? 1 : 0],
    ['sulk', mood.unhappy ? 6 : 0],
    ['hungryStare', mood.hungry ? 6 : 0],
    ['splash', raining ? 5 : 0],
    ['rest', mood.sleepy ? 2 : 0.5],
    ['rare', p.stage === 'adult' ? 0.6 : 0],
  ];
  const total = w.reduce((a, [, n]) => a + n, 0);
  let r = rnd() * total;
  for (const [k, n] of w) {
    r -= n;
    if (r <= 0) return k;
  }
  return 'wander';
}
