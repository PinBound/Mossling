import { memo, useMemo } from 'react';
import { motion, type MotionValue, useTransform } from 'framer-motion';
import type { Dropping } from '../sim';
import { sceneImage, propImage, type SceneLayer } from '../assets/manifest';
import { paletteAt, todWeights, type Palette } from './palette';
import type { Season } from './weather';
import { TIMES } from '../assets/manifest';
import styles from './scene.module.css';

/**
 * The Hollow is a 16:9 world, 1600×900 units, laid out to match the scene art
 * (giant fern on the left, open meadow in the middle, pond and burrow on the right).
 * The stage shows all of it on wide screens, or a tall window that follows the pet.
 */
export const WORLD_W = 1600;
export const WORLD_H = 900;
/** Feet line in the meadow. */
export const GROUND_Y = 760;
/** Walkable meadow. */
export const MEADOW = { min: 300, max: 1000 };
/** Burrow mouth (where the pet sleeps) and the spot in the meadow it hops up from. */
export const BURROW = { x: 1432, y: 606, scale: 0.72, approachX: 1060 };
export const POND = { cx: 1312, cy: 722, rx: 270, ry: 62 };
export const STOOL = { x: 360, y: 778 };
export const LANTERN = { x: 1208, y: 470, base: 640 };
/** Painted lantern: a fern stem holding a paper lantern, drawn this big with its stem on the ground. */
const LANTERN_ART = { size: 270, stemX: 0.22, stemY: 0.9, globeX: 0.65, globeY: 0.56 };
/** Where the lantern's light comes from (painted globe, or the code-drawn lamp). */
export function lanternGlowPoint(): { x: number; y: number } {
  if (propImage('lantern_on')) {
    const a = LANTERN_ART;
    const left = LANTERN.x - a.stemX * a.size;
    const top = LANTERN.base - a.stemY * a.size;
    return { x: left + a.globeX * a.size, y: top + a.globeY * a.size };
  }
  return { x: LANTERN.x - 40, y: LANTERN.y + 40 };
}

/** Older placeholder art was drawn for a 900×1200 frame; this stretches it to the world. */
const LEGACY = `scale(${WORLD_W / 900} ${WORLD_H / 1200})`;

interface LayerProps {
  hour: number;
  px: MotionValue<number>;
  py: MotionValue<number>;
}

function ArtLayer({ layer, hour }: { layer: SceneLayer; hour: number }) {
  const w = todWeights(hour);
  // Only mount the paintings that are visible right now (one, or two while crossfading):
  // every mounted full-size image costs ~6 MB of decoded memory, which matters on phones.
  const imgs = TIMES.map((t) => ({ t, src: sceneImage(layer, t) })).filter(
    (x) => x.src && w[x.t] > 0.005,
  );
  if (!imgs.length) return null;
  return (
    <>
      {imgs.map(({ t, src }) => (
        <img
          key={t}
          src={src!}
          alt=""
          className={styles.art}
          style={{ opacity: w[t], transition: 'opacity 2s ease' }}
          draggable={false}
        />
      ))}
    </>
  );
}

const Stars = memo(function Stars({ opacity }: { opacity: number }) {
  const stars = useMemo(() => {
    const out: { x: number; y: number; r: number; d: number }[] = [];
    let s = 9;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 70; i++)
      out.push({ x: r() * 900, y: r() * 520, r: 0.8 + r() * 1.8, d: r() * 4 });
    return out;
  }, []);
  if (opacity <= 0.02) return null;
  return (
    <g opacity={opacity}>
      {stars.map((st, i) => (
        <circle
          key={i}
          cx={st.x}
          cy={st.y}
          r={st.r}
          fill="#f4f1ff"
          className={styles.twinkle}
          style={{ animationDelay: `${st.d}s` }}
        />
      ))}
    </g>
  );
});

