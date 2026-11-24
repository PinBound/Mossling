/**
 * Code-drawn placeholder art for every form, in the same 1024×1024 frame as the final PNGs
 * (character centred, feet on y = 900). Poses swap eyes and mouth; the sprout is a separate
 * group so code can sway it.
 */
import { memo } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import type { Form } from '../sim';
import type { Pose } from '../assets/manifest';

export interface ArtProps {
  form: Form;
  pose: Pose;
  blink: boolean;
  lookX: MotionValue<number>;
  lookY: MotionValue<number>;
  sprout: MotionValue<number>;
  /** 0 = perky, 1 = fully wilted */
  droop: number;
  sleepy: boolean;
  blush: boolean;
  /** egg only: 0–3 crack stages; glow 0–1 */
  crack?: number;
  glow?: number;
}

type EyeKind =
  | 'open'
  | 'closed'
  | 'happy'
  | 'sad'
  | 'sick'
  | 'squeeze'
  | 'angry'
  | 'surprised'
  | 'sparkle'
  | 'half';
type MouthKind =
  'smile' | 'grin' | 'frown' | 'open' | 'puff' | 'o' | 'wavy' | 'pout' | 'flat' | 'shout' | 'smirk';

function expression(
  pose: Pose,
  blink: boolean,
  form: Form,
  sleepy: boolean,
): { eye: EyeKind; mouth: MouthKind } {
  const base: Record<Pose, { eye: EyeKind; mouth: MouthKind }> = {
    idle: { eye: 'open', mouth: 'smile' },
    blink: { eye: 'closed', mouth: 'smile' },
    happy: { eye: 'happy', mouth: 'grin' },
    sad: { eye: 'sad', mouth: 'frown' },
    eat_open: { eye: 'happy', mouth: 'open' },
    eat_closed: { eye: 'closed', mouth: 'puff' },
    sleep: { eye: 'closed', mouth: 'o' },
    sick: { eye: 'sick', mouth: 'wavy' },
    refuse: { eye: 'squeeze', mouth: 'pout' },
    angry: { eye: 'angry', mouth: 'flat' },
    play: { eye: 'sparkle', mouth: 'grin' },
    call: { eye: 'surprised', mouth: 'shout' },
    surprised: { eye: 'surprised', mouth: 'o' },
  };
  const e = { ...base[pose] };
  if (form === 'mirefuzz' && e.eye === 'open') {
    e.eye = 'half';
    e.mouth = 'smirk';
  }
  if (sleepy && e.eye === 'open') e.eye = 'half';
  if (blink && !['closed', 'happy', 'squeeze'].includes(e.eye)) e.eye = 'closed';
  return e;
}

