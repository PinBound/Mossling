/**
 * Code-drawn placeholder art for the Capling (mushroom folk) and Ripplet (pond folk) species.
 * Same 1024×1024 frame and feet line (y = 900) as the final PNGs. Each form is described by a
 * small set of shapes; the head feature (cap, lily leaf, reed, lotus…) is the emotional tell
 * and sways like the Mossling's sprout.
 */
import { motion, type MotionValue } from 'framer-motion';
import type { Form } from '../sim';
import type { Pose } from '../assets/manifest';
import { Face } from './PlaceholderPet';

type BodyShape = 'round' | 'pear' | 'tall' | 'squat' | 'tadpole';
type Head =
  | 'nubcap'
  | 'spotcap'
  | 'beanie'
  | 'morel'
  | 'truffle'
  | 'bentcap'
  | 'aurora'
  | 'leaf'
  | 'leafdrop'
  | 'reed'
  | 'lotus'
  | 'soggyreed'
  | 'moon';
type Extra =
  | 'gills'
  | 'tail'
  | 'finEars'
  | 'veils'
  | 'koi'
  | 'spots'
  | 'duckweed'
  | 'dust'
  | 'belly'
  | 'feet'
  | 'legs';

interface Design {
  shape: BodyShape;
  top: number;
  width: number;
  color: string;
  edge: string;
  belly?: string;
  head: Head;
  headColor: string;
  headY: number;
  face: { cy: number; s: number; gap: number };
  cheek?: string;
  extras: Extra[];
  hover?: boolean;
  translucent?: boolean;
}

/** Egg designs: base gradient and freckles. */
const EGGS: Partial<
  Record<
    Form,
    { light: string; mid: string; dark: string; edge: string; dots: string; swirl?: string }
  >
> = {
  sporepod: { light: '#fbf3e2', mid: '#ead6b4', dark: '#c9a978', edge: '#a8865a', dots: '#9a7146' },
  pondpearl: {
    light: '#e8f8fb',
    mid: '#a9dfe2',
    dark: '#5fa3a0',
    edge: '#4a8a8a',
    dots: '#e9fbff',
    swirl: '#ffffff',
  },
};

