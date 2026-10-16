# Validation and technical handoff

Current game: **v2.8.0**. The original GitHub handoff was v2.3.1; the releases below document the surplus XP, bot avoidance, typing-focus, World 2 starting-shot, buried-creature targeting, control/progress improvements, v2.4.0 combat balance, and the v2.4.1 procedural soundtrack.

## How to run the portable suite

The root `package.json` pins dev-only test tools to jsdom 30.1.1 and @napi-rs/canvas 0.1.100. Use a Node version allowed by its engine range. From the project root:

```sh
npm ci
npm test
npm run balance
```

The lockfile is committed; use `npm ci` in fresh environments. `npm test` runs the regression/rendering harness and deterministic music checks, while `npm run balance` prints ordinary-health seeded simulation results for interpretation rather than enforcing a pass/fail threshold. Installation needs package-registry access; playing the HTML needs no network or packages.

`tests/qa.cjs` uses JSDOM for DOM/events and native Canvas for rendering. It injects private hooks into the inline IIFE in memory; the distributed HTML has no test hooks. The original migration replaced absolute dependency paths with package imports, resolved the project root relative to the test file, and moved generated PNGs under `tests/artifacts/`. Later releases expanded that harness. Root `qa.cjs` now forwards to the maintained `tests/qa.cjs` so older commands use the same assertions.

## Existing checks

- XP-only level-up triggers, smoothly increasing costs, 1,000 XP cap, carried surplus, no old time gates or overflow-to-score features.
- Start/pause/resume/restart, high-score writes, blocked storage fallback, health/invulnerability, and safe edge spawns.
- Upgrade choices exclude owned systems; one/two remaining options are valid; all-complete notices and leveling continue without empty menus.
- Movement inputs do not leak from a held key through upgrade selection; world/aim/firing freeze during menus; resume provides a short protected guard.
- Swept bullet collisions, piercing, enemy behaviors, enemy/shot/effect caps, and finite coordinates after resize/stress runs.
- Bot movement, shooting, quadrant-target changes every 4.2 seconds, XP collection, upgrade choice, pilot switching, and World 2 entry.
- World 1 region transitions, hazards, special weapon systems, and full-build XP collection.
- Levels 41–50 pressure, exact 20-warden finale, field clearing, saved World 2 unlock, and safe transition.
- World 2 enemy behaviors, adaptation completion, seasonal hazards, boss phases, finale, victory freeze, and restart.
- Hidden-tab interval fallback/shared simulation clock and blur/visibility behavior.
- No external runtime scripts/styles/resources in the delivered game.
- Simulated stress sessions: 240 seconds of World 1, 120 seconds of a complete World 1 build, and 180 seconds of World 2.
- PNG output for desktop, portrait mobile, all five space regions, World 2, and its final boss.

## Limits of the evidence

These are simulated regression/rendering checks, not a Chromium/Brave end-to-end recording or a guarantee the bot wins every run. The harness uses invulnerability in stress cases to exercise systems without an early death; it does not establish survival balance. Performance timings are for the test runtime, not the owner's real browser or device.

Real-browser manual checks remain useful for audio unlock, keyboard focus, mouse/touch input, DPI scaling, readability, and actual hidden-tab throttling. Browser/OS tab suspension can stop any game's timers. A future full gameplay rebalance should be tested with ordinary health and multiple seeds/build choices.

## Manual check list for future releases

1. Open the HTML directly in a desktop browser; confirm version, menu, and offline operation.
2. Play briefly: move, aim, dash, pause/resume, take damage, collect cores, select upgrades.
3. Hold movement through a menu, then release/repress; confirm no unwanted motion or fire during selection.
4. Watch Bot, inspect corner pickups and continuous movement, then toggle back to human control.
5. Switch tabs and return; confirm the game does not deliberately auto-pause.
6. Resize to portrait/mobile and inspect controls and UI. Use real touch input where available.
7. Inspect bright hostile shots against the dimmer stars and centered planet.
8. Restart and verify fresh score/time/health/level/enemies/modules. Test high-score/world-unlock persistence.

