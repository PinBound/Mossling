# ASSETS

Living checklist of every art file the game looks for. Paths are relative to `src/assets/img/`, without the extension: **.webp or .png both work** (WebP wins if both exist).
Anything missing falls back to the code-drawn placeholder, so the game runs with any subset.

**Progress: 129 of 322 final** (Mossling: 97 of 97 · Capling: 0 of 96 · Ripplet: 0 of 96). A new species joins the egg draw once each of its forms has art.

## Adding art

1. Drop files at the paths below (PNG is fine). Variants `fg_{time}` (for `fg_near_{time}`) and `firefly_gold` are accepted.
2. `npm run assets:optimize` converts PNGs to web-sized WebP (scenes 1600 wide, props 384, pets 1024) and fixes those name variants. The full-size masters stay in git history.
3. `npm run assets:check` checks sizes, transparency and the feet line; `node scripts/assets-md.mjs` refreshes this file.

Specs: pet poses are 1024×1024 transparent, character centred, feet on y = 900, same scale for every pose of a form. Scenes are 16:9 to match the world layout (fern left, meadow centre, pond and burrow right); `bg_far` is opaque, `bg_mid` and `fg_near` are transparent. Props are transparent squares.

Prompt IDs follow `PET-{FORM}-{POSE}`, `SCENE-{LAYER}-{TIME}` and `PROP-{NAME}`.

## Mosslings

### Dewstone (egg)

| File | Status | Prompt ID |
|---|---|---|
| `pet/egg/egg_idle` | **final** | PET-EGG-IDLE |
| `pet/egg/egg_crack1` | **final** | PET-EGG-CRACK1 |
| `pet/egg/egg_crack2` | **final** | PET-EGG-CRACK2 |
| `pet/egg/egg_crack3` | **final** | PET-EGG-CRACK3 |
| `pet/egg/egg_shell_back` | **final** | PET-EGG-SHELL-BACK |
| `pet/egg/egg_shell_front` | **final** | PET-EGG-SHELL-FRONT |

### Dewdrop

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

### Sprig

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

### Fernlet

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

### Lanternmoss

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

### Burrowbun

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

### Mirefuzz

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

### Starwick

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

## Caplings

### Spore Pod (egg)

| File | Status | Prompt ID |
|---|---|---|
| `pet/sporepod/sporepod_idle` | placeholder | PET-SPOREPOD-IDLE |
| `pet/sporepod/sporepod_crack1` | placeholder | PET-SPOREPOD-CRACK1 |
| `pet/sporepod/sporepod_crack2` | placeholder | PET-SPOREPOD-CRACK2 |
| `pet/sporepod/sporepod_crack3` | placeholder | PET-SPOREPOD-CRACK3 |
| `pet/sporepod/sporepod_shell_back` | placeholder | PET-SPOREPOD-SHELL-BACK |
| `pet/sporepod/sporepod_shell_front` | placeholder | PET-SPOREPOD-SHELL-FRONT |

### Puffkin

| File | Status | Prompt ID |
|---|---|---|
| `pet/puffkin/puffkin_idle` | placeholder | PET-PUFFKIN-IDLE |
| `pet/puffkin/puffkin_blink` | placeholder | PET-PUFFKIN-BLINK |
| `pet/puffkin/puffkin_happy` | placeholder | PET-PUFFKIN-HAPPY |
| `pet/puffkin/puffkin_sad` | placeholder | PET-PUFFKIN-SAD |
| `pet/puffkin/puffkin_eat_open` | placeholder | PET-PUFFKIN-EAT-OPEN |
| `pet/puffkin/puffkin_eat_closed` | placeholder | PET-PUFFKIN-EAT-CLOSED |
| `pet/puffkin/puffkin_sleep` | placeholder | PET-PUFFKIN-SLEEP |
| `pet/puffkin/puffkin_sick` | placeholder | PET-PUFFKIN-SICK |
| `pet/puffkin/puffkin_refuse` | placeholder | PET-PUFFKIN-REFUSE |
| `pet/puffkin/puffkin_angry` | placeholder | PET-PUFFKIN-ANGRY |
| `pet/puffkin/puffkin_call` | placeholder | PET-PUFFKIN-CALL |
| `pet/puffkin/puffkin_surprised` | placeholder | PET-PUFFKIN-SURPRISED |

