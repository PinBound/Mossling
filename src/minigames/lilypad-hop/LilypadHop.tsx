import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { bus, haptic } from '../../game/bus';
import { copy } from '../../ui/copy';
import { propImage } from '../../assets/manifest';

const padArt = propImage('lilypad');
const glowArt = propImage('lilypad_glow');
import { GamePet, GameShell, type GameApi } from '../GameShell';
import styles from '../games.module.css';

/**
 * Rhythm hop: the next lilypad glows toward each beat. Tap within the window to hop.
 * The beat gradually speeds up; missing means a splash.
 */
function Game({ phase, difficulty, end }: GameApi) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [glow, setGlow] = useState(0);
  const [wet, setWet] = useState(false);
  const [offset, setOffset] = useState(0);
  const pet = useAnimationControls();
  const s = useRef({
    t: 0,
    beatAt: 1400,
    interval: 1100,
    score: 0,
    lives: 3,
    tapped: false,
    busy: false,
  });
  const windowMs = 210 - difficulty * 35;

  const miss = async () => {
    const st = s.current;
    st.busy = true;
    st.lives--;
    setLives(st.lives);
    bus.fx('splash');
    haptic([30, 50, 30]);
    setWet(true);
    await pet.start({ y: ['0%', '-30%', '45%'], transition: { duration: 0.55 } });
    await pet.start({ x: [0, -10, 10, -8, 8, 0], transition: { duration: 0.6 } });
    await pet.start({ y: '0%', transition: { type: 'spring', stiffness: 300, damping: 14 } });
    setWet(false);
    st.busy = false;
    if (st.lives <= 0) end(st.score, st.score >= 10);
    else {
      st.beatAt = st.t + st.interval + 400;
      st.tapped = false;
    }
  };

  const hop = async () => {
    const st = s.current;
    st.busy = true;
    st.score++;
    setScore(st.score);
    bus.fx('hop');
    bus.fx('pip', Math.min(12, st.score));
    haptic(10);
    st.interval = Math.max(520 - difficulty * 40, st.interval * 0.96);
    await pet.start({
      y: ['0%', '-40%', '0%'],
      scaleY: [1, 1.1, 0.9, 1],
      transition: { duration: 0.32 },
    });
    setOffset((o) => o + 1);
    st.busy = false;
  };

  const tap = () => {
    if (phase !== 'play') return;
    const st = s.current;
    if (st.busy || st.tapped) return;
    const d = Math.abs(st.t - st.beatAt);
    if (d <= windowMs) {
      st.tapped = true;
      void hop();
    } else {
      st.tapped = true;
      void miss();
    }
  };

  useEffect(() => {
    if (phase !== 'play') return;
    let raf = 0;
    let prev = performance.now();
    const st = s.current;
    const frame = (now: number) => {
      const dt = Math.min(50, now - prev);
      prev = now;
      st.t += dt;
      const until = st.beatAt - st.t;
      setGlow(Math.max(0, 1 - Math.abs(until) / (st.interval * 0.6)));
      if (!st.busy && st.t > st.beatAt + windowMs) {
        if (st.tapped) {
          st.beatAt += st.interval;
          st.tapped = false;
        } else void miss();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp') {
        e.preventDefault();
        tap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className={styles.lily} onPointerDown={tap} data-testid="lily-arena">
      <div className={styles.hudRow}>
        <span>
          {copy.minigame.score}: <strong>{score}</strong>
        </span>
        <span aria-label={`${copy.minigame.lilypad.lives}: ${lives}`}>
          {'♥'.repeat(Math.max(0, lives))}
          {'♡'.repeat(Math.max(0, 3 - lives))}
        </span>
      </div>
      <p className={styles.hint}>
        {wet ? copy.minigame.lilypad.splash : copy.minigame.lilypad.hint}
      </p>
      <div className={styles.pond}>
        {[0, 1, 2, 3, 4].map((i) => {
          const k = offset + i - 1;
          const next = i === 2;
          return (
            <motion.div
              key={k}
              className={styles.pad}
              initial={{ left: `${10 + i * 28}%`, opacity: 0 }}
              animate={{ left: `${10 + (i - 1) * 28}%`, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={
                padArt
                  ? { background: 'none', aspectRatio: '1.6' }
                  : {
                      boxShadow: next
                        ? `0 0 ${10 + glow * 40}px rgba(220,255,140,${glow})`
                        : undefined,
                      background: next
                        ? `color-mix(in srgb, #c9f08a ${Math.round(glow * 100)}%, #6d9a55)`
                        : undefined,
                    }
              }
            >
              {padArt && (
                <>
                  <img src={padArt} alt="" className={styles.padImg} />
                  {next && glowArt && (
                    <img src={glowArt} alt="" className={styles.padImg} style={{ opacity: glow }} />
                  )}
                </>
              )}
            </motion.div>
          );
        })}
        <motion.div className={styles.hopper} animate={pet}>
          <GamePet pose={wet ? 'sad' : glow > 0.7 ? 'play' : 'idle'} />
          {wet && <div className={styles.drips} aria-hidden="true" />}
        </motion.div>
      </div>
    </div>
  );
}

export default function LilypadHop() {
  return <GameShell id="lilypad-hop">{(api) => <Game {...api} />}</GameShell>;
}