Actual long-run/boss verification may use development tooling, but do not leave debug cheats or test hooks in the final HTML.

## Handoff verification — October 2, 2026

The portable `npm test` command passed using the pinned tool versions already installed in the preparation environment. No fresh registry install was performed here. The run reported no DOM/runtime errors. All three stress simulations, upgrade/bot checks, world transition checks, and finale checks passed. Generated screenshots were kept as ignored local artifacts.

The final HTML SHA-256 is `44deddbe060d87ec9c2449338e5c19d1f61726b71655ed37fe8ac3085ffc37b7`. The copy inside this package matches the latest standalone game byte-for-byte.

## v2.3.2 verification — October 2, 2026

- Used supported Node v24.19.0 and npm 11.9.0. Installed only the existing pinned dev dependencies and their dependencies, with lifecycle scripts disabled. The default npm cache directory was unavailable; installation succeeded using a cache under `/tmp`. Added the generated lockfile and ignored `node_modules/` and `tests/artifacts/`.
- The unmodified v2.3.1 suite passed with no DOM/runtime errors.
- Added a regression for surplus XP on the final upgrade purchase in both worlds, the completed-tree guard, and spending the carried XP on two later levels without repeat menus or conversion to score. It failed against v2.3.1: World 1 retained 420 XP instead of the earned 877 XP.
- Removed the two XP clamps in `chooseUpgrade` and `openUpgrade`. The complete suite then passed, including the new cases, all three stress simulations (240 seconds of World 1, 120 seconds of its full build, 180 seconds of World 2), the 20-warden finale, World 2 unlock/transition and finale, bot controls, upgrade isolation, and hidden-tab interval/shared-clock checks. No DOM/runtime errors were reported.
- Inspected generated desktop and portrait Canvas PNGs. The starfield remains subdued and the opening planet remains centered above the arena; rendering code was unchanged.
- Attempted a headless Chromium check of the local HTML. Managed browser policy blocked the `file://` page with “Your organization doesn’t allow you to view this site,” so no real-browser gameplay validation is claimed. Audio, physical touch, and actual browser background throttling remain manual checks.

Complete v2.3.2 HTML SHA-256: `4974c3d6cfe70fe3e7073612b632913780a6e21e8a2c4f244177644c9ac15436`.

## v2.3.3 verification — October 2, 2026

- Investigated the report of a bot trapped in a loading/spinning circle in the late 40s of World 2. Reproduced a level-48 bot jittering beside a warning circle near the arena edge: its radial avoidance opposed its corner patrol, leaving almost no net travel until the route or hazard changed. This is a reproducible match for the reported behavior; the original browser session was not available.
- The existing v2.3.2 suite passed before changes. A new warning-circle movement regression failed against that code. A separate probe also found that the projectile dodge force pointed toward the incoming shot path rather than away from it.
- Garden-circle avoidance now adds a consistent detour and chooses a side with room inside the arena. It handles an exact-center start without changing the corner schedule. Corrected the shared projectile dodge sign. Friendly fields still do not repel the bot. Upgrade/resume guards remain intact.
- Full `npm test` passed under Node 24.19.0 with no DOM/runtime errors. New cases exercise a full World 2 build at level 48 with root/spore circles at top/bottom edges in 1280×720 and 390×844 layouts, center starts, friendly circles, and shot paths on all four sides in both worlds. The tests verify actual displacement, clearance before activation, and corner-target changes only on arrival during the detour.
- Existing stress simulations (240/120/180 seconds), surplus XP, input isolation, corner pickups, shared background clock, exact 20-warden finale, World 2 transition, and World 2 finale all passed. Entity caps and offline resource checks passed.
- Canvas rendering is unchanged. Real-browser playback, physical touch, audio, and real hidden-tab throttling retain the limitations recorded above; the fix is supported by simulated regression evidence.

Complete v2.3.3 HTML SHA-256: `209221f8a04045fc505e6916e0da62eecacacee8e21c9366917a6811ccaf3f0b`.

## v2.3.4 verification — October 2, 2026

