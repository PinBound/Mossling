# ASSETS

Living checklist of every art file the game looks for. Paths are relative to `src/assets/img/`, without the extension: **.webp or .png both work** (WebP wins if both exist).
Anything missing falls back to the code-drawn placeholder, so the game runs with any subset.

**Progress: 129 of 130 final.**

## Adding art

1. Drop files at the paths below (PNG is fine). Variants `fg_{time}` (for `fg_near_{time}`) and `firefly_gold` are accepted.
2. `npm run assets:optimize` converts PNGs to web-sized WebP (scenes 1920 wide, props 384, pets 1024) and fixes those name variants. The full-size masters stay in git history.
3. `npm run assets:check` checks sizes, transparency and the feet line; `node scripts/assets-md.mjs` refreshes this file.

Specs: pet poses are 1024×1024 transparent, character centred, feet on y = 900, same scale for every pose of a form. Scenes are 16:9 to match the world layout (fern left, meadow centre, pond and burrow right); `bg_far` is opaque, `bg_mid` and `fg_near` are transparent. Props are transparent squares.

Prompt IDs follow `PET-{FORM}-{POSE}`, `SCENE-{LAYER}-{TIME}` and `PROP-{NAME}`.

## Pet: Dewstone (egg)

| File | Status | Prompt ID |
|---|---|---|
| `pet/egg/egg_idle` | **final** | PET-EGG-IDLE |
| `pet/egg/egg_crack1` | **final** | PET-EGG-CRACK1 |
| `pet/egg/egg_crack2` | **final** | PET-EGG-CRACK2 |
| `pet/egg/egg_crack3` | **final** | PET-EGG-CRACK3 |
| `pet/egg/egg_shell_back` | **final** | PET-EGG-SHELL-BACK |
| `pet/egg/egg_shell_front` | **final** | PET-EGG-SHELL-FRONT |

## Pet: Dewdrop

| File | Status | Prompt ID |
|---|---|---|
| `pet/dewdrop/dewdrop_idle` | **final** | PET-DEWDROP-IDLE |
| `pet/dewdrop/dewdrop_blink` | **final** | PET-DEWDROP-BLINK |
| `pet/dewdrop/dewdrop_happy` | **final** | PET-DEWDROP-HAPPY |
| `pet/dewdrop/dewdrop_sad` | **final** | PET-DEWDROP-SAD |
| `pet/dewdrop/dewdrop_eat_open` | **final** | PET-DEWDROP-EAT-OPEN |
| `pet/dewdrop/dewdrop_eat_closed` | **final** | PET-DEWDROP-EAT-CLOSED |
| `pet/dewdrop/dewdrop_sleep` | **final** | PET-DEWDROP-SLEEP |
| `pet/dewdrop/dewdrop_sick` | **final** | PET-DEWDROP-SICK |
| `pet/dewdrop/dewdrop_refuse` | **final** | PET-DEWDROP-REFUSE |
| `pet/dewdrop/dewdrop_angry` | **final** | PET-DEWDROP-ANGRY |
| `pet/dewdrop/dewdrop_play` | **final** | PET-DEWDROP-PLAY |
| `pet/dewdrop/dewdrop_call` | **final** | PET-DEWDROP-CALL |
| `pet/dewdrop/dewdrop_surprised` | **final** | PET-DEWDROP-SURPRISED |

## Pet: Sprig