function Eye({
  x,
  y,
  s,
  kind,
  lookX,
  lookY,
  flip,
}: {
  x: number;
  y: number;
  s: number;
  kind: EyeKind;
  lookX: MotionValue<number>;
  lookY: MotionValue<number>;
  flip: boolean;
}) {
  const ink = '#1d1f26';
  const rx = 34 * s;
  const ry = 42 * s;
  const lid = (cover: number, slant = 0) => (
    <path
      d={`M${-rx - 6} ${-ry - 6} L${rx + 6} ${-ry - 6 + (flip ? -slant : slant)} L${rx + 6} ${-ry + cover * ry * 2 + (flip ? -slant : slant)} L${-rx - 6} ${-ry + cover * ry * 2}Z`}
      style={{ fill: 'var(--pet-body)' }}
    />
  );
  const pupil = (r = 1, star = false) => (
    <motion.g style={{ x: lookX, y: lookY }}>
      <ellipse rx={rx * r} ry={ry * r} fill={ink} />
      {star ? (
        <path
          d={`M${-rx * 0.35} ${-ry * 0.45} l6 -16 l6 16 l16 6 l-16 6 l-6 16 l-6 -16 l-16 -6z`}
          fill="#fff"
        />
      ) : (
        <ellipse cx={-rx * 0.32} cy={-ry * 0.38} rx={rx * 0.34} ry={ry * 0.3} fill="#fff" />
      )}
      <circle cx={rx * 0.34} cy={ry * 0.3} r={rx * 0.15} fill="#fff" opacity="0.9" />
    </motion.g>
  );
  let body: React.ReactNode;
  switch (kind) {
    case 'closed':
      body = (
        <path
          d={`M${-rx} 4 Q 0 ${ry * 0.7} ${rx} 4`}
          stroke={ink}
          strokeWidth={9 * s}
          fill="none"
          strokeLinecap="round"
        />
      );
      break;
    case 'happy':
      body = (
        <path
          d={`M${-rx} 12 Q 0 ${-ry * 0.9} ${rx} 12`}
          stroke={ink}
          strokeWidth={10 * s}
          fill="none"
          strokeLinecap="round"
        />
      );
      break;
    case 'squeeze':
      body = (
        <path
          d={
            flip
              ? `M${rx} ${-ry * 0.5} L${-rx * 0.6} 0 L${rx} ${ry * 0.5}`
              : `M${-rx} ${-ry * 0.5} L${rx * 0.6} 0 L${-rx} ${ry * 0.5}`
          }
          stroke={ink}
          strokeWidth={10 * s}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
      break;
    case 'sad':
      body = (
        <g>
          {pupil(0.95)}
          {lid(0.28, 14)}
          <path d={`M${rx * 0.5} ${ry * 0.9} q 10 22 0 34 q -10 -12 0 -34z`} fill="#9fd4ef" />
        </g>
      );
      break;
    case 'sick':
      body = (
        <g>
          {pupil(0.85)}
          {lid(0.45)}
        </g>
      );
      break;
    case 'half':
      body = (
        <g>
          {pupil(1)}
          {lid(0.42)}
        </g>
      );
      break;
    case 'angry':
      body = (
        <g>
          {pupil(0.9)}
          {lid(0.3, -22)}
          <path
            d={
              flip
                ? `M${rx + 4} ${-ry - 4} L${-rx} ${-ry * 0.5}`
                : `M${-rx - 4} ${-ry - 4} L${rx} ${-ry * 0.5}`
            }
            stroke={ink}
            strokeWidth={9 * s}
            strokeLinecap="round"
          />
        </g>
      );
      break;
    case 'surprised':
      body = (
        <g>
          <ellipse rx={rx * 1.05} ry={ry * 1.05} fill="#fff" stroke={ink} strokeWidth={5 * s} />
          <motion.g style={{ x: lookX, y: lookY }}>
            <circle r={rx * 0.55} fill={ink} />
            <circle cx={-rx * 0.18} cy={-rx * 0.2} r={rx * 0.16} fill="#fff" />
          </motion.g>
        </g>
      );
      break;
    case 'sparkle':
      body = pupil(1.08, true);
      break;
    default:
      body = pupil(1);
  }
  return <g transform={`translate(${x} ${y})`}>{body}</g>;
}

function Mouth({ x, y, s, kind }: { x: number; y: number; s: number; kind: MouthKind }) {
  const ink = '#3b2226';
  const w = 9 * s;
  let el: React.ReactNode;
  switch (kind) {
    case 'grin':
      el = (
        <g>
          <path d={`M${-34 * s} ${-6 * s} Q 0 ${44 * s} ${34 * s} ${-6 * s}Z`} fill={ink} />
          <ellipse cx="0" cy={16 * s} rx={14 * s} ry={8 * s} fill="#e8838a" />
        </g>
      );
      break;
    case 'frown':
      el = (
        <path
          d={`M${-22 * s} ${12 * s} Q 0 ${-10 * s} ${22 * s} ${12 * s}`}
          stroke={ink}
          strokeWidth={w}
          fill="none"
          strokeLinecap="round"
        />
      );
      break;
    case 'open':
      el = (
        <g>
          <ellipse rx={30 * s} ry={34 * s} cy={8 * s} fill={ink} />
          <ellipse cy={26 * s} rx={16 * s} ry={9 * s} fill="#e8838a" />
        </g>
      );
      break;
    case 'puff':
      el = (
        <path
          d={`M${-18 * s} 0 Q 0 ${10 * s} ${18 * s} 0`}
          stroke={ink}
          strokeWidth={w}
          fill="none"
          strokeLinecap="round"
        />
      );
      break;
    case 'o':
      el = <ellipse rx={10 * s} ry={12 * s} fill={ink} />;
      break;
    case 'wavy':
      el = (
        <path
          d={`M${-28 * s} 0 q ${7 * s} ${-10 * s} ${14 * s} 0 t ${14 * s} 0 t ${14 * s} 0 t ${14 * s} 0`}
          stroke={ink}
          strokeWidth={w * 0.85}
          fill="none"
          strokeLinecap="round"
        />
      );
      break;
    case 'pout':
      el = (
        <path
          d={`M${-16 * s} ${6 * s} Q ${-6 * s} ${-8 * s} 0 ${4 * s} Q ${6 * s} ${-8 * s} ${16 * s} ${6 * s}`}
          stroke={ink}
          strokeWidth={w}
          fill="none"
          strokeLinecap="round"
        />
      );
      break;
    case 'flat':
      el = (
        <path
          d={`M${-18 * s} ${4 * s} L${18 * s} 0`}
          stroke={ink}
          strokeWidth={w}
          strokeLinecap="round"
        />
      );
      break;
    case 'shout':
      el = <ellipse rx={22 * s} ry={28 * s} cy={6 * s} fill={ink} />;
      break;
    case 'smirk':
      el = (
        <path
          d={`M${-20 * s} ${2 * s} Q ${4 * s} ${14 * s} ${22 * s} ${-6 * s}`}
          stroke={ink}
          strokeWidth={w}
          fill="none"
          strokeLinecap="round"
        />
      );
      break;
    default:
      el = (
        <path
          d={`M${-20 * s} 0 Q ${-10 * s} ${14 * s} 0 ${2 * s} Q ${10 * s} ${14 * s} ${20 * s} 0`}
          stroke={ink}
          strokeWidth={w}
          fill="none"
          strokeLinecap="round"
        />
      );
  }
  return <g transform={`translate(${x} ${y})`}>{el}</g>;
}

function Face(props: {
  cx: number;
  cy: number;
  s: number;
  gap: number;
  pose: Pose;
  blink: boolean;
  form: Form;
  lookX: MotionValue<number>;
  lookY: MotionValue<number>;
  sleepy: boolean;
  blush: boolean;
  cheek?: string;
}) {
  const { cx, cy, s, gap } = props;
  const ex = expression(props.pose, props.blink, props.form, props.sleepy);
  const puffed = props.pose === 'eat_closed';
  const blushOp = props.blush || ex.eye === 'happy' ? 0.85 : 0.5;
  return (
    <g>
      <ellipse
        cx={cx - gap - 18 * s}
        cy={cy + 52 * s}
        rx={(puffed ? 34 : 26) * s}
        ry={(puffed ? 20 : 14) * s}
        fill={props.cheek ?? '#ef8f97'}
        opacity={blushOp}
      />
      <ellipse
        cx={cx + gap + 18 * s}
        cy={cy + 52 * s}
        rx={(puffed ? 34 : 26) * s}
        ry={(puffed ? 20 : 14) * s}
        fill={props.cheek ?? '#ef8f97'}
        opacity={blushOp}
      />
      <Eye
        x={cx - gap}
        y={cy}
        s={s}
        kind={ex.eye}
        lookX={props.lookX}
        lookY={props.lookY}
        flip={false}
      />
      <Eye x={cx + gap} y={cy} s={s} kind={ex.eye} lookX={props.lookX} lookY={props.lookY} flip />
      <Mouth x={cx} y={cy + 66 * s} s={s} kind={ex.mouth} />
    </g>
  );
}

/** The head sprout — the emotional tell. Drawn upright from its base at (0,0). */
function Sprout({ kind, droop, scale = 1 }: { kind: Form; droop: number; scale?: number }) {
  const stem = '#5c8a46';
  const leaf = '#8cc46c';
  const leafDark = '#6aa552';
  const bend = droop * 70;
  const h = 120 * scale * (1 - droop * 0.25);
  const tipX = bend;
  const tipY = -h + droop * 40;
  const stemPath = `M0 0 C 0 ${-h * 0.5} ${tipX * 0.3} ${-h * 0.9} ${tipX} ${tipY}`;
  const top = (node: React.ReactNode) => (
    <g transform={`translate(${tipX} ${tipY}) rotate(${droop * 60})`}>{node}</g>
  );
  const leafShape = (rot: number, len: number, fill: string) => (
    <path
      transform={`rotate(${rot})`}
      d={`M0 0 C ${len * 0.3} ${-len * 0.45} ${len * 0.85} ${-len * 0.4} ${len} 0 C ${len * 0.7} ${len * 0.3} ${len * 0.25} ${len * 0.25} 0 0Z`}
      fill={fill}
    />
  );
  let head: React.ReactNode = null;
  switch (kind) {
    case 'egg':
      return null;
    case 'dewdrop':
      return (
        <g>
          <path
            d={`M0 0 C 0 -40 ${18 + bend * 0.3} -70 ${30 + bend * 0.4} ${-62 + droop * 30} C 44 -52 30 -36 18 -44`}
            stroke={stem}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          <g transform={`translate(${20 + bend * 0.3} ${-56 + droop * 26})`}>
            {leafShape(-30, 46, leaf)}
          </g>
        </g>
      );
    case 'sprig':
      head = (
        <g>
          {leafShape(-150, 70, leafDark)}
          {leafShape(-30, 70, leaf)}
        </g>
      );
      break;
    case 'fernlet':
      head = (
        <g>
          {leafShape(-140, 50, leafDark)}
          {leafShape(-40, 50, leaf)}
          <path
            d="M0 6 C -24 -20 -18 -60 0 -74 C 18 -60 24 -20 0 6Z"
            fill="#9fcf7c"
            stroke="#6aa552"
            strokeWidth="5"
          />
          <path d="M0 -70 L0 -10" stroke="#6aa552" strokeWidth="4" />
        </g>
      );
      break;
    case 'lanternmoss':
      head = (
        <g>
          <circle r="80" fill="#fff1b8" opacity="0.35" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              transform={`rotate(${a}) translate(0 -34)`}
              rx="22"
              ry="36"
              fill="#fbe7a6"
              stroke="#e2bd5c"
              strokeWidth="4"
            />
          ))}
          <circle r="18" fill="#f2c76e" />
          <circle r="8" fill="#fff7d6" />
        </g>
      );
      break;
    case 'burrowbun':
      head = (
        <g>
          {leafShape(-160, 56, leafDark)}
          {leafShape(-20, 56, leaf)}
          <circle cx="0" cy="-10" r="30" fill="#d84f4f" />
          <circle cx="-9" cy="-20" r="9" fill="#f6a3a3" />
        </g>
      );
      break;
    case 'mirefuzz':
      head = (
        <g transform="rotate(20)">
          <path
            d="M-6 0 Q -10 -30 -2 -40"
            stroke="#d9cbb0"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M-58 -36 C -54 -90 50 -96 54 -40 C 30 -30 -30 -28 -58 -36Z" fill="#8a6a4a" />
          <circle cx="-20" cy="-60" r="8" fill="#c9ad85" />
          <circle cx="16" cy="-66" r="6" fill="#c9ad85" />
          <path
            d="M54 -40 q 20 0 16 -20"
            stroke="#8a6a4a"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
      break;
    case 'starwick':
      // A floating candle-flame of blue light, detached from the stem.
      return (
        <g>
          <path
            d={`M0 0 C 0 -30 ${bend * 0.2} -50 ${bend * 0.3} ${-60 + droop * 20}`}
            stroke="#3d4f86"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
          <g transform={`translate(${bend * 0.3} ${-130 + droop * 40})`}>
            <g className="pet-flame">
              <circle r="70" fill="#7fb2ff" opacity="0.22" />
              <path d="M0 -60 C 34 -20 30 22 0 34 C -30 22 -34 -20 0 -60Z" fill="#8cc0ff" />
              <path d="M0 -26 C 14 -6 12 16 0 22 C -12 16 -14 -6 0 -26Z" fill="#e6f1ff" />
            </g>
          </g>
        </g>
      );
    default:
      head = leafShape(-30, 60, leaf);
  }
  return (
    <g>
      <path d={stemPath} stroke={stem} strokeWidth="13" fill="none" strokeLinecap="round" />
      {top(head)}
    </g>
  );
}

