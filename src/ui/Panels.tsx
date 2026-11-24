import { motion } from 'framer-motion';
import type { FoodId, GameId } from '../sim';
import { useGame } from '../game/store';
import { requestNotifications } from '../game/notifications';
import { propImage } from '../assets/manifest';
import { Button, Sheet, squish } from './primitives';
import { copy } from './copy';
import styles from './ui.module.css';

function FoodArt({ id }: { id: FoodId | 'honeydrop' }) {
  const src = propImage(id === 'honeydrop' ? 'snack_honeydrop' : (`food_${id}` as const));
  if (src) return <img src={src} alt="" className={styles.foodImg} />;
  return (
    <svg viewBox="0 0 80 80" className={styles.foodImg} aria-hidden="true">
      {id === 'dewberry_mash' && (
        <g>
          <path d="M10 42 C 10 62 26 70 40 70 C 54 70 70 62 70 42Z" fill="#b8946a" />
          <ellipse cx="40" cy="42" rx="30" ry="8" fill="#8f4a6e" />
          {[
            [30, 38],
            [44, 36],
            [52, 41],
            [36, 44],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6" fill="#6c3a7a" />
          ))}
          <circle cx="28" cy="36" r="2" fill="#fff" opacity="0.7" />
        </g>
      )}
      {id === 'mossbread' && (
        <g>
          <path
            d="M12 54 C 8 30 24 20 40 20 C 56 20 72 30 68 54Z"
            fill="#d6a45f"
            stroke="#a87a3d"
            strokeWidth="3"
          />
          <path
            d="M22 34 q 6 -6 12 0 M38 30 q 6 -6 12 0"
            stroke="#a87a3d"
            strokeWidth="3"
            fill="none"
          />
          {[
            [24, 46],
            [42, 42],
            [56, 48],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="5" fill="#7fa36b" />
          ))}
        </g>
      )}
      {id === 'honeydrop' && (
        <g>
          <path
            d="M40 10 C 54 30 60 40 60 50 C 60 62 51 70 40 70 C 29 70 20 62 20 50 C 20 40 26 30 40 10Z"
            fill="#f2c76e"
            stroke="#d6a440"
            strokeWidth="3"
          />
          <ellipse cx="32" cy="46" rx="6" ry="10" fill="#fff4d0" opacity="0.8" />
        </g>
      )}
    </svg>
  );
}

export function FeedMenu() {
  const open = useGame((s) => s.panel === 'feed');
  const close = () => useGame.getState().setPanel(null);
  const feed = (food: FoodId) => {
    close();
    setTimeout(() => useGame.getState().dispatch({ type: 'feed', food }), 180);
  };
  const snack = () => {
    close();
    setTimeout(() => useGame.getState().dispatch({ type: 'snack' }), 180);
  };
  const items = [
    { id: 'dewberry_mash' as const, run: () => feed('dewberry_mash'), key: '1' },
    { id: 'mossbread' as const, run: () => feed('mossbread'), key: '2' },
    { id: 'honeydrop' as const, run: snack, key: '3' },
  ];
  return (
    <Sheet open={open} onClose={close} title={copy.feedTitle}>
      <div
        className={styles.choiceGrid}
        onKeyDown={(e) => items.find((i) => i.key === e.key)?.run()}
      >
        {items.map((it) => (
          <motion.button
            key={it.id}
            type="button"
            className={styles.choice}
            onClick={it.run}
            {...squish}
            aria-keyshortcuts={it.key}
            data-testid={`food-${it.id}`}
          >
            <FoodArt id={it.id} />
            <span className={styles.choiceName}>{copy.foods[it.id].name}</span>
            <span className={styles.choiceDesc}>{copy.foods[it.id].desc}</span>
          </motion.button>
        ))}
      </div>
    </Sheet>
  );
}