| File | Status | Prompt ID |
|---|---|---|
| `pet/sprig/sprig_idle` | **final** | PET-SPRIG-IDLE |
| `pet/sprig/sprig_blink` | **final** | PET-SPRIG-BLINK |
| `pet/sprig/sprig_happy` | **final** | PET-SPRIG-HAPPY |
| `pet/sprig/sprig_sad` | **final** | PET-SPRIG-SAD |
| `pet/sprig/sprig_eat_open` | **final** | PET-SPRIG-EAT-OPEN |
| `pet/sprig/sprig_eat_closed` | **final** | PET-SPRIG-EAT-CLOSED |
| `pet/sprig/sprig_sleep` | **final** | PET-SPRIG-SLEEP |
| `pet/sprig/sprig_sick` | **final** | PET-SPRIG-SICK |
| `pet/sprig/sprig_refuse` | **final** | PET-SPRIG-REFUSE |
| `pet/sprig/sprig_angry` | **final** | PET-SPRIG-ANGRY |
| `pet/sprig/sprig_play` | **final** | PET-SPRIG-PLAY |
| `pet/sprig/sprig_call` | **final** | PET-SPRIG-CALL |
| `pet/sprig/sprig_surprised` | **final** | PET-SPRIG-SURPRISED |

## Pet: Fernlet

| File | Status | Prompt ID |
|---|---|---|
| `pet/fernlet/fernlet_idle` | **final** | PET-FERNLET-IDLE |
| `pet/fernlet/fernlet_blink` | **final** | PET-FERNLET-BLINK |
| `pet/fernlet/fernlet_happy` | **final** | PET-FERNLET-HAPPY |
| `pet/fernlet/fernlet_sad` | **final** | PET-FERNLET-SAD |
| `pet/fernlet/fernlet_eat_open` | **final** | PET-FERNLET-EAT-OPEN |
| `pet/fernlet/fernlet_eat_closed` | **final** | PET-FERNLET-EAT-CLOSED |
| `pet/fernlet/fernlet_sleep` | **final** | PET-FERNLET-SLEEP |
| `pet/fernlet/fernlet_sick` | **final** | PET-FERNLET-SICK |
| `pet/fernlet/fernlet_refuse` | **final** | PET-FERNLET-REFUSE |
| `pet/fernlet/fernlet_angry` | **final** | PET-FERNLET-ANGRY |
| `pet/fernlet/fernlet_play` | **final** | PET-FERNLET-PLAY |
| `pet/fernlet/fernlet_call` | **final** | PET-FERNLET-CALL |
| `pet/fernlet/fernlet_surprised` | **final** | PET-FERNLET-SURPRISED |

## Pet: Lanternmoss

| File | Status | Prompt ID |
|---|---|---|
| `pet/lanternmoss/lanternmoss_idle` | **final** | PET-LANTERNMOSS-IDLE |
| `pet/lanternmoss/lanternmoss_blink` | **final** | PET-LANTERNMOSS-BLINK |
| `pet/lanternmoss/lanternmoss_happy` | **final** | PET-LANTERNMOSS-HAPPY |
| `pet/lanternmoss/lanternmoss_sad` | **final** | PET-LANTERNMOSS-SAD |
| `pet/lanternmoss/lanternmoss_eat_open` | **final** | PET-LANTERNMOSS-EAT-OPEN |
| `pet/lanternmoss/lanternmoss_eat_closed` | **final** | PET-LANTERNMOSS-EAT-CLOSED |
| `pet/lanternmoss/lanternmoss_sleep` | **final** | PET-LANTERNMOSS-SLEEP |
| `pet/lanternmoss/lanternmoss_sick` | **final** | PET-LANTERNMOSS-SICK |
| `pet/lanternmoss/lanternmoss_refuse` | **final** | PET-LANTERNMOSS-REFUSE |
| `pet/lanternmoss/lanternmoss_angry` | **final** | PET-LANTERNMOSS-ANGRY |
| `pet/lanternmoss/lanternmoss_play` | **final** | PET-LANTERNMOSS-PLAY |
| `pet/lanternmoss/lanternmoss_call` | **final** | PET-LANTERNMOSS-CALL |
| `pet/lanternmoss/lanternmoss_surprised` | **final** | PET-LANTERNMOSS-SURPRISED |

## Pet: Burrowbun