function SproutGroup({
  x,
  y,
  form,
  droop,
  sprout,
  scale,
}: {
  x: number;
  y: number;
  form: Form;
  droop: number;
  sprout: MotionValue<number>;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <motion.g style={{ rotate: sprout, originX: 0.5, originY: 1 }}>
        <rect x="-160" y="-260" width="320" height="260" fill="none" />
        <Sprout kind={form} droop={droop} scale={scale} />
      </motion.g>
    </g>
  );
}

const fuzz = (color: string, w = 16) => ({
  stroke: color,
  strokeWidth: w,
  strokeLinejoin: 'round' as const,
  strokeDasharray: '1 13',
  strokeLinecap: 'round' as const,
});

function Egg({ crack = 0, glow = 0.5 }: { crack?: number; glow?: number }) {
  return (
    <g>
      <defs>
        <radialGradient id="eggFill" cx="0.42" cy="0.36" r="0.75">
          <stop offset="0" stopColor="#e6f6e6" />
          <stop offset="0.55" stopColor="#bfe0c4" />
          <stop offset="1" stopColor="#86b993" />
        </radialGradient>
        <radialGradient id="eggGlow" cx="0.5" cy="0.6" r="0.5">
          <stop offset="0" stopColor="#f8ffd8" stopOpacity="0.95" />
          <stop offset="1" stopColor="#f8ffd8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="512" cy="905" rx="200" ry="26" fill="#000" opacity="0.12" />
      <path
        d="M512 380 C 690 380 760 620 740 760 C 724 870 620 905 512 905 C 400 905 300 870 284 760 C 264 620 334 380 512 380Z"
        fill="url(#eggFill)"
        stroke="#7aa886"
        strokeWidth="8"
      />
      <ellipse
        cx="512"
        cy="700"
        rx="160"
        ry="170"
        fill="url(#eggGlow)"
        opacity={0.25 + glow * 0.6}
        className="egg-pulse"
      />
      {[
        [420, 520, 18],
        [600, 560, 12],
        [560, 470, 9],
        [380, 690, 14],
        [650, 700, 16],
        [470, 800, 11],
        [590, 820, 9],
        [460, 610, 7],
      ].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#7fa36b" opacity="0.75" />
          <circle cx={x + r * 0.6} cy={y - r * 0.4} r={r * 0.5} fill="#9cc083" opacity="0.8" />
        </g>
      ))}
      <ellipse
        cx="440"
        cy="480"
        rx="44"
        ry="70"
        transform="rotate(-24 440 480)"
        fill="#fff"
        opacity="0.35"
      />
      {crack >= 1 && (
        <path
          d="M512 420 L494 480 L526 520 L500 574"
          stroke="#c8ff9a"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#crackGlow)"
        />
      )}
      {crack >= 2 && (
        <path
          d="M500 574 L540 620 L512 680 L560 720 M526 520 L590 540 L620 600"
          stroke="#c8ff9a"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#crackGlow)"
        />
      )}
      {crack >= 3 && (
        <path
          d="M512 680 L470 740 L500 800 M494 480 L430 500 L400 560 L360 600 M620 600 L680 640"
          stroke="#e9ffc8"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#crackGlow)"
        />
      )}
      <defs>
        <filter id="crackGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </g>
  );
}

