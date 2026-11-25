export type Stage = 'egg' | 'baby' | 'child' | 'teen' | 'adult';
export type SpeciesId = 'mossling' | 'capling' | 'ripplet';
/** The adult a pet grows into depends on its care: best, average, poor, or the secret one. */
export type Outcome = 'best' | 'average' | 'poor' | 'secret';
export type AdultForm =
  | 'lanternmoss'
  | 'burrowbun'
  | 'mirefuzz'
  | 'starwick'
  | 'moonmorel'
  | 'truffletum'
  | 'mudpuff'
  | 'auroracap'
  | 'lotusong'
  | 'bogbelly'
  | 'muckbottom'
  | 'moonripple';
export type Form =
  | 'egg'
  | 'dewdrop'
  | 'sprig'
  | 'fernlet'
  | 'sporepod'
  | 'puffkin'
  | 'caplet'
  | 'glimcap'
  | 'pondpearl'
  | 'wiggle'
  | 'splashlet'
  | 'reedling'
  | AdultForm;
export type LifeMode = 'gentle' | 'classic' | 'eternal';
export type LifeStatus = 'alive' | 'left' | 'ranaway' | 'passed';
export type CallReason = 'hunger' | 'happiness' | 'sick' | 'lights' | 'false';
export type FoodId = 'dewberry_mash' | 'mossbread';
export type GameId = 'which-way' | 'firefly-catch' | 'lilypad-hop';
export type MistakeReason = 'hunger' | 'happiness' | 'lights' | 'sick';

export interface Stats {
  hunger: number;
  happiness: number;
  discipline: number;
  energy: number;
  hygiene: number;
  /** grams */
  weight: number;
  health: number;
  bond: number;
}

export interface Dropping {
  id: number;
  at: number;
  /** 0..1 horizontal position in the Hollow */
  x: number;
}

export interface AttentionCall {
  reason: CallReason;
  since: number;
  /** false calls are tests of discipline */
  real: boolean;
}

export type SleepKind = 'night' | 'nap' | 'exhausted';

export interface SleepState {
  kind: SleepKind;
  since: number;
  /** ms the lights have been on while asleep */
  lightsOnMs: number;
  mistakeCounted: boolean;
  /** baby naps end at this time */
  until?: number;
}

export interface PetState {
  version: number;
  id: string;
  species: SpeciesId;
  name: string;
  form: Form;
  stage: Stage;
  status: LifeStatus;
  lifeMode: LifeMode;
  /** when the egg appeared */
  createdAt: number;
  /** when it hatched (0 while an egg) */
  bornAt: number;
  /** sim ms lived since hatching (excludes paused time) */
  ageMs: number;
  /** sim ms spent in the current stage */
  stageMs: number;
  /** sim ms spent as an egg */
  eggMs: number;
  stats: Stats;
  sleep: SleepState | null;
  lightsOn: boolean;
  /** local timezone offset (minutes, as Date#getTimezoneOffset) for wall-clock schedules */
  tzOffsetMin: number;
  droppings: Dropping[];
  nextDroppingId: number;
  sick: { dosesNeeded: number; since: number; untreatedMs: number } | null;
  call: AttentionCall | null;
  /** earliest time a real call for the same reason can re-arm after being ignored */
  callCooldownUntil: Partial<Record<CallReason, number>>;
  hungerZeroMs: number;
  happinessZeroMs: number;
  snackLog: number[];
  careMistakes: Record<Exclude<Stage, 'egg'>, number>;
  /** set when the pet slept a full night with the lights correctly off (child/teen count for Starwick) */
  sleptFullNightLightsOff: boolean;
  /** schedule */
  nextPoopAt: number;
  nextFalseCallAt: number;
  nextNapAt: number;
  /** last local date-key on which a night sleep began (prevents re-sleeping after waking) */
  lastNightKey: string;
  /** a moment where scolding is correct, until this time */
  disciplineUntil: number;
  /** a moment where praise is meaningful, until this time */
  praiseUntil: number;
  lastPetAt: number;
  /** jitter in [0,1) that fixes this pet's natural lifespan */
  lifespanRoll: number;
  pause: { active: boolean; usedMs: number; dayKey: string };
  /** offline catch-up guard (set only during catchUp) */
  offline: { mistakes: number; elapsedMs: number; maxMistakes: number } | null;
  rngState: number;
  /** lifetime counters for the Journal */
  counters: {
    meals: number;
    snacks: number;
    gamesPlayed: number;
    gamesWon: number;
    baths: number;
    pets: number;
    sicknesses: number;
    scolds: number;
    praises: number;
  };
  /** timestamps of stage transitions */
  history: { stage: Stage; form: Form; at: number }[];
  endedAt: number;
}

