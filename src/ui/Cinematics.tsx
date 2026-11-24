import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import type { Form } from '../sim';
import { MOSSLING } from '../sim';
import { useGame, type Cinematic } from '../game/store';
import { bus, haptic } from '../game/bus';
import { useReducedMotion } from '../game/prefs';
import { PlaceholderPet } from '../pet/PlaceholderPet';
import { petImage } from '../assets/manifest';

const shellBack = petImage('egg', 'egg_shell_back');
const shellFront = petImage('egg', 'egg_shell_front');
import { emit } from '../scene/particles';
import { copy, formName } from './copy';
import { Button } from './primitives';
import styles from './cinematic.module.css';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function keyOf(c: Cinematic) {
  return c.kind === 'evolve' ? `evolve:${c.to}` : c.kind === 'leave' ? `leave:${c.how}` : c.kind;
}

export function Cinematics() {
  const c = useGame((s) => s.cinematic);
  const away = useGame((s) => !!s.away);
  if (!c || away) return null;
  return <CinematicPlayer key={JSON.stringify(c)} c={c} />;
}

function Art({
  form,
  pose = 'idle',
  blink = false,
  crack,
  silhouette,
}: {
  form: Form;
  pose?: 'idle' | 'happy' | 'surprised' | 'sad' | 'blink';
  blink?: boolean;
  crack?: number;
  silhouette?: boolean;
}) {
  const z = useMotionValue(0);
  const src =
    form === 'egg'
      ? petImage('egg', crack ? (`egg_crack${crack}` as 'egg_crack1') : 'egg_idle')
      : (petImage(form, blink ? 'blink' : pose) ?? petImage(form, 'idle'));
  return (
    <div
      className={styles.art}
      style={{ filter: silhouette ? 'brightness(0) drop-shadow(0 0 18px #fff8d8)' : undefined }}
    >
      {src ? (
        <img src={src} alt="" />
      ) : (
        <PlaceholderPet
          form={form}
          pose={pose === 'blink' ? 'idle' : pose}
          blink={blink}
          lookX={z}
          lookY={z}
          sprout={z}
          droop={0}
          sleepy={false}
          blush={pose === 'happy'}
          crack={crack}
          glow={1}
        />
      )}
    </div>
  );
}

