#!/usr/bin/env node
// Lists missing art, and checks size and transparency of what's present.
// Usage: npm run assets:check
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('../src/assets/img/', import.meta.url).pathname;
const POSES = ['idle', 'blink', 'happy', 'sad', 'eat_open', 'eat_closed', 'sleep', 'sick', 'refuse', 'angry', 'play', 'call', 'surprised'];
const EGG = ['egg_idle', 'egg_crack1', 'egg_crack2', 'egg_crack3', 'egg_shell_back', 'egg_shell_front'];
const FORMS = ['dewdrop', 'sprig', 'fernlet', 'lanternmoss', 'burrowbun', 'mirefuzz', 'starwick'];
const LAYERS = ['bg_far', 'bg_mid', 'fg_near'];
const TIMES = ['dawn', 'day', 'dusk', 'night'];
const PROPS = ['food_dewberry_mash', 'food_mossbread', 'snack_honeydrop', 'spoon', 'medicine_vial', 'lantern', 'mushroom_stool', 'burrow', 'dropping', 'leaf_ball', 'lilypad', 'firefly', 'firefly_golden', 'snail', 'four_leaf_clover', 'memory_leaf'];

const expected = [
  ...EGG.map((p) => ({ path: `pet/egg/${p}.png`, kind: 'pet' })),
  ...FORMS.flatMap((f) => POSES.map((p) => ({ path: `pet/${f}/${f}_${p}.png`, kind: 'pet' }))),
  ...LAYERS.flatMap((l) => TIMES.map((t) => ({ path: `scene/${l}_${t}.png`, kind: l === 'bg_far' ? 'opaque' : 'scene' }))),
  ...PROPS.map((p) => ({ path: `props/${p}.png`, kind: 'prop' })),
];

let missing = 0;
let problems = 0;
let ok = 0;
for (const e of expected) {
  const file = join(ROOT, e.path);
  if (!existsSync(file)) {
    missing++;
    continue;
  }
  const meta = await sharp(file).metadata();
  const issues = [];
  if (e.kind === 'pet' && (meta.width !== 1024 || meta.height !== 1024)) issues.push(`expected 1024×1024, got ${meta.width}×${meta.height}`);
  if (e.kind !== 'opaque' && !meta.hasAlpha) issues.push('no alpha channel (needs transparency)');
  if (e.kind === 'pet' && meta.hasAlpha) {
    const { data, info } = await sharp(file).ensureAlpha().extractChannel('alpha').raw().toBuffer({ resolveWithObject: true });
    const corner = data[0] + data[info.width - 1] + data[(info.height - 1) * info.width];
    if (corner > 30) issues.push('corners are not transparent');
  }
  if (issues.length) {
    problems++;
    console.log(`✗ ${e.path}: ${issues.join('; ')}`);
  } else ok++;
}

// Files present but not expected (typos in names).
const known = new Set(expected.map((e) => e.path));
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const extra = walk(ROOT).filter((f) => f.endsWith('.png')).map((f) => relative(ROOT, f)).filter((f) => !known.has(f) && !f.startsWith('ui/'));
for (const f of extra) console.log(`? ${f}: not in the manifest (check the name)`);

console.log(`\n${ok} final · ${problems} with problems · ${missing} missing (placeholders in use) · ${expected.length} expected`);
if (missing) console.log('Missing files fall back to code placeholders; the app runs either way.');
process.exitCode = problems || extra.length ? 1 : 0;