function Sky({ p, hour }: { p: Palette; hour: number }) {
  // Sun arcs across the day; the moon at night.
  const dayT = (hour - 6) / 13;
  const nightT = ((hour + 24 - 19.5) % 24) / 11;
  const sun = dayT > -0.05 && dayT < 1.05;
  const t = sun ? dayT : nightT;
  const cx = 120 + t * 660;
  const cy = 420 - Math.sin(Math.max(0, Math.min(1, t)) * Math.PI) * 300;
  return (
    <>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.skyTop} />
          <stop offset="1" stopColor={p.skyBot} />
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop offset="0" stopColor={p.sun} stopOpacity="0.9" />
          <stop offset="1" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="900" height="1200" fill="url(#sky)" />
      <Stars opacity={Math.max(0, (p.dark - 0.45) * 1.8)} />
      <circle cx={cx} cy={cy} r={sun ? 120 : 90} fill="url(#sunGlow)" />
      {sun ? (
        <circle cx={cx} cy={cy} r={42} fill={p.sun} />
      ) : (
        <g>
          <circle cx={cx} cy={cy} r={34} fill="#eef0f8" />
          <circle cx={cx + 14} cy={cy - 8} r={30} fill={p.skyTop} opacity="0.9" />
        </g>
      )}
    </>
  );
}

function FarLayer({ p }: { p: Palette }) {
  return (
    <g>
      <path
        d="M0 640 C 60 560 110 600 150 540 C 200 470 250 560 300 520 C 360 470 400 540 450 500 C 520 440 560 530 610 490 C 670 440 720 520 770 480 C 830 440 870 500 900 470 L900 800 L0 800Z"
        fill={p.farHaze}
        opacity="0.8"
      />
      {[60, 170, 270, 390, 520, 640, 760, 860].map((x, i) => (
        <path
          key={x}
          d={`M${x} 760 L${x - 34 - (i % 3) * 6} 760 L${x - 6} ${560 - (i % 4) * 30} L${x + 30 + (i % 2) * 8} 760Z`}
          fill={p.far}
          opacity="0.85"
        />
      ))}
      <rect y="740" width="900" height="80" fill={p.far} opacity="0.7" />
    </g>
  );
}

function Rainbow({ show }: { show: boolean }) {
  if (!show) return null;
  const colors = ['#e88b8b', '#f0b878', '#f2dc8a', '#a8d69a', '#8fc5d9', '#a99bd6'];
  return (
    <g opacity="0.45" className={styles.fadeIn}>
      {colors.map((c, i) => (
        <path
          key={c}
          d={`M${80 + i * 14} 760 A ${360 - i * 14} ${340 - i * 14} 0 0 1 ${820 - i * 14} 760`}
          stroke={c}
          strokeWidth="14"
          fill="none"
        />
      ))}
    </g>
  );
}

function GiantFern({ p }: { p: Palette }) {
  // One great arching frond over the clearing, with leaflets.
  const leaflets = Array.from({ length: 16 }, (_, i) => i);
  return (
    <g className={styles.fernSway}>
      <path
        d="M-30 1000 C 40 640 230 300 760 210"
        stroke={p.fern}
        strokeWidth="16"
        fill="none"
        strokeLinecap="round"
      />
      {leaflets.map((i) => {
        const t = 0.12 + i * 0.054;
        const x = -30 + (790 * t + 260 * Math.sin(t * Math.PI) * 0.2);
        const y = 1000 - 790 * Math.pow(t, 0.62);
        const len = 150 - i * 6;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${-28 + i * 2})`}>
            <path
              d={`M0 0 C ${len * 0.3} ${-len * 0.6} ${len * 0.8} ${-len * 0.5} ${len} ${-len * 0.2} C ${len * 0.7} ${-len * 0.05} ${len * 0.3} 0 0 0Z`}
              fill={i % 2 ? p.fern : p.fernLight}
            />
            <path
              d={`M0 0 C ${-len * 0.1} ${len * 0.5} ${len * 0.3} ${len * 0.9} ${len * 0.7} ${len * 0.8} C ${len * 0.45} ${len * 0.5} ${len * 0.2} ${len * 0.2} 0 0Z`}
              fill={i % 2 ? p.fernLight : p.fern}
              opacity="0.9"
            />
          </g>
        );
      })}
    </g>
  );
}

function Pond({ p, rain }: { p: Palette; rain: boolean }) {
  return (
    <g>
      <ellipse
        cx={POND.cx}
        cy={POND.cy + 6}
        rx={POND.rx + 16}
        ry={POND.ry + 10}
        fill={p.groundDark}
      />
      <ellipse cx={POND.cx} cy={POND.cy} rx={POND.rx} ry={POND.ry} fill={p.pond} />
      <ellipse
        cx={POND.cx - 40}
        cy={POND.cy - 10}
        rx={POND.rx * 0.55}
        ry={POND.ry * 0.3}
        fill={p.pondLight}
        opacity="0.35"
      />
      <g className={styles.ripple}>
        <ellipse
          cx={POND.cx + 50}
          cy={POND.cy + 8}
          rx="40"
          ry="7"
          fill="none"
          stroke={p.pondLight}
          strokeOpacity="0.5"
          strokeWidth="2"
        />
      </g>
      <g transform={`translate(${POND.cx + 110} ${POND.cy + 4})`}>
        <ellipse rx="34" ry="10" fill="#6d9a55" />
        <path d="M0 0 L34 -2 L30 6Z" fill={p.pond} />
      </g>
      {/* cattails */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${POND.cx + 160 + i * 16} ${POND.cy - 8})`}>
          <path
            d={`M0 0 Q ${4 - i * 3} -60 ${i * 4} -${90 + i * 14}`}
            stroke={p.fern}
            strokeWidth="4"
            fill="none"
          />
          <rect x={i * 4 - 5} y={-(90 + i * 14) + 4} width="10" height="26" rx="5" fill={p.bark} />
        </g>
      ))}
      {rain && (
        <ellipse
          cx={POND.cx}
          cy={POND.cy}
          rx={POND.rx}
          ry={POND.ry}
          fill="#cfe3f0"
          opacity="0.12"
        />
      )}
    </g>
  );
}

