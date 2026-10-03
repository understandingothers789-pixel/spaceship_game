# Void Wake — instructions for Codex

Read `README.md`, `PROJECT_HISTORY.md`, and `VALIDATION.md` before changing the game. `CODEX_START_HERE.md` is the owner's setup guide. The active game is **root `game.html`**, currently v2.3.5. `history/snapshots/` contains real older files for reference; do not edit them or treat them as the active game.

## Product constraints

- Deliver the entire playable game in ONE HTML file with inline HTML, CSS, and vanilla JavaScript. It must open offline directly in a browser. No runtime libraries, remote assets, external fonts, images, audio files, APIs, or build step. Dev-only test dependencies are permitted.
- Keep a visible version label and short in-game changelog current when the game changes. Give the owner the complete updated `game.html`.
- Preserve WASD/arrows, mouse aim and automatic fire, touch movement, dash, pause/resume, localStorage high score, and the saved World 2 unlock.
- All upgrades are one-time purchases (`max:1`). Owned/maxed upgrades must not appear. Announce when the whole tree is acquired; keep leveling through XP afterward.
- ALL levels are XP-only. Do not restore upgrade countdowns, time gates, or the old early-level XP-to-score overflow system. Keep surplus XP. Current costs start at 70 XP, increase smoothly, and cap at 1,000.
- World 1 levels 41–50 progressively increase warden spawns. At level 50 clear existing enemies, then fight exactly 20 final wardens. Their defeat permanently unlocks World 2. Preserve its distinct character, environment, enemies, upgrades, and level-50 finale.
- The bot must aim, shoot, collect XP, select upgrades, and transition worlds. It patrols the rectangle toward corners and changes its target quadrant at most every 4.2 seconds. It must keep moving while firing and can deviate to avoid danger or collect cores.
- Keep the hidden-tab Worker/interval simulation with its single shared clock. Never add automatic blur/visibility pause. Explicit pause and upgrade screens still freeze combat. Browser suspension remains outside the game's control.
- Bot upgrade screens and automatic transitions must not take keyboard focus. Preserve focus when the page is unfocused or a text editor is active; ignore game shortcuts typed into editors. World 2 starts with one petal bolt and earns two more through Threefold Bloom.
- Damage invulnerability, safe enemy spawning, upgrade input isolation, guarded resume, and complete restart resets must remain intact.

## Visual direction and latest feedback

The owner wants an attractive, visible space scene: teal/violet nebulae, a layered starfield, and an atmospheric blue planet. Keep stars visibly smaller and dimmer than enemy bullets. The brightest decorative stars and glow were deliberately dimmed in v2.3.1. The planet is horizontally centered above the arena (`W*.5`, `H*.12`). Do not reintroduce the disliked lower-left ring. Keep a quiet central combat area and inspect both desktop and portrait layouts.

## Implementation and checks

- Inspect existing functions before rewriting. Keep the single-file architecture unless the owner changes that requirement.
- `xpNeeded`, `openUpgrade`, `chooseUpgrade`, `startRun`, `configureWorld2`, `thinkBot`, `spawnWave`, `update`, `advanceSimulation`, `paintSpaceBackground`, `paintGardenBackground`, and `render` are useful entry points.
- Playing needs no Node or npm. Automated validation uses `npm install` once, then `npm test`; Node must satisfy `package.json`'s engine range. These are development dependencies only.
- `tests/qa.cjs` injects private test hooks into the inline IIFE in memory. Do not ship hooks in `game.html`. If names or the IIFE terminator change, update the harness appropriately rather than weakening assertions.
- Run checks appropriate to the edit. For gameplay changes, run the full suite. For purely visual edits, also render and inspect relevant PNGs under `tests/artifacts/`; a browser check is preferable when available. The suite uses JSDOM/native Canvas, not a real browser. See `VALIDATION.md` for limits.
- Respect entity caps and keep expensive background generation out of the per-frame loop. Do not remove caps to make a test pass.
- Default delivery preference: after the relevant checks pass, commit completed changes and merge them into `main`. Do not leave routine finished work on an unmerged branch or stop after preparing a pull request. If the user requests a review instead, follow that request.
- Keep the visible version and short in-game changelog current whenever game code changes. Record each code change in `PROJECT_HISTORY.md` and add its validation evidence and HTML SHA-256 to `VALIDATION.md`. Keep current-version references in `README.md`, `AGENTS.md`, and `package.json` synchronized.
- Briefly report the outcome, what changed, what was checked, and any material limitations. Keep updates understandable to a beginner. Ask only when essential information is missing.