function CinematicPlayer({ c }: { c: Cinematic }) {
  const reduced = useReducedMotion();
  const key = keyOf(c);
  const seen = useGame((s) => s.meta.flags.seenCinematics.includes(key));
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);
  const cancelled = useRef(false);

  const finish = () => {
    if (cancelled.current) return;
    cancelled.current = true;
    useGame.getState().markCinematicSeen(key);
    useGame.getState().nextCinematic();
  };

  useEffect(() => {
    cancelled.current = false;
    let alive = true;
    const step = (n: number) => alive && !cancelled.current && setPhase(n);
    const run = async () => {
      if (reduced) {
        step(99);
        if (c.kind !== 'leave') {
          await wait(2200);
          if (alive) setDone(true);
        }
        return;
      }
      if (c.kind === 'hatch') {
        bus.fx('wobble');
        for (let i = 1; i <= 3; i++) {
          step(i);
          bus.fx('crack');
          haptic(20 * i);
          await wait(900 - i * 120);
        }
        step(4); // darken + rays
        await wait(900);
        bus.fx('heartbeat');
        haptic([50, 150, 50]);
        await wait(1100);
        bus.fx('heartbeat');
        await wait(900);
        step(5); // burst
        bus.fx('burst');
        haptic([30, 30, 80]);
        emit('petal', 450, 650, 40, { vy: -200, vx: 0 });
        emit('sparkle', 450, 650, 30);
        await wait(900);
        step(6); // first blink
        await wait(600);
        step(7);
        await wait(250);
        step(6);
        await wait(1200);
        if (alive) finish();
      } else if (c.kind === 'evolve') {
        const adult = MOSSLING.formStage[c.to] === 'adult';
        const star = c.to === 'starwick';
        if (star) {
          step(20); // night takes over
          await wait(1600);
          step(21); // constellation
          bus.fx('wish');
          await wait(3400);
          step(22); // descend
          bus.fx('fanfareBig');
          emit('star', 450, 500, 40);
          await wait(2600);
          step(30);
          return;
        }
        step(1); // glow
        await wait(adult ? 1500 : 900);
        const flashes = adult ? 5 : 3;
        for (let i = 0; i < flashes; i++) {
          step(i % 2 ? 3 : 2);
          bus.fx('pop');
          await wait(Math.max(110, 520 - i * 110));
        }
        step(4); // leaf swirl
        emit('swirl', 450, 650, 40, { ox: 450, oy: 650 });
        bus.fx('swoosh');
        await wait(1100);
        step(30); // reveal
        bus.fx(adult ? 'fanfareBig' : 'fanfare');
        emit('sparkle', 450, 600, 24);
      } else if (c.kind === 'leave') {
        step(1); // dusk falls
        await wait(1200);
        step(2); // walks, looks back
        await wait(2200);
        step(3); // waves
        bus.fx('farewell');
        await wait(1800);
        step(4); // into the ferns
        if (c.how === 'passed') emit('leaf', 450, 200, 24);
        await wait(2400);
        step(5); // something left behind
      }
    };
    void run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (done) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const skip =
    seen && !(c.kind === 'leave' && phase >= 5) ? (
      <button type="button" className={styles.skip} onClick={finish} data-testid="skip">
        {copy.cinematic.skip}
      </button>
    ) : null;

  if (c.kind === 'hatch') {
    const egg = phase < 5 && phase !== 99;
    return (
      <div
        className={styles.overlay}
        role="dialog"
        aria-label="The Dewstone is hatching"
        data-testid="cinematic"
      >
        <motion.div
          className={styles.dim}
          animate={{ opacity: phase >= 4 && phase < 99 ? 0.82 : 0.35 }}
        />
        {phase >= 4 && phase < 6 && <div className={styles.rays} />}
        <div className={styles.center}>
          {egg ? (
            <motion.div
              animate={{ rotate: phase ? [0, -6 * phase, 6 * phase, 0] : 0 }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Art form="egg" crack={Math.min(3, phase)} />
            </motion.div>
          ) : (
            <div className={styles.hatched}>
              {shellBack && <img src={shellBack} alt="" className={styles.shell} />}
              <motion.div
                initial={{ scale: 0.4, opacity: 0, y: '10%' }}
                animate={{ scale: 1, opacity: 1, y: '0%' }}
                transition={{ type: 'spring', stiffness: 160, damping: 12 }}
              >
                <Art
                  form="dewdrop"
                  pose="happy"
                  blink={phase === 6 || phase === 99 ? false : true}
                />
              </motion.div>
              {shellFront && <img src={shellFront} alt="" className={styles.shell} />}
            </div>
          )}
        </div>
        <AnimatePresence>
          {phase === 5 && (
            <motion.div
              className={styles.flash}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          )}
        </AnimatePresence>
        {skip}
      </div>
    );
  }

  if (c.kind === 'evolve') {
    const starwick = c.to === 'starwick';
    const revealed = phase >= 30 || phase === 99;
    const showOld = phase === 1 || phase === 3;
    const card = copy.cinematic.evolved(formName(c.from), formName(c.to));
    return (
      <div
        className={`${styles.overlay} ${starwick ? styles.night : ''}`}
        role="dialog"
        aria-label={`${card.join('')}`}
        data-testid="cinematic"
      >
        <motion.div className={styles.dim} animate={{ opacity: starwick ? 0.95 : 0.7 }} />
        {starwick && phase >= 20 && <Constellation drawing={phase >= 21} />}
        <div className={styles.center}>
          {!starwick && !revealed && phase >= 1 && phase < 4 && (
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            >
              <Art form={showOld ? c.from : c.to} silhouette={phase >= 2} pose="idle" />
            </motion.div>
          )}
          {!starwick && phase === 4 && (
            <motion.div
              className={styles.swirlGlow}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 1 }}
              transition={{ duration: 1 }}
            />
          )}
          {starwick && phase >= 22 && !revealed && (
            <motion.div
              initial={{ y: -500, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 2.4, ease: [0.2, 0.8, 0.3, 1] }}
            >
              <Art form="starwick" pose="happy" />
            </motion.div>
          )}
          {revealed && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12 }}
            >
              <Art form={c.to} pose="happy" />
            </motion.div>
          )}
        </div>
        {starwick && phase === 20 && (
          <p className={styles.caption}>{copy.cinematic.starwickIntro}</p>
        )}
        {!starwick && MOSSLING.formStage[c.to] === 'adult' && phase === 1 && (
          <p className={styles.caption}>{copy.cinematic.adultIntro}</p>
        )}
        {revealed && (
          <motion.div
            className={styles.nameCard}
            initial={{ y: 40, opacity: 0, rotate: -3 }}
            animate={{ y: 0, opacity: 1, rotate: -1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.2 }}
          >
            <p>
              {card[0]}
              {card[1]}
              <strong>{card[2]}</strong>
              {card[3]}
            </p>
            <Button onClick={finish} data-testid="cinematic-continue">
              Hooray!
            </Button>
          </motion.div>
        )}
        {skip}
      </div>
    );
  }

  // Leaving (gentle / ran away / passed).
  const sad = c.how !== 'left';
  const text =
    c.how === 'left'
      ? copy.cinematic.leaveGentle(formName(c.form))
      : c.how === 'ranaway'
        ? copy.cinematic.leaveRanAway(c.name)
        : copy.cinematic.passed(c.name);
  const end = phase >= 5 || phase === 99;
  return (
    <div
      className={`${styles.overlay} ${sad ? styles.sad : styles.dusk}`}
      role="dialog"
      aria-label={text}
      data-testid="cinematic"
    >
      <motion.div
        className={styles.dim}
        animate={{ opacity: phase >= 1 ? (sad ? 0.75 : 0.6) : 0.2 }}
        transition={{ duration: 1.2 }}
      />
      <div className={styles.ferns} aria-hidden="true">
        <motion.div
          className={styles.fernL}
          initial={{ x: '-100%' }}
          animate={{ x: phase >= 4 ? '0%' : '-100%' }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
        >
          <Fronds />
        </motion.div>
        <motion.div
          className={styles.fernR}
          initial={{ x: '100%' }}
          animate={{ x: phase >= 4 ? '0%' : '100%' }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
        >
          <Fronds />
        </motion.div>
      </div>
      {!end && c.how !== 'passed' && (
        <motion.div
          className={styles.walker}
          animate={{
            x: phase >= 4 ? '70%' : phase >= 2 ? '25%' : '0%',
            scale: phase >= 4 ? 0.4 : phase >= 2 ? 0.75 : 1,
            opacity: phase >= 4 ? 0 : 1,
            rotate: phase === 3 ? [0, -8, 8, -8, 0] : 0,
          }}
          transition={{ duration: phase >= 4 ? 2.2 : 1.8, ease: 'easeInOut' }}
        >
          <Art form={c.form} pose={phase === 3 ? (sad ? 'sad' : 'happy') : 'idle'} />
        </motion.div>
      )}
      {c.how === 'passed' && !end && (
        <motion.div
          className={styles.center}
          animate={{ opacity: phase >= 3 ? 0 : 1 }}
          transition={{ duration: 2 }}
        >
          <Art form={c.form} pose="blink" blink />
        </motion.div>
      )}
      {end && (
        <div className={styles.center}>
          {c.how === 'passed' && (
            <svg viewBox="0 0 200 160" className={styles.stone} aria-hidden="true">
              <ellipse cx="100" cy="150" rx="80" ry="10" fill="#000" opacity="0.2" />
              <path
                d="M50 150 C 46 90 70 60 100 60 C 130 60 154 90 150 150Z"
                fill="#9aa39a"
                stroke="#6f786f"
                strokeWidth="4"
              />
              <path
                d="M84 100 C 90 90 110 90 116 100 M100 92 V124"
                stroke="#6f786f"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M60 150 C 70 140 80 146 86 150 M120 150 C 126 142 138 142 144 150"
                stroke="#7fa36b"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          )}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 0.8, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.4 }}
          >
            <Art form="egg" />
          </motion.div>
        </div>
      )}
      {phase >= 4 && (
        <motion.div
          className={styles.nameCard}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 0.3 }}
        >
          {c.how === 'ranaway' && (
            <svg viewBox="0 0 60 40" width="60" aria-hidden="true">
              <path d="M6 6 H54 V34 H6Z" fill="#f6f0e1" stroke="#6b4f3a" strokeWidth="2" />
              <path d="M12 14 H44 M12 20 H40 M12 26 H32" stroke="#6b4f3a" strokeWidth="2" />
            </svg>
          )}
          <p>{text}</p>
          {end && (
            <>
              <p className={styles.small}>{copy.cinematic.newEgg}</p>
              <Button onClick={finish} data-testid="cinematic-continue">
                {copy.cinematic.continue}
              </Button>
            </>
          )}
        </motion.div>
      )}
      {skip}
    </div>
  );
}

