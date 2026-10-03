# Void Wake — relevant project history

This handoff preserves the visible project's requirements, decisions, real earlier snapshots, and latest state. It is a curated development history, not the full chat transcript and not an invented Git commit history. Current source: root `game.html`, v2.3.5.

## Original brief

A complete, playable single-screen 2D browser survival game: move a spaceship with WASD/arrows; auto-fire toward the mouse; enemies spawn outside the screen and chase; include at least three distinct behaviors, increasing difficulty, score, health, brief invulnerability, particles, hit feedback, procedural sound, clear responsive UI, start/pause/game-over/restart screens, and localStorage high score. Everything must remain in one offline HTML file with no runtime libraries, external media, fonts, or online resources. Level-ups pause and offer three random upgrades when enough unused upgrades remain.

Quality requirements: no rapid repeated damage, no leaked motion or firing during upgrade selection, complete restart resets, no unavoidable starting damage, and bounded entity counts.

## Evolution of gameplay

1. **Unique upgrades.** The owner first asked to hide maxed upgrades, then clarified that upgrades should not repeat at all. Current trees are entirely one-time choices. Completion is announced and empty upgrade menus never open.
2. **XP progression.** Initial requests included no time-based upgrades after level 5, slower growth in XP requirements, and a 1,000 XP threshold cap. Timed early levels were retained for a while; later feedback explicitly removed the timer feature altogether. That later instruction controls the current game.
3. **Built-in bot.** Watch Bot starts automated play. The bot also chooses upgrades and transitions into the unlocked second world. A human can take over using B or the HUD button.
4. **Continue when unfocused.** Blur/hidden-tab events do not pause gameplay. A Blob Worker, with an interval fallback, advances the same simulation clock used by rendering. An explicit pause or upgrade choice still freezes combat. Browser suspension can still interrupt any page.
5. **Bot patrol.** The owner requested circular movement around the rectangular playfield, no standing still while shooting, a new target quadrant within five seconds, and more corner visits for XP. The current route switches targets every 4.2 seconds and permits detours for pickups and danger avoidance. Changing a target is not a guarantee the bot physically reaches that quadrant on time in every crowded situation.
6. **Warden finale.** Difficulty escalates from levels 41 to 50. World 1's final level is 50. Existing enemies must be cleared before the final invasion, which contains exactly 20 final wardens. Defeating them permanently unlocks World 2.
7. **World 2.** Chloris changes the environment, player model, enemies, hazards, and upgrade tree. Score and total run time carry into it; health, level, ship stats, and upgrade tree reset to a safe fresh World 2 start. It has 24 one-time adaptations and a level-50 finale: three Dreadblooms followed by The Heart.
8. **World 1 expanded.** The starting world keeps its spaceship theme and now has five regions, an evolving ship, new enemy tactics, hazards, salvage, and 20 one-time ship systems. Special systems include missiles, railguns, ion trails, Tesla arcs, point defense, fusion bursts, overdrive, and an emergency warp.

## World 1 regions

| Levels | Region | Character |
| --- | --- | --- |
| 1–10 | Orbital Frontier | Blue planet, stellar backdrop, early pursuit combat |
| 11–20 | Shattered Belt | Moon/debris, mineable asteroids |
| 21–30 | Solar Foundry | Warm stellar glow, warned solar beams |
| 31–40 | Gravity Rift | Distant rift, warned local pulling hazards |
| 41–50 | Warden Gate | Increasing warden pressure and the final invasion |

The removed lower-left opening ring is decorative scenery, distinct from actual Gravity Rift hazards or the late-game gate. Do not restore it to the starting region.

## Recent iterations and what superseded them

| Version | Changes and status |
| --- | --- |
| v2.0.0 | World 2 baseline preserved in a real snapshot. |
| v2.1.0 | World 1 expansion: regions, enemies, weapons, hazards, ship evolution. |
| v2.1.1 | Natural planet/rift rendering and smoothing of early XP costs. Timed early levels temporarily capped XP reserves and converted overflow to score; both behaviors are obsolete. |
| v2.2.0 | Removed ALL upgrade time gates. New XP curve starts at 70, grows smoothly, caps at 1,000, and preserves surplus XP. Calmer procedural backgrounds. |
| v2.2.1 | Removed the disliked lower-left ring and restored brighter background stars. |
| v2.3.0 | Owner found the scene too empty/dim. Rebuilt art direction with a dense starfield, teal/violet nebulae, warm stellar highlights, and a brighter planet. |
| v2.3.1 | Dimmed large decorative stars and their glow so hostile bullets stand out. Moved the planet from upper right to horizontally centered above the arena. |
| v2.3.2 | Fixed surplus XP being truncated when the final upgrade was chosen in either world, and in the completed-tree guard. All banked XP now remains available for subsequent levels. |
| v2.3.3 | Fixed the bot hovering beside World 2 warning circles near arena edges. It now chooses a consistent detour with space to move. Corrected the shared projectile dodge direction so it turns away from incoming shots. |
| v2.3.4 | Changed World 2 to one starting petal bolt at the owner’s request; Threefold Bloom adds two. Guarded UI focus so bot upgrades and automatic transitions do not interrupt typing, and ignored game shortcuts in text editors. |
| **v2.3.5 — current** | Fixed buried burrowers intercepting projectiles/guidance/chains and underground separation; touch aiming no longer overrides bot targets. Restored Space activation for focused buttons. Added visible XP/build progress, a pause-screen installed-build list, and synchronized touch/mouse/bot instructions. |