### Caplet

| File | Status | Prompt ID |
|---|---|---|
| `pet/caplet/caplet_idle` | placeholder | PET-CAPLET-IDLE |
| `pet/caplet/caplet_blink` | placeholder | PET-CAPLET-BLINK |
| `pet/caplet/caplet_happy` | placeholder | PET-CAPLET-HAPPY |
| `pet/caplet/caplet_sad` | placeholder | PET-CAPLET-SAD |
| `pet/caplet/caplet_eat_open` | placeholder | PET-CAPLET-EAT-OPEN |
| `pet/caplet/caplet_eat_closed` | placeholder | PET-CAPLET-EAT-CLOSED |
| `pet/caplet/caplet_sleep` | placeholder | PET-CAPLET-SLEEP |
| `pet/caplet/caplet_sick` | placeholder | PET-CAPLET-SICK |
| `pet/caplet/caplet_refuse` | placeholder | PET-CAPLET-REFUSE |
| `pet/caplet/caplet_angry` | placeholder | PET-CAPLET-ANGRY |
| `pet/caplet/caplet_play` | placeholder | PET-CAPLET-PLAY |
| `pet/caplet/caplet_call` | placeholder | PET-CAPLET-CALL |
| `pet/caplet/caplet_surprised` | placeholder | PET-CAPLET-SURPRISED |

### Glimcap

| File | Status | Prompt ID |
|---|---|---|
| `pet/glimcap/glimcap_idle` | placeholder | PET-GLIMCAP-IDLE |
| `pet/glimcap/glimcap_blink` | placeholder | PET-GLIMCAP-BLINK |
| `pet/glimcap/glimcap_happy` | placeholder | PET-GLIMCAP-HAPPY |
| `pet/glimcap/glimcap_sad` | placeholder | PET-GLIMCAP-SAD |
| `pet/glimcap/glimcap_eat_open` | placeholder | PET-GLIMCAP-EAT-OPEN |
| `pet/glimcap/glimcap_eat_closed` | placeholder | PET-GLIMCAP-EAT-CLOSED |
| `pet/glimcap/glimcap_sleep` | placeholder | PET-GLIMCAP-SLEEP |
| `pet/glimcap/glimcap_sick` | placeholder | PET-GLIMCAP-SICK |
| `pet/glimcap/glimcap_refuse` | placeholder | PET-GLIMCAP-REFUSE |
| `pet/glimcap/glimcap_angry` | placeholder | PET-GLIMCAP-ANGRY |
| `pet/glimcap/glimcap_play` | placeholder | PET-GLIMCAP-PLAY |
| `pet/glimcap/glimcap_call` | placeholder | PET-GLIMCAP-CALL |
| `pet/glimcap/glimcap_surprised` | placeholder | PET-GLIMCAP-SURPRISED |

### Moonmorel

| File | Status | Prompt ID |
|---|---|---|
| `pet/moonmorel/moonmorel_idle` | placeholder | PET-MOONMOREL-IDLE |
| `pet/moonmorel/moonmorel_blink` | placeholder | PET-MOONMOREL-BLINK |
| `pet/moonmorel/moonmorel_happy` | placeholder | PET-MOONMOREL-HAPPY |
| `pet/moonmorel/moonmorel_sad` | placeholder | PET-MOONMOREL-SAD |
| `pet/moonmorel/moonmorel_eat_open` | placeholder | PET-MOONMOREL-EAT-OPEN |
| `pet/moonmorel/moonmorel_eat_closed` | placeholder | PET-MOONMOREL-EAT-CLOSED |
| `pet/moonmorel/moonmorel_sleep` | placeholder | PET-MOONMOREL-SLEEP |
| `pet/moonmorel/moonmorel_sick` | placeholder | PET-MOONMOREL-SICK |
| `pet/moonmorel/moonmorel_refuse` | placeholder | PET-MOONMOREL-REFUSE |
| `pet/moonmorel/moonmorel_angry` | placeholder | PET-MOONMOREL-ANGRY |
| `pet/moonmorel/moonmorel_play` | placeholder | PET-MOONMOREL-PLAY |
| `pet/moonmorel/moonmorel_call` | placeholder | PET-MOONMOREL-CALL |
| `pet/moonmorel/moonmorel_surprised` | placeholder | PET-MOONMOREL-SURPRISED |