/** Fern fronds that sweep closed behind the departing Mossling. */
function Fronds() {
  return (
    <svg viewBox="0 0 300 1200" preserveAspectRatio="none" aria-hidden="true">
      {[120, 380, 640, 900, 1140].map((y, k) => (
        <g key={y} transform={`translate(-20 ${y}) rotate(${-14 + k * 6})`}>
          <path d="M0 0 C 120 -30 240 -10 330 30" stroke="#2f4a33" strokeWidth="10" fill="none" />
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i} transform={`translate(${20 + i * 34} ${-6 + i * 3})`}>
              <ellipse
                cx="0"
                cy="-34"
                rx="16"
                ry="40"
                transform="rotate(20)"
                fill={(i + k) % 2 ? '#3f5e3a' : '#4f7444'}
              />
              <ellipse
                cx="0"
                cy="34"
                rx="16"
                ry="40"
                transform="rotate(-20)"
                fill={(i + k) % 2 ? '#4f7444' : '#3f5e3a'}
              />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

/** Stars draw the outline of a winged creature, joined by glowing lines. */
function Constellation({ drawing }: { drawing: boolean }) {
  const pts = [
    [450, 330],
    [400, 380],
    [330, 330],
    [240, 360],
    [270, 450],
    [380, 470],
    [400, 560],
    [450, 620],
    [500, 560],
    [520, 470],
    [630, 450],
    [660, 360],
    [570, 330],
    [500, 380],
    [450, 330],
  ];
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  return (
    <svg viewBox="0 0 900 1200" className={styles.constellation} aria-hidden="true">
      {Array.from({ length: 60 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 137) % 900}
          cy={(i * 251) % 1200}
          r={1 + (i % 3)}
          fill="#fff"
          opacity={0.4 + (i % 5) * 0.1}
        />
      ))}
      <motion.path
        d={d}
        fill="none"
        stroke="#bcd3ff"
        strokeWidth="3"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: drawing ? 1 : 0 }}
        transition={{ duration: 3, ease: 'easeInOut' }}
        style={{ filter: 'drop-shadow(0 0 6px #8fb5ff)' }}
      />
      {pts.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="7"
          fill="#fff"
          initial={{ scale: 0 }}
          animate={{ scale: drawing ? 1 : 0.4 }}
          transition={{ delay: drawing ? i * 0.2 : 0 }}
          style={{ filter: 'drop-shadow(0 0 8px #cfe0ff)' }}
        />
      ))}
    </svg>
  );
}
