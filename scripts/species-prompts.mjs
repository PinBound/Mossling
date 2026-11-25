#!/usr/bin/env node
// Writes NEW_SPECIES_IMAGE_PROMPTS.md: one explicit prompt for every image of the Capling and
// Ripplet species (no "follow the pattern" shortcuts, so nothing gets skipped).
// Run: node scripts/species-prompts.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const CATALOG = JSON.parse(readFileSync(new URL('../src/sim/species/catalog.json', import.meta.url), 'utf8')).species;
const POSES = ['idle', 'blink', 'happy', 'sad', 'eat_open', 'eat_closed', 'sleep', 'sick', 'refuse', 'angry', 'play', 'call', 'surprised'];

const BASE_STYLE =
  'Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes.';

const NEGATIVE =
  'text, letters, numbers, watermark, signature, logo, frame, border, background scenery, ground, cast shadow, multiple characters, extra limbs, extra eyes, realistic fungus or amphibian anatomy, slime, gore, photorealism, 3D render, harsh black outlines, horror, creepy, sharp teeth, cropped, cut off, blurry, low resolution, pokemon, digimon, tamagotchi, existing franchise character';

const FRAME =
  'Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.';

/** Species-level additions to the style block. */
const SPECIES = {
  capling: {
    tagline: 'Caplings are the mushroom folk of the Hollow: soft, round little mushroom creatures that grow from a puffball spore pod.',
    style:
      'Species signature: instead of a sprout, a mushroom cap sits on top of its head and is the emotional "tell" (it tilts, droops, lifts and its gills glow with its mood). Texture like soft suede and velvety mushroom skin. Palette: parchment cream #F6F0E1, mushroom red #D86B6B, bark brown #6B4F3A, soft violet, bioluminescent teal glow #7FE0D0, lantern gold #F2C76E.',
    tell: 'cap',
  },
  ripplet: {
    tagline: 'Ripplets are the pond folk of the Hollow: small, glossy little newt-and-tadpole creatures that hatch from a pond pearl.',
    style:
      'Species signature: a plant from the pond sits on top of its head and is the emotional "tell" (a lily leaf, a reed or a flower; it tilts, droops, lifts and sparkles with its mood). Texture like smooth, softly glossy skin with a gentle dewy sheen, never slimy. Palette: pond teal #5FA3A0, dew mint #CFE8D5, lily green #7FB35F, lotus pink #F3B6C8, pearl white, moon gold #F2C76E.',
    tell: 'head plant',
  },
};