- The existing v2.3.3 suite passed before changes. A new editor-focus regression failed against that release: an upgrade focused its first button instead of preserving the active textarea.
- Automatic UI focus now requires a focused page, human control, and no active text editor. Bot upgrade selection, world completion/entry, and game over do not take focus. Explicit Play/Watch Bot still focus the arena. Text input, textarea, editable content, and textbox roles do not trigger game keyboard shortcuts; entering an editor clears held movement without pausing combat.
- At the owner's request, fresh World 2 entry, direct starts, and restarts now begin with one projectile. The unique Threefold Bloom upgrade adds two for a three-shot volley. Updated the ship description and upgrade text. This lowers starting World 2 firepower; stress tests are not a survival-balance study.
- Full `npm test` passed after the implementation under supported Node 24.19.0, with no DOM/runtime errors. New tests cover editor focus during upgrades, resume, world completion/entry and game over in both bot/human modes; typed shortcut isolation; unfocused-page behavior; retained keyboard selection for focused human play; and actual one/three/one-shot volleys across World 2 entry, upgrade and restart.
- Existing bot-circle/dodge, XP carry, input isolation, shared-clock, entity-cap, stress and finale checks passed. Version/changelog and documentation were then updated to v2.3.4. The distributed game remains one offline HTML file with no shipped test hooks.
- This verifies game focus calls in JSDOM. The exact ChatGPT preview/parent-frame focus behavior still needs a real-browser check; managed Chromium's local-file limitation remains as recorded above.

Complete v2.3.4 HTML SHA-256: `b886013290933e344c7ffcd2a28a41437850eb75989d45b2603d612b64630ce7`.

## v2.3.5 verification — October 3, 2026

- Used supported Node v24.19.0 with the already installed pinned dev dependencies. The unmodified v2.3.4 suite passed. No runtime dependencies or new packages were added.
- Five focused gameplay probes failed against v2.3.4: underground projectile absorption, buried homing acquisition, wasted chain jumps, underground separation, and touch mode replacing the bot's target. Managed Chromium also reproduced Space failing to activate Play, Resume, upgrade cards, and HUD Pause; pressing Space on HUD Pause incorrectly dashed instead.
- Added regressions for projectile pass-through, guidance acquisition and stale locks, chain destinations, separation, visible emergence damage, human touch targeting, retained bot priority, native button shortcuts/arena dash, DASH click and pointer cooldown protection, build list/count/reset in both worlds, numerical XP after tree completion, and synchronized input instructions.
- The final full `npm test` passed with no DOM/runtime errors after all game changes, including the 240-second World 1, 120-second full World 1 build, and 180-second World 2 simulations. Entity caps, XP carry, input isolation, focus preservation, warning-circle detours, shared background clock, exact 20-warden finale, World 2 transition/one starting bolt, and World 2 finale/victory/reset all passed. `git diff --check` passed.
- Managed Chromium permits the standard localhost development preview (`http://127.0.0.1:8765/game.html`), allowing real-browser UI checks in this release. Actual Space presses activate Play, Resume, upgrade selection and HUD Pause. A controlled editor remains focused during bot upgrades and automatic world entry. Numeric XP and the full 24-adaptation pause list fit portrait layouts, including 390- and 320-pixel widths; long menu/pause/upgrade content scrolls without horizontal overflow. Screenshots are ignored local artifacts under `tests/artifacts/`.
- Final release checks verified one-line health values at 390/320 pixels, touch-specific start instructions, and native Space/Enter activation of DASH. Loaded the unmodified delivered HTML without injected hooks: Space activated Play/Pause/Resume/Bot, explicit pause froze time, World 2 opened correctly, and simulation continued with network access disabled after loading. No runtime exceptions were reported; observed requests were the local HTML and its inline Blob worker. The managed local-file restriction remains, so this is an HTTP-preview check rather than a successful file-URL browser check.
- Browser build/upgrade/transition fixtures use private hooks injected into browser memory only; the delivered HTML contains no test hooks. These UI checks complement the simulated campaign checks rather than establishing long-run survival balance. Physical touch, audible audio output, actual browser/OS background throttling, and the owner's ChatGPT preview integration still need device checks.