## Current XP curve

```js
function xpNeeded(level) {
  const rank = Math.max(0, level - 1);
  return Math.min(1000, Math.round(
    70 + rank * 16 + 30 * (1 - Math.exp(-rank / 3))
  ));
}
```

Examples: level 1 needs 70 XP to reach level 2; level 2 needs 95; level 5 needs 156; level 10 needs 243. No time condition determines level-ups. The numeric cap is 1,000 even though this campaign ends each world at level 50 before the curve naturally reaches the cap.

A development bot sample after timer removal reached its first upgrade at about 30 seconds; the next several were roughly 19–20 seconds apart. That is a sample, not a guaranteed cadence. Combat, build choices, survival, pickups, and bot decisions change the timing.

## Latest visual preferences

- Keep a visible, attractive star/space atmosphere; the owner disliked backgrounds becoming almost empty.
- Prefer luminous teal and violet nebulae, a layered starfield, warm/cool star color variation, and a shaded atmospheric planet.
- Dim oversized decorative highlights relative to enemy projectiles; do not erase the starfield.
- Keep the planet at `W * .5, H * .12` for a balanced top-center composition; keep the central battle area readable.
- Remove the lower-left ring in the starting region. Do not confuse that preference with removing all actual rift gameplay.
- Continue checking desktop and portrait sizes.

## Genuine earlier snapshots

| File | What it preserves |
| --- | --- |
| `history/snapshots/v1.0.0.html` | Earlier bot-era baseline, archived before the endgame work |
| `history/snapshots/v1.1.0.html` | World 1 finale/unlock baseline, archived before World 2 |
| `history/snapshots/v2.0.0.html` | World 2 baseline, archived before World 1 expansion |
| `history/snapshots/v2.1.0.html` | Expanded World 1 before early pacing/background refinements |
| `history/snapshots/v2.1.1.html` | Last timed-early-level build before removing timers |
| `history/snapshots/v2.2.1.html` | XP-only build before the denser stellar art overhaul |

Not every intermediate version has a separate saved HTML snapshot. These files are actual archived bytes, not recreated versions. Their behavior is historical and can conflict with the current instructions.

## Ongoing Codex workflow preference

The owner asked Codex to merge completed, checked changes into `main` by default and to record each code change in the project history. This standing preference is stored in `AGENTS.md`; edit its default-delivery bullets to change it. Update `README.md` and the current release log when the preference changes.

## Handoff boundaries

- No full-run save/continue or replay system exists in this particular branch. High score, sound, and the World 2 unlock are persisted.
- The game has not been published to GitHub as part of preparing this package. Uploading these files creates the initial GitHub history; Codex can continue from there.
- The owner's ongoing priorities are fun, variety, readable visuals, reasonably paced upgrades, and complete downloadable code. Keep the visible version tag and short changelog.

## v2.3.5 product review — October 3, 2026

Reviewed the active single-file game and ran the existing suite before editing. The baseline passed, but focused probes and actual browser keyboard checks exposed gaps in its coverage.

- Underground burrowers absorbed projectile hits despite rejecting damage, attracted homing and chain-lightning jumps, and pushed nearby creatures. A shared targetability guard now makes buried creatures intangible while retaining vulnerability during their visible emergence.
- On touch devices, human aim assistance replaced the bot's priority target every tick. Touch assistance now runs during human control and selects visible targets.
- Space was globally consumed even on menu and HUD buttons. Focused buttons now receive native keyboard activation; the arena retains Space dash. The touch DASH button also responds to click/keyboard activation, with cooldown protection after pointer activation.
- Numeric XP stays visible after either one-time tree completes. A separate HUD row shows systems/adaptations acquired, and Pause lists the current build with the correct world-specific total and a fresh-run empty state.
- Touch, mouse, and bot instructions stay synchronized, including touch guidance on the start screen. Narrow-screen hull labels and health values are readable without splitting the health fraction across lines.

Version/changelog, project instructions, package metadata, and documentation are synchronized at v2.3.5. The original offline architecture, XP curve, one-time trees, corner patrol, shared background clock, World 1's exact 20-warden finale, distinct World 2, restrained stars, and centered planet remain in place. Validation evidence is recorded in `VALIDATION.md`.
