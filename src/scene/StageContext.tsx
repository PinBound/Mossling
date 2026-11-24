import { createContext, useContext } from 'react';

export interface PointerState {
  x: number;
  y: number;
  lastMove: number;
  inside: boolean;
}

export interface StageCtx {
  /** CSS px per stage unit (stage is 900×1200 units) */
  unit: number;
  pointer: React.MutableRefObject<PointerState>;
  el: React.RefObject<HTMLDivElement>;
}

export const StageContext = createContext<StageCtx | null>(null);

export function useStage(): StageCtx {
  const c = useContext(StageContext);
  if (!c) throw new Error('useStage outside Stage');
  return c;
}

/** Convert a client point to stage units. */
export function toStage(el: HTMLElement | null, clientX: number, clientY: number) {
  if (!el) return { x: 450, y: 600 };
  const r = el.getBoundingClientRect();
  return { x: ((clientX - r.left) / r.width) * 900, y: ((clientY - r.top) / r.height) * 1200 };
}