/** Every form: a design (for its turnaround sheet) and pose lines. */
const FORMS = {
  // ---------------- Capling ----------------
  sporepod: {
    egg: true,
    design:
      'a Spore Pod, the egg of a Capling: a soft round puffball pod about the size of a plum, creamy parchment color with tiny cocoa-brown freckles, a small frilly ruff at its base, and a faint warm golden glow inside that pulses like a heartbeat',
    crack: 'soft seams in the puffball skin glowing gold, with tiny glowing spores drifting out',
  },
  puffkin: {
    design:
      'a Puffkin, the baby Capling: a perfectly round, soft cream puffball blob about the size of a grape, no arms or legs, a few tiny cocoa freckles, two huge glossy eyes, tiny smile, rosy cheeks, and a tiny tan button-mushroom cap perched on top of its head',
    limbs: 'none',
    notes: { sleep: 'Flattened like a little cushion, eyes closed, a tiny spore puff floating up from its cap.', happy: 'Squished wide mid-bounce, eyes in joyful arcs, laughing, cap bouncing up, a few glowing spores puffing out.' },
  },
  caplet: {
    design:
      'a Caplet, the child Capling: a pear-shaped cream stem body like a little mushroom stalk, a cream belly, two stubby round nub feet, and a big round red mushroom cap with white spots worn like an oversized hat, a thin frill of gills under the rim, big curious eyes, rosy cheeks',
    limbs: 'nub feet',
    notes: { play: 'Mid-run toward the left, one foot lifted, holding the rim of its big cap with the wind lifting it, playful grin.', refuse: 'Head turned away, eyes shut, pulling the brim of its cap down over one eye.' },
  },
  glimcap: {
    design:
      'a Glimcap, the teen Capling: taller and slightly lanky cream stem body, longer legs, a plum-violet mushroom cap tilted to one side like a slouchy beanie, the gills under the cap glowing soft teal, freckles on its cheeks, slightly narrower eyes with attitude but still big and glossy. Moody teenage energy, but cute',
    limbs: 'legs',
    notes: { happy: 'A big grin it is trying to hide, eyes closed in arcs, its gills glowing brightly teal.', sad: 'Sitting hugging its knees, cap pulled down low, gills dim.', sleep: 'Lying on its back, its cap tipped over its face like a hat, gills softly glowing.' },
  },
  moonmorel: {
    design:
      'a Moonmorel, the graceful adult Capling (best care): tall, slender pale lavender-cream body, a tall honeycomb-textured morel cap that glows soft gold from within like a paper lantern, a delicate frilled collar of gills around its neck, long elegant arms, serene kind eyes, and a single tiny firefly companion near its cap. Calm, wise, gentle',
    limbs: 'legs',
    notes: { happy: 'Its morel cap glowing brightly, small floating light motes around it, a serene smile.', sleep: 'Sitting tucked in with its eyes closed, cap glow dimmed to a soft ember, the firefly resting on the cap.', play: 'A graceful little spin on one foot, the firefly circling it.' },
  },
  truffletum: {
    design:
      'a Truffletum, the round adult Capling (average care): plump, sturdy and huggable cocoa-brown body with a big cream belly, a small knobbly dark-brown truffle cap on its head, short chunky legs, round cheerful eyes, big rosy cheeks. A cheerful food-lover',
    limbs: 'legs',
    notes: { eat_closed: 'Blissfully chewing, hugging its round belly, eyes closed, cheeks stuffed.', sleep: 'Curled into a round ball, its cap tucked down, snoring softly.', refuse: 'Looking genuinely betrayed by the food, lip wobbling, cap tilted back.' },
  },
  mudpuff: {
    design:
      'a Mudpuff, the scruffy adult Capling (poor care): a squat, dusty grey-brown puffball body with a slightly crusty, cracked texture, a crooked bent cap, half-lidded unimpressed eyes that are still big and glossy, and little puffs of dust around it. Sardonic and independent, secretly sweet. Lovable, never gross or scary',
    limbs: 'nub feet',
    notes: { idle: 'Standing squat and unimpressed, half-lidded eyes, a tiny dust puff by its foot.', happy: 'A reluctant, wobbly, very sweet smile with a deep blush, its bent cap lifting a little.', play: 'A lazy pose, puffing a small round cloud of spore dust and watching it float.', angry: 'A grumpy sulk with its body turned away, a dust cloud puffing out of its cap.' },
  },
  auroracap: {
    secret: true,
    design:
      'an Auroracap, the rare secret adult Capling (perfect care): a slender, softly translucent pearly stem body, a wide umbrella mushroom cap with an iridescent aurora gradient (mint, periwinkle, pink and gold) that shimmers, glowing gills underneath, tiny glowing spores drifting around it like snow, starry-bright eyes. It floats gently above the ground. Mystical, calm, rare and precious',
    limbs: 'floats',
    notes: { happy: 'Its cap shimmering brightly through every aurora color, glowing spores swirling around it.', sad: 'Its cap colors faded and dim, drooping low.', sleep: 'Floating curled up under its own cap like an umbrella, gills glowing faintly.' },
  },
  // ---------------- Ripplet ----------------
  pondpearl: {
    egg: true,
    design:
      'a Pond Pearl, the egg of a Ripplet: a round, softly translucent teal jelly orb like a giant dewdrop, a small swirl of light glowing inside it, a pearly sheen, and a tiny lily-leaf collar wrapped around its base',
    crack: 'glowing ripple-shaped cracks in the jelly, small bubbles rising out',
  },
  wiggle: {
    design:
      'a Wiggle, the baby Ripplet: a round, glossy teal tadpole-like blob about the size of a grape, no arms or legs, a short curly tail, two huge glossy eyes, tiny smile, rosy cheeks, and a tiny round lily leaf sitting on top of its head',
    limbs: 'none',
    notes: { happy: 'Squished wide mid-wiggle, tail curled up, eyes in joyful arcs, laughing, tiny bubbles around it.', sleep: 'Curled around its own tail like a little snail, eyes closed, one bubble at its nose.' },
  },
  splashlet: {
    design:
      'a Splashlet, the child Ripplet: a round, glossy mint-green little newt-frog with a pale cream belly, short stubby legs, a short tail, a round lily-leaf cap on its head with a single dewdrop resting on it, big curious eyes, rosy cheeks. Curious, splashy, playful',
    limbs: 'legs',
    notes: { play: 'Mid-hop toward the left with a splash of droplets, tail flicking, playful grin.', refuse: 'Head turned away, eyes shut, cheeks puffed, the dewdrop sliding off its lily leaf.' },
  },
  reedling: {
    design:
      'a Reedling, the teen Ripplet: taller and lankier teal-green newt, frilly fin-shaped ears on both sides of its head, a long tail, longer legs, a single cattail reed growing from the top of its head, slightly narrower eyes with attitude but still big and glossy. Moody teenage energy, but cute',
    limbs: 'legs',
    notes: { happy: 'A grin it is trying to hide, ear-fins fanned wide, its reed standing tall.', sleep: 'Lying on its belly with its tail curled around it, reed bent over.', angry: 'Glaring with its ear-fins flared out stiffly, tail lashing.' },
  },
  lotusong: {
    design:
      'a Lotusong, the graceful adult Ripplet (best care): an elegant pale mint body with soft pink blush, long flowing translucent fin-veils trailing from its arms and tail like a betta fish, a softly glowing pink lotus blossom on its head, serene kind eyes. It sings softly. Calm, wise, gentle',
    limbs: 'legs',
    notes: { happy: 'Singing with its eyes closed, tiny glowing musical ripples around it, lotus fully open.', sleep: 'Wrapped in its own flowing veils like a blanket, lotus petals closed.', play: 'A graceful twirl, its veils swirling in a circle.' },
  },
  bogbelly: {
    design:
      'a Bogbelly, the round adult Ripplet (average care): a big, round, glossy green frog-like body with a soft yellow belly, short chunky legs, a wide happy mouth, round cheerful eyes, big rosy cheeks, and a tiny lily-leaf hat. A cheerful food-lover',
    limbs: 'legs',
    notes: { eat_closed: 'Blissfully chewing with its cheeks puffed huge, hugging its round belly, eyes closed.', sleep: 'Sitting like a round lump with its eyes closed, a bubble growing and shrinking at its nose.', refuse: 'Looking genuinely betrayed by the food, mouth turned down, lily hat slipping.' },
  },
  muckbottom: {
    design:
      'a Muckbottom, the scruffy adult Ripplet (poor care): a squat, murky olive-brown newt speckled with little bright green duckweed dots, droopy posture, a soggy reed bent over on its head, half-lidded unimpressed eyes that are still big and glossy, a drip of pond water on its chin. Sardonic and independent, secretly sweet. Lovable, never gross or scary',
    limbs: 'legs',
    notes: { idle: 'Sitting slumped and unimpressed, half-lidded eyes, its soggy reed flopped over.', happy: 'A reluctant, wobbly, very sweet smile with a deep blush, its reed perking up just a little.', play: 'A lazy pose, blowing a single big bubble and watching it.', angry: 'A grumpy sulk with its back turned, glancing over its shoulder.' },
  },
  moonripple: {
    secret: true,
    design:
      'a Moonripple, the rare secret adult Ripplet (perfect care): a sleek, softly glowing pearly-white translucent body with soft koi-orange patches, long flowing ribbon fins that drift as if underwater, and a small glowing crescent moon floating just above its head, gentle rings of light rippling around it, starry-bright eyes. It floats gently above the ground. Mystical, calm, rare and precious',
    limbs: 'floats',
    notes: { happy: 'Its body glowing brighter, the crescent moon shining, light ripples spreading out.', sad: 'Its glow dimmed, the crescent moon fading, fins drooping.', sleep: 'Floating curled up with its fins wrapped around it, the crescent moon resting just above, dimmed.' },
  },
};

