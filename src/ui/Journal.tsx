import { useState } from 'react';
import { useMotionValue } from 'framer-motion';
import { ALL_FORMS, MOSSLING, type Form } from '../sim';
import { useGame } from '../game/store';
import { petImage, propImage, type Pose } from '../assets/manifest';

const leafArt = propImage('memory_leaf');
import { PlaceholderPet } from '../pet/PlaceholderPet';
import { Sheet } from './primitives';
import { copy, formName } from './copy';
import styles from './ui.module.css';

export function Portrait({
  form,
  pose = 'happy',
  silhouette = false,
}: {
  form: Form;
  pose?: Pose;
  silhouette?: boolean;
}) {
  const z = useMotionValue(0);
  const src =
    form === 'egg' ? petImage('egg', 'egg_idle') : (petImage(form, pose) ?? petImage(form, 'idle'));
  const style = { filter: silhouette ? 'brightness(0) opacity(0.35)' : undefined };
  return (
    <div className={styles.portrait} style={style} aria-hidden="true">
      {src ? (
        <img src={src} alt="" />
      ) : (
        <PlaceholderPet
          form={form}
          pose={pose}
          blink={false}
          lookX={z}
          lookY={z}
          sprout={z}
          droop={0}
          sleepy={false}
          blush={false}
        />
      )}
    </div>
  );
}

const fmtDate = (ms: number) =>
  ms
    ? new Date(ms).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

export function Journal() {
  const open = useGame((s) => s.panel === 'journal');
  const j = useGame((s) => s.meta.journal);
  const [tab, setTab] = useState(0);
  const t = copy.journal;
  const forms = ALL_FORMS.filter(
    (f) => f !== 'egg' && (!MOSSLING.secretForms.includes(f as never) || j.formsSeen.includes(f)),
  );
  const lifetime = j.memoryLeaves.reduce(
    (a, l) => ({
      meals: a.meals + l.stats.meals,
      won: a.won + l.stats.gamesWon,
      baths: a.baths + l.stats.baths,
      pets: a.pets + l.stats.pets,
    }),
    { meals: 0, won: 0, baths: 0, pets: 0 },
  );
  return (
    <Sheet
      open={open}
      onClose={() => useGame.getState().setPanel(null)}
      title={t.title}
      wide
      className={styles.notebook}
    >
      <div className={styles.tabs} role="tablist" aria-label="Journal sections">
        {t.tabs.map((name, i) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={tab === i}
            className={`${styles.tab} ${tab === i ? styles.tabOn : ''}`}
            onClick={() => setTab(i)}
          >
            {name}
          </button>
        ))}
      </div>
      <div role="tabpanel" className={styles.journalBody}>
        {tab === 0 && (
          <ul className={styles.formGrid}>
            {forms.map((f) => {
              const seen = j.formsSeen.includes(f);
              return (
                <li key={f} className={styles.formCard}>
                  <Portrait form={f} silhouette={!seen} pose="idle" />
                  <span className={styles.choiceName}>{seen ? formName(f) : t.unknown}</span>
                  {!seen && <span className={styles.choiceDesc}>{t.unknownHint}</span>}
                </li>
              );
            })}
          </ul>
        )}
        {tab === 1 &&
          (j.memoryLeaves.length === 0 ? (
            <p className={styles.para}>{t.noLeaves}</p>
          ) : (
            <ul className={styles.leafList}>
              {j.memoryLeaves.map((l) => (
                <li key={l.id + l.endedAt} className={styles.leaf}>
                  {leafArt && <img src={leafArt} alt="" className={styles.leafBadge} />}
                  <Portrait form={l.form} pose="happy" />
                  <div>
                    <h3>{l.name}</h3>
                    <p className={styles.choiceDesc}>
                      {formName(l.form)} · age {l.ageYears} · {t.leafHow[l.how]}
                    </p>
                    <p className={styles.choiceDesc}>
                      Born {fmtDate(l.bornAt)} · {fmtDate(l.endedAt)}
                    </p>
                    <p className={styles.choiceDesc}>
                      {l.stats.meals} meals · {l.stats.gamesWon} games won · {l.stats.pets} pats ·
                      discipline {l.stats.discipline}% · bond {l.stats.bond} · care slips{' '}
                      {l.stats.mistakes}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ))}
        {tab === 2 && (
          <ul className={styles.treasures}>
            <li>
              <TreasureArt kind="firefly" />
              <span>{t.goldenFirefly}</span>
              <strong>{j.collectibles.goldenFirefly}</strong>
            </li>
            <li>
              <TreasureArt kind="clover" />
              <span>{t.clover}</span>
              <strong>{j.collectibles.clover}</strong>
            </li>
            <li className={styles.wishItem}>
              <TreasureArt kind="star" />
              <span>{t.wishes}</span>
              <strong>{j.collectibles.wishes.length}</strong>
              {j.collectibles.wishes.length > 0 && (
                <ul className={styles.wishes}>
                  {j.collectibles.wishes.slice(0, 6).map((w, i) => (
                    <li key={i}>“{w}”</li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        )}
        {tab === 3 && (
          <>
            <p className={styles.note}>
              {t.lifetime}: {j.memoryLeaves.length} Mosslings · {lifetime.meals} meals ·{' '}
              {lifetime.won} games won · {lifetime.pets} pats
            </p>
            {j.timeline.length === 0 ? (
              <p className={styles.para}>{t.noTimeline}</p>
            ) : (
              <ol className={styles.timeline}>
                {[...j.timeline]
                  .reverse()
                  .slice(0, 60)
                  .map((e, i) => (
                    <li key={i}>
                      <time>{fmtDate(e.at)}</time> {e.text}
                    </li>
                  ))}
              </ol>
            )}
          </>
        )}
      </div>
    </Sheet>
  );
}

function TreasureArt({ kind }: { kind: 'firefly' | 'clover' | 'star' }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
      {kind === 'firefly' && (
        <g>
          <circle cx="24" cy="24" r="16" fill="#f2c76e" opacity="0.3" />
          <circle cx="24" cy="24" r="7" fill="#ffd34d" />
          <ellipse cx="17" cy="18" rx="6" ry="4" fill="#fff" opacity="0.7" />
          <ellipse cx="31" cy="18" rx="6" ry="4" fill="#fff" opacity="0.7" />
        </g>
      )}
      {kind === 'clover' && (
        <g fill="#7fa36b">
          <circle cx="18" cy="18" r="8" />
          <circle cx="30" cy="18" r="8" />
          <circle cx="18" cy="30" r="8" />
          <circle cx="30" cy="30" r="8" />
          <path d="M24 24 Q 30 36 34 44" stroke="#3f5e3a" strokeWidth="3" fill="none" />
        </g>
      )}
      {kind === 'star' && (
        <path
          d="M24 6 L29 18 L42 19 L32 27 L35 40 L24 33 L13 40 L16 27 L6 19 L19 18Z"
          fill="#cfe0ff"
          stroke="#7f8fe0"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}