Complete v2.3.5 HTML SHA-256: `6bed6a25d4856e5ac6b214df043b308c3ae85eace65f553e21f7a4533c192946`.

## v2.4.0 verification — October 3, 2026

- The existing v2.3.5 suite passed before edits on supported Node v24.19.0. Used existing pinned dev dependencies; no additional packages were installed.
- Added regression coverage for regular formation sizes at levels 1/8/9/24/25/40 in both worlds, every escort's safe offscreen arrival, level-driven hull scaling at fixed elapsed time, enemy caps with packs, the actual three-shot Broadside volley, smaller escort XP, and Lifeweaver burst limits/recovery/boss healing. Existing exact-finale tests verify that packs do not add enemies to either final siege.
- Final v2.4.0 `npm test` passed with no DOM/runtime errors. The 240/120/180-second stress simulations, entity/effect caps, XP surplus and XP-only progression, unique trees, editor focus, native button activation, restart/reset, bot patrol and warning-circle escapes, shared background clock, World 1's exact 20 final wardens, World 2 entry/one starting bolt and final victory all passed. `git diff --check` passed.
- Added the repeatable `tests/balance.cjs` runner (`npm run balance`). It uses the QA harness's DOM/Canvas setup and private hooks in memory. Seeds 17/83/211 exercise both worlds in three modes: normal bot progression for 600 seconds of update steps, complete-build moving bot for 180 seconds, and complete-build stationary aiming for 180 seconds. Complete-build cases start at level 30 and 180 elapsed seconds, hold that level for a controlled comparison, and use ordinary health/invulnerability and real damage. Normal runs retain upgrade pause/resume protection; their game clock can be shorter than the step budget. 'damage' in the output sums observed per-step hull losses, rather than counting every hit before simultaneous healing.
- Compared the saved v2.3.5 source with the final implementation: all six stationary complete builds survived the old three-minute sample; only one survived the revised sample. All six moving complete builds survived both samples. Revised normal runs survived into levels 47/47/47 in World 1 and 50/49/49 in World 2. Moving complete-build mean enemy counts rose from 12.4 to 50.0 in World 1 and 5.9 to 17.9 in World 2. This supports increased pressure and a meaningful cost for failing to move, with viable strong builds.
- An initial pack-only pass was rejected after the comparisons showed extra kills supplying enough XP/healing to keep parked ships safe. Smaller escort cores, adjusted repair frequency, slower point defense and limited Lifeweaver recovery were included in the final pass. Ignored comparison output lives in `tests/artifacts/balance-before.json` and `balance-after.json`; run the harness against an earlier HTML path to repeat the comparison.
- Inspected generated portrait Canvas images for the denser World 1/World 2 combat. Hostile shots remain more prominent than decorative stars, and drawing/background placement code is unchanged. This release was checked through simulation and Canvas rendering; the v2.3.5 real-browser UI checks are recorded above. Real Android feel/performance, human difficulty, audio, and actual tab suspension require device play. Three seeds per world are illustrative balance evidence, not a guarantee of survival or a population win-rate estimate.

Complete v2.4.0 HTML SHA-256: `dc2238272a4410a69090dcf2db005bac47dc6656dac8b4b195ba7f7382ec89d8`.

## Supporting-file refresh verification — October 16, 2026

- Installed the committed locked development dependencies with `npm ci --ignore-scripts --no-audit --no-fund` under Node v24.19.0 and npm 11.9.0, using a temporary npm cache. No dependency or lockfile changes were needed.
- `npm test` passed with `passed: true` and an empty runtime-error list, including the existing 240/120/180-second stress simulations and campaign/input/focus regressions.
- `npm run balance` completed all 18 seeded cases across both worlds and all three modes. This confirms the documented runner works; its output remains observational and does not establish new balance claims.
- Checked package/lock version and dependency agreement, current-version references, local Markdown links, supporting-file whitespace, and the root compatibility entry point. `node --check qa.cjs` passed. The maintained regression and balance harnesses were unchanged.
- Rechecked the cloud-environment creation/publishing instructions against the official OpenAI documentation. No new real-browser gameplay check was needed for this supporting-file refresh.
- The game remains v2.4.0 and is byte-for-byte unchanged: SHA-256 `dc2238272a4410a69090dcf2db005bac47dc6656dac8b4b195ba7f7382ec89d8`. Archived snapshots were not modified.