/** Default pose lines; {tell} becomes "cap" / "lily leaf" etc. */
function poseLine(form, f, pose, tell) {
  if (f.notes?.[pose]) return f.notes[pose];
  const floats = f.limbs === 'floats';
  const noLimbs = f.limbs === 'none';
  switch (pose) {
    case 'idle':
      return `${floats ? 'Floating calmly' : noLimbs ? 'Sitting still' : 'Standing relaxed'}, looking straight at the viewer with a gentle closed-mouth smile, its ${tell} upright.`;
    case 'blink':
      return 'Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves.';
    case 'happy':
      return `${noLimbs ? 'Squished wide mid-bounce' : floats ? 'Rising up joyfully' : 'Jumping with both feet off the ground'}, eyes closed in joyful arcs, mouth open laughing, its ${tell} lifted high, a few sparkles.`;
    case 'sad':
      return `${noLimbs ? 'Slightly flattened' : 'Slumped'}, eyes watery and glistening, a wobbly frown, its ${tell} drooping.`;
    case 'eat_open':
      return 'Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward.';
    case 'eat_closed':
      return 'Cheeks puffed full, chewing happily, eyes closed contentedly.';
    case 'sleep':
      return `Asleep, ${floats ? 'floating low and curled up' : 'curled up small'}, eyes closed, mouth slightly open, its ${tell} drooping softly. No "Z" letters.`;
    case 'sick':
      return `Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its ${tell} wilted.`;
    case 'refuse':
      return `Refusing food: head turned away, eyes squeezed shut, mouth pressed tight, its ${tell} tilted away.`;
    case 'angry':
      return `Just scolded and sulking: puffed up and pouting, cheeks red, little frown, its ${tell} stiff.`;
    case 'play':
      return f.limbs === 'none'
        ? 'Optional (babies can’t play games; the game uses idle instead). If you make it: bouncing playfully with sparkling eyes and an open grin.'
        : `Playful and excited, ${floats ? 'doing a little loop in the air' : 'mid-leap'}, sparkling star-shaped eye highlights, open grin.`;
    case 'call':
      return `Calling for attention: ${noLimbs ? 'bouncing up' : floats ? 'rising up' : 'hopping'}, eyes wide, mouth open calling out, its ${tell} bobbing urgently.`;
    case 'surprised':
      return `Surprised: eyes very wide with small pupils, a little "o" mouth, ${noLimbs ? 'body stretched tall' : 'leaning back'}, its ${tell} standing straight up.`;
  }
  return '';
}

