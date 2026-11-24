import { useReducedMotion as useFmReducedMotion } from 'framer-motion';
import { useGame } from './store';

/** Reduced motion from Settings (on/off) or the system preference. */
export function useReducedMotion(): boolean {
  const pref = useGame((s) => s.meta.settings.reducedMotion);
  const system = useFmReducedMotion() ?? false;
  return pref === 'on' ? true : pref === 'off' ? false : system;
}

export function reducedMotionNow(): boolean {
  const pref = useGame.getState().meta.settings.reducedMotion;
  if (pref !== 'system') return pref === 'on';
  return (
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}
