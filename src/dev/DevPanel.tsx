import { useState } from 'react';
import { motion } from 'framer-motion';
import { HOUR, MIN, SPECIES_IDS, speciesOf, TUNING, type Stats } from '../sim';
import { speciesArtReady } from '../assets/manifest';
import { eligibleSpecies } from '../game/store';
import { useGame } from '../game/store';
import styles from './dev.module.css';

const SCALES = [1, 10, 60, 600];
const STATS: (keyof Stats)[] = [
  'hunger',
  'happiness',
  'discipline',
  'energy',
  'hygiene',
  'health',
  'bond',
  'weight',
];

/** Hidden testing tools. Toggle with the backtick key or open with ?dev=1. */
export default function DevPanel() {
  const st = useGame();
  const [min, setMin] = useState(false);
  const p = st.pet;
  const fmt = (ms: number) => `${Math.floor(ms / HOUR)}h ${Math.floor((ms % HOUR) / MIN)}m`;
  const stageLeft =
    p.stage === 'egg'
      ? TUNING.stageDuration.egg - p.eggMs
      : p.stage === 'adult'
        ? 0
        : TUNING.stageDuration[p.stage] - p.stageMs;
  return (
    <motion.aside
      className={styles.panel}
      drag
      dragMomentum={false}
      aria-label="Dev Panel"
      data-testid="dev-panel"
      data-photo-hide="true"
    >
      <header className={styles.head}>
        <strong>Dev Panel</strong>
        <button
          type="button"
          onClick={() => setMin((m) => !m)}
          aria-label={min ? 'Expand' : 'Collapse'}
        >
          {min ? '▢' : '–'}
        </button>
        <button type="button" onClick={() => st.setDevOpen(false)} aria-label="Close dev panel">
          ×
        </button>
      </header>
      {!min && (
        <div className={styles.body}>
          <section>
            <h4>Time</h4>
            <div className={styles.row}>
              {SCALES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={st.timeScale === s ? styles.on : ''}
                  onClick={() => st.devSetScale(s)}
                  data-testid={`dev-scale-${s}`}
                >
                  {s}×
                </button>
              ))}
            </div>
            <div className={styles.row}>
              {[10 * MIN, HOUR, 6 * HOUR, 24 * HOUR].map((ms) => (
                <button key={ms} type="button" onClick={() => st.devJump(ms)}>
                  +{fmt(ms).replace(' 0m', '').replace('0h ', '')}
                </button>
              ))}
            </div>
            <p className={styles.info}>
              {p.form} · {p.stage} · {p.status} · next stage in {fmt(Math.max(0, stageLeft))} · age{' '}
              {(p.ageMs / HOUR).toFixed(1)}h · mistakes c{p.careMistakes.child}/t
              {p.careMistakes.teen}/a{p.careMistakes.adult} · fullNight{' '}
              {String(p.sleptFullNightLightsOff)}
            </p>
          </section>
          <section>
            <h4>Stage &amp; form</h4>
            <div className={styles.row}>
              <button type="button" onClick={() => st.devEvolve()} data-testid="dev-next-stage">
                Next stage
              </button>
              {speciesOf(p.species).adultForms.map((f) => (
                <button key={f} type="button" onClick={() => st.devEvolve(f)}>
                  → {f}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h4>Species</h4>
            <div className={styles.row}>
              {SPECIES_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => st.devNewEgg(id)}
                  data-testid={`dev-egg-${id}`}
                >
                  New {speciesOf(id).displayName} egg
                </button>
              ))}
            </div>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={st.meta.flags.devAllSpecies}
                onChange={(e) => st.setFlags({ devAllSpecies: e.target.checked })}
              />
              Include species without finished art in the egg draw
            </label>
            <p className={styles.info}>
              Egg draw now: {eligibleSpecies(st.meta.flags.devAllSpecies).join(', ')} · art
              complete: {SPECIES_IDS.filter((id) => speciesArtReady(id)).join(', ') || 'none'}
            </p>
          </section>
          <section>
            <h4>Stats</h4>
            {STATS.map((k) => (
              <label key={k} className={styles.slider}>
                <span>{k}</span>
                <input
                  type="range"
                  min={0}
                  max={k === 'weight' ? 120 : 100}
                  value={Math.round(p.stats[k])}
                  onChange={(e) => st.devSetStats({ [k]: Number(e.target.value) })}
                />
                <span>{Math.round(p.stats[k])}</span>
              </label>
            ))}
          </section>
          <section>
            <h4>Events</h4>
            <div className={styles.row}>
              <button type="button" onClick={() => st.devSick()}>
                Sick
              </button>
              <button type="button" onClick={() => st.devPoop()}>
                Poop
              </button>
              <button type="button" onClick={() => st.devFalseCall()}>
                False call
              </button>
              <button type="button" onClick={() => st.devSetStats({ hunger: 0 })}>
                Starve
              </button>
              <button type="button" onClick={() => st.animatePet('greet')}>
                Greeting
              </button>
              <button type="button" onClick={() => st.setScene({ starAt: st.simNow() })}>
                Falling star
              </button>
              <button type="button" onClick={() => st.setScene({ snailAt: st.simNow() })}>
                Snail
              </button>
              <button
                type="button"
                onClick={() =>
                  st.setScene({
                    rain: st.scene.rain ? false : true,
                    rainbowUntil: st.scene.rain ? st.simNow() + 20 * MIN : 0,
                  })
                }
              >
                {st.scene.rain ? 'Stop rain (rainbow)' : 'Rain'}
              </button>
              <button type="button" onClick={() => st.devEnd('left')}>
                Leave
              </button>
              <button type="button" onClick={() => st.devEnd('ranaway')}>
                Run away
              </button>
              <button type="button" onClick={() => st.devEnd('passed')}>
                Pass
              </button>
              <button type="button" onClick={() => st.addCollectible('goldenFirefly')}>
                Golden firefly
              </button>
            </div>
          </section>
          <section>
            <div className={styles.row}>
              <button
                type="button"
                className={styles.danger}
                onClick={() =>
                  confirm('Reset everything (save, journal, settings)?') && void st.devReset()
                }
              >
                Reset all
              </button>
            </div>
          </section>
        </div>
      )}
    </motion.aside>
  );
}
