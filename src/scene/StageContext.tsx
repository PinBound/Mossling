import { createContext, useContext } from 'react';
import type { MotionValue } from 'framer-motion';

export interface PointerState {
  x: number;
  y: number;
  lastMove: number;
  inside: boolean;
}

export interface StageCtx {
  /** CSS px per world unit (the world is 1600×900 units; the stage shows part or all of it) */
  unit: number;
  /** world units visible across the stage */
  viewW: number;
  /** left edge of the visible window, in world units */
  camX: MotionValue<number>;
  /** the pet's x in world units; the camera follows it on narrow stages */
  petX: MotionValue<number>;
  pointer: React.MutableRefObject<PointerState>;
  el: React.RefObject<HTMLDivElement>;
  /** client (screen) point to world units */
  toWorld(clientX: number, clientY: number): { x: number; y: number };
}

export const StageContext = createContext<StageCtx | null>(null);

export function useStage(): StageCtx {
  const c = useContext(StageContext);
  if (!c) throw new Error('useStage outside Stage');
  return c;
}
