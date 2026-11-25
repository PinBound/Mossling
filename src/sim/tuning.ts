/**
 * Every rate, threshold and duration in the simulation lives here.
 * Times are milliseconds of *sim* time. Stats are 0–100 unless noted.
 * One "heart" = 25 points; the spec's food/snack deltas are in half-heart units (12.5).
 */
export const MIN = 60_000;
export const HOUR = 60 * MIN;
export const DAY = 24 * HOUR;

export const HALF_HEART = 12.5;

export const TUNING = {
  /** Fixed tick used by offline catch-up and as the max sub-step of `step`. */
  tickMs: MIN,

  stageDuration: {
    egg: 5 * MIN,
    baby: 1 * HOUR,
    child: 1 * DAY,
    teen: 2 * DAY,
  },

  /** Time for a full stat (100 → 0) to drain while awake. */
  fullDrain: {
    hunger: { baby: 2 * HOUR, child: 3 * HOUR, teen: 4 * HOUR, adult: 5 * HOUR },
    happiness: { baby: 2 * HOUR, child: 3.5 * HOUR, teen: 4 * HOUR, adult: 5.5 * HOUR },
    hygiene: { baby: 10 * HOUR, child: 14 * HOUR, teen: 16 * HOUR, adult: 18 * HOUR },
    /** Energy drains while awake... */
    energy: { baby: 1.5 * HOUR, child: 14 * HOUR, teen: 15 * HOUR, adult: 15 * HOUR },
  },
  /** ...and refills in this long while asleep. */
  energyRefill: 6 * HOUR,
  babyEnergyRefill: 10 * MIN,
  /** Decay multiplier for hunger/happiness/hygiene while asleep (original toy: heavily reduced). */
  sleepDecayFactor: 0.1,
  /** Happiness decays this much faster while awake in the dark. */
  darkAwakeHappinessFactor: 2,

  food: {
    dewberry_mash: { hunger: 2 * HALF_HEART, weight: 1 },
    mossbread: { hunger: 3 * HALF_HEART, weight: 2 },
  },
  snack: { happiness: HALF_HEART, weight: 2 },
  snackWindowMs: 2 * HOUR,
  snackLimit: 3,
  /** Hunger at or above this → the pet refuses meals. */
  fullThreshold: 100,
  /** Teen moodiness: chance to refuse a meal while hungry, scaled by (1 - discipline/100). */
  teenRefuseChance: 0.45,
  disciplineOpportunityMs: 5 * MIN,

  play: { winHappiness: 25, loseHappiness: 8, energyCost: 10, weightCost: 1, minEnergy: 15 },
  pet: { happiness: 4, cooldownMs: 15_000, bond: 0.4 },
  praise: { happiness: 6, discipline: 5, bond: 1, windowMs: 5 * MIN },
  scold: { correctDiscipline: 25, wrongHappiness: 15 },
  medicineRefuseHappiness: 5,

  clean: { hygiene: 30 },
  bath: { cloverChance: 0.06 },
  poopHygieneHit: 12,

  /** Droppings: base interval ± jitter. */
  poopInterval: { baby: 25 * MIN, other: 3 * HOUR },
  poopJitter: { baby: 8 * MIN, other: 1 * HOUR },
  poopSickThresholdCount: 3,
  poopSickAgeMs: 1 * HOUR,

  /** Schedules. Hours are local wall-clock hours. */
  babyNap: { interval: 20 * MIN, duration: 10 * MIN },
  bedtime: {
    child: { sleep: 20, wake: 8 },
    teen: { sleep: 21, wake: 9 },
    adult: { sleep: 22, wake: 9 },
  },
  /** Adult bedtime shift in hours by care outcome (the secret forms are nocturnal-leaning). */
  adultBedtimeShift: { best: -1, average: 0, poor: 1, secret: 1 },
  /** Exhausted pets nap until energy reaches this. */
  exhaustedWakeEnergy: 60,

  /** Attention calls and care mistakes. */
  callTimeoutMs: 15 * MIN,
  callRearmMs: 1 * HOUR,
  lightsMistakeMs: 15 * MIN,
  sickMistakeMs: 1 * HOUR,
  hungerZeroMistakeMs: 15 * MIN,
  falseCallInterval: { child: 2 * HOUR, teen: 3 * HOUR },
  falseCallJitter: 1 * HOUR,
  falseCallDurationMs: 15 * MIN,
  ignoredFalseCallDisciplinePenalty: 0,

  /** Sickness: base chance per minute plus additive risks. */
  sickness: {
    base: 0.00002,
    perDroppingOverLimit: 0.0012,
    oldDropping: 0.0008,
    lowHygiene: 0.0008,
    lowHygieneThreshold: 20,
    overweight: 0.0006,
    starving: 0.0008,
    minDoses: 1,
    maxDoses: 3,
  },
  overweight: { baby: 15, child: 30, teen: 45, adult: 70 },
  minWeight: { baby: 5, child: 10, teen: 20, adult: 30 },
  /** Weight added on each evolution (growing up). */
  growthWeight: { child: 5, teen: 10, adult: 12 },

  health: {
    /** Points per hour. */
    sickDrain: 4,
    starvingDrain: 3,
    recover: 2,
  },

  bond: {
    /** Points per hour while all needs are above 50. */
    contentGain: 0.35,
  },

  /** Natural lifespan (total age since hatching). */
  lifespan: { minDays: 6, maxDays: 10 },

  /** Babysitter pause allowance per local day. */
  pauseAllowanceMs: 12 * HOUR,

  offline: {
    /** Catch-up is never longer than this. */
    maxCatchUpMs: 14 * DAY,
    /** Absences longer than this have their care mistakes capped at `maxMistakes`. */
    capAfterMs: 48 * HOUR,
    /** Max care mistakes that can accrue during one offline catch-up. */
    maxMistakes: 3,
    /** Health can't drop below this during catch-up... */
    healthFloor: 15,
    /** ...unless the player has been away longer than this. Gentle mode: the pet leaves. */
    leaveAfterMs: 72 * HOUR,
  },

  evolution: {
    secret: { maxMistakes: 0, minDiscipline: 100 },
    best: { maxMistakes: 2, minDiscipline: 75 },
    average: { maxMistakes: 5 },
  },
} as const;

export type Tuning = typeof TUNING;
