import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../game/store';
import { bus, haptic } from '../game/bus';
import { Icon } from './Icons';
import { ACTIONS, runAction } from './actions';
import { copy } from './copy';
import { uiImage } from '../assets/manifest';
import { ageYears } from '../sim';
import { formName } from './copy';
import { Toasts, TopIcon } from './Dialogs';

/** The leaf-shaped screen opening of ui/device_shell, traced from the art (% of its bounding box). */
const SCREEN_CLIP =
  'polygon(91% 0%, 84.7% 2.4%, 40.5% 4.7%, 33.8% 7.1%, 28.9% 9.4%, 25% 11.8%, 22% 14.2%, 19.1% 16.5%, 16.7% 18.9%, 14.3% 21.2%, 12.4% 23.6%, 10.8% 25.9%, 9% 28.3%, 7.7% 30.7%, 6.3% 33%, 5.3% 35.4%, 4.1% 37.7%, 3.3% 40.1%, 2.6% 42.5%, 1.8% 44.8%, 1.4% 47.2%, 0.8% 49.5%, 0.4% 51.9%, 0% 56.6%, 0% 59%, 0.4% 63.7%, 0.8% 66%, 1.8% 70.8%, 2.8% 73.1%, 4.7% 77.8%, 6.1% 80.2%, 7.1% 82.5%, 7.3% 84.9%, 6.5% 87.3%, 4.7% 89.6%, 18.7% 92%, 23% 94.3%, 28.3% 96.7%, 36.5% 99.1%, 43.6% 100%, 51.5% 100%, 58% 99.1%, 65.6% 96.7%, 70.7% 94.3%, 74.7% 92%, 77.8% 89.6%, 80.6% 87.3%, 82.9% 84.9%, 85.1% 82.5%, 87% 80.2%, 88.8% 77.8%, 90.2% 75.5%, 91.6% 73.1%, 92.9% 70.8%, 94.1% 68.4%, 95.1% 66%, 96.1% 63.7%, 96.7% 61.3%, 97.4% 59%, 98% 56.6%, 98.6% 54.2%, 99% 51.9%, 99.2% 49.5%, 99.6% 47.2%, 99.8% 44.8%, 100% 40.1%, 100% 37.7%, 99.8% 33%, 99.4% 30.7%, 99.2% 28.3%, 98.6% 23.6%, 98.2% 21.2%, 97.8% 18.9%, 97.1% 14.2%, 96.7% 11.8%, 96.3% 9.4%, 95.7% 4.7%, 95.1% 0%)';

/** A tiny handheld-style status line under the screen: name, age, the alert bell, pause. */
function DeviceReadout() {
  const pet = useGame((s) => s.pet);
  const name = pet.stage === 'egg' ? formName(pet.form) : pet.name || formName(pet.form);
  return (
    <div className={styles.deviceReadout} data-testid="device-readout">
      <strong data-testid="pet-name">{name}</strong>
      {pet.stage !== 'egg' && <span> · {copy.hud.age(ageYears(pet))}</span>}
      {pet.call && (
        <span
          className={styles.deviceBell}
          role="img"
          aria-label={copy.hud.bell}
          data-testid="bell"
        >
          <Icon name="bell" width={16} height={16} />
        </span>
      )}
      {pet.pause.active && <span> · {copy.hud.paused}</span>}
    </div>
  );
}

function MenuButtons() {
  const muted = useGame((s) => s.meta.settings.muted);
  const st = useGame.getState();
  return (
    <>
      <TopIcon
        name={muted ? 'mute' : 'sound'}
        label={muted ? copy.hud.unmute : copy.hud.mute}
        pressed={muted}
        onClick={() => st.updateSettings({ muted: !muted })}
      />
      <TopIcon name="photo" label={copy.hud.photo} onClick={() => st.setPhoto(true)} />
      <TopIcon name="journal" label={copy.hud.journal} onClick={() => st.setPanel('journal')} />
      <TopIcon name="settings" label={copy.hud.settings} onClick={() => st.setPanel('settings')} />
    </>
  );
}
import styles from './ui.module.css';

/**
 * Optional nostalgia skin: an original river-stone handheld with a leaf-shaped bezel.
 * A cycles the icons, B selects, C cancels (keys 1 / 2 / 3).
 */
