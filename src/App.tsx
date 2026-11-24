import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { localHour } from './sim';
import { useGame } from './game/store';
import { startLoop } from './game/loop';
import { setHaptics } from './game/bus';
import { scheduleReminders } from './game/notifications';
import { useAudio } from './audio/useAudio';
import { Stage } from './scene/Stage';
import { paletteAt } from './scene/palette';
import { ActionRing } from './ui/ActionRing';
import { Hud } from './ui/Hud';
import { FeedMenu, NotifCard, PlayMenu } from './ui/Panels';
import { StatusSheet } from './ui/StatusSheet';
import { Journal } from './ui/Journal';
import { Settings } from './ui/Settings';
import { AwayCard, LiveRegion, NamingDialog, NudgeArrow, Toasts } from './ui/Dialogs';
import { Cinematics } from './ui/Cinematics';
import { BathOverlay } from './ui/BathOverlay';
import { Onboarding } from './ui/Onboarding';
import { PhotoMode } from './ui/PhotoMode';
import { DeviceFrame } from './ui/DeviceFrame';
import { ACTIONS, runAction } from './ui/actions';
import styles from './ui/ui.module.css';

const MinigameHost = lazy(() => import('./minigames'));
const DevPanel = lazy(() => import('./dev/DevPanel'));

function useRail() {
  const q = '(min-width: 900px) and (min-aspect-ratio: 1/1)';
  const [rail, setRail] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const f = () => setRail(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return rail;
}

/** Device Mode's screen opening is a little wider than tall. */
export const DEVICE_SCREEN_ASPECT = 1.14;

/** Wide 16:9 on landscape screens (the whole Hollow), tall 3:4 on upright ones (a window that follows the pet). */
function useLandscape() {
  const q = '(min-aspect-ratio: 1/1)';
  const [land, setLand] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const f = () => setLand(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return land;
}

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey)
        return;
      const st = useGame.getState();
      if (e.key === '`') {
        st.setDevOpen(!st.devOpen);
        return;
      }
      if (e.key === 'Escape') {
        if (st.photo) st.setPhoto(false);
        else if (st.panel) st.setPanel(null);
        return;
      }
      if (
        st.game ||
        st.cinematic ||
        st.bath ||
        !st.meta.flags.onboarded ||
        (st.pet.stage !== 'egg' && !st.pet.name)
      )
        return;
      if (st.panel && st.panel !== 'status') return;
      const k = e.key.toUpperCase();
      const a = ACTIONS.find((x) => x.key === k);
      if (a) {
        e.preventDefault();
        runAction(a.id);
        return;
      }
      if (k === 'J') st.setPanel('journal');
      else if (k === 'O') st.setPanel('settings');
      else if (k === 'C') st.setPhoto(!st.photo);
      else if (k === 'T') st.dispatch({ type: 'pet', spot: 'head' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/** Letterbox: an ambient, softly parallaxed version of the Hollow around the stage. */
function Backdrop({ hour }: { hour: number }) {
  const p = paletteAt(hour);
  const mx = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 30, damping: 12 });
  const x1 = useTransform(sx, (v) => v * 20);
  const x2 = useTransform(sx, (v) => v * -30);
  useEffect(() => {
    const f = (e: PointerEvent) => mx.set(e.clientX / window.innerWidth - 0.5);
    window.addEventListener('pointermove', f);
    return () => window.removeEventListener('pointermove', f);
  }, [mx]);
  return (
    <div
      className={styles.backdrop}
      style={{
        background: `linear-gradient(to bottom, ${p.skyTop}, ${p.skyBot} 55%, ${p.groundDark})`,
      }}
      aria-hidden="true"
    >
      <motion.div
        className={styles.backFern}
        style={{
          x: x1,
          background: `radial-gradient(ellipse at 10% 100%, ${p.fern} 0 30%, transparent 60%)`,
        }}
      />
      <motion.div
        className={styles.backFern}
        style={{
          x: x2,
          background: `radial-gradient(ellipse at 95% 95%, ${p.fernLight} 0 22%, transparent 55%)`,
        }}
      />
      <div className={styles.backVeil} />
    </div>
  );
}

export function App() {
  const ready = useGame((s) => s.ready);
  const settings = useGame((s) => s.meta.settings);
  const photo = useGame((s) => s.photo);
  const devOpen = useGame((s) => s.devOpen);
  const now = useGame((s) => s.now);
  const tz = useGame((s) => s.pet.tzOffsetMin);
  const stageRef = useRef<HTMLDivElement>(null);
  const rail = useRail();
  const landscape = useLandscape();
  const aspect = settings.deviceMode ? DEVICE_SCREEN_ASPECT : landscape ? 16 / 9 : 3 / 4;
  const hour = localHour(now || Date.now(), tz);
  useAudio();
  useShortcuts();

  useEffect(() => {
    void useGame.getState().init();
    const stop = startLoop();
    if (new URLSearchParams(location.search).get('dev') === '1') {
      useGame.getState().setDevOpen(true);
      // Test/debug hook (dev URLs only): jump the sim clock to an absolute time.
      (window as unknown as { __mossling: unknown }).__mossling = {
        jumpTo: (ms: number) => useGame.getState().devJump(ms - useGame.getState().simNow()),
        store: useGame,
      };
    }
    const onVis = () => document.visibilityState === 'hidden' && scheduleReminders();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => {
    const r = document.documentElement;
    r.dataset.theme = paletteAt(hour).dark > 0.6 ? 'night' : 'day';
    r.dataset.text = settings.textSize;
    r.dataset.rm = settings.reducedMotion;
    setHaptics(settings.haptics);
  }, [hour, settings.textSize, settings.reducedMotion, settings.haptics]);

  const stage = (
    <Stage stageRef={stageRef} aspect={aspect}>
      {!photo && <Hud />}
      {!photo && <NudgeArrow />}
      <Suspense fallback={null}>
        <MinigameHost />
      </Suspense>
      <BathOverlay />
      <Cinematics />
      <PhotoMode stageRef={stageRef} />
      {!photo && <Toasts />}
    </Stage>
  );

  return (
    <div className={styles.app}>
      <Backdrop hour={hour} />
      {!ready ? (
        <div className={styles.loading} role="status">
          <span className={styles.loadingEgg} />
          <span className="sr-only">Loading the Hollow…</span>
        </div>
      ) : (
        <main
          className={`${styles.layout} ${rail ? styles.layoutRail : styles.layoutArc} ${settings.deviceMode ? styles.layoutDevice : ''}`}
        >
          <h1 className="sr-only">Mossling</h1>
          <div className={styles.stageBox} style={{ ['--ar' as string]: aspect }}>
            {settings.deviceMode ? <DeviceFrame>{stage}</DeviceFrame> : stage}
          </div>
          {!settings.deviceMode && !photo && <ActionRing layout={rail ? 'rail' : 'arc'} />}
        </main>
      )}
      {ready && (
        <>
          <FeedMenu />
          <PlayMenu />
          <StatusSheet />
          <Journal />
          <Settings />
          <NotifCard />
          <AwayCard />
          <NamingDialog />
          <Onboarding />
          <LiveRegion />
        </>
      )}
      {devOpen && (
        <Suspense fallback={null}>
          <DevPanel />
        </Suspense>
      )}
    </div>
  );
}