const TELL = { puffkin: 'button cap', caplet: 'big cap', glimcap: 'cap', moonmorel: 'morel cap', truffletum: 'truffle cap', mudpuff: 'bent cap', auroracap: 'aurora cap', wiggle: 'lily leaf', splashlet: 'lily leaf', reedling: 'reed', lotusong: 'lotus', bogbelly: 'lily-leaf hat', muckbottom: 'soggy reed', moonripple: 'crescent moon' };

const block = (t) => '```text\n' + t + '\n```\n';
let n = 0;
let md = `# New species: image generation pack

Companion to the Mossling image pack. Two new species that hatch in the Hollow alongside Mosslings: **Caplings** (mushroom folk) and **Ripplets** (pond folk). Each has an egg, a baby, a child, a teen and four adults (best, average and poor care, plus a secret form for perfect care), exactly like the Mossling.

**What changed from the first pack (lessons from the Mossling set):**
- **Every single image has its own complete prompt below.** The first pack gave the adults short "follow the patterns above" notes instead of a prompt per pose, and those 65 images were the ones that went missing. Nothing here depends on adapting a pattern.
- **Blinks are made by editing the idle**, not generated fresh. Two blinks didn't line up with their idles last time; editing guarantees only the eyes change.
- **Idle first, then use it as the reference for that form's other poses.** Starwick's idle drifted off-model last time because it was made separately from the rest.
- **Correct folder:** files go in \`src/assets/img/pet/<form>/\` (the first pack said \`public/assets/img/\`).
- **No new scenes or props are needed.** Both species live in the same Hollow and use the same food and props.
- The game only adds a species to the egg draw once **every** form has at least its idle image (and the egg its idle and crack images), so a half-finished species never appears in play. Anything else missing falls back to the code placeholder.

## How to use this pack (the order matters)

1. **Use the existing Mossling art as the style reference** in every prompt (for example \`sprig_idle.png\` and \`lanternmoss_idle.png\`), so the new species match the art already in the game.
2. **Make each form's turnaround sheet first** (the "SHEET" prompts). That locks the design. Sheets are for reference only and aren't uploaded.
3. **Make the form's \`idle\` next**, using the sheet as the character reference. Then use that \`idle\` as the reference for the form's other poses ("same character, same size, same position").
4. **Make \`blink\` by editing the \`idle\`** (or inpainting just the eyes).
5. **Check each image:** transparent background, 1024×1024, character centered, lowest point at y = 900. If one pose drifts off-model, regenerate it rather than accept it.
6. **Upload one form at a time** to its own folder (GitHub's web upload takes up to 100 files per batch). PNG is fine; it gets converted for the web.

## Global Style Block (paste at the start of EVERY prompt)

${block(BASE_STYLE)}
Then add the **species line** for the species you're working on (below), then the **form design**, then the **pose line**, then the **frame line**:

${block(FRAME)}
**Negative prompt (where your tool supports it):**

${block(NEGATIVE)}
**Format:** 1:1, 1024×1024 (or larger, then downscale), PNG, transparent background.

---

`;