function Burrow({ p }: { p: Palette }) {
  const GROUND_Y = BURROW.y + 30;
  const src = propImage('burrow');
  if (src)
    return <image href={src} x={BURROW.x - 150} y={GROUND_Y - 250} width="300" height="300" />;
  return (
    <g>
      <path
        d={`M${BURROW.x - 160} ${GROUND_Y - 30} C ${BURROW.x - 150} ${GROUND_Y - 240} ${BURROW.x + 150} ${GROUND_Y - 240} ${BURROW.x + 170} ${GROUND_Y - 30}Z`}
        fill={p.mid}
      />
      <path
        d={`M${BURROW.x - 150} ${GROUND_Y - 40} C ${BURROW.x - 130} ${GROUND_Y - 200} ${BURROW.x + 130} ${GROUND_Y - 210} ${BURROW.x + 160} ${GROUND_Y - 40}`}
        fill="none"
        stroke={p.fernLight}
        strokeWidth="10"
        strokeDasharray="2 16"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d={`M${BURROW.x - 80} ${GROUND_Y - 30} C ${BURROW.x - 76} ${GROUND_Y - 150} ${BURROW.x + 76} ${GROUND_Y - 150} ${BURROW.x + 84} ${GROUND_Y - 30}Z`}
        fill="#20160f"
        opacity="0.88"
      />
      <ellipse cx={BURROW.x} cy={GROUND_Y - 34} rx="86" ry="14" fill="#3a2a1d" opacity="0.6" />
    </g>
  );
}

function Stool({ p, candles }: { p: Palette; candles: number }) {
  const birthday = candles > 0 ? propImage('birthday_candle_mushroom') : null;
  const src = birthday ?? propImage('mushroom_stool');
  const { x, y } = STOOL;
  return (
    <g>
      {src ? (
        <image href={src} x={x - 70} y={y - 130} width="140" height="140" />
      ) : (
        <g>
          <path
            d={`M${x - 22} ${y} L${x - 16} ${y - 60} L${x + 16} ${y - 60} L${x + 22} ${y}Z`}
            fill="#efe3cc"
          />
          <path
            d={`M${x - 72} ${y - 58} C ${x - 70} ${y - 130} ${x + 70} ${y - 130} ${x + 72} ${y - 58} Q ${x} ${y - 46} ${x - 72} ${y - 58}Z`}
            fill="#c8604f"
          />
          {[
            [-36, -82, 9],
            [8, -100, 11],
            [40, -74, 7],
            [-6, -70, 6],
          ].map(([dx, dy, r], i) => (
            <circle key={i} cx={x + dx} cy={y + dy} r={r} fill="#f6efdf" />
          ))}
          <ellipse cx={x} cy={y + 2} rx="36" ry="6" fill={p.groundDark} opacity="0.5" />
        </g>
      )}
      {!birthday &&
        Array.from({ length: Math.min(candles, 10) }, (_, i) => {
          const cx = x - (Math.min(candles, 10) - 1) * 9 + i * 18;
          return (
            <g key={i} transform={`translate(${cx} ${y - 118})`}>
              <rect
                x="-3.5"
                y="-26"
                width="7"
                height="26"
                rx="2"
                fill={i % 2 ? '#f2c76e' : '#cfe8d5'}
              />
              <path
                d="M0 -40 C 6 -32 4 -28 0 -26 C -4 -28 -6 -32 0 -40Z"
                fill="#ffb347"
                className={styles.flame}
              />
            </g>
          );
        })}
    </g>
  );
}

