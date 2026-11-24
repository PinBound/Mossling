import { useEffect, useRef } from 'react';
import { runParticles, W, type Ambient } from './particles';
import styles from './scene.module.css';

/** Canvas overlay. `ambient` is read every frame so emitters can change without re-mounting. */
export function ParticleLayer({
  ambientRef,
}: {
  ambientRef: React.MutableRefObject<Ambient | null>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth || W;
      c.width = Math.round(w * dpr);
      c.height = Math.round(((w * 4) / 3) * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const stop = runParticles(c, () => ambientRef.current);
    return () => {
      ro.disconnect();
      stop();
    };
  }, [ambientRef]);
  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />;
}
