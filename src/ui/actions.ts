import { playBlock } from '../sim';
import { bus } from '../game/bus';
import { useGame } from '../game/store';
import { copy, formName } from './copy';

export type ActionId =
  'feed' | 'play' | 'bathe' | 'lights' | 'medicine' | 'discipline' | 'praise' | 'status';

export const ACTIONS: { id: ActionId; key: string }[] = [
  { id: 'feed', key: 'F' },
  { id: 'play', key: 'P' },
  { id: 'bathe', key: 'B' },
  { id: 'lights', key: 'L' },
  { id: 'medicine', key: 'M' },
  { id: 'discipline', key: 'D' },
  { id: 'praise', key: 'G' },
  { id: 'status', key: 'S' },
];

/** Run one of the eight care actions. Every action does something (no dead buttons). */
export function runAction(id: ActionId) {
  const st = useGame.getState();
  const p = st.pet;
  const n = p.name || formName(p.form);
  if (p.status !== 'alive') return;
  const egg = p.stage === 'egg';
  switch (id) {
    case 'feed':
      if (egg) return st.toast(`The ${n} hums. It isn’t hungry yet.`);
      if (p.sleep) return st.toast(copy.asleep(n));
      st.setPanel(st.panel === 'feed' ? null : 'feed');
      if (st.meta.flags.nudge === 'feed') st.setFlags({ nudge: 'pet' });
      return;
    case 'play': {
      const b = playBlock(p);
      if (b === 'egg') return st.toast(`The ${n} wobbles happily, but it can’t play yet.`);
      if (b === 'too-young') return st.toast(copy.tooLittle(n));
      if (b === 'asleep') return st.toast(copy.asleep(n));
      if (b === 'tired') return st.toast(copy.tooTired(n));
      if (b === 'sick') return st.toast(copy.tooSick(n));
      st.setPanel(st.panel === 'play' ? null : 'play');
      return;
    }
    case 'bathe': {
      bus.fx('wave');
      st.dispatch({ type: 'clean' });
      const after = useGame.getState().pet;
      if (!egg && !after.sleep && after.stats.hygiene < 75)
        setTimeout(() => useGame.getState().setBath(true), 700);
      else st.toast(copy.toasts.cleaned, 'good');
      return;
    }
    case 'lights':
      st.dispatch({ type: 'lights', on: !p.lightsOn });
      return;
    case 'medicine':
      if (egg) return st.toast(`The ${n} is perfectly healthy.`);
      if (p.sleep) return st.toast(copy.asleep(n));
      st.dispatch({ type: 'medicine' });
      return;
    case 'discipline':
      if (egg) return st.toast('You can’t scold a stone. It just glows at you.');
      if (p.sleep) return st.toast(copy.asleep(n));
      st.dispatch({ type: 'scold' });
      return;
    case 'praise':
      if (egg) return st.toast(`The ${n} glows a little brighter.`);
      if (p.sleep) return st.toast(copy.asleep(n));
      st.dispatch({ type: 'praise' });
      return;
    case 'status':
      st.setPanel(st.panel === 'status' ? null : 'status');
      return;
  }
}

/** Whether an action is "asking" to be used right now (a soft badge, never color alone). */
export function actionNeeded(id: ActionId): boolean {
  const p = useGame.getState().pet;
  if (p.stage === 'egg' || p.status !== 'alive') return false;
  switch (id) {
    case 'feed':
      return !p.sleep && p.stats.hunger < 25;
    case 'bathe':
      return p.droppings.length > 0 || p.stats.hygiene < 30;
    case 'lights':
      return !!p.sleep && p.lightsOn && p.sleep.kind !== 'nap';
    case 'medicine':
      return !!p.sick;
    case 'play':
      return !p.sleep && p.stats.happiness < 25 && p.stage !== 'baby';
    default:
      return false;
  }
}
