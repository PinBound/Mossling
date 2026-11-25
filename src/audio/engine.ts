/**
 * All sound is synthesized live with the Web Audio API: no samples, no licensing.
 * The context is created on the first user gesture (autoplay policy).
 */
import type { Form } from '../sim';

let ctx: AudioContext | null = null;
let master: GainNode;
let musicBus: GainNode;
let sfxBus: GainNode;
let reverbSend: GainNode;

const state = { music: 0.5, sfx: 0.8, muted: false, sleeping: false };

export function audioReady() {
  return !!ctx;
}

export function initAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 3;
  master.connect(comp).connect(ctx.destination);
  musicBus = ctx.createGain();
  sfxBus = ctx.createGain();
  musicBus.connect(master);
  sfxBus.connect(master);
  // A soft feedback-delay "room" shared by music and chimes.
  reverbSend = ctx.createGain();
  reverbSend.gain.value = 0.25;
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.23;
  const fb = ctx.createGain();
  fb.gain.value = 0.38;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2200;
  reverbSend.connect(delay).connect(lp).connect(fb).connect(delay);
  lp.connect(master);
  applyVolumes();
}

function applyVolumes() {
  if (!ctx) return;
  const t = ctx.currentTime;
  master.gain.setTargetAtTime(state.muted ? 0 : 1, t, 0.05);
  musicBus.gain.setTargetAtTime(state.music * 0.32 * (state.sleeping ? 0.45 : 1), t, 0.4);
  sfxBus.gain.setTargetAtTime(state.sfx * 0.7, t, 0.05);
}

export function setVolumes(v: { music: number; sfx: number; muted: boolean; sleeping: boolean }) {
  Object.assign(state, v);
  applyVolumes();
}

interface ToneOpts {
  type?: OscillatorType;
  freq: number;
  to?: number;
  at?: number;
  dur?: number;
  attack?: number;
  gain?: number;
  filter?: number;
  q?: number;
  dest?: AudioNode;
  reverb?: number;
  detune?: number;
}

