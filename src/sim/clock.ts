import { DAY, HOUR, MIN } from './tuning';

/** Local wall-clock hour (fractional, 0–24) for a sim timestamp. */
export function localHour(nowMs: number, tzOffsetMin: number): number {
  const local = nowMs - tzOffsetMin * MIN;
  return (((local % DAY) + DAY) % DAY) / HOUR;
}

/** A key that changes at local midnight. */
export function dayKey(nowMs: number, tzOffsetMin: number): string {
  return String(Math.floor((nowMs - tzOffsetMin * MIN) / DAY));
}

/** A key shared by one whole night (evening and the following early morning). */
export function nightKey(nowMs: number, tzOffsetMin: number): string {
  return dayKey(nowMs - 12 * HOUR, tzOffsetMin);
}

/** Is `hour` inside a window that may wrap midnight (sleep → wake)? */
export function inWindow(hour: number, start: number, end: number): boolean {
  const s = ((start % 24) + 24) % 24;
  const e = ((end % 24) + 24) % 24;
  if (s === e) return false;
  return s < e ? hour >= s && hour < e : hour >= s || hour < e;
}

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export function timeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17.5) return 'day';
  if (hour >= 17.5 && hour < 20.5) return 'dusk';
  return 'night';
}
