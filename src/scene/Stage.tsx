import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { DAY, HOUR, localHour } from '../sim';
import { useGame } from '../game/store';
import { bus } from '../game/bus';
import { useReducedMotion } from '../game/prefs';
import { PetActor } from '../pet/PetActor';
import { HollowBack, HollowLight, HollowNear, GROUND_Y, POND } from './Hollow';
import { ParticleLayer } from './ParticleLayer';
import { emit, type Ambient } from './particles';
import { paletteAt } from './palette';
import { seasonOf, weatherAt } from './weather';
import { StageContext, toStage, type PointerState } from './StageContext';
import { copy } from '../ui/copy';
import { propImage } from '../assets/manifest';
import styles from './stage.module.css';

export function Stage({
  children,
  stageRef,
}: {
  children?: ReactNode;
  stageRef: React.RefObject<HTMLDivElement>;
}) {
  const [unit, setUnit] = useState(0.5);
  const pointer = useRef<PointerState>({ x: 450, y: 700, lastMove: 0, inside: false });
  const reduced = useReducedMotion();
  const pxRaw = useMotionValue(0);
  const pyRaw = useMotionValue(0);
  const px = useSpring(pxRaw, { stiffness: 40, damping: 14 });
  const py = useSpring(pyRaw, { stiffness: 40, damping: 14 });

  const now = useGame((s) => s.now) || Date.now();
  const pet = useGame((s) => s.pet);
  const scene = useGame((s) => s.scene);
  const hour = localHour(now, pet.tzOffsetMin);
  const date = new Date(now);
  const season = seasonOf(date);
  const w = weatherAt(date);
  const rain = scene.rain ?? w.rain;
  const rainbow = scene.rainbowUntil > now || (scene.rain === null && w.rainbow);
  const dark = paletteAt(hour).dark;
  const birthdayCandles =
    pet.stage !== 'egg' && pet.ageMs >= DAY && pet.ageMs % DAY < 6 * HOUR
      ? Math.floor(pet.ageMs / DAY)
      : 0;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setUnit(el.clientWidth / 900));
    ro.observe(el);
    setUnit(el.clientWidth / 900);
    return () => ro.disconnect();
  }, [stageRef]);

  // Ambient emitters, read by the particle loop every frame.
  const ambientRef = useRef<Ambient | null>(null);
  const acc = useRef(0);
  useEffect(() => {
    if (reduced) {
      ambientRef.current = null;
      return;
    }
    const lightsOff = !pet.lightsOn;
    const fireflies = dark > 0.55 && (season === 'summer' || lightsOff || pet.sleep);
    const rate =
      (rain ? 40 : 0) +
      (season === 'autumn' ? 0.5 : 0) +
      (season === 'winter' ? 3 : 0) +
      (season === 'spring' ? 0.7 : 0) +
      (fireflies ? 0.5 : 0);
    if (!rate) {
      ambientRef.current = null;
      return;
    }
    ambientRef.current = (dt) => {
      acc.current += dt * rate;
      while (acc.current >= 1) {
        acc.current -= 1;
        const pick = Math.random() * rate;
        let r = pick;
        if (rain && (r -= 40) < 0) {
          emit('rain', Math.random() * 960, -20);
          if (Math.random() < 0.05)
            emit(
              'ripple',
              POND.cx + (Math.random() - 0.5) * POND.rx * 1.6,
              POND.cy + (Math.random() - 0.5) * POND.ry,
            );
          continue;
        }
        if (season === 'autumn' && (r -= 0.5) < 0) emit('leaf', Math.random() * 900, -20);
        else if (season === 'winter' && (r -= 3) < 0) emit('snow', Math.random() * 900, -10);
        else if (season === 'spring' && (r -= 0.7) < 0) emit('petal', Math.random() * 900, -10);
        else if (fireflies) emit('firefly', 80 + Math.random() * 740, 600 + Math.random() * 450);
      }
    };
  }, [reduced, rain, season, dark, pet.lightsOn, pet.sleep]);

  // Rare events: a falling star at night, a visiting snail by day.
  useEffect(() => {
    const id = window.setInterval(() => {
      const st = useGame.getState();
      const h = localHour(st.simNow(), st.pet.tzOffsetMin);
      const d = paletteAt(h).dark;
      if (st.pet.stage === 'egg' || st.game) return;
      if (d > 0.7 && st.scene.starAt < st.simNow() - 60_000 && Math.random() < 1 / 40)
        st.setScene({ starAt: st.simNow() });
      if (d < 0.4 && st.scene.snailAt < st.simNow() - 120_000 && Math.random() < 1 / 60)
        st.setScene({ snailAt: st.simNow() });
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Wave sweep when cleaning.
  const [wave, setWave] = useState(0);
  useEffect(
    () =>
      bus.on((e) => {
        if (e.type === 'fx' && e.name === 'wave') setWave((n) => n + 1);
        if (e.type === 'sim' && e.live && e.event.type === 'CLEANED') {
          for (const d of useGame.getState().pet.droppings)
            emit('sparkle', 120 + d.x * 660, GROUND_Y + 20, 6);
          setTimeout(() => emit('sparkle', 450, GROUND_Y, 10), 500);
        }
        if (e.type === 'sim' && e.live && e.event.type === 'BATHED')
          emit('bubble', 450, GROUND_Y - 120, 14);
      }),
    [],
  );

  const onMove = (e: React.PointerEvent) => {
    const s = toStage(stageRef.current, e.clientX, e.clientY);
    pointer.current = { x: s.x, y: s.y, lastMove: performance.now(), inside: true };
    if (!reduced) {
      pxRaw.set((s.x - 450) / 450);
      pyRaw.set((s.y - 600) / 600);
    }
  };

  const ctx = useMemo(() => ({ unit, pointer, el: stageRef }), [unit, stageRef]);

  return (
    <StageContext.Provider value={ctx}>
      <div ref={stageRef} className={styles.stage} onPointerMove={onMove} data-testid="stage">
        <HollowBack
          hour={hour}
          px={px}
          py={py}
          lightsOn={pet.lightsOn}
          droppings={pet.droppings}
          season={season}
          rain={rain}
          rainbow={rainbow}
          candles={birthdayCandles}
        />
        <Snail at={scene.snailAt} now={now} />
        <PetActor raining={rain} />
        <HollowNear hour={hour} px={px} py={py} />
        <HollowLight hour={hour} lightsOn={pet.lightsOn} mist={w.mist && !rain} />
        <ParticleLayer ambientRef={ambientRef} />
        <FallingStar at={scene.starAt} now={now} />
        <AnimatePresence>
          {wave > 0 && <Wave key={wave} onDone={() => setWave(0)} />}
        </AnimatePresence>
        {children}
      </div>
    </StageContext.Provider>
  );
}

function Wave({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      className={styles.wave}
      initial={{ x: '-110%' }}
      animate={{ x: '110%' }}
      transition={{ duration: 1.1, ease: [0.4, 0, 0.3, 1] }}
      onAnimationComplete={onDone}
      aria-hidden="true"
    >
      <svg viewBox="0 0 400 1200" preserveAspectRatio="none" width="100%" height="100%">
        <path
          d="M120 0 C 60 200 180 400 100 600 C 30 800 160 1000 110 1200 L0 1200 L0 0Z"
          fill="#5fa3a0"
          opacity="0.75"
        />
        <path
          d="M200 0 C 140 200 260 400 180 600 C 110 800 240 1000 190 1200 L120 1200 C 160 1000 30 800 100 600 C 180 400 60 200 120 0Z"
          fill="#cfe8d5"
          opacity="0.7"
        />
      </svg>
    </motion.div>
  );
}

function FallingStar({ at, now }: { at: number; now: number }) {
  const [gone, setGone] = useState(0);
  const live = at > 0 && now - at < 7000 && gone !== at;
  if (!live) return null;
  const wish = () => {
    setGone(at);
    useGame.getState().animatePet('wish');
    useGame
      .getState()
      .toast(copy.toasts.wish(useGame.getState().pet.name || 'Your Mossling'), 'good');
    emit('star', 600, 200, 20);
  };
  return (
    <motion.button
      type="button"
      className={styles.star}
      initial={{ x: '80%', y: '5%', opacity: 0 }}
      animate={{ x: '15%', y: '28%', opacity: [0, 1, 1, 0] }}
      transition={{ duration: 6.5, ease: 'easeOut' }}
      onClick={wish}
      aria-label={copy.aria.star}
    >
      <svg viewBox="0 0 120 40" width="100%" height="100%" aria-hidden="true">
        <path d="M110 6 L10 34" stroke="url(#tail)" strokeWidth="4" strokeLinecap="round" />
        <defs>
          <linearGradient id="tail" x1="1" x2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="33" r="6" fill="#fff" />
      </svg>
    </motion.button>
  );
}

function Snail({ at, now }: { at: number; now: number }) {
  if (!at || now - at > 45_000) return null;
  const src = propImage('snail');
  return (
    <motion.button
      type="button"
      className={styles.snail}
      initial={{ left: '102%' }}
      animate={{ left: '-14%' }}
      transition={{ duration: 45, ease: 'linear' }}
      aria-label="A visiting snail"
      onClick={() => {
        useGame.getState().animatePet('pet-ears');
        useGame
          .getState()
          .toast('A snail is visiting the Hollow! It leaves a shiny trail.', 'good');
      }}
    >
      {src ? (
        <img src={src} alt="" width="100%" />
      ) : (
        <svg viewBox="0 0 80 50" width="100%" aria-hidden="true">
          <path d="M6 44 C 20 40 60 40 76 44 L70 48 L8 48Z" fill="#c9b79a" />
          <circle cx="40" cy="28" r="18" fill="#c98e5a" stroke="#8a5a34" strokeWidth="3" />
          <path
            d="M40 28 m -8 0 a 8 8 0 1 1 8 8 a 4 4 0 1 1 -4 -4"
            fill="none"
            stroke="#8a5a34"
            strokeWidth="3"
          />
          <path
            d="M14 42 L8 24 M18 42 L16 24"
            stroke="#c9b79a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="8" cy="22" r="3" fill="#1d1f26" />
          <circle cx="16" cy="22" r="3" fill="#1d1f26" />
        </svg>
      )}
    </motion.button>
  );
}
