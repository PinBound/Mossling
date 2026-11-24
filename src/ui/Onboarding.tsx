import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../game/store';
import { bus } from '../game/bus';
import { Button } from './primitives';
import { copy } from './copy';
import { petImage, propImage, sceneImage } from '../assets/manifest';
import styles from './ui.module.css';

/** Onboarding pictures composed from the painted scene and character art. */
function ArtIllustration({ i }: { i: number }) {
  const tod = (['dusk', 'night', 'day'] as const)[i];
  const far = sceneImage('bg_far', tod);
  const mid = sceneImage('bg_mid', tod);
  const egg = petImage('egg', 'egg_idle');
  const sprig = petImage('sprig', 'happy');
  const lantern = propImage('lantern_on');
  // Card 2 moves in close on the glowing stone.
  const zoom = i === 1 ? { transform: 'scale(1.7)', transformOrigin: '58% 88%' } : undefined;
  return (
    <div className={styles.onbArtBox} aria-hidden="true">
      <div className={styles.onbArtScene} style={zoom}>
        {far && <img src={far} alt="" className={styles.onbBg} />}
        {mid && <img src={mid} alt="" className={styles.onbBg} />}
        {i < 2 && egg && (
          <div className={styles.onbEgg}>
            <span className={styles.onbGlow} />
            <img src={egg} alt="" />
          </div>
        )}
        {i === 2 && (
          <>
            {lantern && <img src={lantern} alt="" className={styles.onbLantern} />}
            {sprig && <img src={sprig} alt="" className={styles.onbSprig} />}
          </>
        )}
      </div>
    </div>
  );
}

function Illustration({ i }: { i: number }) {
  if (sceneImage('bg_far', 'day') && petImage('egg', 'egg_idle')) return <ArtIllustration i={i} />;
  return <DrawnIllustration i={i} />;
}

/** Code-drawn fallback used until scene art exists. */
function DrawnIllustration({ i }: { i: number }) {
  return (
    <svg viewBox="0 0 300 200" className={styles.onbArt} aria-hidden="true">
      <defs>
        <linearGradient id={`onbSky${i}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={i === 2 ? '#93cbdc' : '#5d5486'} />
          <stop offset="1" stopColor={i === 2 ? '#e4f3e1' : '#f0a077'} />
        </linearGradient>
        <radialGradient id={`onbGlow${i}`}>
          <stop offset="0" stopColor="#f8ffd8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f8ffd8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="200" rx="24" fill={`url(#onbSky${i})`} />
      <path d="M0 140 C 80 120 200 150 300 130 L300 200 L0 200Z" fill="#7fa36b" />
      <ellipse cx="200" cy="160" rx="70" ry="14" fill="#5fa3a0" />
      <path d="M-10 200 C 10 120 60 60 180 30" stroke="#3f5e3a" strokeWidth="6" fill="none" />
      {i === 0 && (
        <circle cx="150" cy="150" r="40" fill={`url(#onbGlow${i})`} className={styles.pulse} />
      )}
      <ellipse
        cx={i === 2 ? 120 : 150}
        cy="150"
        rx={i === 1 ? 26 : 20}
        ry={i === 1 ? 32 : 25}
        fill="#cfe8d5"
        stroke="#7aa886"
        strokeWidth="3"
      />
      {[
        [-8, -8],
        [6, 4],
        [-4, 12],
      ].map(([dx, dy], k) => (
        <circle key={k} cx={(i === 2 ? 120 : 150) + dx} cy={150 + dy} r="3.5" fill="#7fa36b" />
      ))}
      {i === 1 && (
        <ellipse
          cx="150"
          cy="150"
          rx="40"
          ry="48"
          fill={`url(#onbGlow${i})`}
          className={styles.pulse}
        />
      )}
      {i === 2 && (
        <g>
          <path
            d="M160 140 C 186 136 196 156 190 172 C 186 182 150 182 146 172 C 140 156 150 140 160 140Z"
            fill="#a9c98b"
            stroke="#3f5e3a"
            strokeWidth="3"
          />
          <circle cx="160" cy="158" r="4" fill="#1d1f26" />
          <circle cx="176" cy="158" r="4" fill="#1d1f26" />
          <path d="M168 140 Q 170 128 178 126" stroke="#5c8a46" strokeWidth="3" fill="none" />
          <path
            d="M226 110 L226 92 M216 100 H236 L238 104 H214Z"
            stroke="#5a4433"
            strokeWidth="3"
          />
          <rect
            x="217"
            y="104"
            width="18"
            height="18"
            rx="5"
            fill="#fbe3a1"
            stroke="#5a4433"
            strokeWidth="3"
          />
        </g>
      )}
    </svg>
  );
}

export function Onboarding() {
  const show = useGame((s) => s.ready && !s.meta.flags.onboarded);
  const [i, setI] = useState(0);
  const cards = copy.onboarding;
  const done = () => {
    bus.fx('chime');
    useGame.getState().setFlags({ onboarded: true });
    setI(0);
  };
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={styles.onb}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="onb-title"
          data-testid="onboarding"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              className={styles.onbCard}
              initial={{ opacity: 0, x: 60, rotate: 3 }}
              animate={{ opacity: 1, x: 0, rotate: -0.6 }}
              exit={{ opacity: 0, x: -60, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            >
              <Illustration i={i} />
              <h2 id="onb-title" className={styles.handLettered}>
                {cards[i].title}
              </h2>
              <p className={styles.para}>{cards[i].body}</p>
              <div className={styles.dots} aria-hidden="true">
                {cards.map((_, k) => (
                  <span key={k} className={k === i ? styles.dotOn : styles.dot} />
                ))}
              </div>
              <div className={styles.rowEnd}>
                {i < cards.length - 1 && (
                  <Button variant="ghost" onClick={done}>
                    {copy.onboardingSkip}
                  </Button>
                )}
                <Button
                  onClick={() => (i < cards.length - 1 ? (bus.fx('page'), setI(i + 1)) : done())}
                  data-testid="onboarding-next"
                  autoFocus={
                    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
                  }
                >
                  {i < cards.length - 1 ? copy.onboardingNext : copy.onboardingBegin}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
