import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { bus, haptic } from '../../game/bus';
import { copy } from '../../ui/copy';
import { Button } from '../../ui/primitives';
import { GamePet, GameShell, type GameApi } from '../GameShell';
import styles from '../games.module.css';

const ROUNDS = 5;

function Game({ phase, end }: GameApi) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [turn, setTurn] = useState<0 | -1 | 1>(0);
  const [verdict, setVerdict] = useState<null | boolean>(null);
  const t = copy.minigame.whichWay;
  const busy = verdict !== null;

  const guess = (dir: -1 | 1) => {
    if (phase !== 'play' || busy) return;
    const look: -1 | 1 = Math.random() < 0.5 ? -1 : 1;
    bus.fx('turn');
    setTurn(look);
    const right = look === dir;
    setTimeout(() => {
      setVerdict(right);
      bus.fx(right ? 'pip' : 'lose', right ? 6 : undefined);
      haptic(right ? 20 : [10, 40, 10]);
    }, 380);
    const nextScore = score + (right ? 1 : 0);
    setTimeout(() => {
      setScore(nextScore);
      setVerdict(null);
      setTurn(0);
      if (round + 1 >= ROUNDS) end(nextScore, nextScore >= 3);
      else setRound(round + 1);
    }, 1500);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') guess(-1);
      if (e.key === 'ArrowRight') guess(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className={styles.whichWay}>
      <p className={styles.prompt} aria-live="polite">
        {verdict === null ? t.prompt : verdict ? t.right_ : t.wrong}
      </p>
      <p className={styles.round}>
        {t.round(round + 1)} · {score} ✓
      </p>
      <motion.div
        className={styles.wwPet}
        animate={
          turn === 0
            ? { rotate: 0, x: 0, scaleY: 1 }
            : {
                rotate: [0, -turn * 4, turn * 14, turn * 8],
                x: [0, 0, turn * 30, turn * 20],
                scaleY: [1, 0.9, 1.06, 1],
              }
        }
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <GamePet
          pose={
            verdict === true ? 'happy' : verdict === false ? 'surprised' : turn ? 'play' : 'idle'
          }
          facing={turn === -1 ? -1 : 1}
        />
      </motion.div>
      <div className={styles.lr}>
        <Button
          onClick={() => guess(-1)}
          disabled={busy || phase !== 'play'}
          aria-keyshortcuts="ArrowLeft"
          data-testid="ww-left"
        >
          ← {t.left}
        </Button>
        <Button
          onClick={() => guess(1)}
          disabled={busy || phase !== 'play'}
          aria-keyshortcuts="ArrowRight"
          data-testid="ww-right"
        >
          {t.right} →
        </Button>
      </div>
    </div>
  );
}

export default function WhichWay() {
  return <GameShell id="which-way">{(api) => <Game {...api} />}</GameShell>;
}
