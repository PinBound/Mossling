import { useState } from 'react';
import { motion } from 'framer-motion';
import { ageYears } from '../sim';
import { useGame } from '../game/store';
import { bus } from '../game/bus';
import { Button } from './primitives';
import { copy, formName } from './copy';
import styles from './ui.module.css';

/** Photo mode: hides the UI, frames the Hollow with a hand-lettered caption, saves a PNG. */
export function PhotoMode({ stageRef }: { stageRef: React.RefObject<HTMLDivElement> }) {
  const on = useGame((s) => s.photo);
  const pet = useGame((s) => s.pet);
  const [flash, setFlash] = useState(false);
  if (!on) return null;
  const name = pet.name || formName(pet.form);
  const caption =
    pet.stage === 'egg'
      ? formName(pet.form)
      : copy.photo.caption(name, formName(pet.form), ageYears(pet));
  const save = async () => {
    const el = stageRef.current;
    if (!el) return;
    bus.fx('shutter');
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    const { toPng } = await import('html-to-image');
    try {
      const url = await toPng(el, {
        pixelRatio: 2,
        filter: (n) => !(n instanceof HTMLElement && n.dataset.photoHide === 'true'),
      });
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      useGame.getState().toast(copy.toasts.photoSaved, 'good');
    } catch {
      useGame.getState().toast('The photo didn’t develop. Try again?', 'warn');
    }
  };
  return (
    <>
      <div className={styles.photoFrame} aria-hidden="true">
        <span className={styles.photoCaption}>{caption}</span>
      </div>
      {flash && (
        <motion.div
          className={styles.photoFlash}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <div className={styles.photoBar} data-photo-hide="true">
        <Button variant="soft" onClick={() => useGame.getState().setPhoto(false)}>
          {copy.photo.exit}
        </Button>
        <Button onClick={save}>{copy.photo.save}</Button>
      </div>
    </>
  );
}
