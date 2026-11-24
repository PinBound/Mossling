import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ageYears, totalMistakes } from '../sim';
import { useGame } from '../game/store';
import { bus } from '../game/bus';
import { Hearts, Sheet, squish } from './primitives';
import { Icon } from './Icons';
import { copy, formName } from './copy';
import styles from './ui.module.css';

export function StatusSheet() {
  const open = useGame((s) => s.panel === 'status');
  const pet = useGame((s) => s.pet);
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  const pages = copy.status.pages;
  const go = (d: number) => {
    bus.fx('page');
    setDir(d);
    setPage((p) => (p + d + pages.length) % pages.length);
  };
  const s = pet.stats;
  const c = copy.status;
  const adult = pet.stage === 'adult';
  const name = pet.name || formName(pet.form);
  return (
    <Sheet
      open={open}
      onClose={() => useGame.getState().setPanel(null)}
      title={`${c.title}: ${name}`}
      className={styles.notebook}
    >
      <div
        className={styles.pageWrap}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1);
          if (e.key === 'ArrowLeft') go(-1);
        }}
      >
        <div className={styles.tabs} role="tablist" aria-label="Notebook pages">
          {pages.map((p, i) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={page === i}
              className={`${styles.tab} ${page === i ? styles.tabOn : ''}`}
              onClick={() => {
                setDir(i > page ? 1 : -1);
                setPage(i);
                bus.fx('page');
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={page}
            role="tabpanel"
            className={styles.page}
            initial={{ opacity: 0, x: 40 * dir, rotate: 1.5 * dir }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: -40 * dir, rotate: -1.5 * dir }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            {page === 0 && (
              <>
                <Hearts value={s.hunger} label={c.hunger} />
                <Hearts value={s.happiness} label={c.happiness} />
                <div className={styles.miniStats}>
                  <Bar label={c.energy} value={s.energy} />
                  <Bar label={c.hygiene} value={s.hygiene} />
                </div>
                <p className={styles.note}>{c.health(!!pet.sick)}</p>
              </>
            )}
            {page === 1 && (
              <>
                <Hearts value={s.discipline} label={c.discipline} icon="sprout" />
                <p className={styles.bigNum}>{Math.round(s.discipline)}%</p>
                <p className={styles.note}>
                  {c.mistakes}: {totalMistakes(pet)}
                </p>
              </>
            )}
            {page === 2 && (
              <dl className={styles.facts}>
                <dt>{c.weight}</dt>
                <dd>{Math.round(s.weight)} g</dd>
                <dt>{c.age}</dt>
                <dd>{c.years(ageYears(pet))}</dd>
                <dt>{c.form}</dt>
                <dd>{formName(pet.form)}</dd>
              </dl>
            )}
            {page === 3 &&
              (adult ? (
                <>
                  <Hearts value={s.bond} label={c.bond} />
                  <p className={styles.note}>
                    {s.bond > 75
                      ? `${name} trusts you completely.`
                      : s.bond > 40
                        ? `${name} perks up when you’re near.`
                        : `${name} is still getting to know you.`}
                  </p>
                </>
              ) : (
                <p className={styles.para}>{c.bondLocked}</p>
              ))}
          </motion.div>
        </AnimatePresence>
        <div className={styles.pageNav}>
          <motion.button
            type="button"
            className={styles.iconBtn}
            onClick={() => go(-1)}
            aria-label="Previous page"
            {...squish}
          >
            <Icon name="left" width={28} height={28} />
          </motion.button>
          <span aria-live="polite">
            {page + 1} / {pages.length}
          </span>
          <motion.button
            type="button"
            className={styles.iconBtn}
            onClick={() => go(1)}
            aria-label="Next page"
            {...squish}
          >
            <Icon name="right" width={28} height={28} />
          </motion.button>
        </div>
      </div>
    </Sheet>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div
      className={styles.bar}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
    >
      <span>{label}</span>
      <span className={styles.barTrack}>
        <motion.span
          className={styles.barFill}
          initial={false}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </span>
    </div>
  );
}
