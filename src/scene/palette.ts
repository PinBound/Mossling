import { timeOfDay, type TimeOfDay } from '../sim/clock';

export interface Palette {
  skyTop: string;
  skyBot: string;
  far: string;
  farHaze: string;
  mid: string;
  ground: string;
  groundDark: string;
  fern: string;
  fernLight: string;
  pond: string;
  pondLight: string;
  bark: string;
  sun: string;
  /** 0 = full daylight, 1 = deep night */
  dark: number;
}

const NIGHT: Palette = {
  skyTop: '#0d1726',
  skyBot: '#22324a',
  far: '#17263a',
  farHaze: '#2a3b52',
  mid: '#1d3329',
  ground: '#2a4634',
  groundDark: '#1a2f24',
  fern: '#1d3a2a',
  fernLight: '#2c5440',
  pond: '#1b3a4a',
  pondLight: '#3c6b7a',
  bark: '#3a2c24',
  sun: '#e8ecf5',
  dark: 1,
};
const DAWN: Palette = {
  skyTop: '#e9a79a',
  skyBot: '#fde2bd',
  far: '#9b9a8a',
  farHaze: '#e8c9b0',
  mid: '#6f8a62',
  ground: '#86a36d',
  groundDark: '#5e7d4f',
  fern: '#4b6b42',
  fernLight: '#7f9e62',
  pond: '#7fa9b0',
  pondLight: '#f6d7bf',
  bark: '#6b4f3a',
  sun: '#ffd9a0',
  dark: 0.25,
};
const DAY: Palette = {
  skyTop: '#93cbdc',
  skyBot: '#e4f3e1',
  far: '#93b88b',
  farHaze: '#cfe6d3',
  mid: '#6e9a5e',
  ground: '#7fa36b',
  groundDark: '#5c8250',
  fern: '#3f5e3a',
  fernLight: '#6f9a5a',
  pond: '#5fa3a0',
  pondLight: '#cfe8d5',
  bark: '#6b4f3a',
  sun: '#fff4c9',
  dark: 0,
};
const DUSK: Palette = {
  skyTop: '#5d5486',
  skyBot: '#f0a077',
  far: '#56606a',
  farHaze: '#b98a84',
  mid: '#4b6448',
  ground: '#5f7c55',
  groundDark: '#40593e',
  fern: '#2f4a33',
  fernLight: '#567a4c',
  pond: '#4e7a8a',
  pondLight: '#f2b98a',
  bark: '#57402f',
  sun: '#ffb27a',
  dark: 0.5,
};

export const PALETTES: Record<TimeOfDay, Palette> = {
  dawn: DAWN,
  day: DAY,
  dusk: DUSK,
  night: NIGHT,
};

const KEYS: [number, Palette][] = [
  [0, NIGHT],
  [4.5, NIGHT],
  [6.5, DAWN],
  [9, DAY],
  [16.5, DAY],
  [19, DUSK],
  [21, NIGHT],
  [24, NIGHT],
];

function hex(c: string) {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number) {
  const x = hex(a);
  const y = hex(b);
  const m = x.map((v, i) => Math.round(v + (y[i] - v) * t));
  return `#${m.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Smoothly crossfaded palette for a fractional hour. */
export function paletteAt(hour: number): Palette {
  let i = 0;
  while (i < KEYS.length - 2 && hour >= KEYS[i + 1][0]) i++;
  const [h0, a] = KEYS[i];
  const [h1, b] = KEYS[i + 1];
  const raw = h1 === h0 ? 0 : (hour - h0) / (h1 - h0);
  const t = raw * raw * (3 - 2 * raw);
  const out = {} as Palette;
  for (const k of Object.keys(a) as (keyof Palette)[]) {
    if (k === 'dark') out.dark = a.dark + (b.dark - a.dark) * t;
    else (out as unknown as Record<string, string>)[k] = mix(a[k] as string, b[k] as string, t);
  }
  return out;
}

/** Weights of each time-of-day image for crossfading real scene art. */
export function todWeights(hour: number): Record<TimeOfDay, number> {
  const w: Record<TimeOfDay, number> = { dawn: 0, day: 0, dusk: 0, night: 0 };
  const names: TimeOfDay[] = ['night', 'night', 'dawn', 'day', 'day', 'dusk', 'night', 'night'];
  let i = 0;
  while (i < KEYS.length - 2 && hour >= KEYS[i + 1][0]) i++;
  const t = (hour - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0] || 1);
  w[names[i]] += 1 - t;
  w[names[i + 1]] += t;
  return w;
}

export { timeOfDay };