### Truffletum

| File | Status | Prompt ID |
|---|---|---|
| `pet/truffletum/truffletum_idle` | placeholder | PET-TRUFFLETUM-IDLE |
| `pet/truffletum/truffletum_blink` | placeholder | PET-TRUFFLETUM-BLINK |
| `pet/truffletum/truffletum_happy` | placeholder | PET-TRUFFLETUM-HAPPY |
| `pet/truffletum/truffletum_sad` | placeholder | PET-TRUFFLETUM-SAD |
| `pet/truffletum/truffletum_eat_open` | placeholder | PET-TRUFFLETUM-EAT-OPEN |
| `pet/truffletum/truffletum_eat_closed` | placeholder | PET-TRUFFLETUM-EAT-CLOSED |
| `pet/truffletum/truffletum_sleep` | placeholder | PET-TRUFFLETUM-SLEEP |
| `pet/truffletum/truffletum_sick` | placeholder | PET-TRUFFLETUM-SICK |
| `pet/truffletum/truffletum_refuse` | placeholder | PET-TRUFFLETUM-REFUSE |
| `pet/truffletum/truffletum_angry` | placeholder | PET-TRUFFLETUM-ANGRY |
| `pet/truffletum/truffletum_play` | placeholder | PET-TRUFFLETUM-PLAY |
| `pet/truffletum/truffletum_call` | placeholder | PET-TRUFFLETUM-CALL |
| `pet/truffletum/truffletum_surprised` | placeholder | PET-TRUFFLETUM-SURPRISED |

### Mudpuff

| File | Status | Prompt ID |
|---|---|---|
| `pet/mudpuff/mudpuff_idle` | placeholder | PET-MUDPUFF-IDLE |
| `pet/mudpuff/mudpuff_blink` | placeholder | PET-MUDPUFF-BLINK |
| `pet/mudpuff/mudpuff_happy` | placeholder | PET-MUDPUFF-HAPPY |
| `pet/mudpuff/mudpuff_sad` | placeholder | PET-MUDPUFF-SAD |
| `pet/mudpuff/mudpuff_eat_open` | placeholder | PET-MUDPUFF-EAT-OPEN |
| `pet/mudpuff/mudpuff_eat_closed` | placeholder | PET-MUDPUFF-EAT-CLOSED |
| `pet/mudpuff/mudpuff_sleep` | placeholder | PET-MUDPUFF-SLEEP |
| `pet/mudpuff/mudpuff_sick` | placeholder | PET-MUDPUFF-SICK |
| `pet/mudpuff/mudpuff_refuse` | placeholder | PET-MUDPUFF-REFUSE |
| `pet/mudpuff/mudpuff_angry` | placeholder | PET-MUDPUFF-ANGRY |
| `pet/mudpuff/mudpuff_play` | placeholder | PET-MUDPUFF-PLAY |
| `pet/mudpuff/mudpuff_call` | placeholder | PET-MUDPUFF-CALL |
| `pet/mudpuff/mudpuff_surprised` | placeholder | PET-MUDPUFF-SURPRISED |

### Auroracap

