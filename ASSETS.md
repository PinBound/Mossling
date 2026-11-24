# ASSETS

Living checklist of every art file the game looks for. Paths are relative to `src/assets/img/`.
Any missing file falls back to the code-drawn placeholder, so the game is fully playable with this whole list at **placeholder**.

To add art: drop the PNG at the path below, run `npm run assets:check`, and flip its status here to **final**. No code changes are needed (the manifest globs the folder at build time).

Prompt IDs follow the scheme `PET-{FORM}-{POSE}`, `SCENE-{LAYER}-{TIME}` and `PROP-{NAME}`, to match the sections of `MOSSLING_IMAGE_PROMPTS.md` (that companion file wasn't included with the build spec, so these IDs are the suggested mapping).

Specs: pet poses are 1024×1024 transparent PNGs, character centred, feet on y = 900, same scale for every pose of a form. Scene layers are 900×1200 (3:4) or larger at the same ratio; `bg_far` may be opaque, `bg_mid` and `fg_near` need transparency. Props are transparent PNGs.

## Pet: Dewstone (egg)

| File | Status | Prompt ID |
|---|---|---|
| `pet/egg/egg_idle.png` | placeholder | PET-EGG-IDLE |
| `pet/egg/egg_crack1.png` | placeholder | PET-EGG-CRACK1 |
| `pet/egg/egg_crack2.png` | placeholder | PET-EGG-CRACK2 |
| `pet/egg/egg_crack3.png` | placeholder | PET-EGG-CRACK3 |
| `pet/egg/egg_shell_back.png` | placeholder | PET-EGG-SHELL-BACK |
| `pet/egg/egg_shell_front.png` | placeholder | PET-EGG-SHELL-FRONT |

## Pet: Dewdrop

| File | Status | Prompt ID |
|---|---|---|
| `pet/dewdrop/dewdrop_idle.png` | placeholder | PET-DEWDROP-IDLE |
| `pet/dewdrop/dewdrop_blink.png` | placeholder | PET-DEWDROP-BLINK |
| `pet/dewdrop/dewdrop_happy.png` | placeholder | PET-DEWDROP-HAPPY |
| `pet/dewdrop/dewdrop_sad.png` | placeholder | PET-DEWDROP-SAD |
| `pet/dewdrop/dewdrop_eat_open.png` | placeholder | PET-DEWDROP-EAT-OPEN |
| `pet/dewdrop/dewdrop_eat_closed.png` | placeholder | PET-DEWDROP-EAT-CLOSED |
| `pet/dewdrop/dewdrop_sleep.png` | placeholder | PET-DEWDROP-SLEEP |
| `pet/dewdrop/dewdrop_sick.png` | placeholder | PET-DEWDROP-SICK |
| `pet/dewdrop/dewdrop_refuse.png` | placeholder | PET-DEWDROP-REFUSE |
| `pet/dewdrop/dewdrop_angry.png` | placeholder | PET-DEWDROP-ANGRY |
| `pet/dewdrop/dewdrop_play.png` | placeholder | PET-DEWDROP-PLAY |
| `pet/dewdrop/dewdrop_call.png` | placeholder | PET-DEWDROP-CALL |
| `pet/dewdrop/dewdrop_surprised.png` | placeholder | PET-DEWDROP-SURPRISED |

## Pet: Sprig

| File | Status | Prompt ID |
|---|---|---|
| `pet/sprig/sprig_idle.png` | placeholder | PET-SPRIG-IDLE |
| `pet/sprig/sprig_blink.png` | placeholder | PET-SPRIG-BLINK |
| `pet/sprig/sprig_happy.png` | placeholder | PET-SPRIG-HAPPY |
| `pet/sprig/sprig_sad.png` | placeholder | PET-SPRIG-SAD |
| `pet/sprig/sprig_eat_open.png` | placeholder | PET-SPRIG-EAT-OPEN |
| `pet/sprig/sprig_eat_closed.png` | placeholder | PET-SPRIG-EAT-CLOSED |
| `pet/sprig/sprig_sleep.png` | placeholder | PET-SPRIG-SLEEP |
| `pet/sprig/sprig_sick.png` | placeholder | PET-SPRIG-SICK |
| `pet/sprig/sprig_refuse.png` | placeholder | PET-SPRIG-REFUSE |
| `pet/sprig/sprig_angry.png` | placeholder | PET-SPRIG-ANGRY |
| `pet/sprig/sprig_play.png` | placeholder | PET-SPRIG-PLAY |
| `pet/sprig/sprig_call.png` | placeholder | PET-SPRIG-CALL |
| `pet/sprig/sprig_surprised.png` | placeholder | PET-SPRIG-SURPRISED |

## Pet: Fernlet

| File | Status | Prompt ID |
|---|---|---|
| `pet/fernlet/fernlet_idle.png` | placeholder | PET-FERNLET-IDLE |
| `pet/fernlet/fernlet_blink.png` | placeholder | PET-FERNLET-BLINK |
| `pet/fernlet/fernlet_happy.png` | placeholder | PET-FERNLET-HAPPY |
| `pet/fernlet/fernlet_sad.png` | placeholder | PET-FERNLET-SAD |
| `pet/fernlet/fernlet_eat_open.png` | placeholder | PET-FERNLET-EAT-OPEN |
| `pet/fernlet/fernlet_eat_closed.png` | placeholder | PET-FERNLET-EAT-CLOSED |
| `pet/fernlet/fernlet_sleep.png` | placeholder | PET-FERNLET-SLEEP |
| `pet/fernlet/fernlet_sick.png` | placeholder | PET-FERNLET-SICK |
| `pet/fernlet/fernlet_refuse.png` | placeholder | PET-FERNLET-REFUSE |
| `pet/fernlet/fernlet_angry.png` | placeholder | PET-FERNLET-ANGRY |
| `pet/fernlet/fernlet_play.png` | placeholder | PET-FERNLET-PLAY |
| `pet/fernlet/fernlet_call.png` | placeholder | PET-FERNLET-CALL |
| `pet/fernlet/fernlet_surprised.png` | placeholder | PET-FERNLET-SURPRISED |

## Pet: Lanternmoss

| File | Status | Prompt ID |
|---|---|---|
| `pet/lanternmoss/lanternmoss_idle.png` | placeholder | PET-LANTERNMOSS-IDLE |
| `pet/lanternmoss/lanternmoss_blink.png` | placeholder | PET-LANTERNMOSS-BLINK |
| `pet/lanternmoss/lanternmoss_happy.png` | placeholder | PET-LANTERNMOSS-HAPPY |
| `pet/lanternmoss/lanternmoss_sad.png` | placeholder | PET-LANTERNMOSS-SAD |
| `pet/lanternmoss/lanternmoss_eat_open.png` | placeholder | PET-LANTERNMOSS-EAT-OPEN |
| `pet/lanternmoss/lanternmoss_eat_closed.png` | placeholder | PET-LANTERNMOSS-EAT-CLOSED |
| `pet/lanternmoss/lanternmoss_sleep.png` | placeholder | PET-LANTERNMOSS-SLEEP |
| `pet/lanternmoss/lanternmoss_sick.png` | placeholder | PET-LANTERNMOSS-SICK |
| `pet/lanternmoss/lanternmoss_refuse.png` | placeholder | PET-LANTERNMOSS-REFUSE |
| `pet/lanternmoss/lanternmoss_angry.png` | placeholder | PET-LANTERNMOSS-ANGRY |
| `pet/lanternmoss/lanternmoss_play.png` | placeholder | PET-LANTERNMOSS-PLAY |
| `pet/lanternmoss/lanternmoss_call.png` | placeholder | PET-LANTERNMOSS-CALL |
| `pet/lanternmoss/lanternmoss_surprised.png` | placeholder | PET-LANTERNMOSS-SURPRISED |

## Pet: Burrowbun

| File | Status | Prompt ID |
|---|---|---|
| `pet/burrowbun/burrowbun_idle.png` | placeholder | PET-BURROWBUN-IDLE |
| `pet/burrowbun/burrowbun_blink.png` | placeholder | PET-BURROWBUN-BLINK |
| `pet/burrowbun/burrowbun_happy.png` | placeholder | PET-BURROWBUN-HAPPY |
| `pet/burrowbun/burrowbun_sad.png` | placeholder | PET-BURROWBUN-SAD |
| `pet/burrowbun/burrowbun_eat_open.png` | placeholder | PET-BURROWBUN-EAT-OPEN |
| `pet/burrowbun/burrowbun_eat_closed.png` | placeholder | PET-BURROWBUN-EAT-CLOSED |
| `pet/burrowbun/burrowbun_sleep.png` | placeholder | PET-BURROWBUN-SLEEP |
| `pet/burrowbun/burrowbun_sick.png` | placeholder | PET-BURROWBUN-SICK |
| `pet/burrowbun/burrowbun_refuse.png` | placeholder | PET-BURROWBUN-REFUSE |
| `pet/burrowbun/burrowbun_angry.png` | placeholder | PET-BURROWBUN-ANGRY |
| `pet/burrowbun/burrowbun_play.png` | placeholder | PET-BURROWBUN-PLAY |
| `pet/burrowbun/burrowbun_call.png` | placeholder | PET-BURROWBUN-CALL |
| `pet/burrowbun/burrowbun_surprised.png` | placeholder | PET-BURROWBUN-SURPRISED |

## Pet: Mirefuzz

| File | Status | Prompt ID |
|---|---|---|
| `pet/mirefuzz/mirefuzz_idle.png` | placeholder | PET-MIREFUZZ-IDLE |
| `pet/mirefuzz/mirefuzz_blink.png` | placeholder | PET-MIREFUZZ-BLINK |
| `pet/mirefuzz/mirefuzz_happy.png` | placeholder | PET-MIREFUZZ-HAPPY |
| `pet/mirefuzz/mirefuzz_sad.png` | placeholder | PET-MIREFUZZ-SAD |
| `pet/mirefuzz/mirefuzz_eat_open.png` | placeholder | PET-MIREFUZZ-EAT-OPEN |
| `pet/mirefuzz/mirefuzz_eat_closed.png` | placeholder | PET-MIREFUZZ-EAT-CLOSED |
| `pet/mirefuzz/mirefuzz_sleep.png` | placeholder | PET-MIREFUZZ-SLEEP |
| `pet/mirefuzz/mirefuzz_sick.png` | placeholder | PET-MIREFUZZ-SICK |
| `pet/mirefuzz/mirefuzz_refuse.png` | placeholder | PET-MIREFUZZ-REFUSE |
| `pet/mirefuzz/mirefuzz_angry.png` | placeholder | PET-MIREFUZZ-ANGRY |
| `pet/mirefuzz/mirefuzz_play.png` | placeholder | PET-MIREFUZZ-PLAY |
| `pet/mirefuzz/mirefuzz_call.png` | placeholder | PET-MIREFUZZ-CALL |
| `pet/mirefuzz/mirefuzz_surprised.png` | placeholder | PET-MIREFUZZ-SURPRISED |

## Pet: Starwick

| File | Status | Prompt ID |
|---|---|---|
| `pet/starwick/starwick_idle.png` | placeholder | PET-STARWICK-IDLE |
| `pet/starwick/starwick_blink.png` | placeholder | PET-STARWICK-BLINK |
| `pet/starwick/starwick_happy.png` | placeholder | PET-STARWICK-HAPPY |
| `pet/starwick/starwick_sad.png` | placeholder | PET-STARWICK-SAD |
| `pet/starwick/starwick_eat_open.png` | placeholder | PET-STARWICK-EAT-OPEN |
| `pet/starwick/starwick_eat_closed.png` | placeholder | PET-STARWICK-EAT-CLOSED |
| `pet/starwick/starwick_sleep.png` | placeholder | PET-STARWICK-SLEEP |
| `pet/starwick/starwick_sick.png` | placeholder | PET-STARWICK-SICK |
| `pet/starwick/starwick_refuse.png` | placeholder | PET-STARWICK-REFUSE |
| `pet/starwick/starwick_angry.png` | placeholder | PET-STARWICK-ANGRY |
| `pet/starwick/starwick_play.png` | placeholder | PET-STARWICK-PLAY |
| `pet/starwick/starwick_call.png` | placeholder | PET-STARWICK-CALL |
| `pet/starwick/starwick_surprised.png` | placeholder | PET-STARWICK-SURPRISED |

## Scene: The Hollow

| File | Status | Prompt ID |
|---|---|---|
| `scene/bg_far_dawn.png` | placeholder | SCENE-BG-FAR-DAWN |
| `scene/bg_far_day.png` | placeholder | SCENE-BG-FAR-DAY |
| `scene/bg_far_dusk.png` | placeholder | SCENE-BG-FAR-DUSK |
| `scene/bg_far_night.png` | placeholder | SCENE-BG-FAR-NIGHT |
| `scene/bg_mid_dawn.png` | placeholder | SCENE-BG-MID-DAWN |
| `scene/bg_mid_day.png` | placeholder | SCENE-BG-MID-DAY |
| `scene/bg_mid_dusk.png` | placeholder | SCENE-BG-MID-DUSK |
| `scene/bg_mid_night.png` | placeholder | SCENE-BG-MID-NIGHT |
| `scene/fg_near_dawn.png` | placeholder | SCENE-FG-NEAR-DAWN |
| `scene/fg_near_day.png` | placeholder | SCENE-FG-NEAR-DAY |
| `scene/fg_near_dusk.png` | placeholder | SCENE-FG-NEAR-DUSK |
| `scene/fg_near_night.png` | placeholder | SCENE-FG-NEAR-NIGHT |

## Props

| File | Status | Prompt ID |
|---|---|---|
| `props/food_dewberry_mash.png` | placeholder | PROP-FOOD-DEWBERRY-MASH |
| `props/food_mossbread.png` | placeholder | PROP-FOOD-MOSSBREAD |
| `props/snack_honeydrop.png` | placeholder | PROP-SNACK-HONEYDROP |
| `props/spoon.png` | placeholder | PROP-SPOON |
| `props/medicine_vial.png` | placeholder | PROP-MEDICINE-VIAL |
| `props/lantern.png` | placeholder | PROP-LANTERN |
| `props/mushroom_stool.png` | placeholder | PROP-MUSHROOM-STOOL |
| `props/burrow.png` | placeholder | PROP-BURROW |
| `props/dropping.png` | placeholder | PROP-DROPPING |
| `props/leaf_ball.png` | placeholder | PROP-LEAF-BALL |
| `props/lilypad.png` | placeholder | PROP-LILYPAD |
| `props/firefly.png` | placeholder | PROP-FIREFLY |
| `props/firefly_golden.png` | placeholder | PROP-FIREFLY-GOLDEN |
| `props/snail.png` | placeholder | PROP-SNAIL |
| `props/four_leaf_clover.png` | placeholder | PROP-FOUR-LEAF-CLOVER |
| `props/memory_leaf.png` | placeholder | PROP-MEMORY-LEAF |

## UI icons (optional)

The action icons are hand-drawn SVG in `src/ui/Icons.tsx`. PNGs in `ui/` are optional and not required.