export type SimEvent =
  | { type: 'EGG_READY'; at: number }
  | { type: 'HATCHED'; at: number }
  | { type: 'NAMED'; at: number; name: string }
  | { type: 'POOPED'; at: number; id: number }
  | { type: 'GOT_SICK'; at: number; cause: string }
  | { type: 'STOMACHACHE'; at: number }
  | { type: 'MEDICINE'; at: number; cured: boolean; dosesLeft: number }
  | { type: 'MEDICINE_REFUSED'; at: number }
  | { type: 'CALLED_ATTENTION'; at: number; reason: CallReason }
  | { type: 'CALL_ENDED'; at: number; reason: CallReason; answered: boolean }
  | { type: 'CARE_MISTAKE'; at: number; reason: MistakeReason; stage: Stage }
  | { type: 'EVOLVED'; at: number; from: Form; to: Form }
  | { type: 'FELL_ASLEEP'; at: number; kind: SleepKind }
  | { type: 'WOKE_UP'; at: number; kind: SleepKind; fullNightLightsOff: boolean }
  | { type: 'LIGHTS'; at: number; on: boolean }
  | { type: 'ATE'; at: number; food: FoodId }
  | {
      type: 'REFUSED';
      at: number;
      why: 'full' | 'moody' | 'asleep' | 'sick' | 'too-young' | 'tired';
    }
  | { type: 'SNACKED'; at: number }
  | { type: 'PLAYED'; at: number; game: GameId; won: boolean }
  | { type: 'CLEANED'; at: number; removed: number }
  | { type: 'BATHED'; at: number }
  | { type: 'FOUND_CLOVER'; at: number }
  | { type: 'SCOLDED'; at: number; correct: boolean }
  | { type: 'PRAISED'; at: number; meaningful: boolean }
  | { type: 'PETTED'; at: number; spot: PetSpot; counted: boolean }
  | { type: 'BIRTHDAY'; at: number; age: number }
  | { type: 'LEFT'; at: number; reason: 'lifespan' }
  | { type: 'RAN_AWAY'; at: number }
  | { type: 'PASSED'; at: number }
  | { type: 'PAUSE_CHANGED'; at: number; active: boolean }
  | { type: 'PAUSE_EXHAUSTED'; at: number };

export type SimEventType = SimEvent['type'];

export type PetSpot = 'sprout' | 'belly' | 'ears' | 'head' | 'body';

export type Action =
  | { type: 'name'; name: string }
  | { type: 'feed'; food: FoodId }
  | { type: 'snack' }
  | { type: 'play'; game: GameId; won: boolean }
  | { type: 'clean' }
  | { type: 'bath' }
  | { type: 'lights'; on: boolean }
  | { type: 'medicine' }
  | { type: 'scold' }
  | { type: 'praise' }
  | { type: 'pet'; spot: PetSpot }
  | { type: 'setLifeMode'; mode: LifeMode }
  | { type: 'setPaused'; active: boolean }
  | { type: 'setTimezone'; offsetMin: number };

export interface StepResult {
  state: PetState;
  events: SimEvent[];
}
