import { motion } from 'framer-motion';
import { ageYears, localHour, timeOfDay } from '../sim';
import { useGame } from '../game/store';
import { Icon } from './Icons';
import { TopIcon } from './Dialogs';
import { copy, formName } from './copy';
import styles from './ui.module.css';

export function Hud() {
  const pet = useGame((s) => s.pet);
  const now = useGame((s) => s.now);
  const muted = useGame((s) => s.meta.settings.muted);
  const scale = useGame((s) => s.timeScale);
  const st = useGame.getState();
  const tod = timeOfDay(localHour(now || Date.now(), pet.tzOffsetMin));
  const glyph = tod === 'day' ? 'sun' : tod === 'night' ? 'moon' : tod;
  const name = pet.stage === 'egg' ? formName('egg') : pet.name || formName(pet.form);
  const calling = !!pet.call;
  return (
    <header className={styles.hud}>
      <div className={styles.hudName}>
        <span className={styles.todGlyph} title={tod} aria-label={`Time of day: ${tod}`} role="img">
          <Icon name={glyph} width={24} height={24} />
        </span>
        <span>
          <strong data-testid="pet-name">{name}</strong>
          {pet.stage !== 'egg' && (
            <span className={styles.hudAge}> · {copy.hud.age(ageYears(pet))}</span>
          )}
        </span>
        {calling && (
          <motion.span
            className={styles.bell}
            role="img"
            aria-label={copy.hud.bell}
            animate={{ rotate: [0, -16, 14, -10, 8, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.4 }}
            data-testid="bell"
          >
            <Icon name="bell" width={24} height={24} />
          </motion.span>
        )}
        {pet.pause.active && (
          <span className={styles.pausePill} role="status">
            <Icon name="pause" width={16} height={16} /> {copy.hud.paused}
          </span>
        )}
        {scale !== 1 && <span className={styles.pausePill}>{scale}×</span>}
      </div>
      <div className={styles.hudBtns}>
        <TopIcon
          name={muted ? 'mute' : 'sound'}
          label={muted ? copy.hud.unmute : copy.hud.mute}
          pressed={muted}
          onClick={() => st.updateSettings({ muted: !muted })}
        />
        <TopIcon name="photo" label={copy.hud.photo} onClick={() => st.setPhoto(true)} />
        <TopIcon name="journal" label={copy.hud.journal} onClick={() => st.setPanel('journal')} />
        <TopIcon
          name="settings"
          label={copy.hud.settings}
          onClick={() => st.setPanel('settings')}
        />
      </div>
    </header>
  );
}