function tone(o: ToneOpts) {
  if (!ctx) return;
  const t0 = ctx.currentTime + (o.at ?? 0);
  const dur = o.dur ?? 0.2;
  const osc = ctx.createOscillator();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.detune) osc.detune.value = o.detune;
  if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + dur);
  const g = ctx.createGain();
  const peak = o.gain ?? 0.3;
  const a = o.attack ?? 0.008;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let node: AudioNode = osc;
  if (o.filter) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.filter;
    f.Q.value = o.q ?? 0.7;
    osc.connect(f);
    node = f;
  }
  node.connect(g);
  g.connect(o.dest ?? sfxBus);
  if (o.reverb) {
    const s = ctx.createGain();
    s.gain.value = o.reverb;
    g.connect(s).connect(reverbSend);
  }
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(o: {
  at?: number;
  dur?: number;
  gain?: number;
  freq?: number;
  to?: number;
  type?: BiquadFilterType;
  q?: number;
}) {
  if (!ctx) return;
  const t0 = ctx.currentTime + (o.at ?? 0);
  const dur = o.dur ?? 0.3;
  const len = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.frequency.setValueAtTime(o.freq ?? 1200, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
  f.Q.value = o.q ?? 1;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.2, t0 + Math.min(0.05, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(sfxBus);
  src.start(t0);
  src.stop(t0 + dur);
}

const pluck = (freq: number, at = 0, gain = 0.25, dur = 0.5) => {
  tone({ type: 'triangle', freq, at, dur, gain, filter: freq * 4, reverb: 0.4 });
  tone({ type: 'sine', freq: freq * 2, at, dur: dur * 0.5, gain: gain * 0.3 });
};
const chimeNote = (freq: number, at = 0, gain = 0.18) => {
  tone({ type: 'sine', freq, at, dur: 1.2, gain, reverb: 0.7 });
  tone({ type: 'sine', freq: freq * 2.76, at, dur: 0.6, gain: gain * 0.25, reverb: 0.5 });
};

const NOTE = (semi: number) => 440 * Math.pow(2, semi / 12);

export const sfx = {
  tap: () => tone({ type: 'sine', freq: 520, to: 680, dur: 0.08, gain: 0.12 }),
  open: () => {
    pluck(NOTE(3), 0, 0.12, 0.25);
    pluck(NOTE(7), 0.05, 0.12, 0.3);
  },
  close: () => {
    pluck(NOTE(7), 0, 0.1, 0.25);
    pluck(NOTE(3), 0.05, 0.1, 0.3);
  },
  page: () => noise({ dur: 0.18, freq: 2600, to: 1400, gain: 0.08, q: 0.6 }),
  chomp: () => {
    noise({ dur: 0.08, freq: 700, gain: 0.25, q: 2 });
    tone({ type: 'square', freq: 140, to: 90, dur: 0.07, gain: 0.08, filter: 600 });
  },
  mmf: () =>
    tone({
      type: 'sawtooth',
      freq: 240,
      to: 180,
      dur: 0.35,
      gain: 0.12,
      filter: 700,
      attack: 0.04,
    }),
  sparkle: () => [0, 4, 7, 12].forEach((s, i) => chimeNote(NOTE(15 + s), i * 0.05, 0.08)),
  refuse: () => {
    tone({ type: 'triangle', freq: 330, to: 260, dur: 0.12, gain: 0.15 });
    tone({ type: 'triangle', freq: 300, to: 220, dur: 0.14, gain: 0.15, at: 0.14 });
  },
  swoosh: () => noise({ dur: 0.7, freq: 300, to: 3000, gain: 0.25, q: 0.8 }),
  ding: () => chimeNote(NOTE(19), 0, 0.2),
  bubble: () =>
    tone({
      type: 'sine',
      freq: 300 + Math.random() * 300,
      to: 900 + Math.random() * 400,
      dur: 0.09,
      gain: 0.12,
    }),
  pop: () => tone({ type: 'sine', freq: 900, to: 300, dur: 0.06, gain: 0.15 }),
  scrub: () => noise({ dur: 0.12, freq: 1800, gain: 0.06, q: 3 }),
  lightsOff: () => {
    tone({ type: 'sine', freq: NOTE(0), to: NOTE(-5), dur: 0.5, gain: 0.15, reverb: 0.5 });
  },
  lightsOn: () =>
    tone({ type: 'sine', freq: NOTE(-5), to: NOTE(2), dur: 0.4, gain: 0.15, reverb: 0.5 }),
  medicine: () => {
    tone({ type: 'sawtooth', freq: 200, to: 140, dur: 0.3, gain: 0.08, filter: 500 });
    noise({ dur: 0.3, freq: 400, gain: 0.08, at: 0.05 });
  },
  healed: () => [0, 5, 9, 12].forEach((s, i) => chimeNote(NOTE(10 + s), i * 0.07, 0.12)),
  scold: () => tone({ type: 'triangle', freq: 220, to: 160, dur: 0.35, gain: 0.18, filter: 900 }),
  praise: () => [0, 4, 7].forEach((s, i) => pluck(NOTE(7 + s), i * 0.09, 0.18, 0.6)),
  confused: () => tone({ type: 'sine', freq: 500, to: 700, dur: 0.25, gain: 0.12, at: 0 }),
  giggle: () =>
    [0, 1, 2, 3].forEach((i) =>
      tone({
        type: 'sine',
        freq: 900 - i * 60,
        to: 1100 - i * 60,
        at: i * 0.07,
        dur: 0.06,
        gain: 0.1,
      }),
    ),
  squirm: () => tone({ type: 'triangle', freq: 600, to: 400, dur: 0.3, gain: 0.1, detune: 30 }),
  flick: () => noise({ dur: 0.06, freq: 3200, gain: 0.15, q: 4 }),
  purr: () => {
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 70;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 22;
    const lg = ctx.createGain();
    lg.gain.value = 0.05;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.07, t0 + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 300;
    lfo.connect(lg).connect(g.gain);
    osc.connect(f).connect(g).connect(sfxBus);
    osc.start(t0);
    lfo.start(t0);
    osc.stop(t0 + 1);
    lfo.stop(t0 + 1);
  },
  chime: () => [0, 7].forEach((s, i) => chimeNote(NOTE(12 + s), i * 0.18, 0.14)),
  poop: () => tone({ type: 'sine', freq: 180, to: 90, dur: 0.18, gain: 0.18 }),
  sick: () => tone({ type: 'triangle', freq: 300, to: 200, dur: 0.6, gain: 0.12, detune: -20 }),
  mistake: () => [0, -3].forEach((s, i) => pluck(NOTE(s - 5), i * 0.15, 0.12, 0.5)),
  pip: (combo = 0) =>
    tone({
      type: 'sine',
      freq: NOTE(12 + Math.min(combo, 12)),
      dur: 0.12,
      gain: 0.18,
      reverb: 0.3,
    }),
  win: () => [0, 4, 7, 12, 16].forEach((s, i) => pluck(NOTE(3 + s), i * 0.08, 0.2, 0.7)),
  lose: () => [7, 3, 0].forEach((s, i) => pluck(NOTE(s - 2), i * 0.12, 0.16, 0.6)),
  countdown: () => tone({ type: 'sine', freq: NOTE(7), dur: 0.15, gain: 0.18 }),
  go: () => tone({ type: 'sine', freq: NOTE(19), dur: 0.35, gain: 0.2, reverb: 0.4 }),
  splash: () => {
    noise({ dur: 0.45, freq: 900, to: 300, gain: 0.3, q: 0.7 });
    tone({ type: 'sine', freq: 400, to: 120, dur: 0.2, gain: 0.1 });
  },
  hop: () => tone({ type: 'sine', freq: 300, to: 520, dur: 0.1, gain: 0.12 }),
  turn: () => noise({ dur: 0.25, freq: 600, to: 2400, gain: 0.18, q: 1.2 }),
  heartbeat: () => {
    tone({ type: 'sine', freq: 60, to: 40, dur: 0.18, gain: 0.5 });
    tone({ type: 'sine', freq: 60, to: 40, dur: 0.2, gain: 0.35, at: 0.24 });
  },
  crack: () => noise({ dur: 0.12, freq: 2400, gain: 0.2, q: 5 }),
  wobble: () => tone({ type: 'triangle', freq: 260, to: 320, dur: 0.18, gain: 0.12, detune: 15 }),
  burst: () => {
    noise({ dur: 1.4, freq: 400, to: 6000, gain: 0.3, q: 0.5 });
    [0, 4, 7, 11, 14].forEach((s, i) => chimeNote(NOTE(12 + s), 0.1 + i * 0.06, 0.12));
  },
  fanfare: () => [0, 4, 7, 12].forEach((s, i) => pluck(NOTE(s), i * 0.14, 0.22, 0.9)),
  fanfareBig: () => {
    [0, 4, 7, 12, 16, 19].forEach((s, i) => pluck(NOTE(s - 5), i * 0.16, 0.22, 1.2));
    [12, 16, 19].forEach((s) => chimeNote(NOTE(s), 1.1, 0.12));
  },
  wish: () => [12, 16, 19, 24].forEach((s, i) => chimeNote(NOTE(s), i * 0.12, 0.1)),
  goldenFirefly: () =>
    [0, 7, 12, 16, 19].forEach((s, i) => chimeNote(NOTE(14 + s), i * 0.06, 0.12)),
  shutter: () => {
    noise({ dur: 0.05, freq: 4000, gain: 0.2, q: 2 });
    noise({ dur: 0.07, freq: 2500, gain: 0.15, q: 2, at: 0.08 });
  },
  greet: () => [0, 4, 7, 12, 7, 12].forEach((s, i) => pluck(NOTE(5 + s), i * 0.07, 0.15, 0.4)),
  farewell: () => [12, 9, 7, 4, 2, 0].forEach((s, i) => pluck(NOTE(s - 3), i * 0.3, 0.16, 1.4)),
  birthday: () => [0, 0, 2, 0, 5, 4].forEach((s, i) => pluck(NOTE(s + 3), i * 0.2, 0.16, 0.5)),
};

/** "Mossling-speak": pitched babble syllables whose register depends on the form. */
const VOICE: Record<
  Form,
  { base: number; spread: number; type: OscillatorType; grumble?: boolean }
> = {
  egg: { base: 600, spread: 100, type: 'sine' },
  sporepod: { base: 560, spread: 90, type: 'sine' },
  pondpearl: { base: 640, spread: 110, type: 'sine' },
  // Caplings: soft woody plucks, low and round
  puffkin: { base: 760, spread: 200, type: 'triangle' },
  caplet: { base: 600, spread: 180, type: 'triangle' },
  glimcap: { base: 480, spread: 170, type: 'triangle' },
  moonmorel: { base: 380, spread: 110, type: 'sine' },
  truffletum: { base: 300, spread: 130, type: 'triangle' },
  mudpuff: { base: 210, spread: 70, type: 'sawtooth', grumble: true },
  auroracap: { base: 520, spread: 280, type: 'sine' },
  // Ripplets: bubbly, liquid chirps
  wiggle: { base: 940, spread: 300, type: 'sine' },
  splashlet: { base: 720, spread: 260, type: 'sine' },
  reedling: { base: 560, spread: 220, type: 'sine' },
  lotusong: { base: 440, spread: 160, type: 'sine' },
  bogbelly: { base: 260, spread: 120, type: 'triangle' },
  muckbottom: { base: 200, spread: 60, type: 'sawtooth', grumble: true },
  moonripple: { base: 500, spread: 300, type: 'sine' },
  dewdrop: { base: 880, spread: 260, type: 'sine' },
  sprig: { base: 660, spread: 220, type: 'triangle' },
  fernlet: { base: 520, spread: 200, type: 'triangle' },
  lanternmoss: { base: 400, spread: 120, type: 'sine' },
  burrowbun: { base: 360, spread: 160, type: 'triangle' },
  mirefuzz: { base: 230, spread: 80, type: 'sawtooth', grumble: true },
  starwick: { base: 470, spread: 260, type: 'sine' },
};

export function babble(
  form: Form,
  mood: 'happy' | 'sad' | 'call' | 'neutral' = 'neutral',
  syllables = 3,
) {
  if (!ctx) return;
  const v = VOICE[form];
  const n = syllables + Math.floor(Math.random() * 2);
  for (let i = 0; i < n; i++) {
    const rise = mood === 'happy' ? 1.12 : mood === 'sad' ? 0.88 : mood === 'call' ? 1.2 : 1;
    const f = (v.base + (Math.random() - 0.4) * v.spread) * Math.pow(rise, i / n);
    const at = i * (0.11 + Math.random() * 0.05);
    const dur = 0.08 + Math.random() * 0.07;
    tone({
      type: v.type,
      freq: f,
      to: f * (mood === 'sad' ? 0.82 : 1.1 + Math.random() * 0.2),
      at,
      dur,
      gain: 0.11,
      filter: v.grumble ? 900 : 2800,
      attack: 0.012,
    });
    if (v.grumble) noise({ at, dur, freq: 300, gain: 0.04, q: 2 });
  }
}

// ---- Generative music -----------------------------------------------------------------------

type Tod = 'dawn' | 'day' | 'dusk' | 'night';
const SCALES: Record<Tod, { root: number; steps: number[]; tempo: number; density: number }> = {
  dawn: { root: -7, steps: [0, 2, 4, 7, 9, 12, 14], tempo: 0.42, density: 0.55 },
  day: { root: -2, steps: [0, 2, 4, 7, 9, 12, 14, 16], tempo: 0.36, density: 0.62 },
  dusk: { root: -5, steps: [0, 3, 5, 7, 10, 12, 15], tempo: 0.48, density: 0.5 },
  night: { root: -12, steps: [0, 3, 5, 7, 10, 12], tempo: 0.62, density: 0.38 },
};
const CHORDS = [
  [0, 4, 7],
  [5, 9, 12],
  [-3, 0, 4],
  [7, 11, 14],
];

let musicTimer = 0;
let tod: Tod = 'day';
let nextNote = 0;
let beat = 0;

export function setMusicTime(t: Tod) {
  tod = t;
}

function kalimba(freq: number, at: number, gain: number) {
  if (!ctx) return;
  tone({ type: 'sine', freq, at, dur: 1.6, gain, dest: musicBus, reverb: 0.6, attack: 0.004 });
  tone({
    type: 'sine',
    freq: freq * 3.01,
    at,
    dur: 0.25,
    gain: gain * 0.25,
    dest: musicBus,
    attack: 0.002,
  });
}

function pad(semis: number[], at: number, dur: number) {
  if (!ctx) return;
  const minor = tod === 'dusk' || tod === 'night';
  const sc = SCALES[tod];
  for (const s of semis) {
    const shifted = minor && s % 12 === 4 ? s - 1 : s;
    for (const det of [-6, 6]) {
      tone({
        type: 'sawtooth',
        freq: NOTE(sc.root - 12 + shifted),
        at,
        dur,
        attack: dur * 0.4,
        gain: 0.035,
        filter: 700,
        detune: det,
        dest: musicBus,
        reverb: 0.3,
      });
    }
  }
}

function schedule() {
  if (!ctx) return;
  const sc = SCALES[tod];
  const now = ctx.currentTime;
  if (nextNote < now) nextNote = now + 0.05;
  while (nextNote < now + 0.6) {
    const at = nextNote - now;
    if (beat % 16 === 0) pad(CHORDS[(beat / 16) % CHORDS.length], at, sc.tempo * 16);
    if (Math.random() < sc.density) {
      const step = sc.steps[Math.floor(Math.random() * sc.steps.length)];
      kalimba(NOTE(sc.root + step), at, 0.09 + Math.random() * 0.05);
    }
    nextNote += sc.tempo * (Math.random() < 0.15 ? 2 : 1);
    beat++;
  }
}

export function startMusic() {
  if (!ctx || musicTimer) return;
  musicTimer = window.setInterval(schedule, 200);
}

export function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = 0;
}