export const DESIGNS: Partial<Record<Form, Design>> = {
  // ---------- Capling: mushroom folk ----------
  puffkin: {
    shape: 'round',
    top: 540,
    width: 200,
    color: '#f2e8d4',
    edge: '#c9b38f',
    head: 'nubcap',
    headColor: '#c98b5a',
    headY: 548,
    face: { cy: 720, s: 1.02, gap: 74 },
    extras: ['spots'],
  },
  caplet: {
    shape: 'pear',
    top: 520,
    width: 190,
    color: '#f1e6cf',
    edge: '#c2a77d',
    belly: '#fbf5e8',
    head: 'spotcap',
    headColor: '#cf5b4a',
    headY: 540,
    face: { cy: 668, s: 0.92, gap: 66 },
    extras: ['feet'],
  },
  glimcap: {
    shape: 'tall',
    top: 450,
    width: 160,
    color: '#e9dcc0',
    edge: '#b39a6e',
    belly: '#f7efdc',
    head: 'beanie',
    headColor: '#8a5a7a',
    headY: 470,
    face: { cy: 600, s: 0.86, gap: 60 },
    extras: ['gills', 'legs'],
  },
  moonmorel: {
    shape: 'tall',
    top: 470,
    width: 170,
    color: '#efe6f2',
    edge: '#b7a6c2',
    belly: '#fbf7fd',
    head: 'morel',
    headColor: '#e8c47a',
    headY: 490,
    face: { cy: 628, s: 0.86, gap: 60 },
    extras: ['legs'],
  },
  truffletum: {
    shape: 'round',
    top: 480,
    width: 250,
    color: '#a77d5a',
    edge: '#7a573c',
    belly: '#ecd9bd',
    head: 'truffle',
    headColor: '#4f3a2c',
    headY: 492,
    face: { cy: 640, s: 1, gap: 80 },
    extras: ['belly', 'feet'],
  },
  mudpuff: {
    shape: 'squat',
    top: 540,
    width: 240,
    color: '#a89a86',
    edge: '#766a58',
    belly: '#c8bca8',
    head: 'bentcap',
    headColor: '#7d6a55',
    headY: 552,
    face: { cy: 700, s: 0.98, gap: 76 },
    cheek: '#c9958a',
    extras: ['dust', 'feet'],
  },
  auroracap: {
    shape: 'tall',
    top: 470,
    width: 150,
    color: '#e7f1ff',
    edge: '#a9bde0',
    belly: '#f8fbff',
    head: 'aurora',
    headColor: '#9fd8e8',
    headY: 488,
    face: { cy: 620, s: 0.84, gap: 58 },
    cheek: '#d79ad8',
    extras: ['spots'],
    hover: true,
    translucent: true,
  },
  // ---------- Ripplet: pond folk ----------
  wiggle: {
    shape: 'tadpole',
    top: 560,
    width: 190,
    color: '#7cc4c0',
    edge: '#4f9a96',
    head: 'leaf',
    headColor: '#7fb35f',
    headY: 566,
    face: { cy: 720, s: 1, gap: 70 },
    extras: ['tail'],
  },
  splashlet: {
    shape: 'round',
    top: 520,
    width: 220,
    color: '#8fd0b0',
    edge: '#5a9e84',
    belly: '#e9f7e6',
    head: 'leafdrop',
    headColor: '#6faa55',
    headY: 528,
    face: { cy: 668, s: 0.96, gap: 76 },
    extras: ['tail', 'feet', 'belly'],
  },
  reedling: {
    shape: 'tall',
    top: 450,
    width: 160,
    color: '#76b9a4',
    edge: '#4c8a78',
    belly: '#def2e6',
    head: 'reed',
    headColor: '#7a5a3a',
    headY: 462,
    face: { cy: 590, s: 0.86, gap: 60 },
    extras: ['finEars', 'tail', 'legs'],
  },
  lotusong: {
    shape: 'tall',
    top: 470,
    width: 170,
    color: '#cfeee6',
    edge: '#8dbdb2',
    belly: '#fbf2f4',
    head: 'lotus',
    headColor: '#f3b6c8',
    headY: 486,
    face: { cy: 624, s: 0.86, gap: 60 },
    cheek: '#f09ab4',
    extras: ['veils', 'tail'],
  },
  bogbelly: {
    shape: 'round',
    top: 470,
    width: 260,
    color: '#6fae5c',
    edge: '#4a8040',
    belly: '#f2e2a0',
    head: 'leaf',
    headColor: '#5f9a48',
    headY: 480,
    face: { cy: 610, s: 1.02, gap: 92 },
    extras: ['belly', 'feet'],
  },
  muckbottom: {
    shape: 'squat',
    top: 540,
    width: 240,
    color: '#6f7a52',
    edge: '#4c5638',
    belly: '#a5a880',
    head: 'soggyreed',
    headColor: '#6b5a3c',
    headY: 550,
    face: { cy: 700, s: 0.98, gap: 78 },
    cheek: '#b98a72',
    extras: ['duckweed', 'tail', 'feet'],
  },
  moonripple: {
    shape: 'tall',
    top: 470,
    width: 160,
    color: '#eef6fb',
    edge: '#a8c3d6',
    belly: '#ffffff',
    head: 'moon',
    headColor: '#fff2c4',
    headY: 470,
    face: { cy: 622, s: 0.84, gap: 58 },
    cheek: '#f3a58c',
    extras: ['koi', 'veils', 'tail'],
    hover: true,
    translucent: true,
  },
};

export function hasSpeciesArt(form: Form): boolean {
  return !!DESIGNS[form] || !!EGGS[form];
}