## v2.4.1 music verification — October 16, 2026

- `npm test` passed on supported Node v24.19.0 with the existing locked dev dependencies. The command now runs both `tests/qa.cjs` and `tests/music.cjs`. No packages or runtime dependencies were added.
- The full gameplay regression/rendering harness reported no DOM/runtime errors. Existing XP, one-time upgrades, focus/input isolation, bot movement, hidden-tab clock, stress, world transition, finale, and restart checks passed.
- New music checks execute the real inline soundtrack and control logic with a deterministic mocked Web Audio context. They verify no audio creation before Play, the 22% default, synchronized controls, saved preferences, slider keyboard isolation, zero-volume release, independent music toggle, master mute, pause cleanup, subdued upgrade playback, different world harmonies, context reuse across restarts, and game-over cleanup. A simulated ten-minute audio clock stays within the 32-voice limit; a two-minute scheduling delay produces no catch-up burst.
- No browser binary was available in this workspace. These checks validate scheduling and UI logic, not audible playback, subjective mix quality, mobile touch layout, or actual browser autoplay/background-audio policy. Audio output begins after a user interaction and remains subject to browser/OS suspension.
- Confirmed synchronized v2.4.1 release/package references, valid inline JavaScript, package/lock agreement, and no external runtime resources. Historical snapshots remain untouched. No combat balance changes were made.

Complete v2.4.1 HTML SHA-256: `7ed1defc44343011fa11e93ea3bee9be3cfe02f5177e92960f8c86c6d77b0e7d`.

## v2.4.2 independent audio verification — October 16, 2026

- Full `npm test` passed under Node v24.19.0 with the existing locked dependencies. The gameplay suite reported no DOM/runtime errors; music scheduling, focus/input isolation, restart, hidden-tab and campaign regressions remain covered.
- Extended deterministic Web Audio checks verify all four effects/music combinations during live toggling and on fresh pages with saved preferences. Music initializes with effects off, muting effects does not reset or silence the score, music off leaves the effects gain available, and both muted avoids initializing audio. Effects toggles on both settings panels and M work independently and stay synchronized with the HUD.
- Checked inline JavaScript syntax, package/lock agreement, and current release descriptions. No runtime dependencies, external assets, gameplay balance changes, or snapshot edits. Audio APIs remain mocked for automated checks; audible output and actual browser/device behavior retain the limits recorded for v2.4.1.

Complete v2.4.2 HTML SHA-256: `9672e538162b8d45b06ecc4de8299ba775ab3707cb4c5f709f00e83e1a960172`.

## v2.5.0 adaptive soundtrack verification — October 16, 2026

- Full `npm test` passed under Node v24.19.0 with existing locked dependencies. Gameplay regressions and all 240/120/180-second stress cases reported no DOM/runtime errors. No additional dependencies were needed.
- Deterministic Web Audio checks exercised all five space arrangements and all four Chloris seasonal arrangements through the actual scheduler. They verify scene adoption within a bar, continuous step position on region changes, increased musical pressure at late levels and ordinary bosses, the 148-BPM Warden finale, Crown Siege, and escalating Heart phases. Thirty seconds of audio scheduling leaves campaign level, hull, score, and world time unchanged.
- All arrangements respect the 32-voice cap. Existing ten-minute scheduling and delayed-clock tests passed, as did pause/restart cleanup, independent effects/music controls, all four saved channel combinations, input isolation, volume persistence, and world changes.
- Inline JavaScript and music-test syntax checks passed; release/package/lock versions, documentation links, and whitespace were checked. Historical snapshots and gameplay balance code remain unchanged.
- Audio tests use a mocked Web Audio clock. These results establish arrangement selection and scheduling behavior, not an audible quality review. No browser binary was available; actual device playback, mix preferences, and browser/OS background suspension remain listening/device checks. No real-browser validation is claimed for this release.

