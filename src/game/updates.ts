import { create } from 'zustand';
import { registerSW } from 'virtual:pwa-register';
import { useGame } from './store';

/**
 * App updates. The service worker keeps the game working offline; when a newer version is
 * published it downloads in the background. We then switch to it at a calm moment: right away
 * if the app was just opened, otherwise when you next leave the app (or when you press
 * "Reload to update" in Settings). The game is always saved before reloading.
 */
export type UpdateStatus =
  'idle' | 'checking' | 'current' | 'downloading' | 'ready' | 'offline' | 'unavailable';

interface UpdateState {
  status: UpdateStatus;
  checkedAt: number;
}

export const useUpdates = create<UpdateState>(() => ({ status: 'idle', checkedAt: 0 }));

export const BUILD_INFO = __BUILD__;

let registration: ServiceWorkerRegistration | undefined;
let applyUpdate: ((reload?: boolean) => Promise<void>) | undefined;
const openedAt = Date.now();

const set = (s: Partial<UpdateState>) => useUpdates.setState(s);

async function reloadToUpdate() {
  try {
    await useGame.getState().save();
  } catch {
    /* saving is best effort; the autosave ran recently */
  }
  await applyUpdate?.(true);
}

/** Version label for Settings, e.g. "25 Nov 2026 · 40798d5". */
export function versionLabel(): string {
  const d = new Date(BUILD_INFO.builtAt);
  const date = isNaN(+d)
    ? ''
    : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  return [date, BUILD_INFO.commit].filter(Boolean).join(' · ');
}

export function startUpdates() {
  if (!('serviceWorker' in navigator)) {
    set({ status: 'unavailable' });
    return;
  }
  applyUpdate = registerSW({
    immediate: true,
    onRegisteredSW(_url, reg) {
      registration = reg;
      // A version may already be downloading or waiting from an earlier visit.
      if (reg?.waiting && isUpdate()) onReady();
      else if (reg?.installing) watchInstall(reg.installing);
      reg?.addEventListener('updatefound', () => reg.installing && watchInstall(reg.installing));
    },
    onNeedRefresh: onReady,
    onRegisterError() {
      set({ status: 'unavailable' });
    },
  });
  // iOS often pauses a home-screen app instead of closing it: check again whenever it returns,
  // and switch to a downloaded version while it's out of sight.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void checkForUpdates(true);
    else if (useUpdates.getState().status === 'ready') void reloadToUpdate();
  });
}

/** A new worker is an update only if an older version is already running this page. */
const isUpdate = () => !!navigator.serviceWorker.controller;

function watchInstall(sw: ServiceWorker) {
  // The very first install (making the game work offline) isn't an update.
  if (!isUpdate()) return;
  set({ status: 'downloading' });
  sw.addEventListener('statechange', () => {
    if (sw.state === 'installed' && registration?.waiting) onReady();
    if (sw.state === 'redundant' && useUpdates.getState().status === 'downloading')
      set({ status: 'idle' });
  });
}

function onReady() {
  if (useUpdates.getState().status === 'ready' || !isUpdate()) return;
  set({ status: 'ready' });
  const st = useGame.getState();
  const busy = !!st.game || !!st.cinematic || !!st.bath || !st.meta.flags.onboarded;
  // Just opened and nothing is happening yet: switch now. Otherwise don't interrupt play.
  if (Date.now() - openedAt < 20_000 && !busy) void reloadToUpdate();
  else
    st.toast(
      'A new version of the game is ready. It will update next time you open it, or tap Settings → Reload to update.',
      'info',
    );
}

/** Ask the server for a newer version now. `quiet` skips the status changes for background checks. */
export async function checkForUpdates(quiet = false): Promise<UpdateStatus> {
  const current = useUpdates.getState().status;
  if (current === 'ready' || current === 'downloading') return current;
  if (!registration) {
    if (!quiet) set({ status: 'unavailable' });
    return 'unavailable';
  }
  if (!navigator.onLine) {
    if (!quiet) set({ status: 'offline' });
    return 'offline';
  }
  if (!quiet) set({ status: 'checking' });
  try {
    await registration.update();
  } catch {
    if (!quiet) set({ status: 'offline' });
    return 'offline';
  }
  const after = useUpdates.getState().status;
  if (registration.waiting && isUpdate()) {
    onReady();
    return 'ready';
  }
  if (registration.installing && isUpdate()) {
    watchInstall(registration.installing);
    return 'downloading';
  }
  if (!quiet || after === 'checking') set({ status: 'current', checkedAt: Date.now() });
  return 'current';
}

export { reloadToUpdate };
