import { create } from 'zustand';
import {
  ageYears,
  applyAction,
  catchUp,
  createPet,
  createRng,
  evolve as simEvolve,
  endLife,
  makeSick,
  migrateSave,
  SAVE_VERSION,
  seedFrom,
  step,
  summarize,
  summaryIsEmpty,
  totalMistakes,
  type Action,
  type AdultForm,
  type AwaySummary,
  type Form,
  type GameId,
  type PetState,
  type SaveData,
  type SimEvent,
  type Stats,
} from '../sim';
import { bus, haptic } from './bus';
import { defaultMeta, migrateMeta, type MemoryLeaf, type Meta, type Settings } from './meta';
import { storage } from './storage';
import { copy, formName } from '../ui/copy';

export type PanelId = 'feed' | 'play' | 'status' | 'journal' | 'settings' | 'notif' | null;

export type Cinematic =
  | { kind: 'hatch' }
  | { kind: 'evolve'; from: Form; to: Form }
  | { kind: 'leave'; how: 'left' | 'ranaway' | 'passed'; form: Form; name: string };

export type PetAnimKind =
  | 'eat'
  | 'snack'
  | 'refuse'
  | 'medicine'
  | 'cured'
  | 'scold'
  | 'praise'
  | 'confused'
  | 'pet-sprout'
  | 'pet-belly'
  | 'pet-ears'
  | 'pet-head'
  | 'won'
  | 'lost'
  | 'greet'
  | 'wish'
  | 'stomachache';

export interface Toast {
  id: number;
  text: string;
  tone: 'info' | 'warn' | 'good';
}

export interface SceneOverrides {
  rain: boolean | null;
  starAt: number;
  snailAt: number;
  rainbowUntil: number;
}

interface GameState {
  ready: boolean;
  pet: PetState;
  meta: Meta;
  clockOffsetMs: number;
  timeScale: number;
  panel: PanelId;
  game: GameId | null;
  bath: boolean;
  cinematic: Cinematic | null;
  cinematicQueue: Cinematic[];
  away: { lines: AwaySummary; awayMs: number; name: string } | null;
  toasts: Toast[];
  petAnim: { kind: PetAnimKind; id: number } | null;
  hoverAction: { id: string; x: number; y: number } | null;
  photo: boolean;
  devOpen: boolean;
  announce: string;
  scene: SceneOverrides;
  /** sim timestamp, refreshed by the loop (drives re-renders of time-based visuals) */
  now: number;
}

interface GameActions {
  init(): Promise<void>;
  simNow(): number;
  advance(realDtMs: number): void;
  dispatch(action: Action): SimEvent[];
  setPanel(p: PanelId): void;
  startGame(g: GameId | null): void;
  finishGame(g: GameId, won: boolean, score: number): { best: boolean };
  setBath(open: boolean): void;
  toast(text: string, tone?: Toast['tone']): void;
  dismissToast(id: number): void;
  animatePet(kind: PetAnimKind): void;
  setHoverAction(h: GameState['hoverAction']): void;
  nextCinematic(): void;
  markCinematicSeen(key: string): void;
  dismissAway(): void;
  updateSettings(p: Partial<Settings>): void;
  setFlags(p: Partial<Meta['flags']>): void;
  addCollectible(kind: 'goldenFirefly' | 'clover' | 'wish', wish?: string): void;
  setPhoto(on: boolean): void;
  setDevOpen(on: boolean): void;
  setScene(p: Partial<SceneOverrides>): void;
  save(): Promise<void>;
  exportSave(): string;
  importSave(json: string): Promise<void>;
  release(): void;
  // dev
  devSetScale(n: number): void;
  devJump(ms: number): void;
  devSetStats(p: Partial<Stats>): void;
  devEvolve(form?: AdultForm): void;
  devSick(): void;
  devEnd(how: 'left' | 'ranaway' | 'passed'): void;
  devFalseCall(): void;
  devPoop(): void;
  devReset(): Promise<void>;
}

export type Store = GameState & GameActions;

let toastId = 1;
let animId = 1;

function freshPet(now: number, lifeMode: Settings['lifeMode']): PetState {
  const seed = seedFrom(`${now}-${Math.random()}`);
  return createPet({ now, seed, lifeMode, tzOffsetMin: new Date(now).getTimezoneOffset() });
}

