import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../game/store';
import { bus, haptic } from '../game/bus';
import { Icon } from './Icons';
import { ACTIONS, runAction } from './actions';
import { copy } from './copy';
import styles from './ui.module.css';

/**
 * Optional nostalgia skin: an original river-stone handheld with a leaf-shaped bezel.
 * A cycles the icons, B selects, C cancels (keys 1 / 2 / 3).
 */
export function DeviceFrame({ children }: { children: ReactNode }) {
  const [sel, setSel] = useState(-1);
  const panel = useGame((s) => s.panel);
  const a = () => {
    bus.fx('tap');
    haptic(8);
    setSel((s) => (s + 1) % ACTIONS.length);
  };
  const b = () => {
    haptic(12);
    if (sel < 0) return a();
    runAction(ACTIONS[sel].id);
  };
  const c = () => {
    haptic(8);
    bus.fx('close');
    const st = useGame.getState();
    if (st.panel) st.setPanel(null);
    else if (st.bath) st.setBath(false);
    else setSel(-1);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === '1') a();
      if (e.key === '2') b();
      if (e.key === '3') c();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const top = ACTIONS.slice(0, 4);
  const bottom = ACTIONS.slice(4);
  const strip = (items: typeof ACTIONS, offset: number) => (
    <div className={styles.lcdStrip}>
      {items.map((it, i) => (
        <span
          key={it.id}
          className={`${styles.lcdIcon} ${sel === i + offset ? styles.lcdOn : ''}`}
          aria-label={copy.actions[it.id]}
          role="img"
        >
          <Icon name={it.id} width="100%" height="100%" />
        </span>
      ))}
    </div>
  );
  return (
    <div className={styles.device}>
      <svg
        viewBox="0 0 600 760"
        className={styles.shell}
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="stone" cx="0.35" cy="0.3" r="0.9">
            <stop offset="0" stopColor="#a9c9a0" />
            <stop offset="0.55" stopColor="#6f9a6a" />
            <stop offset="1" stopColor="#3f5e3a" />
          </radialGradient>
        </defs>
        <path
          d="M300 10 C 470 10 590 110 590 330 C 590 590 470 750 300 750 C 130 750 10 590 10 330 C 10 110 130 10 300 10Z"
          fill="url(#stone)"
        />
        <path
          d="M300 30 C 450 30 560 120 566 320"
          stroke="#fff"
          strokeOpacity="0.25"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
        />
        {[
          [120, 140, 10],
          [480, 200, 7],
          [90, 520, 8],
          [510, 560, 11],
          [300, 700, 6],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#3f5e3a" opacity="0.4" />
        ))}
      </svg>
      <div className={styles.bezel}>
        {strip(top, 0)}
        <div className={styles.screen}>{children}</div>
        {strip(bottom, 4)}
      </div>
      <div className={styles.hwButtons}>
        {[
          ['A', a, 'Cycle icons (1)'],
          ['B', b, 'Select (2)'],
          ['C', c, 'Cancel (3)'],
        ].map(([l, fn, label], i) => (
          <motion.button
            key={l as string}
            type="button"
            className={styles.hwBtn}
            style={{ marginTop: i === 1 ? 18 : 0 }}
            onClick={fn as () => void}
            aria-label={label as string}
            whileTap={{ scale: 0.88, y: 3 }}
            transition={{ type: 'spring', stiffness: 600, damping: 14 }}
          >
            {l as string}
          </motion.button>
        ))}
      </div>
      {panel === null && sel >= 0 && (
        <p className={styles.devHint}>{copy.actions[ACTIONS[sel].id]}</p>
      )}
    </div>
  );
}
