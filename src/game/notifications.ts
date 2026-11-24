import { forecast, localHour } from '../sim';
import { copy } from '../ui/copy';
import { useGame } from './store';

/** Local reminders computed from the sim forecast. Shown via the service worker when available. */
let timers: number[] = [];

const QUIET_START = 22.5;
const QUIET_END = 7.5;

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotifications(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

async function show(title: string, body: string) {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg)
      await reg.showNotification(title, { body, icon: 'icons/icon-192.png', tag: 'mossling' });
    else new Notification(title, { body, icon: 'icons/icon-192.png' });
  } catch {
    /* notifications unavailable */
  }
}

function quiet(simAt: number, tz: number) {
  const h = localHour(simAt, tz);
  return h >= QUIET_START || h < QUIET_END;
}

/** Re-plan reminders. Call after actions and on visibility changes. */
export function scheduleReminders() {
  for (const t of timers) clearTimeout(t);
  timers = [];
  const st = useGame.getState();
  if (!st.meta.settings.notifications || !notificationsSupported()) return;
  if (Notification.permission !== 'granted') return;
  const pet = st.pet;
  if (pet.status !== 'alive' || pet.stage === 'egg' || pet.pause.active) return;
  const now = st.simNow();
  const f = forecast(pet, now);
  const n = pet.name || 'Your Mossling';
  const plan = (simAt: number | null, body: string) => {
    if (simAt === null || quiet(simAt, pet.tzOffsetMin)) return;
    const realDelay = (simAt - now) / Math.max(1, st.timeScale);
    if (realDelay <= 0 || realDelay > 2 ** 31 - 1) return;
    timers.push(
      window.setTimeout(() => {
        if (document.visibilityState === 'visible') return; // they can see it already
        void show(copy.appName, body);
      }, realDelay),
    );
  };
  plan(f.hungryAt, copy.notif.hungry(n));
  plan(f.bedtimeAt !== null ? f.bedtimeAt + 5 * 60_000 : null, copy.notif.bedtime(n));
}