function memoryLeafOf(p: PetState, how: MemoryLeaf['how'], at: number): MemoryLeaf {
  return {
    id: p.id,
    name: p.name || 'Little one',
    form: p.form,
    ageYears: ageYears(p),
    bornAt: p.bornAt,
    endedAt: p.endedAt || at,
    how,
    stats: {
      mistakes: totalMistakes(p),
      discipline: p.stats.discipline,
      bond: Math.round(p.stats.bond),
      weight: Math.round(p.stats.weight),
      meals: p.counters.meals,
      gamesWon: p.counters.gamesWon,
      baths: p.counters.baths,
      pets: p.counters.pets,
    },
  };
}

export const useGame = create<Store>()((set, get) => {
  const name = () => get().pet.name || formName(get().pet.form);

  const withMeta = (fn: (m: Meta) => void) => {
    const m = structuredClone(get().meta);
    fn(m);
    set({ meta: m });
  };

  const seeForm = (m: Meta, f: Form) => {
    if (!m.journal.formsSeen.includes(f)) m.journal.formsSeen.push(f);
  };

  const timeline = (m: Meta, at: number, text: string) => {
    m.journal.timeline.push({ at, text });
    if (m.journal.timeline.length > 300)
      m.journal.timeline.splice(0, m.journal.timeline.length - 300);
  };

  const queue = (c: Cinematic) => {
    const st = get();
    if (!st.cinematic) set({ cinematic: c });
    else set({ cinematicQueue: [...st.cinematicQueue, c] });
  };

  function handleEvents(events: SimEvent[], live: boolean) {
    const st = get();
    const n = name();
    const t = copy.toasts;
    const meta = structuredClone(st.meta);
    let metaChanged = false;
    for (const e of events) {
      bus.emit({ type: 'sim', event: e, live });
      switch (e.type) {
        case 'HATCHED':
          seeForm(meta, 'dewdrop');
          timeline(meta, e.at, 'A Dewstone hatched.');
          metaChanged = true;
          if (live) queue({ kind: 'hatch' });
          break;
        case 'EVOLVED':
          seeForm(meta, e.to);
          timeline(meta, e.at, `${n} grew into a ${formName(e.to)}.`);
          metaChanged = true;
          queue({ kind: 'evolve', from: e.from, to: e.to });
          break;
        case 'LEFT':
        case 'RAN_AWAY':
        case 'PASSED': {
          const how = e.type === 'LEFT' ? 'left' : e.type === 'RAN_AWAY' ? 'ranaway' : 'passed';
          queue({ kind: 'leave', how, form: get().pet.form, name: n });
          break;
        }
        case 'FOUND_CLOVER':
          meta.journal.collectibles.clover++;
          metaChanged = true;
          if (live) get().toast(t.clover, 'good');
          break;
        case 'BIRTHDAY':
          timeline(meta, e.at, `${n} turned ${e.age}.`);
          metaChanged = true;
          if (live) get().toast(t.birthday(n, e.age), 'good');
          break;
        case 'CARE_MISTAKE':
          if (live) get().toast(t.mistake[e.reason](n), 'warn');
          break;
        case 'CALLED_ATTENTION':
          if (live) {
            get().toast(t.call[e.reason](n), e.reason === 'false' ? 'info' : 'warn');
            set({ announce: t.call[e.reason](n) });
            haptic([30, 60, 30]);
          }
          break;
        case 'GOT_SICK':
          if (live && e.cause !== 'stomachache') get().toast(t.sick(n), 'warn');
          break;
        case 'FELL_ASLEEP':
          if (live && e.kind !== 'nap') set({ announce: t.asleepNow(n) });
          break;
        case 'WOKE_UP':
          if (live && e.kind === 'night') get().toast(t.awake(n), 'info');
          break;
        case 'PAUSE_EXHAUSTED':
          get().toast(t.pauseExhausted, 'info');
          break;
        default:
          break;
      }
    }
    if (metaChanged) set({ meta });
  }

  function actionFeedback(events: SimEvent[]) {
    const n = name();
    const t = copy.toasts;
    const f = formName(get().pet.form);
    for (const e of events) {
      switch (e.type) {
        case 'ATE':
          get().animatePet('eat');
          get().toast(t.ate(n), 'good');
          haptic(15);
          break;
        case 'REFUSED':
          if (e.why === 'full' || e.why === 'moody') get().animatePet('refuse');
          get().toast(t.refuse[e.why](n, f), 'info');
          haptic([10, 40, 10]);
          break;
        case 'SNACKED':
          get().animatePet('snack');
          get().toast(t.snacked(n), 'good');
          haptic(15);
          break;
        case 'STOMACHACHE':
          get().animatePet('stomachache');
          get().toast(t.stomachache(n), 'warn');
          break;
        case 'MEDICINE':
          get().animatePet(e.cured ? 'cured' : 'medicine');
          get().toast(t.medicine(n, e.dosesLeft), e.cured ? 'good' : 'info');
          haptic(e.cured ? [20, 40, 60] : 30);
          break;
        case 'MEDICINE_REFUSED':
          get().animatePet('refuse');
          get().toast(t.medicineRefused(n), 'info');
          break;
        case 'CLEANED':
          haptic(20);
          break;
        case 'BATHED':
          get().toast(t.bathed(n), 'good');
          break;
        case 'SCOLDED':
          get().animatePet(e.correct ? 'scold' : 'confused');
          get().toast(e.correct ? t.scoldRight(n) : t.scoldWrong(n), e.correct ? 'good' : 'warn');
          haptic(e.correct ? 40 : [10, 30, 10]);
          break;
        case 'PRAISED':
          get().animatePet(e.meaningful ? 'praise' : 'confused');
          get().toast(
            e.meaningful ? t.praised(n) : t.praiseEmpty(n),
            e.meaningful ? 'good' : 'info',
          );
          haptic(e.meaningful ? [15, 30, 15] : 10);
          break;
        case 'PETTED':
          if (e.counted || get().pet.stage !== 'egg')
            get().animatePet(`pet-${e.spot === 'body' ? 'head' : e.spot}`);
          haptic(8);
          break;
        case 'PAUSE_CHANGED':
          get().toast(e.active ? t.pauseOn : t.pauseOff, 'info');
          break;
        case 'NAMED':
          withMeta((m) => timeline(m, e.at, `The little one was named ${e.name}.`));
          break;
        default:
          break;
      }
    }
  }

  return {
    ready: false,
    pet: createPet({ now: 0, seed: 1 }),
    meta: defaultMeta(),
    clockOffsetMs: 0,
    timeScale: 1,
    panel: null,
    game: null,
    bath: false,
    cinematic: null,
    cinematicQueue: [],
    away: null,
    toasts: [],
    petAnim: null,
    hoverAction: null,
    photo: false,
    devOpen: false,
    announce: '',
    scene: { rain: null, starAt: 0, snailAt: 0, rainbowUntil: 0 },
    now: 0,

    simNow: () => Date.now() + get().clockOffsetMs,

    async init() {
      const raw = await storage.load();
      const realNow = Date.now();
      let save: SaveData | null = null;
      if (raw) {
        try {
          save = migrateSave(raw);
        } catch {
          save = null;
        }
      }
      if (!save) {
        const meta = defaultMeta();
        meta.lastSeenAt = realNow;
        set({ ready: true, pet: freshPet(realNow, meta.settings.lifeMode), meta, now: realNow });
        await get().save();
        return;
      }
      const meta = migrateMeta(save.meta);
      const clockOffsetMs = save.clockOffsetMs;
      const now = realNow + clockOffsetMs;
      let pet = save.pet;
      const tz = new Date(now).getTimezoneOffset();
      if (pet.tzOffsetMin !== tz)
        pet = applyAction(pet, { type: 'setTimezone', offsetMin: tz }, now).state;
      const res = catchUp(pet, save.savedAt, now);
      const awayMs = res.awayMs;
      set({ ready: true, pet: res.state, meta, clockOffsetMs, now });
      const summary = summarize(res.events);
      handleEvents(res.events, false);
      if (awayMs > 10 * 60_000 && !summaryIsEmpty(summary) && meta.flags.onboarded) {
        set({ away: { lines: summary, awayMs, name: res.state.name || formName(res.state.form) } });
      }
      const sinceSeen = realNow - (meta.lastSeenAt || realNow);
      if (sinceSeen > 4 * 3_600_000 && res.state.status === 'alive' && res.state.stage !== 'egg') {
        setTimeout(() => get().animatePet('greet'), 900);
      }
      withMeta((m) => (m.lastSeenAt = realNow));
      await get().save();
    },

    advance(realDtMs) {
      const st = get();
      if (!st.ready) return;
      const scale = st.timeScale;
      const clockOffsetMs = st.clockOffsetMs + realDtMs * (scale - 1);
      const now = Date.now() + clockOffsetMs;
      const res = step(st.pet, realDtMs * scale, now);
      set({ pet: res.state, clockOffsetMs, now });
      if (res.events.length) handleEvents(res.events, true);
    },

    dispatch(action) {
      const now = get().simNow();
      const res = applyAction(get().pet, action, now);
      set({ pet: res.state, now });
      handleEvents(res.events, true);
      actionFeedback(res.events);
      void get().save();
      return res.events;
    },

    setPanel: (panel) => {
      if (panel !== get().panel) bus.fx(panel ? 'open' : 'close');
      set({ panel });
    },
    startGame: (game) => set({ game, panel: null }),
    finishGame(g, won, score) {
      const prev = get().meta.bests[g] ?? 0;
      const best = score > prev;
      if (best) withMeta((m) => (m.bests[g] = score));
      get().dispatch({ type: 'play', game: g, won });
      get().toast(won ? copy.toasts.won(name()) : copy.toasts.lost(name()), won ? 'good' : 'info');
      return { best };
    },
    setBath: (bath) => set({ bath }),

    toast(text, tone = 'info') {
      const id = toastId++;
      set({ toasts: [...get().toasts.slice(-2), { id, text, tone }] });
      setTimeout(() => get().dismissToast(id), 4200);
    },
    dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
    animatePet: (kind) => set({ petAnim: { kind, id: animId++ } }),
    setHoverAction: (hoverAction) => set({ hoverAction }),

    nextCinematic() {
      const st = get();
      const done = st.cinematic;
      const [next, ...rest] = st.cinematicQueue;
      set({ cinematic: next ?? null, cinematicQueue: rest });
      if (done?.kind === 'leave') {
        // The pet left something behind: a Memory Leaf and a fresh Dewstone.
        const p = get().pet;
        const at = get().simNow();
        withMeta((m) => {
          m.journal.memoryLeaves.unshift(memoryLeafOf(p, done.how, at));
          timeline(m, at, copy.journal.leafHow[done.how] + `: ${p.name || 'Little one'}.`);
        });
        set({ pet: freshPet(at, get().meta.settings.lifeMode) });
        get().setFlags({ nudge: 'egg' });
        void get().save();
      }
      if (done?.kind === 'evolve' && done.to === 'sprig' && !get().meta.flags.notifAsked) {
        setTimeout(() => {
          if (!get().cinematic && !get().panel) get().setPanel('notif');
        }, 1200);
      }
    },
    markCinematicSeen(key) {
      if (get().meta.flags.seenCinematics.includes(key)) return;
      withMeta((m) => m.flags.seenCinematics.push(key));
    },
    dismissAway: () => set({ away: null }),

    updateSettings(p) {
      withMeta((m) => Object.assign(m.settings, p));
      if (p.lifeMode) get().dispatch({ type: 'setLifeMode', mode: p.lifeMode });
      void get().save();
    },
    setFlags(p) {
      withMeta((m) => Object.assign(m.flags, p));
      void get().save();
    },
    addCollectible(kind, wish) {
      withMeta((m) => {
        if (kind === 'wish') {
          m.journal.collectibles.wishes.unshift(wish ?? '');
          m.journal.collectibles.wishes = m.journal.collectibles.wishes.slice(0, 30);
        } else m.journal.collectibles[kind]++;
      });
      void get().save();
    },
    setPhoto: (photo) => set({ photo, panel: null }),
    setDevOpen: (devOpen) => set({ devOpen }),
    setScene: (p) => set({ scene: { ...get().scene, ...p } }),

    async save() {
      const st = get();
      if (!st.ready) return;
      const data: SaveData = {
        version: SAVE_VERSION,
        savedAt: st.simNow(),
        clockOffsetMs: st.clockOffsetMs,
        pet: st.pet,
        meta: { ...st.meta, lastSeenAt: Date.now() },
      };
      await storage.save(data);
    },

    exportSave() {
      const st = get();
      const data: SaveData = {
        version: SAVE_VERSION,
        savedAt: st.simNow(),
        clockOffsetMs: st.clockOffsetMs,
        pet: st.pet,
        meta: st.meta,
      };
      return JSON.stringify(data, null, 2);
    },

    async importSave(json) {
      const data = migrateSave(JSON.parse(json));
      await storage.save(data);
      set({ ready: false, away: null, cinematic: null, cinematicQueue: [], panel: null });
      await get().init();
    },

    release() {
      const st = get();
      const at = st.simNow();
      if (st.pet.stage !== 'egg') {
        withMeta((m) => {
          m.journal.memoryLeaves.unshift(memoryLeafOf({ ...st.pet, endedAt: at }, 'released', at));
          timeline(m, at, `${st.pet.name || 'A Mossling'} was released to the forest.`);
        });
      }
      set({
        pet: freshPet(at, st.meta.settings.lifeMode),
        panel: null,
        cinematic: null,
        cinematicQueue: [],
      });
      get().setFlags({ nudge: 'egg' });
      void get().save();
    },

    devSetScale: (timeScale) => set({ timeScale }),
    devJump(ms) {
      const st = get();
      const clockOffsetMs = st.clockOffsetMs + ms;
      const now = Date.now() + clockOffsetMs;
      const res = step(st.pet, ms, now);
      set({ pet: res.state, clockOffsetMs, now });
      handleEvents(res.events, true);
    },
    devSetStats(p) {
      const pet = structuredClone(get().pet);
      Object.assign(pet.stats, p);
      set({ pet });
    },
    devEvolve(form) {
      const pet = structuredClone(get().pet);
      const r = createRng(pet.rngState);
      const ev: SimEvent[] = [];
      if (form && pet.stage !== 'teen' && pet.stage !== 'adult') {
        for (let i = 0; i < 4 && (pet.stage as string) !== 'teen'; i++)
          simEvolve(pet, get().simNow(), r, ev);
      }
      if (form && pet.stage === 'adult') {
        const from = pet.form;
        pet.form = form;
        ev.push({ type: 'EVOLVED', at: get().simNow(), from, to: form });
      } else {
        pet.sleep = null;
        simEvolve(pet, get().simNow(), r, ev, form);
      }
      pet.rngState = r.state;
      set({ pet });
      handleEvents(ev, true);
    },
    devSick() {
      const pet = structuredClone(get().pet);
      const r = createRng(pet.rngState);
      const ev: SimEvent[] = [];
      makeSick(pet, get().simNow(), r, 'dev', ev);
      pet.rngState = r.state;
      set({ pet });
      handleEvents(ev, true);
    },
    devEnd(how) {
      const pet = structuredClone(get().pet);
      if (pet.stage === 'egg' || pet.status !== 'alive') return;
      const ev: SimEvent[] = [];
      endLife(pet, get().simNow(), how, ev);
      set({ pet });
      handleEvents(ev, true);
    },
    devFalseCall() {
      const pet = structuredClone(get().pet);
      pet.nextFalseCallAt = get().simNow();
      if (pet.stage !== 'child' && pet.stage !== 'teen') {
        pet.call = { reason: 'false', since: get().simNow(), real: false };
        pet.disciplineUntil = get().simNow() + 15 * 60_000;
        set({ pet });
        handleEvents([{ type: 'CALLED_ATTENTION', at: get().simNow(), reason: 'false' }], true);
        return;
      }
      set({ pet });
    },
    devPoop() {
      const pet = structuredClone(get().pet);
      pet.nextPoopAt = get().simNow();
      set({ pet });
    },
    async devReset() {
      await storage.clear();
      set({
        ready: false,
        meta: defaultMeta(),
        clockOffsetMs: 0,
        timeScale: 1,
        away: null,
        cinematic: null,
        cinematicQueue: [],
        panel: null,
        game: null,
      });
      await get().init();
    },
  };
});