function Lantern({ on, dark }: { on: boolean; dark: number }) {
  const src = propImage(on ? 'lantern_on' : 'lantern_off');
  const { x, y } = LANTERN;
  if (src) {
    const a = LANTERN_ART;
    const g = lanternGlowPoint();
    return (
      <g>
        {on && <circle cx={g.x} cy={g.y} r={90 + dark * 90} fill="url(#lanternGlow)" />}
        <image
          href={src}
          x={x - a.stemX * a.size}
          y={LANTERN.base - a.stemY * a.size}
          width={a.size}
          height={a.size}
        />
        <defs>
          <radialGradient id="lanternGlow">
            <stop offset="0" stopColor="#ffd98a" stopOpacity={0.35 + dark * 0.35} />
            <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
          </radialGradient>
        </defs>
      </g>
    );
  }
  return (
    <g>
      <path
        d={`M${x} ${LANTERN.base} L${x} ${y - 40} Q ${x} ${y - 70} ${x - 40} ${y - 70}`}
        stroke="#5a4433"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <g transform={`translate(${x - 40} ${y - 66})`} className={styles.lanternSwing}>
        <line x1="0" y1="0" x2="0" y2="18" stroke="#5a4433" strokeWidth="3" />
        {src ? (
          <image href={src} x="-46" y="8" width="92" height="92" />
        ) : (
          <g>
            <path d="M-20 22 L20 22 L26 30 L-26 30Z" fill="#5a4433" />
            <rect
              x="-20"
              y="30"
              width="40"
              height="46"
              rx="10"
              fill={on ? '#fbe3a1' : '#53606b'}
              stroke="#5a4433"
              strokeWidth="4"
            />
            {on && <circle cx="0" cy="53" r="9" fill="#fff6cf" />}
            <path d="M-22 76 L22 76 L16 84 L-16 84Z" fill="#5a4433" />
          </g>
        )}
        {on && <circle cx="0" cy="53" r={70 + dark * 60} fill="url(#lanternGlow)" />}
      </g>
      <defs>
        <radialGradient id="lanternGlow">
          <stop offset="0" stopColor="#ffd98a" stopOpacity={0.45 + dark * 0.3} />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </g>
  );
}

