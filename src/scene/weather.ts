import { seedFrom } from '../sim/rng';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export function seasonOf(date: Date): Season {
  const m = date.getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'autumn';
  return 'winter';
}

const roll = (key: string) => seedFrom(key) / 4294967296;

export interface Weather {
  rain: boolean;
  /** rain just ended this hour (daytime only) → rainbow */
  rainbow: boolean;
  mist: boolean;
}

/** Deterministic per local hour, so reloading doesn't reshuffle the sky. */
export function weatherAt(date: Date): Weather {
  const day = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const h = date.getHours();
  const rainAt = (hour: number) => roll(`rain:${day}:${hour}`) < 0.07;
  const rain = rainAt(h);
  const rainbow = !rain && rainAt(h - 1) && h >= 8 && h < 18;
  const mist = h >= 5 && h < 9 && roll(`mist:${day}`) < 0.45;
  return { rain, rainbow, mist };
}
