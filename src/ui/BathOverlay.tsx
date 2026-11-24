import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../game/store';
import { bus, haptic } from '../game/bus';
import { Button } from './primitives';
import { copy } from './copy';
import styles from './ui.module.css';

interface Bubble {
  id: number;
  x: number;
  y: number;
  r: number;
}

/** Bubble bath: drag over the bubbles to pop them. Space pops a handful (keyboard play). */
export function BathOverlay() {
  const open = useGame((s) => s.bath);
  return <AnimatePresence>{open && <Bath />}</AnimatePresence>;
}

function Bath() {
  const initial = useMemo<Bubble[]>(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: 28 + Math.random() * 44,
        y: 52 + Math.random() * 34,
        r: 3 + Math.random() * 4,
      })),
    [],
  );
  const [bubbles, setBubbles] = useState(initial);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    useGame.getState().dispatch({ type: 'bath' });
    bus.fx('chime');
    setTimeout(() => useGame.getState().setBath(false), 400);
  };

  useEffect(() => {
    if (bubbles.length <= initial.length * 0.15) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bubbles.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setBubbles((b) => b.slice(4));
        bus.fx('pop');
      }
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const scrub = (e: React.PointerEvent) => {
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setBubbles((b) => {
      const keep = b.filter((bb) => Math.hypot(bb.x - x, (bb.y - y) * 0.75) > bb.r + 3);
      if (keep.length !== b.length) {
        bus.fx('pop');
        haptic(5);
      } else if (Math.random() < 0.2) bus.fx('scrub');
      return keep;
    });
  };

  return (
    <motion.div
      ref={ref}
      className={styles.bath}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onPointerDown={scrub}
      onPointerMove={scrub}
      role="dialog"
      aria-label={copy.bath.hint}
      data-testid="bath"
    >
      <p className={styles.bathHint}>{copy.bath.hint}</p>
      <AnimatePresence>
        {bubbles.map((b) => (
          <motion.span
            key={b.id}
            className={styles.bubble}
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.r * 2}%` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1, y: [0, -6, 0] }}
            exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.18 } }}
            transition={{
              y: { duration: 2 + (b.id % 3), repeat: Infinity },
              scale: { type: 'spring', stiffness: 300, damping: 12, delay: b.id * 0.02 },
            }}
          />
        ))}
      </AnimatePresence>
      <div className={styles.bathBtn}>
        <Button variant="soft" onClick={finish} data-testid="bath-rinse">
          {copy.bath.done}
        </Button>
      </div>
    </motion.div>
  );
}