const BOTTOM = 900;

function bodyPath(shape: BodyShape, top: number, w: number): string {
  const c = 512;
  const b = BOTTOM;
  const h = b - top;
  switch (shape) {
    case 'pear':
    case 'tall': {
      const wt = shape === 'tall' ? w * 0.72 : w * 0.66;
      return `M${c} ${top} C ${c + wt} ${top} ${c + w * 0.92} ${top + h * 0.3} ${c + w} ${top + h * 0.62} C ${c + w * 1.04} ${top + h * 0.92} ${c + w * 0.6} ${b} ${c} ${b} C ${c - w * 0.6} ${b} ${c - w * 1.04} ${top + h * 0.92} ${c - w} ${top + h * 0.62} C ${c - w * 0.92} ${top + h * 0.3} ${c - wt} ${top} ${c} ${top}Z`;
    }
    case 'squat':
      return `M${c} ${top} C ${c + w * 0.9} ${top} ${c + w * 1.1} ${top + h * 0.55} ${c + w} ${top + h * 0.8} C ${c + w * 0.9} ${b} ${c + w * 0.5} ${b} ${c} ${b} C ${c - w * 0.5} ${b} ${c - w * 0.9} ${b} ${c - w} ${top + h * 0.8} C ${c - w * 1.1} ${top + h * 0.55} ${c - w * 0.9} ${top} ${c} ${top}Z`;
    case 'tadpole':
    case 'round':
    default:
      return `M${c} ${top} C ${c + w * 0.79} ${top} ${c + w * 1.03} ${top + h * 0.44} ${c + w} ${top + h * 0.63} C ${c + w * 0.96} ${top + h * 0.92} ${c + w * 0.5} ${b} ${c} ${b} C ${c - w * 0.5} ${b} ${c - w * 0.96} ${top + h * 0.92} ${c - w} ${top + h * 0.63} C ${c - w * 1.03} ${top + h * 0.44} ${c - w * 0.79} ${top} ${c} ${top}Z`;
  }
}

