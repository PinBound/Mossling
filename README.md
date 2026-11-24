# Mossling

A cozy virtual pet in the tradition of the handheld egg toys. A **Dewstone** hatches into a little creature of moss, moth and pond-light. It grows through four stages, and your care decides which of four adult forms it becomes (one of them is secret). It lives in real time in **the Hollow**, a mossy clearing that follows your clock from dawn to night.

The game runs fully with placeholder art drawn in code. Final illustrations drop in as PNGs with zero code changes.

## Run

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build (PWA, service worker)
npm run preview      # serve the build
```

## Test

```bash
npm test             # Vitest: simulation engine
npm run coverage     # with coverage (src/sim is at ~100% lines; gate is 90%)
npm run e2e          # Playwright smoke test: hatch → feed → clean → sleep
npm run lint
npm run assets:check # missing art, wrong sizes, missing transparency, feet line
npm run assets:optimize # convert dropped-in PNGs to web-sized WebP
```

The Playwright test builds the app and serves it on port 4173. To use a particular Chromium binary, set `PW_CHROMIUM=/path/to/chromium`.

## Dev Panel

Press **`** (backtick) or open `/?dev=1`. It provides:

- **Time**: 1× / 10× / 60× / 600× time scale, plus jumps of +10 m, +1 h, +6 h and +24 h. A full life (about 8 days) plays out in about 20 minutes at 600×.
- **Stage & form**: jump to the next stage, or force-evolve into any adult (including Starwick).
- **Stats**: sliders for every stat.
- **Events**: sick, poop, false call, starve, the greeting, a falling star, the snail, rain (stopping it brings a rainbow), leave, run away, pass away, golden firefly.
- **Reset all**: wipes the save, journal and settings.

## Adding art

1. Generate images following `ASSETS.md` (paths, sizes and prompt IDs).
2. Drop them into `src/assets/img/…` using the exact names (PNG or WebP).
3. Run `npm run assets:optimize` to shrink them for the web, then `npm run assets:check`, then rebuild. `src/assets/manifest.ts` discovers files at build time, and missing files keep using the placeholders. `node scripts/assets-md.mjs` refreshes the checklist.
4. If a form reads too big or too small, tune `FORM_META` (`scale`, `anchorY`) in the manifest. To re-lay out the world around new scene paintings, edit the constants at the top of `src/scene/Hollow.tsx` (`GROUND_Y`, `MEADOW`, `BURROW`, `POND`, `STOOL`, `LANTERN`).
5. A new `art-source/app_icon.png` regenerates the PWA icons with `node scripts/make-icons.mjs`.

## Project map

```
src/sim/        pure, deterministic engine (+ tests). tuning.ts holds every number.
src/game/       store (Zustand), loop, persistence, offline catch-up glue, notifications
src/pet/        PetActor (idle AI, reactions, petting, eye tracking), placeholder SVG art
src/scene/      the Hollow, time-of-day palettes, weather, seasons, particles, rare events
src/ui/         action ring, HUD, sheets, journal, settings, cinematics, onboarding, copy.ts
src/minigames/  Which Way?, Firefly Catch, Lilypad Hop (lazy-loaded)
src/audio/      synthesized SFX, Mossling-speak babble, generative music
src/dev/        Dev Panel (lazy-loaded)
```

Design notes and judgment calls are in `DECISIONS.md`.
