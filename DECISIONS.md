# DECISIONS

Choices made where the spec was silent or ambiguous, plus any deviations from it.

## Simulation

- **Stat units.** Stats are 0–100; one heart is 25. The spec's food deltas ("+2 hunger", "+1 happiness") are read as **half-heart units (12.5)**. Dewberry Mash = +1 ♥, Mossbread = +1½ ♥, Honeydrop = +½ ♥ happiness. That keeps a meal meaningful without one bowl filling the pet.
- **Fixed ticks.** `step()` splits any dt into ticks of at most 1 minute. Offline catch-up uses exactly 1-minute ticks. Both share one `tick()` function, so live play and catch-up behave identically.
- **The RNG lives in the state** (`rngState`, mulberry32). `step`, `applyAction`, `catchUp` and `forecast` are all pure and reproducible.
- **Wall-clock schedules.** Bedtimes use the player's local clock via `tzOffsetMin`, which is stored on the pet and refreshed on load. The sim never reads `Date` itself; ESLint enforces this inside `src/sim`.
- **Dev time-scale** moves a *sim clock* (`clockOffsetMs`) ahead of real time, so bedtimes and dawn arrive correctly at 600×. The offset is saved, so a time-travelled save stays consistent.
- **Baby naps.** "3× a day for 10 min" doesn't fit a 1-hour stage, so babies nap for 10 minutes every 20 minutes, which works out to about 3 naps across the baby stage.
- **Naps are exempt from the lights rule.** Leaving the lantern on during a 10-minute baby nap isn't a care mistake. Night sleeps and exhaustion naps do count.
- **Waking turns the lantern back on** ("dawn light fills the Hollow"), so the player isn't punished for forgetting in the morning.
- **Calls.** An ignored hunger or happiness call is one mistake after 15 minutes. It then goes quiet and can re-arm after 1 hour, as on the original toy (one mistake per call, not a stream of them). Sickness has its own hourly mistake clock. The lights mistake is counted once per sleep.
- **Calls are suppressed while asleep**, except the "lights" call. Sickness doesn't tick its untreated-mistake clock overnight.
- **"Full night with lights off"** (needed for Starwick) means: a night sleep of at least 8 h during Child or Teen, with no lights mistake and the lantern off at waking.
- **Evolution waits for the pet to be awake.** A sleeping pet never evolves mid-sleep.
- **Discipline.** A correct scold gives +25. Meaningful praise (within 5 min of a good deed) gives +5 discipline, +happiness and +bond, then the window closes, so spamming does nothing. A wrong scold costs happiness.
- **Teen moodiness.** A hungry teen may refuse a meal, with the chance scaled by (1 − discipline). Scolding that refusal counts as correct discipline.
- **Overweight sickness risk** uses per-stage weight thresholds (`TUNING.overweight`). Growing up adds weight per stage.
- **Offline cap.** If the absence is longer than 48 h, the whole absence can cost at most 3 care mistakes. Health can't fall below 15 during catch-up until 72 h have passed. After 72 h in Gentle mode, a hungry pet has wandered off. Catch-up is capped at 14 days of simulation.
- **Babysitter pause.** It is part of the sim state, so offline catch-up respects it. While paused, every scheduled timestamp shifts forward, so nothing "catches up" afterwards. The allowance is 12 h per local day.
- **Eternal mode.** The adult never leaves of old age and never runs away. Health bottoms out at 1, so it can still get sick and sad, and it still needs care.
- **Lifespan** = 6 + 4 × (0.5·care + 0.3·bond + 0.2·random) days, where care = 1 − mistakes/10.
- **Release to the forest** writes a Memory Leaf (`how: "released"`) and starts a new Dewstone. It sits behind a 2-step confirm.

## Game layer / UI

