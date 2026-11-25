import { useRef, useState } from 'react';
import { TUNING, type LifeMode } from '../sim';
import { useGame } from '../game/store';
import { notificationsSupported, requestNotifications } from '../game/notifications';
import { Button, Sheet, Toggle } from './primitives';
import { copy } from './copy';
import {
  checkForUpdates,
  reloadToUpdate,
  useUpdates,
  versionLabel,
  type UpdateStatus,
} from '../game/updates';
import styles from './ui.module.css';

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className={styles.sliderRow}>
      <span className={styles.rowLabel}>{label}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
    </label>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { v: T; name: string; desc?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className={styles.segmented}>
      <legend className={styles.rowLabel}>{label}</legend>
      <div className={styles.segRow}>
        {options.map((o) => (
          <label key={o.v} className={`${styles.seg} ${value === o.v ? styles.segOn : ''}`}>
            <input
              type="radio"
              name={label}
              value={o.v}
              checked={value === o.v}
              onChange={() => onChange(o.v)}
              className="sr-only"
            />
            {o.name}
          </label>
        ))}
      </div>
      {options.find((o) => o.v === value)?.desc && (
        <p className={styles.rowDesc}>{options.find((o) => o.v === value)!.desc}</p>
      )}
    </fieldset>
  );
}

export function Settings() {
  const open = useGame((s) => s.panel === 'settings');
  const st = useGame((s) => s.meta.settings);
  const pause = useGame((s) => s.pet.pause);
  const update = useGame((s) => s.updateSettings);
  const [confirm, setConfirm] = useState(0);
  const [credits, setCredits] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const c = copy.settings;
  const leftMs = Math.max(0, TUNING.pauseAllowanceMs - pause.usedMs);
  const left = `${Math.floor(leftMs / 3_600_000)} h ${Math.floor((leftMs % 3_600_000) / 60_000)} min`;
  const close = () => {
    setConfirm(0);
    useGame.getState().setPanel(null);
  };

  const exportSave = () => {
    const blob = new Blob([useGame.getState().exportSave()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mossling-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    useGame.getState().toast(copy.toasts.saved, 'good');
  };
  const importSave = async (f: File) => {
    try {
      await useGame.getState().importSave(await f.text());
      useGame.getState().toast(copy.toasts.imported, 'good');
    } catch (e) {
      useGame
        .getState()
        .toast(copy.toasts.importFailed(e instanceof Error ? e.message : 'unknown error'), 'warn');
    }
  };

  return (
    <Sheet open={open} onClose={close} title={c.title} wide>
      <section className={styles.section}>
        <h3>{c.sound}</h3>
        <Slider
          label={c.music}
          value={st.musicVolume}
          onChange={(v) => update({ musicVolume: v })}
        />
        <Slider label={c.sfx} value={st.sfxVolume} onChange={(v) => update({ sfxVolume: v })} />
        <Toggle label={c.mute} checked={st.muted} onChange={(v) => update({ muted: v })} />
        <Toggle label={c.haptics} checked={st.haptics} onChange={(v) => update({ haptics: v })} />
      </section>
      <section className={styles.section}>
        <h3>{c.lifeMode}</h3>
        <Segmented<LifeMode>
          label={c.lifeMode}
          value={st.lifeMode}
          onChange={(v) => update({ lifeMode: v })}
          options={(['gentle', 'classic', 'eternal'] as const).map((v) => ({
            v,
            name: c.lifeModes[v].name,
            desc: c.lifeModes[v].desc,
          }))}
        />
        <Toggle
          label={c.babysitter}
          desc={c.babysitterDesc(left)}
          checked={pause.active}
          onChange={(v) => useGame.getState().dispatch({ type: 'setPaused', active: v })}
        />
        <Toggle
          label={c.notifications}
          desc={
            notificationsSupported() && Notification.permission === 'denied'
              ? c.notificationsDenied
              : undefined
          }
          checked={st.notifications}
          onChange={async (v) => {
            if (v && !(await requestNotifications())) return update({ notifications: false });
            useGame.getState().setFlags({ notifAsked: true });
            update({ notifications: v });
          }}
        />
      </section>
      <section className={styles.section}>
        <h3>Look &amp; feel</h3>
        <Segmented
          label={c.reducedMotion}
          value={st.reducedMotion}
          onChange={(v) => update({ reducedMotion: v })}
          options={(['system', 'on', 'off'] as const).map((v) => ({ v, name: c.rm[v] }))}
        />
        <Segmented
          label={c.textSize}
          value={st.textSize}
          onChange={(v) => update({ textSize: v })}
          options={(['s', 'm', 'l'] as const).map((v) => ({ v, name: c.sizes[v] }))}
        />
        <Toggle
          label={c.deviceMode}
          desc={c.deviceModeDesc}
          checked={st.deviceMode}
          onChange={(v) => update({ deviceMode: v })}
        />
      </section>
      <section className={styles.section}>
        <h3>{c.save}</h3>
        <div className={styles.rowWrap}>
          <Button variant="soft" onClick={exportSave}>
            {c.export}
          </Button>
          <Button variant="soft" onClick={() => fileRef.current?.click()}>
            {c.import}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => e.target.files?.[0] && void importSave(e.target.files[0])}
          />
          <Button
            variant="soft"
            onClick={() => {
              useGame.getState().setFlags({ onboarded: false });
              close();
            }}
          >
            {c.replayIntro}
          </Button>
        </div>
        {confirm === 0 && (
          <Button variant="danger" onClick={() => setConfirm(1)}>
            {c.release}
          </Button>
        )}
        {confirm > 0 && (
          <div className={styles.confirm} role="alertdialog" aria-label={c.release}>
            <p>{confirm === 1 ? c.releaseConfirm1 : c.releaseConfirm2}</p>
            <div className={styles.rowEnd}>
              <Button variant="ghost" onClick={() => setConfirm(0)}>
                {c.releaseNo}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm === 1) setConfirm(2);
                  else {
                    setConfirm(0);
                    useGame.getState().release();
                  }
                }}
              >
                {confirm === 1 ? 'Continue' : c.releaseYes}
              </Button>
            </div>
          </div>
        )}
      </section>
      <UpdatesSection />
      <section className={styles.section}>
        <Button variant="ghost" onClick={() => setCredits((v) => !v)} aria-expanded={credits}>
          {c.credits}
        </Button>
        {credits && <p className={styles.para}>{c.creditsBody}</p>}
      </section>
      <div className={styles.rowEnd}>
        <Button onClick={close}>{c.close}</Button>
      </div>
    </Sheet>
  );
}

