import { motion } from 'framer-motion';
import { useGame } from '../game/store';
import { Icon } from './Icons';
import { ACTIONS, actionNeeded, runAction, type ActionId } from './actions';
import { copy } from './copy';
import styles from './ui.module.css';

export function ActionRing({ layout }: { layout: 'arc' | 'rail' }) {
  // Subscribe to the bits that affect badges.
  useGame(
    (s) =>
      `${s.pet.stats.hunger < 25}${s.pet.droppings.length}${s.pet.sick ? 1 : 0}${s.pet.lightsOn}${s.pet.sleep ? 1 : 0}${s.pet.stats.happiness < 25}`,
  );
  const lightsOn = useGame((s) => s.pet.lightsOn);
  const setHover = useGame((s) => s.setHoverAction);
  const n = ACTIONS.length;
  return (
    <nav className={layout === 'arc' ? styles.ringArc : styles.ringRail} aria-label="Care actions">
      {ACTIONS.map((a, i) => {
        const t = n > 1 ? i / (n - 1) : 0.5;
        const lift = layout === 'arc' ? Math.sin(t * Math.PI) * 16 : 0;
        const need = actionNeeded(a.id);
        const label = copy.actions[a.id];
        const ariaVerb =
          a.id === 'lights' ? (lightsOn ? 'Dim the lantern' : 'Light the lantern') : label;
        return (
          <motion.button
            key={a.id}
            type="button"
            className={`${styles.actionBtn} ${need ? styles.actionNeed : ''}`}
            style={{ marginTop: layout === 'arc' ? 16 - lift : 0 }}
            aria-label={`${ariaVerb}. ${copy.actionHints[a.id]}. Shortcut ${a.key}`}
            aria-keyshortcuts={a.key}
            title={`${label} (${a.key})`}
            data-action={a.id}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 520, damping: 14 }}
            onClick={() => runAction(a.id as ActionId)}
            onPointerEnter={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setHover({ id: a.id, x: r.left + r.width / 2, y: r.top + r.height / 2 });
            }}
            onPointerLeave={() => setHover(null)}
            onFocus={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setHover({ id: a.id, x: r.left + r.width / 2, y: r.top + r.height / 2 });
            }}
            onBlur={() => setHover(null)}
          >
            <span className={styles.actionIcon}>
              <Icon
                name={a.id === 'lights' && !lightsOn ? 'moon' : a.id}
                width="100%"
                height="100%"
              />
              {need && (
                <span className={styles.badge} aria-hidden="true">
                  !
                </span>
              )}
            </span>
            <span className={styles.actionLabel}>{label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
