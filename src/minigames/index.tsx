import { lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGame } from '../game/store';

const games = {
  'which-way': lazy(() => import('./which-way/WhichWay')),
  'firefly-catch': lazy(() => import('./firefly-catch/FireflyCatch')),
  'lilypad-hop': lazy(() => import('./lilypad-hop/LilypadHop')),
};

export default function MinigameHost() {
  const id = useGame((s) => s.game);
  const G = id ? games[id] : null;
  return (
    <AnimatePresence>
      {G && (
        <Suspense fallback={null} key={id}>
          <G />
        </Suspense>
      )}
    </AnimatePresence>
  );
}