const UPDATE_TEXT: Record<UpdateStatus, string> = {
  idle: '',
  checking: 'Checking for a new version…',
  current: 'You have the latest version.',
  downloading: 'Downloading the new version…',
  ready: 'A new version is ready.',
  offline: 'Couldn’t check: you seem to be offline. Try again when you’re connected.',
  unavailable:
    'Updates are handled by your browser here (only the installed web app checks itself).',
};

function UpdatesSection() {
  const { status, checkedAt } = useUpdates();
  const busy = status === 'checking' || status === 'downloading';
  const time = checkedAt
    ? new Date(checkedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : '';
  return (
    <section className={styles.section} aria-labelledby="updates-title">
      <h3 id="updates-title">{copy.settings.updates}</h3>
      <p className={styles.rowDesc} data-testid="version">
        {copy.settings.version(versionLabel())}
      </p>
      <div className={styles.rowWrap}>
        {status === 'ready' ? (
          <Button onClick={() => void reloadToUpdate()} data-testid="update-reload">
            {copy.settings.reloadToUpdate}
          </Button>
        ) : (
          <Button
            variant="soft"
            onClick={() => void checkForUpdates()}
            disabled={busy}
            data-testid="update-check"
          >
            {copy.settings.checkUpdates}
          </Button>
        )}
      </div>
      {status !== 'idle' && (
        <p className={styles.rowDesc} role="status" data-testid="update-status">
          {UPDATE_TEXT[status]}
          {status === 'current' && time ? ` (checked ${time})` : ''}
          {status === 'ready' ? ` ${copy.settings.reloadNote}` : ''}
        </p>
      )}
    </section>
  );
}