function Extras({ d, pose }: { d: Design; pose: Pose }) {
  const c = 512;
  const w = d.width;
  const lift = pose === 'call' || pose === 'play' || pose === 'happy';
  return (
    <g>
      {d.extras.includes('veils') && (
        <g className="pet-wings" opacity="0.75">
          <path
            d={`M${c - w * 0.6} 600 C ${c - w * 2.2} 520 ${c - w * 2.4} 760 ${c - w * 0.8} 800Z`}
            fill={d.headColor}
            opacity="0.45"
            stroke={d.edge}
            strokeWidth="4"
          />
          <path
            d={`M${c + w * 0.6} 600 C ${c + w * 2.2} 520 ${c + w * 2.4} 760 ${c + w * 0.8} 800Z`}
            fill={d.headColor}
            opacity="0.45"
            stroke={d.edge}
            strokeWidth="4"
          />
        </g>
      )}
      {d.extras.includes('tail') && (
        <path
          d={
            d.shape === 'tadpole'
              ? `M${c + w * 0.7} 840 C ${c + w * 1.6} 860 ${c + w * 1.9} 760 ${c + w * 1.6} 700 C ${c + w * 1.5} 780 ${c + w * 1.2} 820 ${c + w * 0.8} 800Z`
              : `M${c + w * 0.7} 860 C ${c + w * 1.3} 880 ${c + w * 1.5} 820 ${c + w * 1.35} 780 C ${c + w * 1.2} 830 ${c + w} 840 ${c + w * 0.75} 830Z`
          }
          fill={d.color}
          stroke={d.edge}
          strokeWidth="6"
          opacity={d.translucent ? 0.8 : 1}
        />
      )}
      {d.extras.includes('feet') && (
        <g fill={d.edge}>
          <ellipse cx={c - w * 0.45} cy={BOTTOM - 8} rx={w * 0.28} ry="24" />
          <ellipse cx={c + w * 0.45} cy={BOTTOM - 8} rx={w * 0.28} ry="24" />
        </g>
      )}
      {d.extras.includes('legs') && (
        <g fill={d.edge}>
          <rect x={c - w * 0.5} y={BOTTOM - 90} width={w * 0.3} height="92" rx={w * 0.15} />
          <rect x={c + w * 0.2} y={BOTTOM - 90} width={w * 0.3} height="92" rx={w * 0.15} />
        </g>
      )}
      {d.extras.includes('finEars') && (
        <g fill={d.color} stroke={d.edge} strokeWidth="5">
          <path
            d={`M${c - w * 0.8} ${d.top + 120} C ${c - w * 1.7} ${d.top + 40} ${c - w * 1.6} ${d.top + 200} ${c - w * 0.9} ${d.top + 210}Z`}
          />
          <path
            d={`M${c + w * 0.8} ${d.top + 120} C ${c + w * 1.7} ${d.top + 40} ${c + w * 1.6} ${d.top + 200} ${c + w * 0.9} ${d.top + 210}Z`}
          />
        </g>
      )}
      <path
        d={bodyPath(d.shape, d.top, w)}
        fill={d.color}
        stroke={d.edge}
        strokeWidth="7"
        opacity={d.translucent ? 0.92 : 1}
      />
      {(d.belly || d.extras.includes('belly')) && (
        <ellipse
          cx={c}
          cy={BOTTOM - (BOTTOM - d.top) * 0.28}
          rx={w * 0.58}
          ry={(BOTTOM - d.top) * 0.24}
          fill={d.belly ?? '#f3ead4'}
          opacity="0.9"
        />
      )}
      {d.extras.includes('gills') && (
        <path
          d={`M${c - w * 0.9} ${d.top + 26} Q ${c} ${d.top + 70} ${c + w * 0.9} ${d.top + 26}`}
          stroke="#7fe0d0"
          strokeWidth="10"
          fill="none"
          opacity="0.8"
          strokeDasharray="4 10"
          strokeLinecap="round"
        />
      )}
      {d.extras.includes('spots') &&
        [
          [-0.5, 0.35],
          [0.45, 0.5],
          [-0.2, 0.7],
          [0.3, 0.2],
          [0.6, 0.75],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={c + x * w}
            cy={d.top + y * (BOTTOM - d.top)}
            r={i % 2 ? 6 : 9}
            fill={d.translucent ? '#c9b6ff' : d.edge}
            opacity="0.6"
          />
        ))}
      {d.extras.includes('koi') &&
        [
          [-0.55, 0.45, 34],
          [0.4, 0.62, 26],
          [-0.1, 0.8, 20],
        ].map(([x, y, r], i) => (
          <ellipse
            key={i}
            cx={c + x * w}
            cy={d.top + y * (BOTTOM - d.top)}
            rx={r}
            ry={r * 0.7}
            fill="#f08a5d"
            opacity="0.75"
          />
        ))}
      {d.extras.includes('duckweed') &&
        [
          [-0.6, 0.3],
          [0.5, 0.42],
          [-0.3, 0.62],
          [0.2, 0.15],
          [0.65, 0.7],
          [-0.7, 0.78],
        ].map(([x, y], i) => (
          <circle key={i} cx={c + x * w} cy={d.top + y * (BOTTOM - d.top)} r="10" fill="#9bc25a" />
        ))}
      {d.extras.includes('dust') &&
        [
          [-1.2, 0.2],
          [1.15, 0.35],
          [-1.05, 0.6],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={c + x * w}
            cy={d.top + y * (BOTTOM - d.top)}
            r={22 - i * 4}
            fill="#cfc4b2"
            opacity="0.6"
          />
        ))}
      {lift && d.shape !== 'tadpole' && (
        <g fill={d.color} stroke={d.edge} strokeWidth="5">
          <ellipse
            cx={c - w * 1.02}
            cy={d.top + (BOTTOM - d.top) * 0.45}
            rx="26"
            ry="44"
            transform={`rotate(-40 ${c - w * 1.02} ${d.top + (BOTTOM - d.top) * 0.45})`}
          />
          <ellipse
            cx={c + w * 1.02}
            cy={d.top + (BOTTOM - d.top) * 0.45}
            rx="26"
            ry="44"
            transform={`rotate(40 ${c + w * 1.02} ${d.top + (BOTTOM - d.top) * 0.45})`}
          />
        </g>
      )}
    </g>
  );
}