function GameArt({ id }: { id: GameId }) {
  return (
    <svg viewBox="0 0 80 80" className={styles.foodImg} aria-hidden="true">
      {id === 'which-way' && (
        <g>
          <circle cx="40" cy="44" r="22" fill="#7fa36b" />
          <circle cx="33" cy="42" r="4" fill="#1d1f26" />
          <circle cx="47" cy="42" r="4" fill="#1d1f26" />
          <path d="M8 44 L18 36 L18 52Z M72 44 L62 36 L62 52Z" fill="#f2c76e" />
          <path
            d="M40 22 Q 42 12 50 10"
            stroke="#5c8a46"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}
      {id === 'firefly-catch' && (
        <g>
          <rect width="80" height="80" rx="18" fill="#26355f" />
          {[
            [22, 26],
            [52, 20],
            [40, 48],
            [62, 56],
            [18, 60],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="9" fill="#e9f58a" opacity="0.3" />
              <circle cx={x} cy={y} r="3.5" fill="#fffbe0" />
            </g>
          ))}
        </g>
      )}
      {id === 'lilypad-hop' && (
        <g>
          <rect width="80" height="80" rx="18" fill="#5fa3a0" />
          {[
            [18, 56],
            [40, 44],
            [62, 56],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="14" ry="6" fill={i === 1 ? '#c9f08a' : '#6d9a55'} />
          ))}
          <circle cx="40" cy="30" r="10" fill="#cfe8d5" />
        </g>
      )}
    </svg>
  );
}

export function PlayMenu() {
  const open = useGame((s) => s.panel === 'play');
  const bests = useGame((s) => s.meta.bests);
  const close = () => useGame.getState().setPanel(null);
  const games: GameId[] = ['which-way', 'firefly-catch', 'lilypad-hop'];
  return (
    <Sheet open={open} onClose={close} title={copy.playTitle}>
      <div
        className={styles.choiceGrid}
        onKeyDown={(e) => {
          const g = games[Number(e.key) - 1];
          if (g) useGame.getState().startGame(g);
        }}
      >
        {games.map((g, i) => (
          <motion.button
            key={g}
            type="button"
            className={styles.choice}
            onClick={() => useGame.getState().startGame(g)}
            {...squish}
            aria-keyshortcuts={String(i + 1)}
            data-testid={`game-${g}`}
          >
            <GameArt id={g} />
            <span className={styles.choiceName}>{copy.games[g].name}</span>
            <span className={styles.choiceDesc}>{copy.games[g].desc}</span>
            {bests[g] !== undefined && (
              <span className={styles.choiceBest}>{copy.minigame.best(bests[g]!)}</span>
            )}
          </motion.button>
        ))}
      </div>
    </Sheet>
  );
}

export function NotifCard() {
  const open = useGame((s) => s.panel === 'notif' && !s.cinematic);
  const name = useGame((s) => s.pet.name || 'your Mossling');
  const done = (enabled: boolean) => {
    const st = useGame.getState();
    st.setFlags({ notifAsked: true });
    st.updateSettings({ notifications: enabled });
    st.setPanel(null);
  };
  return (
    <Sheet open={open} onClose={() => done(false)} title={copy.notif.title}>
      <div className={styles.notifArt} aria-hidden="true">
        <svg viewBox="0 0 120 80" width="160">
          <path
            d="M20 20 H100 V64 H20Z"
            fill="var(--parchment)"
            stroke="var(--bark)"
            strokeWidth="3"
          />
          <path d="M20 20 L60 46 L100 20" fill="none" stroke="var(--bark)" strokeWidth="3" />
          <path d="M84 10 C 92 2 104 8 98 18 C 94 24 86 20 84 10Z" fill="var(--moss)" />
        </svg>
      </div>
      <p className={styles.para}>{copy.notif.body(name)}</p>
      <div className={styles.rowEnd}>
        <Button variant="ghost" onClick={() => done(false)}>
          {copy.notif.no}
        </Button>
        <Button
          onClick={async () => {
            const ok = await requestNotifications();
            done(ok);
          }}
        >
          {copy.notif.yes}
        </Button>
      </div>
    </Sheet>
  );
}