- **One store (Zustand) holds the sim state plus UI state.** Sim events go through a tiny event bus to audio, particles and pet animation. The sim stays the single source of truth.
- **Persistence**: an `IdbAdapter` (idb-keyval) with a `localStorage` fallback, behind a `StorageAdapter` interface. The game's meta (journal, settings, bests) is saved alongside the pet and merged over defaults on load (`migrateMeta`).
- **Stage.** A locked 3:4 stage (900×1200 logical units) is scaled to fit. On phones the 8 actions sit in a gentle arc under it. On wide landscape screens (≥900 px) they become a labelled side rail. The letterbox is a blurred, slowly parallaxed echo of the current sky.
- **Placeholder art is code-drawn SVG in the same 1024 frame as the final PNGs**, so swapping in art is purely a file drop. `import.meta.glob` discovers PNGs at build time. A form "has art" once its idle pose exists, and missing poses fall back to idle.
- **Final art gets the sprout sway as a slight whole-image wobble.** A PNG doesn't expose its sprout as a separate layer, so the body still breathes, hops and squashes in code.
- **The "pet" action** is direct manipulation: tap or drag on the creature, or press Enter/Space while it's focused, or `T`. It isn't one of the 8 ring buttons, which follows the spec's list.
- **Bathe** always clears droppings. If hygiene is still below 75 afterwards, a bubble-scrub overlay follows. Popping 85% of the bubbles, or pressing "All clean", finishes the bath. Space pops bubbles for keyboard players.
- **Notifications.** The browser has no reliable way to schedule local notifications while the app is closed (Notification Triggers never shipped). So reminders are scheduled from the sim forecast as timers while the app is backgrounded, and shown through the service worker. Quiet hours are 22:30 to 07:30. Permission is requested only after the first evolution, from a cute explainer card.
- **Keyboard**: F/P/B/L/M/D/G/S for the ring, J journal, O settings, C photo mode, T pat, Esc closes, ` toggles the Dev Panel. Device Mode adds 1/2/3 for its A/B/C buttons. In minigames: arrows, Space, and Esc/P to pause.
- **Lighthouse** wasn't run in this environment (no Lighthouse install). Accessibility work done in code: labels on all controls, focus rings, focus trap in sheets, live regions, reduced-motion paths, AA-contrast surfaces. Run `npx lighthouse` against `npm run preview` to verify.
- **The Starwick form** stays out of the Journal's form grid until it has been met once.
- **The test hook** `window.__mossling` (`jumpTo`, `store`) exists only on `?dev=1` URLs. It is used by the Playwright smoke test.

## Art integration (starter art drop)

- **The Hollow became a 16:9 world.** The painted scenes are 16:9 (giant fern left, meadow centre, pond and burrow right). The original stage was a tall 3:4. The world is now 1600×900 units laid out to match the paintings. The stage shows it two ways:
  - **Wide** (any landscape screen, including desktop): the whole Hollow, in 16:9.
  - **Tall** (upright phones): a 3:4 window that follows the pet across the Hollow with a soft spring camera. While the pet sleeps, the window settles on the burrow.
  - Device Mode uses the shape of the painted shell's screen opening (about 1.14:1) with the same following camera.
- **Sleeping in the burrow.** The painted burrow sits behind the pond, so the pet walks to the meadow's edge and hops up into the burrow mouth, getting smaller because it is further back. It hops back down on waking.
- **The code-drawn scene is still the fallback.** It is stretched from its old 900×1200 design into the world, and only shows if the scene paintings are missing.
- **Night darkening.** The painted night scenes already carry their own darkness, so the extra code shading is reduced when they're present.
- **Web-sized art.** The delivered PNGs totalled about 95 MB, too heavy for a phone or an offline PWA. `npm run assets:optimize` converts them to WebP: scenes at 1600 wide, props at 384, pets at 1024, all with alpha kept. The total is now about 6 MB. Full-size masters remain in git history, and the app icon master is kept in `art-source/`.
- **Accepted name variants.** `fg_{time}` works for `fg_near_{time}`, and `firefly_gold` for `firefly_golden`. New props were added to the manifest: `lantern_on`/`lantern_off` (the painted lantern includes its own fern stem, so no code post is drawn), `lilypad_glow`, and `birthday_candle_mushroom` (replaces the stool on birthdays).
- **Device Mode** uses the painted shell (`ui/device_shell`). Invisible A/B/C hit areas sit over its painted buttons, and the HUD is drawn at 60% size inside the small screen.
- **Eggshell halves** (`egg_shell_back` / `egg_shell_front`) frame the new Dewdrop at the end of the hatching scene.
- **Missing poses** of a form fall back to that form's idle pose; for example, `dewdrop_play` isn't in this drop.

## Deviations from the stack

- None in libraries. Versions are pinned to a mutually compatible set: Vite 6, Vitest 3, `@vitejs/plugin-react` 4, React 18, vite-plugin-pwa 1, Framer Motion (`framer-motion@^14`), and `@playwright/test` matching the installed browser.
- Styling uses CSS Modules plus one global `theme.css` holding the design tokens as CSS variables.