Complete v2.5.0 HTML SHA-256: `c9f841eff716c90633aad2df8fecafc9080e5d21669a3aaaaf4a2c27ec27ab12`.

## v2.6.0 cinematic audio and mixer verification — October 16, 2026

- Full `npm test` passed under Node v24.19.0 with existing locked dependencies. The gameplay suite reported no DOM/runtime errors, including its 240/120/180-second simulations. Adaptive audio, all channel combinations, input/focus, campaign transitions, finales, and restart coverage passed.
- Extended the Web Audio test double to represent cached periodic waves, oscillator detuning, persistent multichannel buffers, and a convolution node. Tests confirm the real inline score uses its harmonic instruments, creates a two-channel nonidentical hall impulse, gates the hall output on mute, and reuses the room across restarts. Noise sources are distinguished from pitched oscillator notes in the assertions.
- Mixer checks verify independent 0–100% ranges, synchronized start/pause readouts, SFX changes leaving music unchanged and vice versa, zero SFX avoiding new effects sources, full music range, saved 40% SFX / 60% music restoration on a fresh page, and unmute restoring the chosen gain. Existing 32-voice, delayed-clock, pause cleanup, region/season/boss/Heart, and gameplay-isolation checks remain passing.
- Inline/test syntax, release and lockfile metadata, relative documentation links, and whitespace checks passed. No runtime packages or external assets were added; archived snapshots and combat balance are unchanged.
- Audio APIs are simulated for these checks; convolution output, audible mix quality, and real device playback were not auditioned. No browser binary was available in this workspace. Listening on the owner's browser remains the check for subjective orchestral character and the desired music/effects balance.

Complete v2.6.0 HTML SHA-256: `423a142e023583b5c3ed391842b48cb4c3c6610e5040a5669c22e31fa3326eb5`.


## v2.7.0 visible SFX/music balance verification — October 16, 2026

- Full `npm test` passed under Node v24.19.0 with the existing locked dependencies. Gameplay QA passed its 240/120/180-second runs with no DOM/runtime errors; the adaptive soundtrack and all previous control, campaign, stress, and persistence checks passed.
- New audio/UI regressions confirm that the explicit Audio Mix range is present near the top of both start and pause panels, its exact SFX/music split updates in sync, both extreme mixes correctly silence one channel while emphasizing the other, the midpoint preserves the existing gains, and the chosen ratio restores from local storage. Existing independent volume controls and mute toggles remain covered.
- Inline JavaScript and test syntax passed. No external assets, runtime dependencies, gameplay changes, or archived snapshot edits. The JSDOM harness checks UI markup and audio routing but does not measure real browser layout or audition audio. A browser binary was unavailable; on-device visibility and listening remain practical checks.

Complete v2.7.0 HTML SHA-256: `c1c60c620505303bc1e93942384f95f0e6c95ccdfa23a83201357bca0d1a85f8`.


## v2.8.0 shared overall audio volume verification — October 16, 2026

- Full `npm test` passed under Node v24.19.0 with the locked dependencies. Gameplay stress simulations (240/120/180 seconds) and the complete adaptive score regression passed without DOM/runtime errors.
- Audio graph assertions confirm that SFX and the complete music/reverb output feed one shared final gain node. The single Overall Volume slider synchronizes between start and pause panels, persists, reaches silence cleanly, and does not alter the balance slider. The SFX/music balance endpoints, independent channel mutes, keyboard input isolation, music cleanup, restart reuse, and legacy Music volume preference migration are covered.
- Inline JavaScript and test syntax passed. No new packages or external assets. JSDOM checks the rendered markup and mocked Web Audio routing, not physical-browser layout or audible output; no browser binary was available.

Complete v2.8.0 HTML SHA-256: `0356716c5772529ff1dae114b7505dd610e56aac64f3f20afbbe632df08f095f`.
