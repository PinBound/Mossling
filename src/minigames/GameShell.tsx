import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import type { Form, GameId } from '../sim';
import { useGame } from '../game/store';
import { bus } from '../game/bus';
import { PlaceholderPet } from '../pet/PlaceholderPet';
import { petPose, type Pose } from '../assets/manifest';
import { Button } from '../ui/primitives';
import { copy } from '../ui/copy';
import styles from './games.module.css';

export type Phase = 'intro' | 'play' | 'paused' | 'results';

export interface GameApi {
  phase: Phase;
  difficulty: number;
  form: Form;
  end(score: number, won: boolean): void;
}

/** Simple portrait of the pet for use inside games. */
export function GamePet({
  pose = 'idle',
  facing = 1,
  blink = false,
}: {
  pose?: Pose;
  facing?: number;
  blink?: boolean;
}) {
  const form = useGame((s) => s.pet.form);
  const z = useMotionValue(0);
  const src = form === 'egg' ? null : petPose(form, pose);
  return (
    <div className={styles.pet} style={{ transform: `scaleX(${facing})` }}>
      {src ? (
        <img src={src} alt="" />
      ) : (
        <PlaceholderPet
          form={form}
          pose={pose}
          blink={blink}
          lookX={z}
          lookY={z}
          sprout={z}
          droop={0}
          sleepy={false}
          blush={pose === 'happy'}
        />
      )}
    </div>
  );
}

export function GameShell({ id, children }: { id: GameId; children: (api: GameApi) => ReactNode }) {
  const form = useGame((s) => s.pet.form);
  const stage = useGame((s) => s.pet.stage);
  const best = useGame((s) => s.meta.bests[id] ?? 0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [count, setCount] = useState(3);
  const [result, setResult] = useState<{ score: number; won: boolean; best: boolean } | null>(null);
  const [round, setRound] = useState(0);
  const difficulty = stage === 'adult' ? 2 : stage === 'teen' ? 1 : 0;
  const finished = useRef(false);

  useEffect(() => {
    if (phase !== 'intro') return;
    setCount(3);
    let n = 3;
    bus.fx('countdown');
    const t = setInterval(() => {
      n--;
      setCount(n);
      if (n > 0) bus.fx('countdown');
      else {
        bus.fx('go');
        clearInterval(t);
        setTimeout(() => setPhase('play'), 450);
      }
    }, 700);
    return () => clearInterval(t);
  }, [phase, round]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        e.stopPropagation();
        setPhase((p) => (p === 'play' ? 'paused' : p === 'paused' ? 'play' : p));
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  const end = (score: number, won: boolean) => {
    if (finished.current) return;
    finished.current = true;
    const r = useGame.getState().finishGame(id, won, score);
    bus.fx(won ? 'win' : 'lose');
    setResult({ score, won, best: r.best });
    setPhase('results');
  };

  const again = () => {
    const p = useGame.getState().pet;
    if (p.stats.energy < 15 || p.sleep) {
      useGame.getState().toast(copy.tooTired(p.name || 'Your Mossling'));
      return quit();
    }
    finished.current = false;
    setResult(null);
    setRound((r) => r + 1);
    setPhase('intro');
  };
  const quit = () => useGame.getState().startGame(null);

  return (
    <motion.div
      className={styles.shell}
      initial={{ opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      role="region"
      aria-label={copy.games[id].name}
      data-testid={`minigame-${id}`}
    >
      <div className={styles.top}>
        <h2>{copy.games[id].name}</h2>
        <span className={styles.best}>{copy.minigame.best(best)}</span>
        {phase === 'play' && (
          <button
            type="button"
            className={styles.pauseBtn}
            onClick={() => setPhase('paused')}
            aria-label={copy.minigame.pause}
          >
            ❚❚
          </button>
        )}
      </div>
      <div className={styles.arena} key={round}>
        {children({ phase, difficulty, form, end })}
      </div>
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            className={styles.countdown}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-live="assertive"
          >
            <motion.span
              key={count}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 14 }}
            >
              {count > 0 ? count : copy.minigame.go}
            </motion.span>
          </motion.div>
        )}
        {phase === 'paused' && (
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-label={copy.minigame.paused}
          >
            <div className={styles.card}>
              <h3>{copy.minigame.paused}</h3>
              <div className={styles.btns}>
                <Button variant="soft" onClick={quit}>
                  {copy.minigame.quit}
                </Button>
                <Button onClick={() => setPhase('play')} autoFocus>
                  {copy.minigame.resume}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        {phase === 'results' && result && (
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="dialog"
            aria-label="Results"
            data-testid="results"
          >
            <motion.div
              className={styles.card}
              initial={{ y: 40, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            >
              <motion.div
                animate={result.won ? { y: [0, -20, 0] } : { rotate: [0, -4, 4, 0] }}
                transition={{ repeat: result.won ? Infinity : 0, duration: 0.6 }}
                className={styles.resultPet}
              >
                <GamePet pose={result.won ? 'happy' : 'sad'} />
              </motion.div>
              <h3>
                {result.won
                  ? copy.toasts.won(useGame.getState().pet.name || 'It')
                  : copy.toasts.lost(useGame.getState().pet.name || 'It')}
              </h3>
              <p className={styles.score}>
                {copy.minigame.score}: <strong>{result.score}</strong>
                {result.best && <span className={styles.newBest}> {copy.minigame.newBest}</span>}
              </p>
              <div className={styles.deltas} aria-label="Stat changes">
                {[result.won ? '+1 ♥' : '+⅓ ♥', '−1 g', '−10 energy'].map((d, i) => (
                  <motion.span
                    key={d}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: 0.3 + i * 0.18,
                      type: 'spring',
                      stiffness: 300,
                      damping: 14,
                    }}
                    className={i === 0 ? styles.deltaGood : styles.delta}
                  >
                    {d}
                  </motion.span>
                ))}
              </div>
              <div className={styles.btns}>
                <Button variant="soft" onClick={again}>
                  {copy.minigame.again}
                </Button>
                <Button onClick={quit} autoFocus data-testid="results-done">
                  {copy.minigame.done}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