| File | Status | Prompt ID |
|---|---|---|
| `pet/burrowbun/burrowbun_idle` | **final** | PET-BURROWBUN-IDLE |
| `pet/burrowbun/burrowbun_blink` | **final** | PET-BURROWBUN-BLINK |
| `pet/burrowbun/burrowbun_happy` | **final** | PET-BURROWBUN-HAPPY |
| `pet/burrowbun/burrowbun_sad` | **final** | PET-BURROWBUN-SAD |
| `pet/burrowbun/burrowbun_eat_open` | **final** | PET-BURROWBUN-EAT-OPEN |
| `pet/burrowbun/burrowbun_eat_closed` | **final** | PET-BURROWBUN-EAT-CLOSED |
| `pet/burrowbun/burrowbun_sleep` | **final** | PET-BURROWBUN-SLEEP |
| `pet/burrowbun/burrowbun_sick` | **final** | PET-BURROWBUN-SICK |
| `pet/burrowbun/burrowbun_refuse` | **final** | PET-BURROWBUN-REFUSE |
| `pet/burrowbun/burrowbun_angry` | **final** | PET-BURROWBUN-ANGRY |
| `pet/burrowbun/burrowbun_play` | **final** | PET-BURROWBUN-PLAY |
| `pet/burrowbun/burrowbun_call` | **final** | PET-BURROWBUN-CALL |
| `pet/burrowbun/burrowbun_surprised` | **final** | PET-BURROWBUN-SURPRISED |

## Pet: Mirefuzz

| File | Status | Prompt ID |
|---|---|---|
| `pet/mirefuzz/mirefuzz_idle` | **final** | PET-MIREFUZZ-IDLE |
| `pet/mirefuzz/mirefuzz_blink` | **final** | PET-MIREFUZZ-BLINK |
| `pet/mirefuzz/mirefuzz_happy` | **final** | PET-MIREFUZZ-HAPPY |
| `pet/mirefuzz/mirefuzz_sad` | **final** | PET-MIREFUZZ-SAD |
| `pet/mirefuzz/mirefuzz_eat_open` | **final** | PET-MIREFUZZ-EAT-OPEN |
| `pet/mirefuzz/mirefuzz_eat_closed` | **final** | PET-MIREFUZZ-EAT-CLOSED |
| `pet/mirefuzz/mirefuzz_sleep` | **final** | PET-MIREFUZZ-SLEEP |
| `pet/mirefuzz/mirefuzz_sick` | **final** | PET-MIREFUZZ-SICK |
| `pet/mirefuzz/mirefuzz_refuse` | **final** | PET-MIREFUZZ-REFUSE |
| `pet/mirefuzz/mirefuzz_angry` | **final** | PET-MIREFUZZ-ANGRY |
| `pet/mirefuzz/mirefuzz_play` | **final** | PET-MIREFUZZ-PLAY |
| `pet/mirefuzz/mirefuzz_call` | **final** | PET-MIREFUZZ-CALL |
| `pet/mirefuzz/mirefuzz_surprised` | **final** | PET-MIREFUZZ-SURPRISED |

## Pet: Starwick

| File | Status | Prompt ID |
|---|---|---|
| `pet/starwick/starwick_idle` | **final** | PET-STARWICK-IDLE |
| `pet/starwick/starwick_blink` | **final** | PET-STARWICK-BLINK |
| `pet/starwick/starwick_happy` | **final** | PET-STARWICK-HAPPY |
| `pet/starwick/starwick_sad` | **final** | PET-STARWICK-SAD |
| `pet/starwick/starwick_eat_open` | **final** | PET-STARWICK-EAT-OPEN |
| `pet/starwick/starwick_eat_closed` | **final** | PET-STARWICK-EAT-CLOSED |
| `pet/starwick/starwick_sleep` | **final** | PET-STARWICK-SLEEP |
| `pet/starwick/starwick_sick` | **final** | PET-STARWICK-SICK |
| `pet/starwick/starwick_refuse` | **final** | PET-STARWICK-REFUSE |
| `pet/starwick/starwick_angry` | **final** | PET-STARWICK-ANGRY |
| `pet/starwick/starwick_play` | **final** | PET-STARWICK-PLAY |
| `pet/starwick/starwick_call` | **final** | PET-STARWICK-CALL |
| `pet/starwick/starwick_surprised` | **final** | PET-STARWICK-SURPRISED |

