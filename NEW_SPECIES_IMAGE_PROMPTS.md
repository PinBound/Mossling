# New species: image generation pack

Companion to the Mossling image pack. Two new species that hatch in the Hollow alongside Mosslings: **Caplings** (mushroom folk) and **Ripplets** (pond folk). Each has an egg, a baby, a child, a teen and four adults (best, average and poor care, plus a secret form for perfect care), exactly like the Mossling.

**What changed from the first pack (lessons from the Mossling set):**
- **Every single image has its own complete prompt below.** The first pack gave the adults short "follow the patterns above" notes instead of a prompt per pose, and those 65 images were the ones that went missing. Nothing here depends on adapting a pattern.
- **Blinks are made by editing the idle**, not generated fresh. Two blinks didn't line up with their idles last time; editing guarantees only the eyes change.
- **Idle first, then use it as the reference for that form's other poses.** Starwick's idle drifted off-model last time because it was made separately from the rest.
- **Correct folder:** files go in `src/assets/img/pet/<form>/` (the first pack said `public/assets/img/`).
- **No new scenes or props are needed.** Both species live in the same Hollow and use the same food and props.
- The game only adds a species to the egg draw once **every** form has at least its idle image (and the egg its idle and crack images), so a half-finished species never appears in play. Anything else missing falls back to the code placeholder.

## How to use this pack (the order matters)