| File | Status | Prompt ID |
|---|---|---|
| `pet/auroracap/auroracap_idle` | placeholder | PET-AURORACAP-IDLE |
| `pet/auroracap/auroracap_blink` | placeholder | PET-AURORACAP-BLINK |
| `pet/auroracap/auroracap_happy` | placeholder | PET-AURORACAP-HAPPY |
| `pet/auroracap/auroracap_sad` | placeholder | PET-AURORACAP-SAD |
| `pet/auroracap/auroracap_eat_open` | placeholder | PET-AURORACAP-EAT-OPEN |
| `pet/auroracap/auroracap_eat_closed` | placeholder | PET-AURORACAP-EAT-CLOSED |
| `pet/auroracap/auroracap_sleep` | placeholder | PET-AURORACAP-SLEEP |
| `pet/auroracap/auroracap_sick` | placeholder | PET-AURORACAP-SICK |
| `pet/auroracap/auroracap_refuse` | placeholder | PET-AURORACAP-REFUSE |
| `pet/auroracap/auroracap_angry` | placeholder | PET-AURORACAP-ANGRY |
| `pet/auroracap/auroracap_play` | placeholder | PET-AURORACAP-PLAY |
| `pet/auroracap/auroracap_call` | placeholder | PET-AURORACAP-CALL |
| `pet/auroracap/auroracap_surprised` | placeholder | PET-AURORACAP-SURPRISED |

## Ripplets

### Pond Pearl (egg)

| File | Status | Prompt ID |
|---|---|---|
| `pet/pondpearl/pondpearl_idle` | placeholder | PET-PONDPEARL-IDLE |
| `pet/pondpearl/pondpearl_crack1` | placeholder | PET-PONDPEARL-CRACK1 |
| `pet/pondpearl/pondpearl_crack2` | placeholder | PET-PONDPEARL-CRACK2 |
| `pet/pondpearl/pondpearl_crack3` | placeholder | PET-PONDPEARL-CRACK3 |
| `pet/pondpearl/pondpearl_shell_back` | placeholder | PET-PONDPEARL-SHELL-BACK |
| `pet/pondpearl/pondpearl_shell_front` | placeholder | PET-PONDPEARL-SHELL-FRONT |

### Wiggle

| File | Status | Prompt ID |
|---|---|---|
| `pet/wiggle/wiggle_idle` | placeholder | PET-WIGGLE-IDLE |
| `pet/wiggle/wiggle_blink` | placeholder | PET-WIGGLE-BLINK |
| `pet/wiggle/wiggle_happy` | placeholder | PET-WIGGLE-HAPPY |
| `pet/wiggle/wiggle_sad` | placeholder | PET-WIGGLE-SAD |
| `pet/wiggle/wiggle_eat_open` | placeholder | PET-WIGGLE-EAT-OPEN |
| `pet/wiggle/wiggle_eat_closed` | placeholder | PET-WIGGLE-EAT-CLOSED |
| `pet/wiggle/wiggle_sleep` | placeholder | PET-WIGGLE-SLEEP |
| `pet/wiggle/wiggle_sick` | placeholder | PET-WIGGLE-SICK |
| `pet/wiggle/wiggle_refuse` | placeholder | PET-WIGGLE-REFUSE |
| `pet/wiggle/wiggle_angry` | placeholder | PET-WIGGLE-ANGRY |
| `pet/wiggle/wiggle_call` | placeholder | PET-WIGGLE-CALL |
| `pet/wiggle/wiggle_surprised` | placeholder | PET-WIGGLE-SURPRISED |

### Splashlet

| File | Status | Prompt ID |
|---|---|---|
| `pet/splashlet/splashlet_idle` | placeholder | PET-SPLASHLET-IDLE |
| `pet/splashlet/splashlet_blink` | placeholder | PET-SPLASHLET-BLINK |
| `pet/splashlet/splashlet_happy` | placeholder | PET-SPLASHLET-HAPPY |
| `pet/splashlet/splashlet_sad` | placeholder | PET-SPLASHLET-SAD |
| `pet/splashlet/splashlet_eat_open` | placeholder | PET-SPLASHLET-EAT-OPEN |
| `pet/splashlet/splashlet_eat_closed` | placeholder | PET-SPLASHLET-EAT-CLOSED |
| `pet/splashlet/splashlet_sleep` | placeholder | PET-SPLASHLET-SLEEP |
| `pet/splashlet/splashlet_sick` | placeholder | PET-SPLASHLET-SICK |
| `pet/splashlet/splashlet_refuse` | placeholder | PET-SPLASHLET-REFUSE |
| `pet/splashlet/splashlet_angry` | placeholder | PET-SPLASHLET-ANGRY |
| `pet/splashlet/splashlet_play` | placeholder | PET-SPLASHLET-PLAY |
| `pet/splashlet/splashlet_call` | placeholder | PET-SPLASHLET-CALL |
| `pet/splashlet/splashlet_surprised` | placeholder | PET-SPLASHLET-SURPRISED |