## Scene: The Hollow (16:9)

| File | Status | Prompt ID |
|---|---|---|
| `scene/bg_far_dawn` | **final** | SCENE-BG-FAR-DAWN |
| `scene/bg_far_day` | **final** | SCENE-BG-FAR-DAY |
| `scene/bg_far_dusk` | **final** | SCENE-BG-FAR-DUSK |
| `scene/bg_far_night` | **final** | SCENE-BG-FAR-NIGHT |
| `scene/bg_mid_dawn` | **final** | SCENE-BG-MID-DAWN |
| `scene/bg_mid_day` | **final** | SCENE-BG-MID-DAY |
| `scene/bg_mid_dusk` | **final** | SCENE-BG-MID-DUSK |
| `scene/bg_mid_night` | **final** | SCENE-BG-MID-NIGHT |
| `scene/fg_near_dawn` | **final** | SCENE-FG-NEAR-DAWN |
| `scene/fg_near_day` | **final** | SCENE-FG-NEAR-DAY |
| `scene/fg_near_dusk` | **final** | SCENE-FG-NEAR-DUSK |
| `scene/fg_near_night` | **final** | SCENE-FG-NEAR-NIGHT |

## Props

| File | Status | Prompt ID | Used for |
|---|---|---|---|
| `props/food_dewberry_mash` | **final** | PROP-FOOD-DEWBERRY-MASH | Feed menu |
| `props/food_mossbread` | **final** | PROP-FOOD-MOSSBREAD | Feed menu |
| `props/snack_honeydrop` | **final** | PROP-SNACK-HONEYDROP | Feed menu, snack animation |
| `props/medicine_vial` | **final** | PROP-MEDICINE-VIAL | Medicine animation |
| `props/lantern_on` | **final** | PROP-LANTERN-ON | The Hollow (lantern lit) |
| `props/lantern_off` | **final** | PROP-LANTERN-OFF | The Hollow (lantern dark) |
| `props/mushroom_stool` | **final** | PROP-MUSHROOM-STOOL | The Hollow |
| `props/birthday_candle_mushroom` | **final** | PROP-BIRTHDAY-CANDLE-MUSHROOM | The Hollow on birthdays |
| `props/dropping` | **final** | PROP-DROPPING | Moss pellets |
| `props/lilypad` | **final** | PROP-LILYPAD | Lilypad Hop |
| `props/lilypad_glow` | **final** | PROP-LILYPAD-GLOW | Lilypad Hop (beat glow) |
| `props/firefly` | **final** | PROP-FIREFLY | Firefly Catch |
| `props/firefly_golden` | **final** | PROP-FIREFLY-GOLDEN | Firefly Catch (rare) |
| `props/memory_leaf` | **final** | PROP-MEMORY-LEAF | Journal: Memory Leaves |
| `props/puddle` | **final** | PROP-PUDDLE | Rain puddles in the meadow |
| `props/spoon` | **final** | PROP-SPOON | Feeding animation (optional) |
| `props/snail` | **final** | PROP-SNAIL | Rare visiting snail (optional) |
| `props/four_leaf_clover` | **final** | PROP-FOUR-LEAF-CLOVER | Journal treasure (optional) |
| `props/leaf_ball` | **final** | PROP-LEAF-BALL | Not used yet (optional) |
| `props/burrow` | placeholder | PROP-BURROW | Only for the code-drawn scene; painted bg_mid already has the burrow |

## UI

| File | Status | Prompt ID | Used for |
|---|---|---|---|
| `ui/device_shell` | **final** | UI-DEVICE-SHELL | Device Mode shell (screen opening 24.7–74% × 28–60.75%, buttons at 30/49.5/68.7% × 71–73%) |
| `art-source/app_icon.png` | **final** | UI-APP-ICON | PWA icons and favicon (`node scripts/make-icons.mjs`) |