export function DeviceFrame({ children }: { children: ReactNode }) {
  const [sel, setSel] = useState(-1);
  const panel = useGame((s) => s.panel);
  const a = () => {
    bus.fx('tap');
    haptic(8);
    setSel((s) => (s + 1) % ACTIONS.length);
  };
  const b = () => {
    haptic(12);
    if (sel < 0) return a();
    runAction(ACTIONS[sel].id);
  };
  const c = () => {
    haptic(8);
    bus.fx('close');
    const st = useGame.getState();
    if (st.panel) st.setPanel(null);
    else if (st.bath) st.setBath(false);
    else setSel(-1);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === '1') a();
      if (e.key === '2') b();
      if (e.key === '3') c();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const top = ACTIONS.slice(0, 4);
  const bottom = ACTIONS.slice(4);
  const strip = (items: typeof ACTIONS, offset: number) => (
    <div className={styles.lcdStrip}>
      {items.map((it, i) => (
        <span
          key={it.id}
          className={`${styles.lcdIcon} ${sel === i + offset ? styles.lcdOn : ''}`}
          aria-label={copy.actions[it.id]}
          role="img"
        >
          <Icon name={it.id} width="100%" height="100%" />
        </span>
      ))}
    </div>
  );
  const shellArt = uiImage('device_shell');
  const buttons: [string, () => void, string][] = [
    ['A', a, 'Cycle icons (1)'],
    ['B', b, 'Select (2)'],
    ['C', c, 'Cancel (3)'],
  ];
  if (shellArt) {
    // Painted shell: the Hollow shows only through the leaf-shaped opening (clipped to its exact
    // outline); the readout, care icons and menu live outside the screen so nothing is cut off.
    const spots = [
      { x: 30, y: 71 },
      { x: 49.5, y: 73 },
      { x: 68.7, y: 71 },
    ];
    return (
      <div className={styles.deviceWrap}>
        <Toasts />
        <div className={styles.deviceArt}>
          <div className={styles.deviceScreen} style={{ clipPath: SCREEN_CLIP }}>
            {children}
          </div>
          <img src={shellArt} alt="" className={styles.deviceShellImg} draggable={false} />
          {buttons.map(([l, fn, label], i) => (
            <motion.button
              key={l}
              type="button"
              className={styles.hwBtnArt}
              style={{ left: `${spots[i].x}%`, top: `${spots[i].y}%` }}
              onClick={fn}
              aria-label={label}
              title={label}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 600, damping: 14 }}
            >
              <span>{l}</span>
            </motion.button>
          ))}
          <DeviceReadout />
        </div>
        <div className={styles.deviceControls}>
          <div className={styles.deviceIcons} role="toolbar" aria-label="Care actions">
            {ACTIONS.map((it, i) => (
              <button
                key={it.id}
                type="button"
                className={`${styles.deviceIcon} ${sel === i ? styles.deviceIconOn : ''}`}
                aria-label={copy.actions[it.id]}
                title={copy.actions[it.id]}
                data-action={it.id}
                onClick={() => {
                  setSel(i);
                  runAction(it.id);
                }}
              >
                <Icon name={it.id} width="100%" height="100%" />
              </button>
            ))}
          </div>
          <p className={styles.deviceHint} aria-live="polite">
            {panel === null && sel >= 0
              ? copy.actions[ACTIONS[sel].id]
              : 'A: choose · B: select · C: back'}
          </p>
          <div className={styles.deviceMenu}>
            <MenuButtons />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.device}>
      <svg
        viewBox="0 0 600 760"
        className={styles.shell}
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="stone" cx="0.35" cy="0.3" r="0.9">
            <stop offset="0" stopColor="#a9c9a0" />
            <stop offset="0.55" stopColor="#6f9a6a" />
            <stop offset="1" stopColor="#3f5e3a" />
          </radialGradient>
        </defs>
        <path
          d="M300 10 C 470 10 590 110 590 330 C 590 590 470 750 300 750 C 130 750 10 590 10 330 C 10 110 130 10 300 10Z"
          fill="url(#stone)"
        />
        <path
          d="M300 30 C 450 30 560 120 566 320"
          stroke="#fff"
          strokeOpacity="0.25"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
        />
        {[
          [120, 140, 10],
          [480, 200, 7],
          [90, 520, 8],
          [510, 560, 11],
          [300, 700, 6],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#3f5e3a" opacity="0.4" />
        ))}
      </svg>
      <div className={styles.bezel}>
        {strip(top, 0)}
        <div className={styles.screen}>{children}</div>
        {strip(bottom, 4)}
      </div>
      <div className={styles.hwButtons}>
        {buttons.map(([l, fn, label], i) => (
          <motion.button
            key={l}
            type="button"
            className={styles.hwBtn}
            style={{ marginTop: i === 1 ? 18 : 0 }}
            onClick={fn}
            aria-label={label}
            whileTap={{ scale: 0.88, y: 3 }}
            transition={{ type: 'spring', stiffness: 600, damping: 14 }}
          >
            {l}
          </motion.button>
        ))}
      </div>
      {panel === null && sel >= 0 && (
        <p className={styles.devHint}>{copy.actions[ACTIONS[sel].id]}</p>
      )}
      <Toasts />
      <div className={styles.deviceMenu} style={{ position: 'absolute', top: 8, right: 8 }}>
        <MenuButtons />
      </div>
    </div>
  );
}