function Ground({ p, season }: { p: Palette; season: Season }) {
  return (
    <g>
      <path
        d="M0 790 C 200 760 380 800 520 780 C 680 760 800 790 900 780 L900 1200 L0 1200Z"
        fill={p.ground}
      />
      <path
        d="M0 1020 C 200 1000 420 1030 600 1010 C 760 995 840 1012 900 1005 L900 1200 L0 1200Z"
        fill={p.groundDark}
        opacity="0.6"
      />
      {Array.from({ length: 22 }, (_, i) => (
        <ellipse
          key={i}
          cx={(i * 97) % 900}
          cy={820 + ((i * 53) % 330)}
          rx={18 + (i % 4) * 6}
          ry={6 + (i % 3) * 2}
          fill={p.fernLight}
          opacity="0.35"
        />
      ))}
      {season === 'winter' &&
        Array.from({ length: 16 }, (_, i) => (
          <ellipse
            key={`s${i}`}
            cx={(i * 131 + 40) % 900}
            cy={800 + ((i * 71) % 340)}
            rx={26 + (i % 3) * 10}
            ry={7}
            fill="#f4f8fb"
            opacity="0.75"
          />
        ))}
      {season === 'spring' &&
        Array.from({ length: 12 }, (_, i) => (
          <g
            key={`f${i}`}
            transform={`translate(${(i * 149 + 60) % 900} ${830 + ((i * 89) % 300)})`}
          >
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} rx="5" ry="3" cx="5" transform={`rotate(${a})`} fill="#f6c6d0" />
            ))}
            <circle r="2.5" fill="#f2c76e" />
          </g>
        ))}
      {season === 'autumn' &&
        Array.from({ length: 14 }, (_, i) => (
          <ellipse
            key={`l${i}`}
            cx={(i * 113 + 30) % 900}
            cy={830 + ((i * 67) % 320)}
            rx="9"
            ry="5"
            transform={`rotate(${i * 40} ${(i * 113 + 30) % 900} ${830 + ((i * 67) % 320)})`}
            fill={['#d9893b', '#c45a35', '#e3b04b'][i % 3]}
            opacity="0.8"
          />
        ))}
    </g>
  );
}