const checklist = [];
for (const sp of CATALOG.filter((s) => SPECIES[s.id])) {
  const S = SPECIES[sp.id];
  const forms = [sp.forms.egg, sp.forms.baby, sp.forms.child, sp.forms.teen, sp.adults.best, sp.adults.average, sp.adults.poor, sp.adults.secret];
  const label = { [sp.forms.egg]: 'Egg', [sp.forms.baby]: 'Baby', [sp.forms.child]: 'Child', [sp.forms.teen]: 'Teen', [sp.adults.best]: 'Adult, best care', [sp.adults.average]: 'Adult, average care', [sp.adults.poor]: 'Adult, poor care', [sp.adults.secret]: 'Secret adult, perfect care' };
  md += `# ${sp.displayName}s\n\n${S.tagline}\n\n**${sp.displayName} species line** (add after the Global Style Block in every ${sp.displayName} prompt):\n\n${block(S.style)}\n`;
  let count = 0;
  for (const form of forms) {
    const f = FORMS[form];
    const name = sp.names[form];
    md += `## ${name}: ${label[form]} → \`pet/${form}/\`\n\n`;
    md += `**SHEET (reference only, not uploaded)**\n\n${block(`[Global Style Block] [${sp.displayName} species line] Character turnaround sheet of ${f.design}. ${f.egg ? 'Shown from the front, three-quarter and side' : 'Front, three-quarter, side and back views'}, evenly spaced on a plain white background.${f.limbs === 'floats' ? ' It floats above the ground in every view.' : ''}`)}\n`;
    md += '| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |\n|---|---|\n';
    if (f.egg) {
      const eggLines = {
        idle: 'The egg standing upright, its soft inner glow calm and steady.',
        crack1: `The same egg with one thin crack near the top: ${f.crack}, just beginning.`,
        crack2: `The same egg with several branching cracks: ${f.crack}, a tiny chip missing at the top.`,
        crack3: `The same egg heavily cracked and about to burst: ${f.crack}, pouring out brightly, a small piece of shell lifting off.`,
        shell_back: 'Only the bottom half of the broken shell, jagged top edge, seen from the front, empty, hollow inside glowing faintly.',
        shell_front: 'Only the front jagged lip of the broken shell (a foreground layer that sits in front of the baby), same perspective as the back shell.',
      };
      for (const [k, line] of Object.entries(eggLines)) {
        md += `| \`${form}_${k}.png\` | ${line} |\n`;
        count++;
      }
    } else {
      for (const p of POSES) {
        const line = poseLine(form, f, p, TELL[form]);
        const optional = f.limbs === 'none' && p === 'play';
        md += `| \`${form}_${p}.png\`${optional ? ' *(optional)*' : ''} | ${line} |\n`;
        if (!optional) count++;
      }
    }
    md += '\n**Full prompt, ready to paste (idle example; swap in each pose line above):**\n\n';
    const first = f.egg ? 'The egg standing upright, its soft inner glow calm and steady.' : poseLine(form, f, 'idle', TELL[form]);
    md += block(`${BASE_STYLE} ${S.style} The character is ${f.design}. ${first} ${FRAME}`) + '\n';
  }
  n += count;
  checklist.push(`- **${sp.displayName}s:** 8 sheets (reference only) + ${count} images (egg 6, baby 12, child 13, teen 13, four adults × 13)`);
}

md += `---

## Shot checklist

${checklist.join('\n')}
- **Total to upload: ${n} images** (plus 2 optional baby \`play\` poses).

Suggested batches (one upload each): one form per batch, 6 or 12 or 13 files. Start with the eggs and babies; the species only enters the egg draw once all eight of its forms have art, so finish one species before starting the next.
`;

writeFileSync(new URL('../NEW_SPECIES_IMAGE_PROMPTS.md', import.meta.url), md);
console.log(`NEW_SPECIES_IMAGE_PROMPTS.md: ${n} images`);
