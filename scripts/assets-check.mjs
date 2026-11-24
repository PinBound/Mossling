#!/usr/bin/env node
// Lists missing art, and checks size and transparency of what's present (PNG or WebP).
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
const PROPS = ['food_dewberry_mash', 'food_mossbread', 'snack_honeydrop', 'spoon', 'medicine_vial', 'lantern_on', 'lantern_off', 'mushroom_stool', 'birthday_candle_mushroom', 'burrow', 'dropping', 'leaf_ball', 'lilypad', 'lilypad_glow', 'puddle', 'firefly', 'firefly_golden', 'snail', 'four_leaf_clover', 'memory_leaf'];
// Names the game also accepts.
const ALIASES = { 'props/firefly_golden': ['props/firefly_gold'], ...Object.fromEntries(TIMES.map((t) => [`scene/fg_near_${t}`, [`scene/fg_${t}`]])) };

const expected = [
  ...EGG.map((p) => ({ path: `pet/egg/${p}`, kind: 'pet' })),
  ...FORMS.flatMap((f) => POSES.map((p) => ({ path: `pet/${f}/${f}_${p}`, kind: 'pet' }))),
  ...LAYERS.flatMap((l) => TIMES.map((t) => ({ path: `scene/${l}_${t}`, kind: l === 'bg_far' ? 'opaque' : 'scene' }))),
  ...PROPS.map((p) => ({ path: `props/${p}`, kind: 'prop' })),
  { path: 'ui/device_shell', kind: 'prop' },
];

const locate = (base) => {
  for (const b of [base, ...(ALIASES[base] ?? [])])
    for (const ext of ['webp', 'png']) if (existsSync(join(ROOT, `${b}.${ext}`))) return `${b}.${ext}`;
  return null;
};

const missing = [];
let problems = 0;
let ok = 0;
const known = new Set();
for (const e of expected) {
  const found = locate(e.path);
  if (!found) {
    missing.push(e.path);
    continue;
  }
  known.add(found);
  const file = join(ROOT, found);
  const meta = await sharp(file).metadata();
  const issues = [];
  if (e.kind === 'pet' && (meta.width !== 1024 || meta.height !== 1024)) issues.push(`expected 1024×1024, got ${meta.width}×${meta.height}`);
  if ((e.kind === 'scene' || e.kind === 'opaque') && Math.abs(meta.width / meta.height - 16 / 9) > 0.02) issues.push(`expected 16:9, got ${meta.width}×${meta.height}`);
  if (e.kind !== 'opaque' && !meta.hasAlpha) issues.push('no alpha channel (needs transparency)');
  if (e.kind === 'pet' && meta.hasAlpha) {
    const { data, info } = await sharp(file).ensureAlpha().extractChannel('alpha').raw().toBuffer({ resolveWithObject: true });
    const corner = data[0] + data[info.width - 1] + data[(info.height - 1) * info.width];
    if (corner > 30) issues.push('corners are not transparent');
    let bottom = 0;
    for (let y = info.height - 1; y >= 0 && !bottom; y--) for (let x = 0; x < info.width; x += 4) if (data[y * info.width + x] > 128) { bottom = y; break; }
    if (Math.abs(bottom - 900) > 12) issues.push(`feet at y=${bottom}, expected ≈900`);
  }
  if (issues.length) {
    problems++;
    console.log(`✗ ${found}: ${issues.join('; ')}`);
  } else ok++;
}

const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const extra = walk(ROOT).filter((f) => /\.(png|webp)$/.test(f)).map((f) => relative(ROOT, f)).filter((f) => !known.has(f));
for (const f of extra) console.log(`? ${f}: not in the manifest (check the name)`);

const byGroup = {};
for (const m of missing) {
  const g = m.startsWith('pet/') ? m.split('/').slice(0, 2).join('/') : m.split('/')[0];
  (byGroup[g] ??= []).push(m.split('/').pop());
}
if (missing.length) {
  console.log('\nMissing (code placeholders used instead):');
  for (const [g, list] of Object.entries(byGroup)) console.log(`  ${g}: ${list.length === POSES.length ? 'all poses' : list.join(', ')}`);
}
console.log(`\n${ok} final · ${problems} with problems · ${missing.length} missing · ${expected.length} expected`);
process.exitCode = problems || extra.length ? 1 : 0;