const Body = memo(function Body({ form, pose }: { form: Form; pose: Pose }) {
  const call = pose === 'call' || pose === 'play' || pose === 'happy';
  switch (form) {
    case 'dewdrop':
      return (
        <g>
          <defs>
            <radialGradient id="dewFill" cx="0.4" cy="0.35" r="0.8">
              <stop offset="0" stopColor="#f1fbf3" stopOpacity="0.98" />
              <stop offset="0.6" stopColor="#cfe8d5" stopOpacity="0.95" />
              <stop offset="1" stopColor="#9ccfb0" stopOpacity="0.95" />
            </radialGradient>
          </defs>
          <ellipse cx="512" cy="905" rx="190" ry="24" fill="#000" opacity="0.1" />
          <path
            d="M512 520 C 680 520 730 680 724 760 C 716 870 620 902 512 902 C 404 902 308 870 300 760 C 294 680 344 520 512 520Z"
            fill="url(#dewFill)"
            stroke="#8fc2a4"
            strokeWidth="8"
          />
          <ellipse
            cx="430"
            cy="600"
            rx="38"
            ry="22"
            transform="rotate(-30 430 600)"
            fill="#fff"
            opacity="0.7"
          />
          <ellipse cx="610" cy="840" rx="60" ry="18" fill="#9ccfb0" opacity="0.35" />
        </g>
      );
    case 'sprig':
      return (
        <g>
          {/* leaf ears */}
          <path
            d="M360 470 C 250 420 200 330 230 300 C 300 300 360 380 380 450Z"
            fill="#8cbf73"
            stroke="#5f8a4c"
            strokeWidth="7"
          />
          <path
            d="M664 470 C 774 420 824 330 794 300 C 724 300 664 380 644 450Z"
            fill="#8cbf73"
            stroke="#5f8a4c"
            strokeWidth="7"
          />
          <ellipse cx="430" cy="890" rx="56" ry="26" fill="#5f8a4c" />
          <ellipse cx="594" cy="890" rx="56" ry="26" fill="#5f8a4c" />
          <path
            d="M512 410 C 640 410 690 520 712 640 C 740 790 660 890 512 890 C 364 890 284 790 312 640 C 334 520 384 410 512 410Z"
            fill="#7fa36b"
            {...fuzz('#6e9a5c')}
          />
          <path
            d="M512 410 C 640 410 690 520 712 640 C 740 790 660 890 512 890 C 364 890 284 790 312 640 C 334 520 384 410 512 410Z"
            fill="none"
            stroke="#5f8a4c"
            strokeWidth="5"
          />
          <ellipse cx="512" cy="760" rx="120" ry="100" fill="#f3ead2" opacity="0.9" />
          {call ? (
            <g>
              <ellipse
                cx="300"
                cy="640"
                rx="34"
                ry="52"
                transform="rotate(-40 300 640)"
                fill="#7fa36b"
                stroke="#5f8a4c"
                strokeWidth="5"
              />
              <ellipse
                cx="724"
                cy="640"
                rx="34"
                ry="52"
                transform="rotate(40 724 640)"
                fill="#7fa36b"
                stroke="#5f8a4c"
                strokeWidth="5"
              />
            </g>
          ) : (
            <g>
              <ellipse
                cx="322"
                cy="720"
                rx="30"
                ry="48"
                transform="rotate(20 322 720)"
                fill="#7fa36b"
                stroke="#5f8a4c"
                strokeWidth="5"
              />
              <ellipse
                cx="702"
                cy="720"
                rx="30"
                ry="48"
                transform="rotate(-20 702 720)"
                fill="#7fa36b"
                stroke="#5f8a4c"
                strokeWidth="5"
              />
            </g>
          )}
        </g>
      );
    case 'fernlet': {
      const frond = (side: 1 | -1) => (
        <g transform={`translate(${512 + side * 120} 380) scale(${side} 1)`}>
          <path
            d="M0 0 C 60 -60 140 -110 200 -60 C 230 -30 210 0 180 -6"
            stroke="#5f8a4c"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          {[0.15, 0.3, 0.45, 0.6, 0.75].map((t, i) => (
            <ellipse
              key={i}
              cx={40 + i * 34}
              cy={-40 - Math.sin(t * Math.PI) * 50}
              rx="22"
              ry="11"
              transform={`rotate(${-40 + i * 18} ${40 + i * 34} ${-40 - Math.sin(t * Math.PI) * 50})`}
              fill={i % 2 ? '#8cc46c' : '#7fb35f'}
            />
          ))}
        </g>
      );
      return (
        <g>
          {/* moth-wing nubs */}
          <ellipse
            cx="380"
            cy="560"
            rx="90"
            ry="60"
            transform="rotate(30 380 560)"
            fill="#e6f0de"
            opacity="0.6"
            stroke="#b9cfaa"
            strokeWidth="5"
          />
          <ellipse
            cx="644"
            cy="560"
            rx="90"
            ry="60"
            transform="rotate(-30 644 560)"
            fill="#e6f0de"
            opacity="0.6"
            stroke="#b9cfaa"
            strokeWidth="5"
          />
          {frond(-1)}
          {frond(1)}
          <rect x="430" y="800" width="50" height="96" rx="24" fill="#557d45" />
          <rect x="544" y="800" width="50" height="96" rx="24" fill="#557d45" />
          <path
            d="M512 340 C 630 340 660 460 668 580 C 680 760 620 840 512 840 C 404 840 344 760 356 580 C 364 460 394 340 512 340Z"
            fill="#729a5f"
            {...fuzz('#628b51')}
          />
          <path
            d="M512 340 C 630 340 660 460 668 580 C 680 760 620 840 512 840 C 404 840 344 760 356 580 C 364 460 394 340 512 340Z"
            fill="none"
            stroke="#557d45"
            strokeWidth="5"
          />
          <ellipse cx="512" cy="700" rx="90" ry="100" fill="#efe6cb" opacity="0.85" />
          {/* cheek tufts */}
          <path d="M360 560 l-40 -14 l26 26 l-34 4 l40 14z" fill="#8cc46c" />
          <path d="M664 560 l40 -14 l-26 26 l34 4 l-40 14z" fill="#8cc46c" />
          {call && (
            <g>
              <ellipse
                cx="346"
                cy="560"
                rx="26"
                ry="50"
                transform="rotate(-40 346 560)"
                fill="#729a5f"
                stroke="#557d45"
                strokeWidth="5"
              />
              <ellipse
                cx="678"
                cy="560"
                rx="26"
                ry="50"
                transform="rotate(40 678 560)"
                fill="#729a5f"
                stroke="#557d45"
                strokeWidth="5"
              />
            </g>
          )}
        </g>
      );
    }
    case 'lanternmoss':
      return (
        <g>
          <defs>
            <radialGradient id="wingGold" cx="0.3" cy="0.4" r="0.8">
              <stop offset="0" stopColor="#fff3c4" />
              <stop offset="0.6" stopColor="#f2c76e" />
              <stop offset="1" stopColor="#a9c08a" />
            </radialGradient>
          </defs>
          <g className="pet-wings">
            <path
              d="M420 560 C 260 360 90 380 110 520 C 120 620 260 660 420 640Z"
              fill="url(#wingGold)"
              stroke="#c9a24f"
              strokeWidth="6"
              opacity="0.92"
            />
            <path
              d="M604 560 C 764 360 934 380 914 520 C 904 620 764 660 604 640Z"
              fill="url(#wingGold)"
              stroke="#c9a24f"
              strokeWidth="6"
              opacity="0.92"
            />
            <path
              d="M430 650 C 300 700 220 800 290 840 C 350 860 420 760 450 690Z"
              fill="#cfe0b0"
              stroke="#a9c08a"
              strokeWidth="5"
              opacity="0.9"
            />
            <path
              d="M594 650 C 724 700 804 800 734 840 C 674 860 604 760 574 690Z"
              fill="#cfe0b0"
              stroke="#a9c08a"
              strokeWidth="5"
              opacity="0.9"
            />
            <circle cx="220" cy="500" r="26" fill="#fff6d6" opacity="0.8" />
            <circle cx="804" cy="500" r="26" fill="#fff6d6" opacity="0.8" />
          </g>
          <path
            d="M512 420 C 640 420 680 520 680 620 C 680 740 610 820 512 820 C 414 820 344 740 344 620 C 344 520 384 420 512 420Z"
            fill="#a9c98b"
            stroke="#7f9f68"
            strokeWidth="7"
          />
          <ellipse cx="512" cy="700" rx="100" ry="90" fill="#f6f0d8" opacity="0.9" />
          <path d="M470 820 Q 512 900 554 820" fill="#a9c98b" stroke="#7f9f68" strokeWidth="6" />
          <path
            d="M380 440 C 340 380 350 330 380 320 C 410 360 420 400 420 430Z"
            fill="#c9dcae"
            stroke="#7f9f68"
            strokeWidth="5"
          />
          <path
            d="M644 440 C 684 380 674 330 644 320 C 614 360 604 400 604 430Z"
            fill="#c9dcae"
            stroke="#7f9f68"
            strokeWidth="5"
          />
        </g>
      );
    case 'burrowbun':
      return (
        <g>
          <ellipse cx="420" cy="888" rx="60" ry="26" fill="#557d45" />
          <ellipse cx="604" cy="888" rx="60" ry="26" fill="#557d45" />
          <path
            d="M512 430 C 690 430 760 560 760 680 C 760 820 660 892 512 892 C 364 892 264 820 264 680 C 264 560 334 430 512 430Z"
            fill="#6f9a5a"
            {...fuzz('#5f8a4c', 20)}
          />
          <path
            d="M512 430 C 690 430 760 560 760 680 C 760 820 660 892 512 892 C 364 892 264 820 264 680 C 264 560 334 430 512 430Z"
            fill="none"
            stroke="#4f7840"
            strokeWidth="6"
          />
          <ellipse cx="512" cy="760" rx="150" ry="110" fill="#f1e4c4" opacity="0.92" />
          {/* lop ears */}
          <path
            d="M360 480 C 260 500 220 640 250 760 C 270 800 320 790 320 740 C 320 640 350 560 400 500Z"
            fill="#8cb873"
            stroke="#4f7840"
            strokeWidth="6"
          />
          <path
            d="M664 480 C 764 500 804 640 774 760 C 754 800 704 790 704 740 C 704 640 674 560 624 500Z"
            fill="#8cb873"
            stroke="#4f7840"
            strokeWidth="6"
          />
          {call && (
            <g>
              <ellipse
                cx="300"
                cy="640"
                rx="30"
                ry="46"
                transform="rotate(-50 300 640)"
                fill="#6f9a5a"
                stroke="#4f7840"
                strokeWidth="5"
              />
              <ellipse
                cx="724"
                cy="640"
                rx="30"
                ry="46"
                transform="rotate(50 724 640)"
                fill="#6f9a5a"
                stroke="#4f7840"
                strokeWidth="5"
              />
            </g>
          )}
        </g>
      );
    case 'mirefuzz':
      return (
        <g>
          <ellipse cx="430" cy="890" rx="56" ry="24" fill="#33472e" />
          <ellipse cx="594" cy="890" rx="56" ry="24" fill="#33472e" />
          <path
            d="M512 430 L560 410 L590 444 L640 440 L656 486 L704 506 L700 556 L736 596 L716 640 L742 690 L712 732 L726 784 L680 812 L664 862 L612 870 L572 900 L512 884 L452 900 L412 870 L360 862 L344 812 L298 784 L312 732 L282 690 L308 640 L288 596 L324 556 L320 506 L368 486 L384 440 L434 444 L464 410Z"
            fill="#4f6b45"
            stroke="#33472e"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          <ellipse cx="512" cy="760" rx="110" ry="90" fill="#7d8a5f" opacity="0.6" />
          {[
            [420, 560],
            [610, 600],
            [470, 820],
            [580, 520],
            [360, 700],
            [660, 730],
          ].map(([x, y], i) => (
            <path
              key={i}
              d={`M${x} ${y} q 12 -18 24 0 q 12 18 24 0`}
              stroke="#3c5536"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          ))}
          {/* one ear up, one flopped */}
          <path
            d="M392 470 C 360 380 380 320 410 310 C 440 360 446 420 436 466Z"
            fill="#5d7a51"
            stroke="#33472e"
            strokeWidth="6"
          />
          <path
            d="M640 470 C 720 470 770 520 780 570 C 740 580 690 540 630 500Z"
            fill="#5d7a51"
            stroke="#33472e"
            strokeWidth="6"
          />
          {/* pond-damp drip */}
          <path d="M700 620 q 10 20 0 30 q -10 -10 0 -30z" fill="#9fd4ef" opacity="0.8" />
          {call && (
            <g>
              <ellipse
                cx="300"
                cy="620"
                rx="28"
                ry="46"
                transform="rotate(-40 300 620)"
                fill="#4f6b45"
                stroke="#33472e"
                strokeWidth="5"
              />
              <ellipse
                cx="724"
                cy="620"
                rx="28"
                ry="46"
                transform="rotate(40 724 620)"
                fill="#4f6b45"
                stroke="#33472e"
                strokeWidth="5"
              />
            </g>
          )}
        </g>
      );
    case 'starwick':
      return (
        <g>
          <g className="pet-wings">
            <path
              d="M420 560 C 250 340 80 380 110 540 C 130 640 270 660 420 640Z"
              fill="#9fb6ff"
              opacity="0.32"
              stroke="#c9d6ff"
              strokeWidth="4"
            />
            <path
              d="M604 560 C 774 340 944 380 914 540 C 894 640 754 660 604 640Z"
              fill="#9fb6ff"
              opacity="0.32"
              stroke="#c9d6ff"
              strokeWidth="4"
            />
            {[
              [200, 480],
              [260, 560],
              [160, 560],
              [830, 480],
              [770, 560],
              [870, 560],
              [300, 460],
              [724, 460],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 3 ? 4 : 6} fill="#eef3ff" />
            ))}
          </g>
          <path
            d="M512 420 C 640 420 680 520 680 620 C 680 740 610 820 512 820 C 414 820 344 740 344 620 C 344 520 384 420 512 420Z"
            fill="#26355f"
            stroke="#1a2547"
            strokeWidth="7"
          />
          <path
            d="M400 560 L452 520 L470 600 L560 640 L610 560 M470 600 L440 700 L520 760 L600 720"
            stroke="#9fc4ff"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
          />
          {[
            [400, 560],
            [452, 520],
            [470, 600],
            [560, 640],
            [610, 560],
            [440, 700],
            [520, 760],
            [600, 720],
            [380, 650],
            [640, 660],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={14} fill="#9fc4ff" opacity="0.25" />
              <circle
                cx={x}
                cy={y}
                r={i % 2 ? 5 : 7}
                fill="#e8f1ff"
                className="pet-spore"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            </g>
          ))}
          <path d="M470 820 Q 512 900 554 820" fill="#26355f" stroke="#1a2547" strokeWidth="6" />
          <path
            d="M380 440 C 340 380 350 330 380 320 C 410 360 420 400 420 430Z"
            fill="#33447a"
            stroke="#1a2547"
            strokeWidth="5"
          />
          <path
            d="M644 440 C 684 380 674 330 644 320 C 614 360 604 400 604 430Z"
            fill="#33447a"
            stroke="#1a2547"
            strokeWidth="5"
          />
        </g>
      );
    default:
      return null;
  }
});