1. **Use the existing Mossling art as the style reference** in every prompt (for example `sprig_idle.png` and `lanternmoss_idle.png`), so the new species match the art already in the game.
2. **Make each form's turnaround sheet first** (the "SHEET" prompts). That locks the design. Sheets are for reference only and aren't uploaded.
3. **Make the form's `idle` next**, using the sheet as the character reference. Then use that `idle` as the reference for the form's other poses ("same character, same size, same position").
4. **Make `blink` by editing the `idle`** (or inpainting just the eyes).
5. **Check each image:** transparent background, 1024×1024, character centered, lowest point at y = 900. If one pose drifts off-model, regenerate it rather than accept it.
6. **Upload one form at a time** to its own folder (GitHub's web upload takes up to 100 files per batch). PNG is fine; it gets converted for the web.

## Global Style Block (paste at the start of EVERY prompt)

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes.
```

Then add the **species line** for the species you're working on (below), then the **form design**, then the **pose line**, then the **frame line**:

```text
Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

**Negative prompt (where your tool supports it):**

```text
text, letters, numbers, watermark, signature, logo, frame, border, background scenery, ground, cast shadow, multiple characters, extra limbs, extra eyes, realistic fungus or amphibian anatomy, slime, gore, photorealism, 3D render, harsh black outlines, horror, creepy, sharp teeth, cropped, cut off, blurry, low resolution, pokemon, digimon, tamagotchi, existing franchise character
```

**Format:** 1:1, 1024×1024 (or larger, then downscale), PNG, transparent background.

---

# Caplings

Caplings are the mushroom folk of the Hollow: soft, round little mushroom creatures that grow from a puffball spore pod.

**Capling species line** (add after the Global Style Block in every Capling prompt):

```text
Species signature: instead of a sprout, a mushroom cap sits on top of its head and is the emotional "tell" (it tilts, droops, lifts and its gills glow with its mood). Texture like soft suede and velvety mushroom skin. Palette: parchment cream #F6F0E1, mushroom red #D86B6B, bark brown #6B4F3A, soft violet, bioluminescent teal glow #7FE0D0, lantern gold #F2C76E.
```

## Spore Pod: Egg → `pet/sporepod/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Capling species line] Character turnaround sheet of a Spore Pod, the egg of a Capling: a soft round puffball pod about the size of a plum, creamy parchment color with tiny cocoa-brown freckles, a small frilly ruff at its base, and a faint warm golden glow inside that pulses like a heartbeat. Shown from the front, three-quarter and side, evenly spaced on a plain white background.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `sporepod_idle.png` | The egg standing upright, its soft inner glow calm and steady. |
| `sporepod_crack1.png` | The same egg with one thin crack near the top: soft seams in the puffball skin glowing gold, with tiny glowing spores drifting out, just beginning. |
| `sporepod_crack2.png` | The same egg with several branching cracks: soft seams in the puffball skin glowing gold, with tiny glowing spores drifting out, a tiny chip missing at the top. |
| `sporepod_crack3.png` | The same egg heavily cracked and about to burst: soft seams in the puffball skin glowing gold, with tiny glowing spores drifting out, pouring out brightly, a small piece of shell lifting off. |
| `sporepod_shell_back.png` | Only the bottom half of the broken shell, jagged top edge, seen from the front, empty, hollow inside glowing faintly. |
| `sporepod_shell_front.png` | Only the front jagged lip of the broken shell (a foreground layer that sits in front of the baby), same perspective as the back shell. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: instead of a sprout, a mushroom cap sits on top of its head and is the emotional "tell" (it tilts, droops, lifts and its gills glow with its mood). Texture like soft suede and velvety mushroom skin. Palette: parchment cream #F6F0E1, mushroom red #D86B6B, bark brown #6B4F3A, soft violet, bioluminescent teal glow #7FE0D0, lantern gold #F2C76E. The character is a Spore Pod, the egg of a Capling: a soft round puffball pod about the size of a plum, creamy parchment color with tiny cocoa-brown freckles, a small frilly ruff at its base, and a faint warm golden glow inside that pulses like a heartbeat. The egg standing upright, its soft inner glow calm and steady. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

## Puffkin: Baby → `pet/puffkin/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Capling species line] Character turnaround sheet of a Puffkin, the baby Capling: a perfectly round, soft cream puffball blob about the size of a grape, no arms or legs, a few tiny cocoa freckles, two huge glossy eyes, tiny smile, rosy cheeks, and a tiny tan button-mushroom cap perched on top of its head. Front, three-quarter, side and back views, evenly spaced on a plain white background.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `puffkin_idle.png` | Sitting still, looking straight at the viewer with a gentle closed-mouth smile, its button cap upright. |
| `puffkin_blink.png` | Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves. |
| `puffkin_happy.png` | Squished wide mid-bounce, eyes in joyful arcs, laughing, cap bouncing up, a few glowing spores puffing out. |
| `puffkin_sad.png` | Slightly flattened, eyes watery and glistening, a wobbly frown, its button cap drooping. |
| `puffkin_eat_open.png` | Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward. |
| `puffkin_eat_closed.png` | Cheeks puffed full, chewing happily, eyes closed contentedly. |
| `puffkin_sleep.png` | Flattened like a little cushion, eyes closed, a tiny spore puff floating up from its cap. |
| `puffkin_sick.png` | Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its button cap wilted. |
| `puffkin_refuse.png` | Refusing food: head turned away, eyes squeezed shut, mouth pressed tight, its button cap tilted away. |
| `puffkin_angry.png` | Just scolded and sulking: puffed up and pouting, cheeks red, little frown, its button cap stiff. |
| `puffkin_play.png` *(optional)* | Optional (babies can’t play games; the game uses idle instead). If you make it: bouncing playfully with sparkling eyes and an open grin. |
| `puffkin_call.png` | Calling for attention: bouncing up, eyes wide, mouth open calling out, its button cap bobbing urgently. |
| `puffkin_surprised.png` | Surprised: eyes very wide with small pupils, a little "o" mouth, body stretched tall, its button cap standing straight up. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: instead of a sprout, a mushroom cap sits on top of its head and is the emotional "tell" (it tilts, droops, lifts and its gills glow with its mood). Texture like soft suede and velvety mushroom skin. Palette: parchment cream #F6F0E1, mushroom red #D86B6B, bark brown #6B4F3A, soft violet, bioluminescent teal glow #7FE0D0, lantern gold #F2C76E. The character is a Puffkin, the baby Capling: a perfectly round, soft cream puffball blob about the size of a grape, no arms or legs, a few tiny cocoa freckles, two huge glossy eyes, tiny smile, rosy cheeks, and a tiny tan button-mushroom cap perched on top of its head. Sitting still, looking straight at the viewer with a gentle closed-mouth smile, its button cap upright. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

## Caplet: Child → `pet/caplet/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Capling species line] Character turnaround sheet of a Caplet, the child Capling: a pear-shaped cream stem body like a little mushroom stalk, a cream belly, two stubby round nub feet, and a big round red mushroom cap with white spots worn like an oversized hat, a thin frill of gills under the rim, big curious eyes, rosy cheeks. Front, three-quarter, side and back views, evenly spaced on a plain white background.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `caplet_idle.png` | Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its big cap upright. |
| `caplet_blink.png` | Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves. |
| `caplet_happy.png` | Jumping with both feet off the ground, eyes closed in joyful arcs, mouth open laughing, its big cap lifted high, a few sparkles. |
| `caplet_sad.png` | Slumped, eyes watery and glistening, a wobbly frown, its big cap drooping. |
| `caplet_eat_open.png` | Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward. |
| `caplet_eat_closed.png` | Cheeks puffed full, chewing happily, eyes closed contentedly. |
| `caplet_sleep.png` | Asleep, curled up small, eyes closed, mouth slightly open, its big cap drooping softly. No "Z" letters. |
| `caplet_sick.png` | Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its big cap wilted. |
| `caplet_refuse.png` | Head turned away, eyes shut, pulling the brim of its cap down over one eye. |
| `caplet_angry.png` | Just scolded and sulking: puffed up and pouting, cheeks red, little frown, its big cap stiff. |
| `caplet_play.png` | Mid-run toward the left, one foot lifted, holding the rim of its big cap with the wind lifting it, playful grin. |
| `caplet_call.png` | Calling for attention: hopping, eyes wide, mouth open calling out, its big cap bobbing urgently. |
| `caplet_surprised.png` | Surprised: eyes very wide with small pupils, a little "o" mouth, leaning back, its big cap standing straight up. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: instead of a sprout, a mushroom cap sits on top of its head and is the emotional "tell" (it tilts, droops, lifts and its gills glow with its mood). Texture like soft suede and velvety mushroom skin. Palette: parchment cream #F6F0E1, mushroom red #D86B6B, bark brown #6B4F3A, soft violet, bioluminescent teal glow #7FE0D0, lantern gold #F2C76E. The character is a Caplet, the child Capling: a pear-shaped cream stem body like a little mushroom stalk, a cream belly, two stubby round nub feet, and a big round red mushroom cap with white spots worn like an oversized hat, a thin frill of gills under the rim, big curious eyes, rosy cheeks. Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its big cap upright. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

## Glimcap: Teen → `pet/glimcap/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Capling species line] Character turnaround sheet of a Glimcap, the teen Capling: taller and slightly lanky cream stem body, longer legs, a plum-violet mushroom cap tilted to one side like a slouchy beanie, the gills under the cap glowing soft teal, freckles on its cheeks, slightly narrower eyes with attitude but still big and glossy. Moody teenage energy, but cute. Front, three-quarter, side and back views, evenly spaced on a plain white background.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `glimcap_idle.png` | Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its cap upright. |
| `glimcap_blink.png` | Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves. |
| `glimcap_happy.png` | A big grin it is trying to hide, eyes closed in arcs, its gills glowing brightly teal. |
| `glimcap_sad.png` | Sitting hugging its knees, cap pulled down low, gills dim. |
| `glimcap_eat_open.png` | Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward. |
| `glimcap_eat_closed.png` | Cheeks puffed full, chewing happily, eyes closed contentedly. |
| `glimcap_sleep.png` | Lying on its back, its cap tipped over its face like a hat, gills softly glowing. |
| `glimcap_sick.png` | Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its cap wilted. |
| `glimcap_refuse.png` | Refusing food: head turned away, eyes squeezed shut, mouth pressed tight, its cap tilted away. |
| `glimcap_angry.png` | Just scolded and sulking: puffed up and pouting, cheeks red, little frown, its cap stiff. |
| `glimcap_play.png` | Playful and excited, mid-leap, sparkling star-shaped eye highlights, open grin. |
| `glimcap_call.png` | Calling for attention: hopping, eyes wide, mouth open calling out, its cap bobbing urgently. |
| `glimcap_surprised.png` | Surprised: eyes very wide with small pupils, a little "o" mouth, leaning back, its cap standing straight up. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: instead of a sprout, a mushroom cap sits on top of its head and is the emotional "tell" (it tilts, droops, lifts and its gills glow with its mood). Texture like soft suede and velvety mushroom skin. Palette: parchment cream #F6F0E1, mushroom red #D86B6B, bark brown #6B4F3A, soft violet, bioluminescent teal glow #7FE0D0, lantern gold #F2C76E. The character is a Glimcap, the teen Capling: taller and slightly lanky cream stem body, longer legs, a plum-violet mushroom cap tilted to one side like a slouchy beanie, the gills under the cap glowing soft teal, freckles on its cheeks, slightly narrower eyes with attitude but still big and glossy. Moody teenage energy, but cute. Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its cap upright. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

## Moonmorel: Adult, best care → `pet/moonmorel/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Capling species line] Character turnaround sheet of a Moonmorel, the graceful adult Capling (best care): tall, slender pale lavender-cream body, a tall honeycomb-textured morel cap that glows soft gold from within like a paper lantern, a delicate frilled collar of gills around its neck, long elegant arms, serene kind eyes, and a single tiny firefly companion near its cap. Calm, wise, gentle. Front, three-quarter, side and back views, evenly spaced on a plain white background.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `moonmorel_idle.png` | Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its morel cap upright. |
| `moonmorel_blink.png` | Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves. |
| `moonmorel_happy.png` | Its morel cap glowing brightly, small floating light motes around it, a serene smile. |
| `moonmorel_sad.png` | Slumped, eyes watery and glistening, a wobbly frown, its morel cap drooping. |
| `moonmorel_eat_open.png` | Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward. |
| `moonmorel_eat_closed.png` | Cheeks puffed full, chewing happily, eyes closed contentedly. |
| `moonmorel_sleep.png` | Sitting tucked in with its eyes closed, cap glow dimmed to a soft ember, the firefly resting on the cap. |
| `moonmorel_sick.png` | Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its morel cap wilted. |
| `moonmorel_refuse.png` | Refusing food: head turned away, eyes squeezed shut, mouth pressed tight, its morel cap tilted away. |
| `moonmorel_angry.png` | Just scolded and sulking: puffed up and pouting, cheeks red, little frown, its morel cap stiff. |
| `moonmorel_play.png` | A graceful little spin on one foot, the firefly circling it. |
| `moonmorel_call.png` | Calling for attention: hopping, eyes wide, mouth open calling out, its morel cap bobbing urgently. |
| `moonmorel_surprised.png` | Surprised: eyes very wide with small pupils, a little "o" mouth, leaning back, its morel cap standing straight up. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: instead of a sprout, a mushroom cap sits on top of its head and is the emotional "tell" (it tilts, droops, lifts and its gills glow with its mood). Texture like soft suede and velvety mushroom skin. Palette: parchment cream #F6F0E1, mushroom red #D86B6B, bark brown #6B4F3A, soft violet, bioluminescent teal glow #7FE0D0, lantern gold #F2C76E. The character is a Moonmorel, the graceful adult Capling (best care): tall, slender pale lavender-cream body, a tall honeycomb-textured morel cap that glows soft gold from within like a paper lantern, a delicate frilled collar of gills around its neck, long elegant arms, serene kind eyes, and a single tiny firefly companion near its cap. Calm, wise, gentle. Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its morel cap upright. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

## Truffletum: Adult, average care → `pet/truffletum/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Capling species line] Character turnaround sheet of a Truffletum, the round adult Capling (average care): plump, sturdy and huggable cocoa-brown body with a big cream belly, a small knobbly dark-brown truffle cap on its head, short chunky legs, round cheerful eyes, big rosy cheeks. A cheerful food-lover. Front, three-quarter, side and back views, evenly spaced on a plain white background.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `truffletum_idle.png` | Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its truffle cap upright. |
| `truffletum_blink.png` | Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves. |
| `truffletum_happy.png` | Jumping with both feet off the ground, eyes closed in joyful arcs, mouth open laughing, its truffle cap lifted high, a few sparkles. |
| `truffletum_sad.png` | Slumped, eyes watery and glistening, a wobbly frown, its truffle cap drooping. |
| `truffletum_eat_open.png` | Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward. |
| `truffletum_eat_closed.png` | Blissfully chewing, hugging its round belly, eyes closed, cheeks stuffed. |
| `truffletum_sleep.png` | Curled into a round ball, its cap tucked down, snoring softly. |
| `truffletum_sick.png` | Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its truffle cap wilted. |
| `truffletum_refuse.png` | Looking genuinely betrayed by the food, lip wobbling, cap tilted back. |
| `truffletum_angry.png` | Just scolded and sulking: puffed up and pouting, cheeks red, little frown, its truffle cap stiff. |
| `truffletum_play.png` | Playful and excited, mid-leap, sparkling star-shaped eye highlights, open grin. |
| `truffletum_call.png` | Calling for attention: hopping, eyes wide, mouth open calling out, its truffle cap bobbing urgently. |
| `truffletum_surprised.png` | Surprised: eyes very wide with small pupils, a little "o" mouth, leaning back, its truffle cap standing straight up. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: instead of a sprout, a mushroom cap sits on top of its head and is the emotional "tell" (it tilts, droops, lifts and its gills glow with its mood). Texture like soft suede and velvety mushroom skin. Palette: parchment cream #F6F0E1, mushroom red #D86B6B, bark brown #6B4F3A, soft violet, bioluminescent teal glow #7FE0D0, lantern gold #F2C76E. The character is a Truffletum, the round adult Capling (average care): plump, sturdy and huggable cocoa-brown body with a big cream belly, a small knobbly dark-brown truffle cap on its head, short chunky legs, round cheerful eyes, big rosy cheeks. A cheerful food-lover. Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its truffle cap upright. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

## Mudpuff: Adult, poor care → `pet/mudpuff/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Capling species line] Character turnaround sheet of a Mudpuff, the scruffy adult Capling (poor care): a squat, dusty grey-brown puffball body with a slightly crusty, cracked texture, a crooked bent cap, half-lidded unimpressed eyes that are still big and glossy, and little puffs of dust around it. Sardonic and independent, secretly sweet. Lovable, never gross or scary. Front, three-quarter, side and back views, evenly spaced on a plain white background.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `mudpuff_idle.png` | Standing squat and unimpressed, half-lidded eyes, a tiny dust puff by its foot. |
| `mudpuff_blink.png` | Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves. |
| `mudpuff_happy.png` | A reluctant, wobbly, very sweet smile with a deep blush, its bent cap lifting a little. |
| `mudpuff_sad.png` | Slumped, eyes watery and glistening, a wobbly frown, its bent cap drooping. |
| `mudpuff_eat_open.png` | Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward. |
| `mudpuff_eat_closed.png` | Cheeks puffed full, chewing happily, eyes closed contentedly. |
| `mudpuff_sleep.png` | Asleep, curled up small, eyes closed, mouth slightly open, its bent cap drooping softly. No "Z" letters. |
| `mudpuff_sick.png` | Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its bent cap wilted. |
| `mudpuff_refuse.png` | Refusing food: head turned away, eyes squeezed shut, mouth pressed tight, its bent cap tilted away. |
| `mudpuff_angry.png` | A grumpy sulk with its body turned away, a dust cloud puffing out of its cap. |
| `mudpuff_play.png` | A lazy pose, puffing a small round cloud of spore dust and watching it float. |
| `mudpuff_call.png` | Calling for attention: hopping, eyes wide, mouth open calling out, its bent cap bobbing urgently. |
| `mudpuff_surprised.png` | Surprised: eyes very wide with small pupils, a little "o" mouth, leaning back, its bent cap standing straight up. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: instead of a sprout, a mushroom cap sits on top of its head and is the emotional "tell" (it tilts, droops, lifts and its gills glow with its mood). Texture like soft suede and velvety mushroom skin. Palette: parchment cream #F6F0E1, mushroom red #D86B6B, bark brown #6B4F3A, soft violet, bioluminescent teal glow #7FE0D0, lantern gold #F2C76E. The character is a Mudpuff, the scruffy adult Capling (poor care): a squat, dusty grey-brown puffball body with a slightly crusty, cracked texture, a crooked bent cap, half-lidded unimpressed eyes that are still big and glossy, and little puffs of dust around it. Sardonic and independent, secretly sweet. Lovable, never gross or scary. Standing squat and unimpressed, half-lidded eyes, a tiny dust puff by its foot. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

## Auroracap: Secret adult, perfect care → `pet/auroracap/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Capling species line] Character turnaround sheet of an Auroracap, the rare secret adult Capling (perfect care): a slender, softly translucent pearly stem body, a wide umbrella mushroom cap with an iridescent aurora gradient (mint, periwinkle, pink and gold) that shimmers, glowing gills underneath, tiny glowing spores drifting around it like snow, starry-bright eyes. It floats gently above the ground. Mystical, calm, rare and precious. Front, three-quarter, side and back views, evenly spaced on a plain white background. It floats above the ground in every view.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `auroracap_idle.png` | Floating calmly, looking straight at the viewer with a gentle closed-mouth smile, its aurora cap upright. |
| `auroracap_blink.png` | Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves. |
| `auroracap_happy.png` | Its cap shimmering brightly through every aurora color, glowing spores swirling around it. |
| `auroracap_sad.png` | Its cap colors faded and dim, drooping low. |
| `auroracap_eat_open.png` | Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward. |
| `auroracap_eat_closed.png` | Cheeks puffed full, chewing happily, eyes closed contentedly. |
| `auroracap_sleep.png` | Floating curled up under its own cap like an umbrella, gills glowing faintly. |
| `auroracap_sick.png` | Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its aurora cap wilted. |
| `auroracap_refuse.png` | Refusing food: head turned away, eyes squeezed shut, mouth pressed tight, its aurora cap tilted away. |
| `auroracap_angry.png` | Just scolded and sulking: puffed up and pouting, cheeks red, little frown, its aurora cap stiff. |
| `auroracap_play.png` | Playful and excited, doing a little loop in the air, sparkling star-shaped eye highlights, open grin. |
| `auroracap_call.png` | Calling for attention: rising up, eyes wide, mouth open calling out, its aurora cap bobbing urgently. |
| `auroracap_surprised.png` | Surprised: eyes very wide with small pupils, a little "o" mouth, leaning back, its aurora cap standing straight up. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: instead of a sprout, a mushroom cap sits on top of its head and is the emotional "tell" (it tilts, droops, lifts and its gills glow with its mood). Texture like soft suede and velvety mushroom skin. Palette: parchment cream #F6F0E1, mushroom red #D86B6B, bark brown #6B4F3A, soft violet, bioluminescent teal glow #7FE0D0, lantern gold #F2C76E. The character is an Auroracap, the rare secret adult Capling (perfect care): a slender, softly translucent pearly stem body, a wide umbrella mushroom cap with an iridescent aurora gradient (mint, periwinkle, pink and gold) that shimmers, glowing gills underneath, tiny glowing spores drifting around it like snow, starry-bright eyes. It floats gently above the ground. Mystical, calm, rare and precious. Floating calmly, looking straight at the viewer with a gentle closed-mouth smile, its aurora cap upright. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

# Ripplets

Ripplets are the pond folk of the Hollow: small, glossy little newt-and-tadpole creatures that hatch from a pond pearl.

**Ripplet species line** (add after the Global Style Block in every Ripplet prompt):

```text
Species signature: a plant from the pond sits on top of its head and is the emotional "tell" (a lily leaf, a reed or a flower; it tilts, droops, lifts and sparkles with its mood). Texture like smooth, softly glossy skin with a gentle dewy sheen, never slimy. Palette: pond teal #5FA3A0, dew mint #CFE8D5, lily green #7FB35F, lotus pink #F3B6C8, pearl white, moon gold #F2C76E.
```

## Pond Pearl: Egg → `pet/pondpearl/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Ripplet species line] Character turnaround sheet of a Pond Pearl, the egg of a Ripplet: a round, softly translucent teal jelly orb like a giant dewdrop, a small swirl of light glowing inside it, a pearly sheen, and a tiny lily-leaf collar wrapped around its base. Shown from the front, three-quarter and side, evenly spaced on a plain white background.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `pondpearl_idle.png` | The egg standing upright, its soft inner glow calm and steady. |
| `pondpearl_crack1.png` | The same egg with one thin crack near the top: glowing ripple-shaped cracks in the jelly, small bubbles rising out, just beginning. |
| `pondpearl_crack2.png` | The same egg with several branching cracks: glowing ripple-shaped cracks in the jelly, small bubbles rising out, a tiny chip missing at the top. |
| `pondpearl_crack3.png` | The same egg heavily cracked and about to burst: glowing ripple-shaped cracks in the jelly, small bubbles rising out, pouring out brightly, a small piece of shell lifting off. |
| `pondpearl_shell_back.png` | Only the bottom half of the broken shell, jagged top edge, seen from the front, empty, hollow inside glowing faintly. |
| `pondpearl_shell_front.png` | Only the front jagged lip of the broken shell (a foreground layer that sits in front of the baby), same perspective as the back shell. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: a plant from the pond sits on top of its head and is the emotional "tell" (a lily leaf, a reed or a flower; it tilts, droops, lifts and sparkles with its mood). Texture like smooth, softly glossy skin with a gentle dewy sheen, never slimy. Palette: pond teal #5FA3A0, dew mint #CFE8D5, lily green #7FB35F, lotus pink #F3B6C8, pearl white, moon gold #F2C76E. The character is a Pond Pearl, the egg of a Ripplet: a round, softly translucent teal jelly orb like a giant dewdrop, a small swirl of light glowing inside it, a pearly sheen, and a tiny lily-leaf collar wrapped around its base. The egg standing upright, its soft inner glow calm and steady. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

## Wiggle: Baby → `pet/wiggle/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Ripplet species line] Character turnaround sheet of a Wiggle, the baby Ripplet: a round, glossy teal tadpole-like blob about the size of a grape, no arms or legs, a short curly tail, two huge glossy eyes, tiny smile, rosy cheeks, and a tiny round lily leaf sitting on top of its head. Front, three-quarter, side and back views, evenly spaced on a plain white background.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `wiggle_idle.png` | Sitting still, looking straight at the viewer with a gentle closed-mouth smile, its lily leaf upright. |
| `wiggle_blink.png` | Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves. |
| `wiggle_happy.png` | Squished wide mid-wiggle, tail curled up, eyes in joyful arcs, laughing, tiny bubbles around it. |
| `wiggle_sad.png` | Slightly flattened, eyes watery and glistening, a wobbly frown, its lily leaf drooping. |
| `wiggle_eat_open.png` | Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward. |
| `wiggle_eat_closed.png` | Cheeks puffed full, chewing happily, eyes closed contentedly. |
| `wiggle_sleep.png` | Curled around its own tail like a little snail, eyes closed, one bubble at its nose. |
| `wiggle_sick.png` | Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its lily leaf wilted. |
| `wiggle_refuse.png` | Refusing food: head turned away, eyes squeezed shut, mouth pressed tight, its lily leaf tilted away. |
| `wiggle_angry.png` | Just scolded and sulking: puffed up and pouting, cheeks red, little frown, its lily leaf stiff. |
| `wiggle_play.png` *(optional)* | Optional (babies can’t play games; the game uses idle instead). If you make it: bouncing playfully with sparkling eyes and an open grin. |
| `wiggle_call.png` | Calling for attention: bouncing up, eyes wide, mouth open calling out, its lily leaf bobbing urgently. |
| `wiggle_surprised.png` | Surprised: eyes very wide with small pupils, a little "o" mouth, body stretched tall, its lily leaf standing straight up. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: a plant from the pond sits on top of its head and is the emotional "tell" (a lily leaf, a reed or a flower; it tilts, droops, lifts and sparkles with its mood). Texture like smooth, softly glossy skin with a gentle dewy sheen, never slimy. Palette: pond teal #5FA3A0, dew mint #CFE8D5, lily green #7FB35F, lotus pink #F3B6C8, pearl white, moon gold #F2C76E. The character is a Wiggle, the baby Ripplet: a round, glossy teal tadpole-like blob about the size of a grape, no arms or legs, a short curly tail, two huge glossy eyes, tiny smile, rosy cheeks, and a tiny round lily leaf sitting on top of its head. Sitting still, looking straight at the viewer with a gentle closed-mouth smile, its lily leaf upright. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

## Splashlet: Child → `pet/splashlet/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Ripplet species line] Character turnaround sheet of a Splashlet, the child Ripplet: a round, glossy mint-green little newt-frog with a pale cream belly, short stubby legs, a short tail, a round lily-leaf cap on its head with a single dewdrop resting on it, big curious eyes, rosy cheeks. Curious, splashy, playful. Front, three-quarter, side and back views, evenly spaced on a plain white background.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `splashlet_idle.png` | Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its lily leaf upright. |
| `splashlet_blink.png` | Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves. |
| `splashlet_happy.png` | Jumping with both feet off the ground, eyes closed in joyful arcs, mouth open laughing, its lily leaf lifted high, a few sparkles. |
| `splashlet_sad.png` | Slumped, eyes watery and glistening, a wobbly frown, its lily leaf drooping. |
| `splashlet_eat_open.png` | Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward. |
| `splashlet_eat_closed.png` | Cheeks puffed full, chewing happily, eyes closed contentedly. |
| `splashlet_sleep.png` | Asleep, curled up small, eyes closed, mouth slightly open, its lily leaf drooping softly. No "Z" letters. |
| `splashlet_sick.png` | Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its lily leaf wilted. |
| `splashlet_refuse.png` | Head turned away, eyes shut, cheeks puffed, the dewdrop sliding off its lily leaf. |
| `splashlet_angry.png` | Just scolded and sulking: puffed up and pouting, cheeks red, little frown, its lily leaf stiff. |
| `splashlet_play.png` | Mid-hop toward the left with a splash of droplets, tail flicking, playful grin. |
| `splashlet_call.png` | Calling for attention: hopping, eyes wide, mouth open calling out, its lily leaf bobbing urgently. |
| `splashlet_surprised.png` | Surprised: eyes very wide with small pupils, a little "o" mouth, leaning back, its lily leaf standing straight up. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: a plant from the pond sits on top of its head and is the emotional "tell" (a lily leaf, a reed or a flower; it tilts, droops, lifts and sparkles with its mood). Texture like smooth, softly glossy skin with a gentle dewy sheen, never slimy. Palette: pond teal #5FA3A0, dew mint #CFE8D5, lily green #7FB35F, lotus pink #F3B6C8, pearl white, moon gold #F2C76E. The character is a Splashlet, the child Ripplet: a round, glossy mint-green little newt-frog with a pale cream belly, short stubby legs, a short tail, a round lily-leaf cap on its head with a single dewdrop resting on it, big curious eyes, rosy cheeks. Curious, splashy, playful. Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its lily leaf upright. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

## Reedling: Teen → `pet/reedling/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Ripplet species line] Character turnaround sheet of a Reedling, the teen Ripplet: taller and lankier teal-green newt, frilly fin-shaped ears on both sides of its head, a long tail, longer legs, a single cattail reed growing from the top of its head, slightly narrower eyes with attitude but still big and glossy. Moody teenage energy, but cute. Front, three-quarter, side and back views, evenly spaced on a plain white background.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `reedling_idle.png` | Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its reed upright. |
| `reedling_blink.png` | Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves. |
| `reedling_happy.png` | A grin it is trying to hide, ear-fins fanned wide, its reed standing tall. |
| `reedling_sad.png` | Slumped, eyes watery and glistening, a wobbly frown, its reed drooping. |
| `reedling_eat_open.png` | Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward. |
| `reedling_eat_closed.png` | Cheeks puffed full, chewing happily, eyes closed contentedly. |
| `reedling_sleep.png` | Lying on its belly with its tail curled around it, reed bent over. |
| `reedling_sick.png` | Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its reed wilted. |
| `reedling_refuse.png` | Refusing food: head turned away, eyes squeezed shut, mouth pressed tight, its reed tilted away. |
| `reedling_angry.png` | Glaring with its ear-fins flared out stiffly, tail lashing. |
| `reedling_play.png` | Playful and excited, mid-leap, sparkling star-shaped eye highlights, open grin. |
| `reedling_call.png` | Calling for attention: hopping, eyes wide, mouth open calling out, its reed bobbing urgently. |
| `reedling_surprised.png` | Surprised: eyes very wide with small pupils, a little "o" mouth, leaning back, its reed standing straight up. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: a plant from the pond sits on top of its head and is the emotional "tell" (a lily leaf, a reed or a flower; it tilts, droops, lifts and sparkles with its mood). Texture like smooth, softly glossy skin with a gentle dewy sheen, never slimy. Palette: pond teal #5FA3A0, dew mint #CFE8D5, lily green #7FB35F, lotus pink #F3B6C8, pearl white, moon gold #F2C76E. The character is a Reedling, the teen Ripplet: taller and lankier teal-green newt, frilly fin-shaped ears on both sides of its head, a long tail, longer legs, a single cattail reed growing from the top of its head, slightly narrower eyes with attitude but still big and glossy. Moody teenage energy, but cute. Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its reed upright. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

## Lotusong: Adult, best care → `pet/lotusong/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Ripplet species line] Character turnaround sheet of a Lotusong, the graceful adult Ripplet (best care): an elegant pale mint body with soft pink blush, long flowing translucent fin-veils trailing from its arms and tail like a betta fish, a softly glowing pink lotus blossom on its head, serene kind eyes. It sings softly. Calm, wise, gentle. Front, three-quarter, side and back views, evenly spaced on a plain white background.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `lotusong_idle.png` | Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its lotus upright. |
| `lotusong_blink.png` | Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves. |
| `lotusong_happy.png` | Singing with its eyes closed, tiny glowing musical ripples around it, lotus fully open. |
| `lotusong_sad.png` | Slumped, eyes watery and glistening, a wobbly frown, its lotus drooping. |
| `lotusong_eat_open.png` | Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward. |
| `lotusong_eat_closed.png` | Cheeks puffed full, chewing happily, eyes closed contentedly. |
| `lotusong_sleep.png` | Wrapped in its own flowing veils like a blanket, lotus petals closed. |
| `lotusong_sick.png` | Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its lotus wilted. |
| `lotusong_refuse.png` | Refusing food: head turned away, eyes squeezed shut, mouth pressed tight, its lotus tilted away. |
| `lotusong_angry.png` | Just scolded and sulking: puffed up and pouting, cheeks red, little frown, its lotus stiff. |
| `lotusong_play.png` | A graceful twirl, its veils swirling in a circle. |
| `lotusong_call.png` | Calling for attention: hopping, eyes wide, mouth open calling out, its lotus bobbing urgently. |
| `lotusong_surprised.png` | Surprised: eyes very wide with small pupils, a little "o" mouth, leaning back, its lotus standing straight up. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: a plant from the pond sits on top of its head and is the emotional "tell" (a lily leaf, a reed or a flower; it tilts, droops, lifts and sparkles with its mood). Texture like smooth, softly glossy skin with a gentle dewy sheen, never slimy. Palette: pond teal #5FA3A0, dew mint #CFE8D5, lily green #7FB35F, lotus pink #F3B6C8, pearl white, moon gold #F2C76E. The character is a Lotusong, the graceful adult Ripplet (best care): an elegant pale mint body with soft pink blush, long flowing translucent fin-veils trailing from its arms and tail like a betta fish, a softly glowing pink lotus blossom on its head, serene kind eyes. It sings softly. Calm, wise, gentle. Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its lotus upright. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

## Bogbelly: Adult, average care → `pet/bogbelly/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Ripplet species line] Character turnaround sheet of a Bogbelly, the round adult Ripplet (average care): a big, round, glossy green frog-like body with a soft yellow belly, short chunky legs, a wide happy mouth, round cheerful eyes, big rosy cheeks, and a tiny lily-leaf hat. A cheerful food-lover. Front, three-quarter, side and back views, evenly spaced on a plain white background.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `bogbelly_idle.png` | Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its lily-leaf hat upright. |
| `bogbelly_blink.png` | Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves. |
| `bogbelly_happy.png` | Jumping with both feet off the ground, eyes closed in joyful arcs, mouth open laughing, its lily-leaf hat lifted high, a few sparkles. |
| `bogbelly_sad.png` | Slumped, eyes watery and glistening, a wobbly frown, its lily-leaf hat drooping. |
| `bogbelly_eat_open.png` | Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward. |
| `bogbelly_eat_closed.png` | Blissfully chewing with its cheeks puffed huge, hugging its round belly, eyes closed. |
| `bogbelly_sleep.png` | Sitting like a round lump with its eyes closed, a bubble growing and shrinking at its nose. |
| `bogbelly_sick.png` | Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its lily-leaf hat wilted. |
| `bogbelly_refuse.png` | Looking genuinely betrayed by the food, mouth turned down, lily hat slipping. |
| `bogbelly_angry.png` | Just scolded and sulking: puffed up and pouting, cheeks red, little frown, its lily-leaf hat stiff. |
| `bogbelly_play.png` | Playful and excited, mid-leap, sparkling star-shaped eye highlights, open grin. |
| `bogbelly_call.png` | Calling for attention: hopping, eyes wide, mouth open calling out, its lily-leaf hat bobbing urgently. |
| `bogbelly_surprised.png` | Surprised: eyes very wide with small pupils, a little "o" mouth, leaning back, its lily-leaf hat standing straight up. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: a plant from the pond sits on top of its head and is the emotional "tell" (a lily leaf, a reed or a flower; it tilts, droops, lifts and sparkles with its mood). Texture like smooth, softly glossy skin with a gentle dewy sheen, never slimy. Palette: pond teal #5FA3A0, dew mint #CFE8D5, lily green #7FB35F, lotus pink #F3B6C8, pearl white, moon gold #F2C76E. The character is a Bogbelly, the round adult Ripplet (average care): a big, round, glossy green frog-like body with a soft yellow belly, short chunky legs, a wide happy mouth, round cheerful eyes, big rosy cheeks, and a tiny lily-leaf hat. A cheerful food-lover. Standing relaxed, looking straight at the viewer with a gentle closed-mouth smile, its lily-leaf hat upright. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

## Muckbottom: Adult, poor care → `pet/muckbottom/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Ripplet species line] Character turnaround sheet of a Muckbottom, the scruffy adult Ripplet (poor care): a squat, murky olive-brown newt speckled with little bright green duckweed dots, droopy posture, a soggy reed bent over on its head, half-lidded unimpressed eyes that are still big and glossy, a drip of pond water on its chin. Sardonic and independent, secretly sweet. Lovable, never gross or scary. Front, three-quarter, side and back views, evenly spaced on a plain white background.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `muckbottom_idle.png` | Sitting slumped and unimpressed, half-lidded eyes, its soggy reed flopped over. |
| `muckbottom_blink.png` | Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves. |
| `muckbottom_happy.png` | A reluctant, wobbly, very sweet smile with a deep blush, its reed perking up just a little. |
| `muckbottom_sad.png` | Slumped, eyes watery and glistening, a wobbly frown, its soggy reed drooping. |
| `muckbottom_eat_open.png` | Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward. |
| `muckbottom_eat_closed.png` | Cheeks puffed full, chewing happily, eyes closed contentedly. |
| `muckbottom_sleep.png` | Asleep, curled up small, eyes closed, mouth slightly open, its soggy reed drooping softly. No "Z" letters. |
| `muckbottom_sick.png` | Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its soggy reed wilted. |
| `muckbottom_refuse.png` | Refusing food: head turned away, eyes squeezed shut, mouth pressed tight, its soggy reed tilted away. |
| `muckbottom_angry.png` | A grumpy sulk with its back turned, glancing over its shoulder. |
| `muckbottom_play.png` | A lazy pose, blowing a single big bubble and watching it. |
| `muckbottom_call.png` | Calling for attention: hopping, eyes wide, mouth open calling out, its soggy reed bobbing urgently. |
| `muckbottom_surprised.png` | Surprised: eyes very wide with small pupils, a little "o" mouth, leaning back, its soggy reed standing straight up. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: a plant from the pond sits on top of its head and is the emotional "tell" (a lily leaf, a reed or a flower; it tilts, droops, lifts and sparkles with its mood). Texture like smooth, softly glossy skin with a gentle dewy sheen, never slimy. Palette: pond teal #5FA3A0, dew mint #CFE8D5, lily green #7FB35F, lotus pink #F3B6C8, pearl white, moon gold #F2C76E. The character is a Muckbottom, the scruffy adult Ripplet (poor care): a squat, murky olive-brown newt speckled with little bright green duckweed dots, droopy posture, a soggy reed bent over on its head, half-lidded unimpressed eyes that are still big and glossy, a drip of pond water on its chin. Sardonic and independent, secretly sweet. Lovable, never gross or scary. Sitting slumped and unimpressed, half-lidded eyes, its soggy reed flopped over. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

## Moonripple: Secret adult, perfect care → `pet/moonripple/`

**SHEET (reference only, not uploaded)**

```text
[Global Style Block] [Ripplet species line] Character turnaround sheet of a Moonripple, the rare secret adult Ripplet (perfect care): a sleek, softly glowing pearly-white translucent body with soft koi-orange patches, long flowing ribbon fins that drift as if underwater, and a small glowing crescent moon floating just above its head, gentle rings of light rippling around it, starry-bright eyes. It floats gently above the ground. Mystical, calm, rare and precious. Front, three-quarter, side and back views, evenly spaced on a plain white background. It floats above the ground in every view.
```

| File | Prompt (after Global Style Block + species line + this form’s design; attach the references) |
|---|---|
| `moonripple_idle.png` | Floating calmly, looking straight at the viewer with a gentle closed-mouth smile, its crescent moon upright. |
| `moonripple_blink.png` | Make this by EDITING the finished idle image: identical to idle in every way (body, pose, size, position, colors), with only the eyes changed to gently closed soft curves. |
| `moonripple_happy.png` | Its body glowing brighter, the crescent moon shining, light ripples spreading out. |
| `moonripple_sad.png` | Its glow dimmed, the crescent moon fading, fins drooping. |
| `moonripple_eat_open.png` | Mouth wide open eagerly as if about to take a big bite, eyes sparkling, leaning forward. |
| `moonripple_eat_closed.png` | Cheeks puffed full, chewing happily, eyes closed contentedly. |
| `moonripple_sleep.png` | Floating curled up with its fins wrapped around it, the crescent moon resting just above, dimmed. |
| `moonripple_sick.png` | Unwell, a pale greyish tint, half-closed teary eyes, a small sweat drop, shivering, its crescent moon wilted. |
| `moonripple_refuse.png` | Refusing food: head turned away, eyes squeezed shut, mouth pressed tight, its crescent moon tilted away. |
| `moonripple_angry.png` | Just scolded and sulking: puffed up and pouting, cheeks red, little frown, its crescent moon stiff. |
| `moonripple_play.png` | Playful and excited, doing a little loop in the air, sparkling star-shaped eye highlights, open grin. |
| `moonripple_call.png` | Calling for attention: rising up, eyes wide, mouth open calling out, its crescent moon bobbing urgently. |
| `moonripple_surprised.png` | Surprised: eyes very wide with small pupils, a little "o" mouth, leaning back, its crescent moon standing straight up. |

**Full prompt, ready to paste (idle example; swap in each pose line above):**

```text
Soft modern storybook illustration of an original cute creature, in the spirit of cozy indie game art, matching the existing Mossling art set. Rounded, chubby, appealing silhouette. Gentle painterly shading with soft gradients and fine natural texture. Colored line work only (outlines a darker shade of the local color, never pure black). Large glossy dark-brown eyes with two white highlights each, small simple mouth, soft rosy cheek dots. Warm soft lighting from the upper left, a gentle rim light. Clean, centered, full-body character, fully visible, not cropped, facing the viewer, on a fully transparent background, no ground, no cast shadow, no text, no watermark, no frame. High detail but readable as a simple silhouette at small sizes. Species signature: a plant from the pond sits on top of its head and is the emotional "tell" (a lily leaf, a reed or a flower; it tilts, droops, lifts and sparkles with its mood). Texture like smooth, softly glossy skin with a gentle dewy sheen, never slimy. Palette: pond teal #5FA3A0, dew mint #CFE8D5, lily green #7FB35F, lotus pink #F3B6C8, pearl white, moon gold #F2C76E. The character is a Moonripple, the rare secret adult Ripplet (perfect care): a sleek, softly glowing pearly-white translucent body with soft koi-orange patches, long flowing ribbon fins that drift as if underwater, and a small glowing crescent moon floating just above its head, gentle rings of light rippling around it, starry-bright eyes. It floats gently above the ground. Mystical, calm, rare and precious. Floating calmly, looking straight at the viewer with a gentle closed-mouth smile, its crescent moon upright. Square 1024×1024 PNG with a transparent background. The character is centered; its lowest point (feet, or the bottom of its body if it floats) sits at y = 900 px, 88% of the way down. Same scale and position in every pose of this form.
```

---

## Shot checklist

- **Caplings:** 8 sheets (reference only) + 96 images (egg 6, baby 12, child 13, teen 13, four adults × 13)
- **Ripplets:** 8 sheets (reference only) + 96 images (egg 6, baby 12, child 13, teen 13, four adults × 13)
- **Total to upload: 192 images** (plus 2 optional baby `play` poses).

Suggested batches (one upload each): one form per batch, 6 or 12 or 13 files. Start with the eggs and babies; the species only enters the egg draw once all eight of its forms have art, so finish one species before starting the next.
