#!/usr/bin/env node
// Regenerates ASSETS.md from what's in src/assets/img. Run: node scripts/assets-md.mjs
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const ROOT = new URL('../src/assets/img/', import.meta.url).pathname;
const POSES = ['idle', 'blink', 'happy', 'sad', 'eat_open', 'eat_closed', 'sleep', 'sick', 'refuse', 'angry', 'play', 'call', 'surprised'];
const EGG = ['egg_idle', 'egg_crack1', 'egg_crack2', 'egg_crack3', 'egg_shell_back', 'egg_shell_front'];
const FORMS = ['dewdrop', 'sprig', 'fernlet', 'lanternmoss', 'burrowbun', 'mirefuzz', 'starwick'];
const L = ['bg_far', 'bg_mid', 'fg_near'];
const T = ['dawn', 'day', 'dusk', 'night'];
const P = {
  food_dewberry_mash: 'Feed menu', food_mossbread: 'Feed menu', snack_honeydrop: 'Feed menu, snack animation',
  medicine_vial: 'Medicine animation', lantern_on: 'The Hollow (lantern lit)', lantern_off: 'The Hollow (lantern dark)',
  mushroom_stool: 'The Hollow', birthday_candle_mushroom: 'The Hollow on birthdays', dropping: 'Moss pellets',
  lilypad: 'Lilypad Hop', lilypad_glow: 'Lilypad Hop (beat glow)', firefly: 'Firefly Catch', firefly_golden: 'Firefly Catch (rare)',
  memory_leaf: 'Journal: Memory Leaves', puddle: 'Rain puddles in the meadow', spoon: 'Feeding animation (optional)', snail: 'Rare visiting snail (optional)',
  four_leaf_clover: 'Journal treasure (optional)', leaf_ball: 'Not used yet (optional)', burrow: 'Only for the code-drawn scene; painted bg_mid already has the burrow',
};
const alias = { 'props/firefly_golden': 'props/firefly_gold' };
const has = (b) => ['webp', 'png'].some((e) => existsSync(join(ROOT, `${b}.${e}`)) || (alias[b] && existsSync(join(ROOT, `${alias[b]}.${e}`)))) || (b.startsWith('scene/fg_near_') && ['webp', 'png'].some((e) => existsSync(join(ROOT, `${b.replace('fg_near_', 'fg_')}.${e}`))));
const st = (b) => (has(b) ? '**final**' : 'placeholder');
const id = (s) => s.toUpperCase().replace(/_/g, '-');
let done = 0, total = 0;
const row = (b, pid, note = '') => { total++; if (has(b)) done++; return `| \`${b}\` | ${st(b)} | ${pid} |${note ? ` ${note} |` : ''}\n`; };
let body = '## Pet: Dewstone (egg)\n\n| File | Status | Prompt ID |\n|---|---|---|\n';
for (const p of EGG) body += row(`pet/egg/${p}`, `PET-EGG-${id(p.replace('egg_', ''))}`);
for (const f of FORMS) {
  body += `\n## Pet: ${f[0].toUpperCase() + f.slice(1)}\n\n| File | Status | Prompt ID |\n|---|---|---|\n`;
  for (const p of POSES) body += row(`pet/${f}/${f}_${p}`, `PET-${id(f)}-${id(p)}`);
}
body += '\n## Scene: The Hollow (16:9)\n\n| File | Status | Prompt ID |\n|---|---|---|\n';
for (const l of L) for (const t of T) body += row(`scene/${l}_${t}`, `SCENE-${id(l)}-${id(t)}`);
body += '\n## Props\n\n| File | Status | Prompt ID | Used for |\n|---|---|---|---|\n';
for (const [p, use] of Object.entries(P)) body += row(`props/${p}`, `PROP-${id(p)}`, use);
body += '\n## UI\n\n| File | Status | Prompt ID | Used for |\n|---|---|---|---|\n';
body += row('ui/device_shell', 'UI-DEVICE-SHELL', 'Device Mode shell (screen opening 24.7–74% × 28–60.75%, buttons at 30/49.5/68.7% × 71–73%)');
body += `| \`art-source/app_icon.png\` | ${existsSync(new URL('../art-source/app_icon.png', import.meta.url)) ? '**final**' : 'placeholder'} | UI-APP-ICON | PWA icons and favicon (\`node scripts/make-icons.mjs\`) |\n`;
const head = `# ASSETS

Living checklist of every art file the game looks for. Paths are relative to \`src/assets/img/\`, without the extension: **.webp or .png both work** (WebP wins if both exist).
Anything missing falls back to the code-drawn placeholder, so the game runs with any subset.

**Progress: ${done} of ${total} final.**

## Adding art

1. Drop files at the paths below (PNG is fine). Variants \`fg_{time}\` (for \`fg_near_{time}\`) and \`firefly_gold\` are accepted.
2. \`npm run assets:optimize\` converts PNGs to web-sized WebP (scenes 1920 wide, props 384, pets 1024) and fixes those name variants. The full-size masters stay in git history.
3. \`npm run assets:check\` checks sizes, transparency and the feet line; \`node scripts/assets-md.mjs\` refreshes this file.

Specs: pet poses are 1024×1024 transparent, character centred, feet on y = 900, same scale for every pose of a form. Scenes are 16:9 to match the world layout (fern left, meadow centre, pond and burrow right); \`bg_far\` is opaque, \`bg_mid\` and \`fg_near\` are transparent. Props are transparent squares.

Prompt IDs follow \`PET-{FORM}-{POSE}\`, \`SCENE-{LAYER}-{TIME}\` and \`PROP-{NAME}\`.

`;
writeFileSync(new URL('../ASSETS.md', import.meta.url), head + body);
console.log(`ASSETS.md: ${done}/${total} final`);
