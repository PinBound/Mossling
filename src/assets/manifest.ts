/**
 * Asset manifest. Drop PNGs into src/assets/img/... following the naming convention and they're
 * picked up at build time — no code changes. Anything missing falls back to the code placeholders.
 *
 *   img/pet/{form}/{form}_{pose}.png     1024×1024, transparent, feet on y = 900
 *   img/scene/{layer}_{timeOfDay}.png    layer: bg_far | bg_mid | fg_near
 *   img/props/{prop}.png
 *   img/ui/{icon}.png
 */
import type { Form } from '../sim';
import type { TimeOfDay } from '../sim/clock';

const files = import.meta.glob('./img/**/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export type Pose =
  | 'idle'
  | 'blink'
  | 'happy'
  | 'sad'
  | 'eat_open'
  | 'eat_closed'
  | 'sleep'
  | 'sick'
  | 'refuse'
  | 'angry'
  | 'play'
  | 'call'
  | 'surprised';

export const POSES: readonly Pose[] = [
  'idle',
  'blink',
  'happy',
  'sad',
  'eat_open',
  'eat_closed',
  'sleep',
  'sick',
  'refuse',
  'angry',
  'play',
  'call',
  'surprised',
];

export type EggPose =
  'egg_idle' | 'egg_crack1' | 'egg_crack2' | 'egg_crack3' | 'egg_shell_back' | 'egg_shell_front';
export const EGG_POSES: readonly EggPose[] = [
  'egg_idle',
  'egg_crack1',
  'egg_crack2',
  'egg_crack3',
  'egg_shell_back',
  'egg_shell_front',
];

export type SceneLayer = 'bg_far' | 'bg_mid' | 'fg_near';
export const SCENE_LAYERS: readonly SceneLayer[] = ['bg_far', 'bg_mid', 'fg_near'];
export const TIMES: readonly TimeOfDay[] = ['dawn', 'day', 'dusk', 'night'];

export const PROPS = [
  'food_dewberry_mash',
  'food_mossbread',
  'snack_honeydrop',
  'spoon',
  'medicine_vial',
  'lantern',
  'mushroom_stool',
  'burrow',
  'dropping',
  'leaf_ball',
  'lilypad',
  'firefly',
  'firefly_golden',
  'snail',
  'four_leaf_clover',
  'memory_leaf',
] as const;
export type Prop = (typeof PROPS)[number];

/**
 * Per-form layout metadata: how big the form should read on stage relative to the others,
 * and where its feet sit in the 1024 box. Tune these when final art lands.
 */
export const FORM_META: Record<Form, { scale: number; anchorY: number; hover?: boolean }> = {
  egg: { scale: 0.62, anchorY: 900 },
  dewdrop: { scale: 0.6, anchorY: 900 },
  sprig: { scale: 0.78, anchorY: 900 },
  fernlet: { scale: 0.92, anchorY: 900 },
  lanternmoss: { scale: 1.05, anchorY: 900, hover: true },
  burrowbun: { scale: 1.0, anchorY: 900 },
  mirefuzz: { scale: 0.98, anchorY: 900 },
  starwick: { scale: 1.05, anchorY: 900, hover: true },
};

const find = (path: string): string | null => files[`./img/${path}`] ?? null;

export function petImage(form: Form, pose: Pose | EggPose): string | null {
  return find(`pet/${form}/${form === 'egg' ? pose : `${form}_${pose}`}.png`);
}

/** A form "has art" once its idle pose exists; other poses then fall back to idle. */
export function petPose(form: Form, pose: Pose): string | null {
  return petImage(form, pose) ?? (pose === 'blink' ? null : petImage(form, 'idle'));
}

export function sceneImage(layer: SceneLayer, tod: TimeOfDay): string | null {
  return find(`scene/${layer}_${tod}.png`);
}

export function propImage(prop: Prop): string | null {
  return find(`props/${prop}.png`);
}

export function uiImage(icon: string): string | null {
  return find(`ui/${icon}.png`);
}

/** Every expected file (relative to src/assets/img), for ASSETS.md and `npm run assets:check`. */
export function expectedFiles(): string[] {
  const out: string[] = [];
  for (const p of EGG_POSES) out.push(`pet/egg/${p}.png`);
  for (const f of [
    'dewdrop',
    'sprig',
    'fernlet',
    'lanternmoss',
    'burrowbun',
    'mirefuzz',
    'starwick',
  ])
    for (const p of POSES) out.push(`pet/${f}/${f}_${p}.png`);
  for (const l of SCENE_LAYERS) for (const t of TIMES) out.push(`scene/${l}_${t}.png`);
  for (const p of PROPS) out.push(`props/${p}.png`);
  return out;
}