/** The head feature, drawn upright from its base at (0,0); sways and droops like a sprout. */
function HeadFeature({ d, droop }: { d: Design; droop: number }) {
  const col = d.headColor;
  const bend = `rotate(${droop * 28})`;
  switch (d.head) {
    case 'nubcap':
      return (
        <path
          transform={bend}
          d="M-70 10 C -66 -60 66 -60 70 10 Q 0 24 -70 10Z"
          fill={col}
          stroke="#8a5a36"
          strokeWidth="5"
        />
      );
    case 'spotcap':
    case 'bentcap': {
      const r = d.head === 'spotcap' ? 230 : 170;
      const tilt = d.head === 'bentcap' ? 'rotate(-14)' : '';
      return (
        <g transform={`${bend} ${tilt}`}>
          <path
            d={`M${-r} 30 C ${-r} ${-r * 0.75} ${r} ${-r * 0.75} ${r} 30 Q 0 70 ${-r} 30Z`}
            fill={col}
            stroke="#00000033"
            strokeWidth="6"
          />
          {[
            [-0.5, -0.25, 0.14],
            [0.1, -0.45, 0.16],
            [0.55, -0.15, 0.11],
            [-0.15, -0.05, 0.08],
          ].map(([x, y, s], i) => (
            <circle
              key={i}
              cx={x * r}
              cy={y * r}
              r={s * r}
              fill="#f8efdc"
              opacity={d.head === 'bentcap' ? 0.4 : 1}
            />
          ))}
        </g>
      );
    }
    case 'beanie':
      return (
        <g transform={`${bend} rotate(-12)`}>
          <path
            d="M-190 40 C -190 -150 190 -150 190 40 Q 0 80 -190 40Z"
            fill={col}
            stroke="#5a3a50"
            strokeWidth="6"
          />
          <path
            d="M-180 42 Q 0 86 180 42"
            stroke="#7fe0d0"
            strokeWidth="12"
            fill="none"
            opacity="0.9"
          />
        </g>
      );
    case 'morel':
      return (
        <g transform={bend}>
          <circle cx="0" cy="-120" r="130" fill="#fff0c8" opacity="0.28" />
          <path
            d="M-120 30 C -130 -140 -40 -250 0 -260 C 40 -250 130 -140 120 30 Q 0 60 -120 30Z"
            fill={col}
            stroke="#b8904a"
            strokeWidth="6"
          />
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse
              key={i}
              cx={((i % 4) - 1.5) * 50}
              cy={-40 - Math.floor(i / 4) * 64}
              rx="18"
              ry="24"
              fill="#b8904a"
              opacity="0.45"
            />
          ))}
        </g>
      );
    case 'truffle':
      return (
        <g transform={bend}>
          <ellipse cx="0" cy="-30" rx="150" ry="80" fill={col} />
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={-110 + i * 28} cy={-60 + (i % 3) * 18} r="12" fill="#6a5240" />
          ))}
        </g>
      );
    case 'aurora':
      return (
        <g transform={bend}>
          <defs>
            <linearGradient id="auroraCap" x1="0" x2="1">
              <stop offset="0" stopColor="#9fe8d8" />
              <stop offset="0.35" stopColor="#a6b8ff" />
              <stop offset="0.7" stopColor="#f0a8e0" />
              <stop offset="1" stopColor="#ffe29a" />
            </linearGradient>
          </defs>
          <circle cx="0" cy="-60" r="200" fill="#c9d8ff" opacity="0.2" />
          <path
            d="M-250 20 C -240 -190 240 -190 250 20 Q 0 70 -250 20Z"
            fill="url(#auroraCap)"
            opacity="0.9"
            stroke="#ffffff88"
            strokeWidth="6"
          />
          <path
            d="M-240 26 Q 0 76 240 26"
            stroke="#ffffff"
            strokeWidth="6"
            strokeDasharray="3 14"
            fill="none"
            opacity="0.8"
          />
        </g>
      );
    case 'leaf':
    case 'leafdrop':
      return (
        <g transform={bend}>
          <ellipse
            cx="0"
            cy="-6"
            rx={d.width * 0.62}
            ry="34"
            fill={col}
            stroke="#3f6e34"
            strokeWidth="5"
          />
          <path d={`M0 -6 L${d.width * 0.6} -14 L${d.width * 0.5} 10Z`} fill={d.color} />
          {d.head === 'leafdrop' && (
            <path
              d="M-20 -110 C 10 -70 14 -50 -20 -40 C -54 -50 -50 -70 -20 -110Z"
              fill="#cfeefa"
              stroke="#7fb6cc"
              strokeWidth="4"
            />
          )}
        </g>
      );
    case 'reed':
    case 'soggyreed': {
      const soggy = d.head === 'soggyreed';
      return (
        <g transform={`${bend} ${soggy ? 'rotate(35)' : ''}`}>
          <path
            d={`M0 0 Q ${soggy ? 40 : 6} -120 ${soggy ? 70 : 0} -230`}
            stroke="#5c8a46"
            strokeWidth="10"
            fill="none"
          />
          <rect
            x={soggy ? 52 : -16}
            y="-230"
            width="32"
            height="90"
            rx="16"
            fill={col}
            transform={soggy ? 'rotate(20 68 -185)' : undefined}
          />
        </g>
      );
    }
    case 'lotus':
      return (
        <g transform={bend}>
          <circle cx="0" cy="-60" r="110" fill="#ffe0ea" opacity="0.3" />
          {[-60, -30, 0, 30, 60].map((a) => (
            <ellipse
              key={a}
              cx="0"
              cy="-70"
              rx="34"
              ry="80"
              transform={`rotate(${a} 0 0)`}
              fill={col}
              stroke="#d98aa4"
              strokeWidth="4"
            />
          ))}
          <circle cx="0" cy="-30" r="20" fill="#f6d36b" />
        </g>
      );
    case 'moon':
      return (
        <g transform={bend}>
          <g className="pet-flame">
            <circle cx="0" cy="-130" r="90" fill="#fff6d6" opacity="0.25" />
            <path
              d="M30 -200 A 70 70 0 1 0 30 -60 A 52 52 0 1 1 30 -200Z"
              fill={col}
              stroke="#e8cf86"
              strokeWidth="4"
            />
          </g>
        </g>
      );
  }
}