/** Face position, eye gap, scale and sprout base per form, in the 1024 frame. */
const LAYOUT: Record<
  Exclude<Form, 'egg'>,
  {
    cx: number;
    cy: number;
    s: number;
    gap: number;
    sx: number;
    sy: number;
    body: string;
    cheek?: string;
    sproutScale?: number;
  }
> = {
  dewdrop: { cx: 512, cy: 715, s: 1.05, gap: 78, sx: 512, sy: 526, body: '#cfe8d5' },
  sprig: { cx: 512, cy: 590, s: 1, gap: 74, sx: 512, sy: 414, body: '#7fa36b' },
  fernlet: { cx: 512, cy: 510, s: 0.92, gap: 66, sx: 512, sy: 344, body: '#729a5f' },
  lanternmoss: {
    cx: 512,
    cy: 580,
    s: 0.92,
    gap: 66,
    sx: 512,
    sy: 424,
    body: '#a9c98b',
    sproutScale: 1.1,
  },
  burrowbun: { cx: 512, cy: 600, s: 1, gap: 80, sx: 512, sy: 434, body: '#6f9a5a' },
  mirefuzz: {
    cx: 512,
    cy: 610,
    s: 1,
    gap: 78,
    sx: 520,
    sy: 420,
    body: '#4f6b45',
    cheek: '#c97f76',
  },
  starwick: {
    cx: 512,
    cy: 580,
    s: 0.92,
    gap: 66,
    sx: 512,
    sy: 424,
    body: '#26355f',
    cheek: '#7f8fe0',
  },
};

