# Void Wake

A complete 2D spaceship survival game in one offline HTML file. Current version: **v2.3.2**. Prepared for a GitHub/Codex handoff on October 2, 2026.

**Start with `CODEX_START_HERE.md` if you are new to GitHub or Codex.**

## Play immediately

Open root `game.html` in Chrome, Brave, or another modern browser. Click **Play** to control the ship or **Watch Bot** to watch the built-in pilot. The game itself needs no install, server, npm, account, internet connection, or API key.

| Control | Action |
| --- | --- |
| WASD / arrow keys | Move |
| Mouse cursor | Aim; weapons fire automatically |
| Space / Shift | Dash |
| P / Escape | Pause or resume |
| B / HUD bot button | Switch between human and bot control |
| M | Toggle procedural sound |
| 1 / 2 / 3, or click a card | Choose an offered upgrade |
| Touch controls | Movement and dash; touch aiming behavior is handled by the game |

## Current game

- World 1: the evolving Kestrel-9 spaceship, five space regions, multiple enemy tactics, and 20 one-time ship systems.
- XP-only upgrades at every level. Cost starts at 70 XP, grows smoothly, and never exceeds 1,000 XP. Surplus XP carries forward.
- World 1 levels 41–50 ramp into a warden invasion. Level 50 ends with exactly 20 final wardens; clearing it unlocks World 2 permanently.
- World 2: Chloris, a living garden, the Verdant Manta, new enemies, seasonal hazards, 24 one-time adaptations, and its own finale.
- The bot moves, aims, collects XP, selects upgrades, and enters World 2. It follows a corner-oriented patrol and changes target quadrants every 4.2 seconds.
- Health, damage invulnerability, safe spawns, particles, effects, procedural sound, pause, restart, and a stored high score.
- Worker/interval background simulation continues when the tab loses focus, subject to browser throttling or suspension.
- Stars are smaller and dimmer than hostile shots; the blue planet is horizontally centered at the top.

High score, sound preference, and World 2 unlock are stored in browser `localStorage`. This branch does **not** contain a full-run save/continue system. Storage is browser/profile/origin-specific; moving from a local file to a hosted URL does not migrate those values automatically.

## Files

| Path | Purpose |
| --- | --- |
| `game.html` | Entire current game and distributable source |
| `AGENTS.md` | Project instructions Codex discovers |
| `PROJECT_HISTORY.md` | Feature history, accepted decisions, superseded behavior |
| `CODEX_START_HERE.md` | Beginner upload, cloud setup, first prompt, everyday workflow |
| `VALIDATION.md` | Verification coverage and limitations |
| `tests/qa.cjs` | Portable automated regression/rendering harness |
| `package.json` | Dev-only test setup |
| `history/snapshots/` | Six genuine earlier HTML files, not active entry points |

The history is a curated record plus actual snapshots, not a reconstructed Git commit log or verbatim chat export. Git history starts when you upload/commit these files.

## Development checks

Use Node 22.22.2+ on the 22.x line, Node 24.15.0+ on the 24.x line, or Node 26+. The exact allowed range is in `package.json`.

```sh
npm install
npm test
```

The game has no npm runtime dependencies. The test tools `jsdom` and `@napi-rs/canvas` are development-only. `npm install` produces a lockfile; commit that lockfile, then use `npm ci` on later clean environments. Tests generate PNGs under `tests/artifacts/`, excluded from Git.

## Distribution

Give players the complete `game.html`. GitHub stores the code; uploading the repository alone does not host a playable website. Hosting can be added separately later. No open-source license was selected in this handoff; choose one only if you intend to grant those rights.