function SpeciesEgg({
  form,
  crack = 0,
  glow = 0.5,
}: {
  form: Form;
  crack?: number;
  glow?: number;
}) {
  const e = EGGS[form]!;
  const id = `egg-${form}`;
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="0.42" cy="0.36" r="0.75">
          <stop offset="0" stopColor={e.light} />
          <stop offset="0.55" stopColor={e.mid} />
          <stop offset="1" stopColor={e.dark} />
        </radialGradient>
      </defs>
      <ellipse cx="512" cy="905" rx="200" ry="26" fill="#000" opacity="0.12" />
      <path
        d={
          form === 'pondpearl'
            ? 'M512 420 C 680 420 740 600 740 690 C 740 820 640 905 512 905 C 384 905 284 820 284 690 C 284 600 344 420 512 420Z'
            : 'M512 400 C 700 400 760 600 744 740 C 730 870 620 905 512 905 C 404 905 294 870 280 740 C 264 600 324 400 512 400Z'
        }
        fill={`url(#${id})`}
        stroke={e.edge}
        strokeWidth="8"
        opacity={form === 'pondpearl' ? 0.92 : 1}
      />
      <ellipse
        cx="512"
        cy="700"
        rx="160"
        ry="160"
        fill="#ffffff"
        opacity={0.1 + glow * 0.25}
        className="egg-pulse"
      />
      {e.swirl ? (
        <path
          d="M512 660 C 560 640 590 700 550 730 C 510 760 460 720 480 680 C 500 640 560 650 570 690"
          stroke={e.swirl}
          strokeWidth="10"
          fill="none"
          opacity="0.7"
          strokeLinecap="round"
        />
      ) : (
        [
          [430, 540, 14],
          [600, 580, 10],
          [560, 480, 8],
          [390, 700, 12],
          [650, 720, 14],
          [470, 810, 9],
          [590, 820, 8],
          [470, 620, 6],
        ].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={e.dots} opacity="0.7" />)
      )}
      <ellipse
        cx="440"
        cy="500"
        rx="40"
        ry="66"
        transform="rotate(-24 440 500)"
        fill="#fff"
        opacity="0.35"
      />
      {crack >= 1 && (
        <path
          d="M512 440 L494 500 L526 540 L500 590"
          stroke="#fff6c8"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {crack >= 2 && (
        <path
          d="M500 590 L540 630 L512 690 L560 730 M526 540 L590 560 L620 610"
          stroke="#fff6c8"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {crack >= 3 && (
        <path
          d="M512 690 L470 750 L500 810 M494 500 L430 520 L400 575 M620 610 L680 650"
          stroke="#ffffff"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

export function SpeciesArt(p: {
  form: Form;
  pose: Pose;
  blink: boolean;
  lookX: MotionValue<number>;
  lookY: MotionValue<number>;
  sprout: MotionValue<number>;
  droop: number;
  sleepy: boolean;
  blush: boolean;
  crack?: number;
  glow?: number;
}) {
  if (EGGS[p.form]) {
    return (
      <svg viewBox="0 0 1024 1024" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <SpeciesEgg form={p.form} crack={p.crack} glow={p.glow} />
      </svg>
    );
  }
  const d = DESIGNS[p.form]!;
  return (
    <svg
      viewBox="0 0 1024 1024"
      width="100%"
      height="100%"
      style={{ overflow: 'visible', ['--pet-body' as string]: d.color }}
    >
      <Extras d={d} pose={p.pose} />
      <g transform={`translate(512 ${d.headY})`}>
        <motion.g style={{ rotate: p.sprout, originX: 0.5, originY: 1 }}>
          <HeadFeature d={d} droop={p.droop} />
        </motion.g>
      </g>
      <Face
        cx={512}
        cy={d.face.cy}
        s={d.face.s}
        gap={d.face.gap}
        pose={p.pose}
        blink={p.blink}
        form={p.form}
        lookX={p.lookX}
        lookY={p.lookY}
        sleepy={p.sleepy}
        blush={p.blush}
        cheek={d.cheek}
      />
    </svg>
  );
}

export function speciesAnchors(form: Form) {
  const d = DESIGNS[form];
  if (!d)
    return { head: { x: 0.5, y: 0.45 }, mouth: { x: 0.5, y: 0.7 }, sprout: { x: 0.5, y: 0.37 } };
  return {
    head: { x: 0.5, y: d.face.cy / 1024 },
    mouth: { x: 0.5, y: (d.face.cy + 66 * d.face.s) / 1024 },
    sprout: { x: 0.5, y: (d.headY - 90) / 1024 },
  };
}
