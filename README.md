# Void Wake

A spaceship survival game in one offline HTML file, with an expanding universe of worlds, unique upgrades, evolving enemies, procedural graphics and sound, and an automated bot pilot. Current version: **v2.8.0**. The current campaign includes World 1 and Chloris; more worlds can be added as the project grows.

**Start with `CODEX_START_HERE.md` if you are new to GitHub or Codex.**

The standing Codex delivery preference is in [`AGENTS.md`](AGENTS.md): finish checks, update the project log, and merge routine changes into `main`. Edit that file to change this behavior.

## Play immediately

Open root `game.html` in Chrome, Brave, or another modern browser. Click **Play** to control the ship or **Watch Bot** to watch the built-in pilot. The game itself needs no install, server, npm, account, internet connection, or API key.

| Control | Action |
| --- | --- |
| WASD / arrow keys | Move |
| Mouse cursor | Aim; weapons fire automatically |
| Space / Shift | Dash |
| P / Escape | Pause or resume |
| B / HUD bot button | Switch between human and bot control |
| M / HUD SFX button | Toggle sound effects independently of music |
| 1 / 2 / 3, or click a card | Choose an offered upgrade |
| Touch controls | Left side moves; right side aims; automatic aim assistance when not aiming; DASH evades |

## Current game

- World 1: the evolving Kestrel-9 spaceship, five space regions, multiple enemy tactics, and 20 one-time ship systems.
- Numerical XP and build progress remain visible after the tree is complete; Pause lists acquired systems and adaptations.
- Enemy formations grow at levels 9 and 25. Escorts carry smaller XP cores; later repairs are scarcer, and stronger upgrades leave room for dodging.
- Every level is earned through collected XP. While unused upgrades remain, level-ups offer up to three one-time choices. After the tree is complete, XP still advances the campaign without repeating upgrades. Cost starts at 70 XP, grows smoothly, and never exceeds 1,000 XP. Surplus XP carries forward.
- World 1 levels 41–50 ramp into a warden invasion. Level 50 ends with exactly 20 final wardens; clearing it unlocks World 2 permanently.
- World 2: Chloris, a living garden, the Verdant Manta starting with one petal bolt, new enemies, seasonal hazards, 24 one-time adaptations, and its own finale.
- The bot moves, aims, collects XP, selects upgrades, and enters World 2. It follows a corner-oriented patrol and changes target quadrants every 4.2 seconds.
- Original cinematic adaptive music: synthesized strings, brass-like anthems, choir-like harmonies, war drums, swells, and stereo hall ambience. Five space-region arrangements and four Chloris-season themes build toward dedicated finales and escalating Heart phases. Arrangement changes enter on bar lines. The start and pause screens put an Audio Mix slider and one Overall Volume slider together near the top. Audio Mix balances SFX against music; Overall Volume turns all sound up or down together. The SFX and music mute switches remain independent, and M plus the HUD SFX button toggle effects only. Mix, overall volume, and mute settings persist locally. Music retains its quiet default level. No downloaded tracks or audio files are used.
- Health, damage invulnerability, safe spawns, particles, effects, procedural sound, pause, restart, and a stored high score.
- Worker/interval background simulation continues when the tab loses focus, subject to browser throttling or suspension.
- Bot upgrades and automatic transitions preserve typing focus; game shortcuts ignore active text editors.
- Stars are smaller and dimmer than hostile shots; the blue planet is horizontally centered at the top.

High score, sound/music preferences, audio mix balance and overall volume, and World 2 unlock are stored in browser `localStorage`. This branch does **not** contain a full-run save/continue system. Storage is browser/profile/origin-specific; moving from a local file to a hosted URL does not migrate those values automatically.

## Files

| Path | Purpose |
| --- | --- |
| `game.html` | Entire current game and distributable source |
| `AGENTS.md` | Project instructions Codex discovers |
| `PROJECT_HISTORY.md` | Feature history, accepted decisions, superseded behavior |
| `CODEX_START_HERE.md` | Beginner guide for the existing repository, checks, and everyday Codex workflow |
| `VALIDATION.md` | Verification coverage and limitations |
| `tests/qa.cjs` | Portable automated regression/rendering harness |
| `tests/music.cjs` | Deterministic Web Audio clock and music/UI regressions |
| `tests/balance.cjs` | Seeded ordinary-health bot and stationary-ship comparisons |
| `qa.cjs` | Compatibility entry point forwarding to `tests/qa.cjs` |
| `package.json` / `package-lock.json` | Dev-only commands and locked test dependencies |
| `.gitignore` | Excludes installed dependencies and generated test artifacts |
| `history/snapshots/` | Six genuine earlier HTML files, not active entry points |

The history is a curated record plus actual snapshots, not a reconstructed Git commit log or verbatim chat export. Git history starts when you upload/commit these files.

## Development checks

Use Node 22.22.2+ on the 22.x line, Node 24.15.0+ on the 24.x line, or Node 26+. The exact allowed range is in `package.json`.

```sh
npm ci
npm test
npm run balance
```

The game has no npm runtime dependencies. The test tools `jsdom` and `@napi-rs/canvas` are development-only. The repository includes `package-lock.json`; use `npm ci` for a clean install of those locked versions. Use `npm install` when intentionally updating dependencies and commit the resulting lockfile changes. Regression tests generate PNGs under `tests/artifacts/`, excluded from Git. `npm run balance` prints seeded simulation results as JSON; it is an observational comparison, not a pass/fail test or a guarantee that the bot will win.

## Distribution

Give players the complete `game.html`. GitHub stores the code; uploading the repository alone does not host a playable website. Hosting can be added separately later. No open-source license was selected in this handoff; choose one only if you intend to grant those rights.
