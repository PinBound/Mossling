import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../game/store';
import { bus } from '../game/bus';
import { Button, Sheet } from './primitives';
import { Icon } from './Icons';
import { awayLines, copy, NAMES } from './copy';
import styles from './ui.module.css';

export function NamingDialog() {
  const need = useGame(
    (s) =>
      s.ready && s.pet.stage !== 'egg' && s.pet.status === 'alive' && !s.pet.name && !s.cinematic,
  );
  const [name, setName] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (need) {
      setName('');
      setTimeout(() => input.current?.focus(), 300);
    }
  }, [need]);
  const suggest = () => {
    bus.fx('tap');
    let n = name;
    while (n === name) n = NAMES[Math.floor(Math.random() * NAMES.length)];
    setName(n);
  };
  const confirm = () => {
    const n = name.trim() || NAMES[Math.floor(Math.random() * NAMES.length)];
    useGame.getState().dispatch({ type: 'name', name: n });
    bus.fx('chime');
  };
  return (
    <AnimatePresence>
      {need && (
        <motion.div
          className={styles.scrim}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            role="dialog"
            aria-modal="true"
            aria-labelledby="name-title"
            className={styles.namingCard}
            initial={{ scale: 0.7, rotate: -4, opacity: 0 }}
            animate={{ scale: 1, rotate: -1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            onSubmit={(e) => {
              e.preventDefault();
              confirm();
            }}
          >
            <h2 id="name-title" className={styles.handLettered}>
              {copy.naming.title}
            </h2>
            <input
              ref={input}
              className={styles.nameInput}
              value={name}
              maxLength={16}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.naming.placeholder}
              aria-label="Name"
              autoComplete="off"
              data-testid="name-input"
            />
            <div className={styles.rowEnd}>
              <Button variant="soft" onClick={suggest}>
                {copy.naming.random}
              </Button>
              <Button type="submit" data-testid="name-confirm">
                {copy.naming.confirm}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const fmtTime = (ms: number) =>
  new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const fmtAway = (ms: number) => {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h >= 24 ? `${Math.floor(h / 24)} days` : h ? `${h} h ${m} min` : `${m} min`;
};

export function AwayCard() {
  const away = useGame((s) => s.away);
  const lines = away ? awayLines(away.name, away.lines, fmtTime) : [];
  return (
    <Sheet open={!!away} onClose={() => useGame.getState().dismissAway()} title={copy.away.title}>
      {away && <p className={styles.note}>{fmtAway(away.awayMs)}</p>}
      <ul className={styles.awayList}>
        {lines.map((l, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.12 }}
          >
            {l}
          </motion.li>
        ))}
      </ul>
      <div className={styles.rowEnd}>
        <Button onClick={() => useGame.getState().dismissAway()} data-testid="away-close">
          {copy.away.close}
        </Button>
      </div>
    </Sheet>
  );
}

export function Toasts() {
  const toasts = useGame((s) => s.toasts);
  return (
    <div className={styles.toasts} aria-live="polite" aria-atomic="false">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            className={`${styles.toast} ${styles[`toast_${t.tone}`]}`}
            initial={{ opacity: 0, y: -20, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            onClick={() => useGame.getState().dismissToast(t.id)}
            role="status"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
              className={styles.toastLeaf}
            >
              <path
                d="M4 20 C 4 10 10 4 20 4 C 20 14 14 20 4 20Z M4 20 L14 10"
                fill="currentColor"
                fillOpacity="0.3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Polite live region announcing the pet's condition changes. */
export function LiveRegion() {
  const announce = useGame((s) => s.announce);
  const status = useGame((s) => {
    const p = s.pet;
    if (p.stage === 'egg' || p.status !== 'alive') return '';
    const n = p.name || 'Your Mossling';
    const a = copy.announce;
    if (p.sleep) return a.asleep(n);
    if (p.sick) return a.sick(n);
    if (p.stats.hunger < 25) return a.hungry(n);
    if (p.stats.happiness < 25) return a.unhappy(n);
    if (p.droppings.length > 1) return a.dirty(n);
    return '';
  });
  return (
    <>
      <div className="sr-only" aria-live="polite">
        {status}
      </div>
      <div className="sr-only" aria-live="polite">
        {announce}
      </div>
    </>
  );
}

export function NudgeArrow() {
  const nudge = useGame((s) => s.meta.flags.nudge);
  const pet = useGame((s) => s.pet);
  const blocked = useGame((s) => !!s.panel || !!s.cinematic || !s.meta.flags.onboarded || !!s.game);
  let text: string | null = null;
  let where: 'pet' | 'feed' = 'pet';
  if (nudge === 'egg' && pet.stage === 'egg') text = copy.nudge.egg;
  if (nudge === 'feed' && pet.stage !== 'egg' && pet.name) {
    text = copy.nudge.feed;
    where = 'feed';
  }
  if (nudge === 'pet' && pet.stage !== 'egg' && pet.name) text = copy.nudge.pet;
  if (!text || blocked || pet.sleep) return null;
  return (
    <motion.div
      className={`${styles.nudge} ${where === 'feed' ? styles.nudgeFeed : styles.nudgePet}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: [0, -8, 0] }}
      transition={{ y: { repeat: Infinity, duration: 1.6 }, opacity: { duration: 0.4 } }}
      aria-hidden="true"
    >
      <span className={styles.handLettered}>{text}</span>
      <svg viewBox="0 0 60 60" width="46" height="46">
        <path
          d="M30 6 C 22 20 24 34 30 50 M18 38 L30 52 L42 38"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}

export function TopIcon({
  name,
  label,
  onClick,
  pressed,
}: {
  name: Parameters<typeof Icon>[0]['name'];
  label: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <motion.button
      type="button"
      className={styles.hudBtn}
      onClick={() => {
        bus.fx('tap');
        onClick();
      }}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
    >
      <Icon name={name} width={26} height={26} />
    </motion.button>
  );
}
