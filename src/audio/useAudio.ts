import { useEffect } from 'react';
import { bus } from '../game/bus';
import { useGame } from '../game/store';
import { localHour, timeOfDay } from '../sim';
import { babble, initAudio, setMusicTime, setVolumes, sfx, startMusic } from './engine';

/** Wires game events to sound. Mount once. */
export function useAudio() {
  const settings = useGame((s) => s.meta.settings);
  const sleeping = useGame((s) => !!s.pet.sleep);
  const hour = useGame((s) => Math.floor(localHour(s.now || Date.now(), s.pet.tzOffsetMin)));

  useEffect(() => {
    setVolumes({
      music: settings.musicVolume,
      sfx: settings.sfxVolume,
      muted: settings.muted,
      sleeping,
    });
  }, [settings.musicVolume, settings.sfxVolume, settings.muted, sleeping]);

  useEffect(() => {
    setMusicTime(timeOfDay(hour));
  }, [hour]);

  // Autoplay policy: start on the first gesture.
  useEffect(() => {
    const start = () => {
      initAudio();
      startMusic();
      const s = useGame.getState().meta.settings;
      setVolumes({
        music: s.musicVolume,
        sfx: s.sfxVolume,
        muted: s.muted,
        sleeping: !!useGame.getState().pet.sleep,
      });
    };
    window.addEventListener('pointerdown', start);
    window.addEventListener('keydown', start);
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, []);

  useEffect(
    () =>
      bus.on((e) => {
        const form = useGame.getState().pet.form;
        if (e.type === 'fx') {
          const fn = (sfx as Record<string, ((n?: number) => void) | undefined>)[e.name];
          if (e.name === 'pip' || e.name === 'combo') sfx.pip(e.x ?? 0);
          else fn?.();
          if (e.name === 'greet') babble(form, 'happy', 5);
          return;
        }
        if (!e.live) return;
        const ev = e.event;
        switch (ev.type) {
          case 'ATE':
            [0, 1, 2].forEach((i) => setTimeout(sfx.chomp, 600 + i * 330));
            setTimeout(sfx.mmf, 1700);
            break;
          case 'SNACKED':
            sfx.sparkle();
            setTimeout(() => babble(form, 'happy', 2), 300);
            break;
          case 'REFUSED':
            sfx.refuse();
            babble(form, 'sad', 2);
            break;
          case 'CLEANED':
            sfx.swoosh();
            setTimeout(sfx.ding, 650);
            break;
          case 'BATHED':
            sfx.ding();
            break;
          case 'FOUND_CLOVER':
            sfx.goldenFirefly();
            break;
          case 'LIGHTS':
            if (ev.on) sfx.lightsOn();
            else sfx.lightsOff();
            break;
          case 'MEDICINE':
            sfx.medicine();
            if (ev.cured) setTimeout(sfx.healed, 700);
            break;
          case 'MEDICINE_REFUSED':
            sfx.refuse();
            break;
          case 'SCOLDED':
            if (ev.correct) sfx.scold();
            else sfx.confused();
            setTimeout(() => babble(form, 'sad', 2), 250);
            break;
          case 'PRAISED':
            if (ev.meaningful) {
              sfx.praise();
              setTimeout(() => babble(form, 'happy', 3), 300);
            } else sfx.confused();
            break;
          case 'PETTED':
            if (form === 'egg') sfx.wobble();
            else if (ev.counted) babble(form, 'happy', 2);
            break;
          case 'CALLED_ATTENTION':
            sfx.chime();
            setTimeout(() => babble(form, 'call', 3), 400);
            break;
          case 'POOPED':
            sfx.poop();
            break;
          case 'GOT_SICK':
            sfx.sick();
            break;
          case 'CARE_MISTAKE':
            sfx.mistake();
            break;
          case 'BIRTHDAY':
            sfx.birthday();
            break;
          case 'FELL_ASLEEP':
            if (ev.kind !== 'nap') babble(form, 'neutral', 2);
            break;
          case 'WOKE_UP':
            babble(form, 'happy', 3);
            break;
          default:
            break;
        }
      }),
    [],
  );
}