function Droppings({ items, onClickAny }: { items: Dropping[]; onClickAny?: () => void }) {
  const src = propImage('dropping');
  return (
    <g>
      {items.map((d) => {
        const x = MEADOW.min + d.x * (MEADOW.max - MEADOW.min);
        const y = GROUND_Y + 18 + ((d.id * 37) % 50);
        return (
          <g
            key={d.id}
            transform={`translate(${x} ${y})`}
            className={styles.dropIn}
            onClick={onClickAny}
            role="img"
            aria-label="A moss pellet"
          >
            {src ? (
              <image href={src} x="-40" y="-60" width="80" height="80" />
            ) : (
              <g>
                <ellipse cx="0" cy="0" rx="30" ry="9" fill="#000" opacity="0.15" />
                <ellipse cx="-10" cy="-8" rx="15" ry="11" fill="#6b5a35" />
                <ellipse cx="10" cy="-9" rx="13" ry="10" fill="#7a6a3f" />
                <ellipse cx="0" cy="-22" rx="11" ry="9" fill="#8a7a48" />
                <circle cx="-4" cy="-26" r="3" fill="#8faa5c" />
                <circle cx="6" cy="-14" r="2.5" fill="#8faa5c" />
                <path
                  d="M-8 -42 q 4 -8 0 -14 M6 -46 q 4 -8 0 -14"
                  stroke="#9b8d6a"
                  strokeWidth="2.5"
                  fill="none"
                  opacity="0.7"
                  className={styles.stink}
                />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Puddles that appear in the meadow while it rains (world coords: centre x, centre y, width). */
const PUDDLES = [
  { x: 440, y: 805, w: 230 },
  { x: 770, y: 842, w: 300 },
  { x: 975, y: 792, w: 170 },
];

function Puddles({ show }: { show: boolean }) {
  if (!show) return null;
  const src = propImage('puddle');
  if (src)
    return (
      <g className={styles.fadeIn}>
        {PUDDLES.map((d, i) => (
          <image key={i} href={src} x={d.x - d.w / 2} y={d.y - d.w / 2} width={d.w} height={d.w} />
        ))}
      </g>
    );
  return (
    <g opacity="0.65" className={styles.fadeIn}>
      {PUDDLES.map((d, i) => (
        <ellipse key={i} cx={d.x} cy={d.y} rx={d.w * 0.32} ry={d.w * 0.06} fill="#9cc4d4" />
      ))}
    </g>
  );
}

export interface BackProps extends LayerProps {
  lightsOn: boolean;
  droppings: Dropping[];
  season: Season;
  rain: boolean;
  rainbow: boolean;
  candles: number;
}

/** Everything behind the pet. */
export const HollowBack = memo(function HollowBack(props: BackProps) {
  const p = paletteAt(props.hour);
  const farX = useTransform(props.px, (v) => v * -6);
  const midX = useTransform(props.px, (v) => v * -12);
  const farY = useTransform(props.py, (v) => v * -3);
  const vb = `0 0 ${WORLD_W} ${WORLD_H}`;
  return (
    <div className={styles.layer} aria-hidden="true">
      <svg viewBox={vb} className={styles.svg} preserveAspectRatio="none">
        <g transform={LEGACY}>
          <Sky p={p} hour={props.hour} />
        </g>
      </svg>
      <motion.div className={`${styles.layer} ${styles.bleed}`} style={{ x: farX, y: farY }}>
        {sceneImage('bg_far', 'day') ? (
          <ArtLayer layer="bg_far" hour={props.hour} />
        ) : (
          <svg viewBox={vb} className={styles.svg} preserveAspectRatio="none">
            <g transform={LEGACY}>
              <FarLayer p={p} />
            </g>
          </svg>
        )}
        <svg viewBox={vb} className={styles.svg} preserveAspectRatio="none">
          <g transform={LEGACY}>
            <Rainbow show={props.rainbow} />
          </g>
        </svg>
      </motion.div>
      <motion.div className={`${styles.layer} ${styles.bleed}`} style={{ x: midX }}>
        {sceneImage('bg_mid', 'day') ? (
          <ArtLayer layer="bg_mid" hour={props.hour} />
        ) : (
          <svg viewBox={vb} className={styles.svg} preserveAspectRatio="none">
            <g transform={LEGACY}>
              <Ground p={p} season={props.season} />
              <GiantFern p={p} />
            </g>
            <Pond p={p} rain={props.rain} />
            <Burrow p={p} />
          </svg>
        )}
      </motion.div>
      <svg viewBox={vb} className={styles.svg} preserveAspectRatio="none">
        <Puddles show={props.rain} />
        <Stool p={p} candles={props.candles} />
        <Lantern on={props.lightsOn} dark={p.dark} />
        <Droppings items={props.droppings} />
      </svg>
    </div>
  );
});

/** Foreground grasses in front of the pet. */
export const HollowNear = memo(function HollowNear({ hour, px }: LayerProps) {
  const p = paletteAt(hour);
  const x = useTransform(px, (v) => v * -22);
  return (
    <motion.div className={`${styles.layer} ${styles.bleed}`} style={{ x }} aria-hidden="true">
      {sceneImage('fg_near', 'day') ? (
        <ArtLayer layer="fg_near" hour={hour} />
      ) : (
        <svg
          viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
          className={styles.svg}
          preserveAspectRatio="none"
        >
          <g transform={LEGACY}>
            {[-20, 90, 700, 820, 900].map((gx, i) => (
              <g
                key={gx}
                transform={`translate(${gx} 1210)`}
                className={styles.grassSway}
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                {[-30, -12, 6, 22, 38].map((dx, j) => (
                  <path
                    key={j}
                    d={`M${dx} 0 Q ${dx + 8} -${70 + j * 12} ${dx + 20 + j * 4} -${120 + ((j * 23) % 50)}`}
                    stroke={j % 2 ? p.fern : p.fernLight}
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                  />
                ))}
              </g>
            ))}
          </g>
        </svg>
      )}
    </motion.div>
  );
});

/** Darkness, lantern light and mist over everything (but under the UI). */
export function HollowLight({
  hour,
  lightsOn,
  mist,
}: {
  hour: number;
  lightsOn: boolean;
  mist: boolean;
}) {
  const p = paletteAt(hour);
  // Painted scenes already carry their own night; only the code-drawn one needs extra shade.
  const painted = !!sceneImage('bg_far', 'night');
  const darkness = p.dark * (painted ? 0.12 : 0.32) + (lightsOn ? 0 : 0.42);
  return (
    <>
      <div
        className={styles.layer}
        aria-hidden="true"
        style={{
          background: lightsOn
            ? `radial-gradient(circle at ${(lanternGlowPoint().x / WORLD_W) * 100}% ${(lanternGlowPoint().y / WORLD_H) * 100}%, rgba(255,217,138,${0.12 * p.dark}) 0%, rgba(30,42,58,${darkness}) 45%)`
            : `rgba(18,26,40,${darkness})`,
          transition: 'background 1.2s ease',
          pointerEvents: 'none',
        }}
      />
      {mist && <div className={`${styles.layer} ${styles.mist}`} aria-hidden="true" />}
    </>
  );
}
