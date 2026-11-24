import type { SimEvent } from '../sim';

/** UI-side effects that aren't sim events (animations, sounds, particles). */
export type FxEvent =
  | { type: 'fx'; name: FxName; x?: number; y?: number }
  | { type: 'sim'; event: SimEvent; live: boolean };

export type FxName =
  | 'tap'
  | 'open'
  | 'close'
  | 'page'
  | 'pip'
  | 'combo'
  | 'win'
  | 'lose'
  | 'countdown'
  | 'go'
  | 'splash'
  | 'hop'
  | 'turn'
  | 'heartbeat'
  | 'burst'
  | 'fanfare'
  | 'fanfareBig'
  | 'swoosh'
  | 'scrub'
  | 'pop'
  | 'chime'
  | 'wish'
  | 'goldenFirefly'
  | 'shutter'
  | 'greet'
  | 'giggle'
  | 'squirm'
  | 'flick'
  | 'purr'
  | 'crack'
  | 'wobble'
  | 'farewell'
  | 'wave';

type Listener = (e: FxEvent) => void;
const listeners = new Set<Listener>();

export const bus = {
  on(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  emit(e: FxEvent) {
    for (const fn of listeners) fn(e);
  },
  fx(name: FxName, x?: number, y?: number) {
    bus.emit({ type: 'fx', name, x, y });
  },
};

let hapticsOn = true;
export function setHaptics(on: boolean) {
  hapticsOn = on;
}

export function haptic(pattern: number | number[]) {
  if (!hapticsOn) return;
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  } catch {
    /* unsupported */
  }
}
