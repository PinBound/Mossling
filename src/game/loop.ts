import { useGame } from './store';

/** Drives the sim in real time (scaled by the Dev Panel), autosaves, and saves on hide. */
export function startLoop(): () => void {
  let last = performance.now();
  const tick = () => {
    const t = performance.now();
    // Background tabs throttle timers; clamp so a long gap is handled by the next load's catch-up.
    const dt = Math.min(t - last, 5 * 60_000);
    last = t;
    useGame.getState().advance(dt);
  };
  const interval = window.setInterval(tick, 1000);
  const autosave = window.setInterval(() => void useGame.getState().save(), 30_000);
  const onVis = () => {
    if (document.visibilityState === 'hidden') void useGame.getState().save();
    else tick();
  };
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('pagehide', onVis);
  return () => {
    clearInterval(interval);
    clearInterval(autosave);
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('pagehide', onVis);
  };
}