### Reedling

| File | Status | Prompt ID |
|---|---|---|
| `pet/reedling/reedling_idle` | placeholder | PET-REEDLING-IDLE |
| `pet/reedling/reedling_blink` | placeholder | PET-REEDLING-BLINK |
| `pet/reedling/reedling_happy` | placeholder | PET-REEDLING-HAPPY |
| `pet/reedling/reedling_sad` | placeholder | PET-REEDLING-SAD |
| `pet/reedling/reedling_eat_open` | placeholder | PET-REEDLING-EAT-OPEN |
| `pet/reedling/reedling_eat_closed` | placeholder | PET-REEDLING-EAT-CLOSED |
| `pet/reedling/reedling_sleep` | placeholder | PET-REEDLING-SLEEP |
| `pet/reedling/reedling_sick` | placeholder | PET-REEDLING-SICK |
| `pet/reedling/reedling_refuse` | placeholder | PET-REEDLING-REFUSE |
| `pet/reedling/reedling_angry` | placeholder | PET-REEDLING-ANGRY |
| `pet/reedling/reedling_play` | placeholder | PET-REEDLING-PLAY |
| `pet/reedling/reedling_call` | placeholder | PET-REEDLING-CALL |
| `pet/reedling/reedling_surprised` | placeholder | PET-REEDLING-SURPRISED |

### Lotusong

| File | Status | Prompt ID |
|---|---|---|
| `pet/lotusong/lotusong_idle` | placeholder | PET-LOTUSONG-IDLE |
| `pet/lotusong/lotusong_blink` | placeholder | PET-LOTUSONG-BLINK |
| `pet/lotusong/lotusong_happy` | placeholder | PET-LOTUSONG-HAPPY |
| `pet/lotusong/lotusong_sad` | placeholder | PET-LOTUSONG-SAD |
| `pet/lotusong/lotusong_eat_open` | placeholder | PET-LOTUSONG-EAT-OPEN |
| `pet/lotusong/lotusong_eat_closed` | placeholder | PET-LOTUSONG-EAT-CLOSED |
| `pet/lotusong/lotusong_sleep` | placeholder | PET-LOTUSONG-SLEEP |
| `pet/lotusong/lotusong_sick` | placeholder | PET-LOTUSONG-SICK |
| `pet/lotusong/lotusong_refuse` | placeholder | PET-LOTUSONG-REFUSE |
| `pet/lotusong/lotusong_angry` | placeholder | PET-LOTUSONG-ANGRY |
| `pet/lotusong/lotusong_play` | placeholder | PET-LOTUSONG-PLAY |
| `pet/lotusong/lotusong_call` | placeholder | PET-LOTUSONG-CALL |
| `pet/lotusong/lotusong_surprised` | placeholder | PET-LOTUSONG-SURPRISED |

### Bogbelly