export const PlaceholderPet = memo(function PlaceholderPet(p: ArtProps) {
  if (p.form === 'egg') {
    return (
      <svg viewBox="0 0 1024 1024" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <Egg crack={p.crack} glow={p.glow} />
      </svg>
    );
  }
  const L = LAYOUT[p.form];
  return (
    <svg
      viewBox="0 0 1024 1024"
      width="100%"
      height="100%"
      style={{ overflow: 'visible', ['--pet-body' as string]: L.body }}
    >
      <Body form={p.form} pose={p.pose} />
      <SproutGroup
        x={L.sx}
        y={L.sy}
        form={p.form}
        droop={p.droop}
        sprout={p.sprout}
        scale={L.sproutScale}
      />
      <Face
        cx={L.cx}
        cy={L.cy}
        s={L.s}
        gap={L.gap}
        pose={p.pose}
        blink={p.blink}
        form={p.form}
        lookX={p.lookX}
        lookY={p.lookY}
        sleepy={p.sleepy}
        blush={p.blush}
        cheek={L.cheek}
      />
    </svg>
  );
});

/** Where the sprout and face sit, as fractions of the art box (used for particles and hit-testing). */
export function anchors(form: Form) {
  if (form === 'egg')
    return { head: { x: 0.5, y: 0.45 }, mouth: { x: 0.5, y: 0.7 }, sprout: { x: 0.5, y: 0.37 } };
  const L = LAYOUT[form];
  return {
    head: { x: L.cx / 1024, y: L.cy / 1024 },
    mouth: { x: L.cx / 1024, y: (L.cy + 66 * L.s) / 1024 },
    sprout: { x: L.sx / 1024, y: (L.sy - 90) / 1024 },
  };
}
