import type { Form, GameId, LifeMode } from '../sim';

export interface Settings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  notifications: boolean;
  lifeMode: LifeMode;
  reducedMotion: 'system' | 'on' | 'off';
  deviceMode: boolean;
  textSize: 's' | 'm' | 'l';
  haptics: boolean;
}

export interface MemoryLeaf {
  id: string;
  name: string;
  form: Form;
  ageYears: number;
  bornAt: number;
  endedAt: number;
  how: 'left' | 'ranaway' | 'passed' | 'released';
  stats: {
    mistakes: number;
    discipline: number;
    bond: number;
    weight: number;
    meals: number;
    gamesWon: number;
    baths: number;
    pets: number;
  };
}

export interface Collectibles {
  goldenFirefly: number;
  clover: number;
  wishes: string[];
}

export interface Meta {
  version: 1;
  settings: Settings;
  journal: {
    formsSeen: Form[];
    memoryLeaves: MemoryLeaf[];
    collectibles: Collectibles;
    timeline: { at: number; text: string }[];
  };
  bests: Partial<Record<GameId, number>>;
  flags: {
    onboarded: boolean;
    seenCinematics: string[];
    notifAsked: boolean;
    nudge: 'egg' | 'feed' | 'pet' | 'done';
    /** Dev Panel: let species whose art isn't finished appear in the egg draw. */
    devAllSpecies: boolean;
  };
  /** real wall-clock ms of the last time the app was open */
  lastSeenAt: number;
}

export function defaultMeta(): Meta {
  return {
    version: 1,
    settings: {
      musicVolume: 0.5,
      sfxVolume: 0.8,
      muted: false,
      notifications: false,
      lifeMode: 'gentle',
      reducedMotion: 'system',
      deviceMode: false,
      textSize: 'm',
      haptics: true,
    },
    journal: {
      formsSeen: [],
      memoryLeaves: [],
      collectibles: { goldenFirefly: 0, clover: 0, wishes: [] },
      timeline: [],
    },
    bests: {},
    flags: {
      onboarded: false,
      seenCinematics: [],
      notifAsked: false,
      nudge: 'egg',
      devAllSpecies: false,
    },
    lastSeenAt: 0,
  };
}

/** Merge a stored meta over defaults so new fields always exist (meta's own migration). */
export function migrateMeta(raw: unknown): Meta {
  const d = defaultMeta();
  if (!raw || typeof raw !== 'object') return d;
  const m = raw as Partial<Meta>;
  return {
    ...d,
    ...m,
    version: 1,
    settings: { ...d.settings, ...(m.settings ?? {}) },
    journal: {
      ...d.journal,
      ...(m.journal ?? {}),
      collectibles: { ...d.journal.collectibles, ...(m.journal?.collectibles ?? {}) },
    },
    bests: { ...(m.bests ?? {}) },
    flags: { ...d.flags, ...(m.flags ?? {}) },
  };
}
