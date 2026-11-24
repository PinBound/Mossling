import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../game/store';
import { bus, haptic } from '../../game/bus';
import { copy } from '../../ui/copy';
import { GamePet, GameShell, type GameApi } from '../GameShell';
import styles from '../games.module.css';

interface Fly {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  golden: boolean;
}

const DURATION = 30_000;

function Game({ phase, difficulty, end }: GameApi) {
  const [flies, setFlies] = useState<Fly[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [net, setNet] = useState({ x: 50, y: 50 });
  const [pose, setPose] = useState<'idle' | 'happy' | 'play'>('idle');
  const s = useRef({
    t: 0,
    last: 0,
    nextId: 1,
    spawnAt: 0,
    lastCatch: -9999,
    score: 0,
    combo: 0,
    keys: new Set<string>(),
  });
  const life = 2600 - difficulty * 450;

  useEffect(() => {
    if (phase !== 'play') return;
    let raf = 0;
    let prev = performance.now();
    const st = s.current;
    const frame = (now: number) => {
      const dt = Math.min(50, now - prev);
      prev = now;
      st.t += dt;
      const remaining = DURATION - st.t;
      setLeft(remaining);
      if (st.t >= st.spawnAt) {
        st.spawnAt = st.t + 520 - difficulty * 60 + Math.random() * 260;
        const golden = Math.random() < 0.04;
        const sp = (0.004 + difficulty * 0.002) * (golden ? 1.6 : 1);
        setFlies((f) => [
          ...f,
          {
            id: st.nextId++,
            x: 10 + Math.random() * 80,
            y: 12 + Math.random() * 62,
            vx: (Math.random() - 0.5) * sp * 2,
            vy: (Math.random() - 0.5) * sp,
            born: st.t,
            life: golden ? life * 0.8 : life,
            golden,
          },
        ]);
      }
      setFlies((f) =>
        f
          .filter((fl) => st.t - fl.born < fl.life)
          .map((fl) => ({
            ...fl,
            x: Math.max(4, Math.min(96, fl.x + fl.vx * dt)),
            y: Math.max(
              8,
              Math.min(80, fl.y + fl.vy * dt + Math.sin((st.t + fl.id * 300) / 300) * 0.03),
            ),
          })),
      );
      // keyboard net
      const k = st.keys;
      const v = 0.06 * dt;
      if (k.size)
        setNet((n) => ({
          x: Math.max(
            3,
            Math.min(97, n.x + (k.has('ArrowRight') ? v : 0) - (k.has('ArrowLeft') ? v : 0)),
          ),
          y: Math.max(
            5,
            Math.min(85, n.y + (k.has('ArrowDown') ? v : 0) - (k.has('ArrowUp') ? v : 0)),
          ),
        }));
      if (st.t - st.lastCatch > 1500 && st.combo) {
        st.combo = 0;
        setCombo(0);
      }
      if (remaining <= 0) {
        end(st.score, st.score >= 15 + difficulty * 5);
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const catchFly = (fl: Fly) => {
    if (phase !== 'play') return;
    const st = s.current;
    st.combo = st.t - st.lastCatch < 1500 ? st.combo + 1 : 1;
    st.lastCatch = st.t;
    const gain = (fl.golden ? 5 : 1) * (1 + Math.floor((st.combo - 1) / 3));
    st.score += gain;
    setScore(st.score);
    setCombo(st.combo);
    setFlies((f) => f.filter((x) => x.id !== fl.id));
    bus.fx('pip', st.combo);
    haptic(8);
    setPose(st.combo > 3 ? 'play' : 'happy');
    if (fl.golden) {
      bus.fx('goldenFirefly');
      useGame.getState().addCollectible('goldenFirefly');
      useGame.getState().toast(copy.toasts.goldenFirefly, 'good');
    }
  };

  useEffect(() => {
    const st = s.current;
    const down = (e: KeyboardEvent) => {
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        st.keys.add(e.key);
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlies((f) => {
          const near = f.find((fl) => Math.hypot(fl.x - net.x, (fl.y - net.y) * 0.75) < 9);
          if (near) setTimeout(() => catchFly(near), 0);
          return f;
        });
      }
    };
    const up = (e: KeyboardEvent) => st.keys.delete(e.key);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  });

  return (
    <div className={styles.fireflies}>
      <div className={styles.hudRow}>
        <span>
          {copy.minigame.score}: <strong data-testid="ff-score">{score}</strong>
        </span>
        {combo > 1 && (
          <motion.span
            key={combo}
            className={styles.combo}
            initial={{ scale: 1.6 }}
            animate={{ scale: 1 }}
          >
            {copy.minigame.firefly.combo(combo)}
          </motion.span>
        )}
        <span>{Math.ceil(Math.max(0, left) / 1000)} s</span>
      </div>
      <p className={styles.hint}>
        {copy.minigame.firefly.hint} · {copy.minigame.firefly.keyHint}
      </p>
      {flies.map((fl) => {
        const age = (s.current.t - fl.born) / fl.life;
        return (
          <button
            key={fl.id}
            type="button"
            className={`${styles.fly} ${fl.golden ? styles.golden : ''}`}
            style={{
              left: `${fl.x}%`,
              top: `${fl.y}%`,
              opacity: age > 0.7 ? (1 - age) / 0.3 : Math.min(1, age * 6),
            }}
            onPointerDown={() => catchFly(fl)}
            aria-label={fl.golden ? 'Golden firefly' : 'Firefly'}
            tabIndex={-1}
          />
        );
      })}
      <div
        className={styles.net}
        style={{ left: `${net.x}%`, top: `${net.y}%` }}
        aria-hidden="true"
      />
      <div className={styles.ffPet}>
        <GamePet pose={pose} />
      </div>
    </div>
  );
}

export default function FireflyCatch() {
  return <GameShell id="firefly-catch">{(api) => <Game {...api} />}</GameShell>;
}