| File | Status | Prompt ID |
|---|---|---|
| `pet/bogbelly/bogbelly_idle` | placeholder | PET-BOGBELLY-IDLE |
| `pet/bogbelly/bogbelly_blink` | placeholder | PET-BOGBELLY-BLINK |
| `pet/bogbelly/bogbelly_happy` | placeholder | PET-BOGBELLY-HAPPY |
| `pet/bogbelly/bogbelly_sad` | placeholder | PET-BOGBELLY-SAD |
| `pet/bogbelly/bogbelly_eat_open` | placeholder | PET-BOGBELLY-EAT-OPEN |
| `pet/bogbelly/bogbelly_eat_closed` | placeholder | PET-BOGBELLY-EAT-CLOSED |
| `pet/bogbelly/bogbelly_sleep` | placeholder | PET-BOGBELLY-SLEEP |
| `pet/bogbelly/bogbelly_sick` | placeholder | PET-BOGBELLY-SICK |
| `pet/bogbelly/bogbelly_refuse` | placeholder | PET-BOGBELLY-REFUSE |
| `pet/bogbelly/bogbelly_angry` | placeholder | PET-BOGBELLY-ANGRY |
| `pet/bogbelly/bogbelly_play` | placeholder | PET-BOGBELLY-PLAY |
| `pet/bogbelly/bogbelly_call` | placeholder | PET-BOGBELLY-CALL |
| `pet/bogbelly/bogbelly_surprised` | placeholder | PET-BOGBELLY-SURPRISED |

### Muckbottom

| File | Status | Prompt ID |
|---|---|---|
| `pet/muckbottom/muckbottom_idle` | placeholder | PET-MUCKBOTTOM-IDLE |
| `pet/muckbottom/muckbottom_blink` | placeholder | PET-MUCKBOTTOM-BLINK |
| `pet/muckbottom/muckbottom_happy` | placeholder | PET-MUCKBOTTOM-HAPPY |
| `pet/muckbottom/muckbottom_sad` | placeholder | PET-MUCKBOTTOM-SAD |
| `pet/muckbottom/muckbottom_eat_open` | placeholder | PET-MUCKBOTTOM-EAT-OPEN |
| `pet/muckbottom/muckbottom_eat_closed` | placeholder | PET-MUCKBOTTOM-EAT-CLOSED |
| `pet/muckbottom/muckbottom_sleep` | placeholder | PET-MUCKBOTTOM-SLEEP |
| `pet/muckbottom/muckbottom_sick` | placeholder | PET-MUCKBOTTOM-SICK |
| `pet/muckbottom/muckbottom_refuse` | placeholder | PET-MUCKBOTTOM-REFUSE |
| `pet/muckbottom/muckbottom_angry` | placeholder | PET-MUCKBOTTOM-ANGRY |
| `pet/muckbottom/muckbottom_play` | placeholder | PET-MUCKBOTTOM-PLAY |
| `pet/muckbottom/muckbottom_call` | placeholder | PET-MUCKBOTTOM-CALL |
| `pet/muckbottom/muckbottom_surprised` | placeholder | PET-MUCKBOTTOM-SURPRISED |

### Moonripple

| File | Status | Prompt ID |
|---|---|---|
| `pet/moonripple/moonripple_idle` | placeholder | PET-MOONRIPPLE-IDLE |
| `pet/moonripple/moonripple_blink` | placeholder | PET-MOONRIPPLE-BLINK |
| `pet/moonripple/moonripple_happy` | placeholder | PET-MOONRIPPLE-HAPPY |
| `pet/moonripple/moonripple_sad` | placeholder | PET-MOONRIPPLE-SAD |
| `pet/moonripple/moonripple_eat_open` | placeholder | PET-MOONRIPPLE-EAT-OPEN |
| `pet/moonripple/moonripple_eat_closed` | placeholder | PET-MOONRIPPLE-EAT-CLOSED |
| `pet/moonripple/moonripple_sleep` | placeholder | PET-MOONRIPPLE-SLEEP |
| `pet/moonripple/moonripple_sick` | placeholder | PET-MOONRIPPLE-SICK |
| `pet/moonripple/moonripple_refuse` | placeholder | PET-MOONRIPPLE-REFUSE |
| `pet/moonripple/moonripple_angry` | placeholder | PET-MOONRIPPLE-ANGRY |
| `pet/moonripple/moonripple_play` | placeholder | PET-MOONRIPPLE-PLAY |
| `pet/moonripple/moonripple_call` | placeholder | PET-MOONRIPPLE-CALL |
| `pet/moonripple/moonripple_surprised` | placeholder | PET-MOONRIPPLE-SURPRISED |


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
