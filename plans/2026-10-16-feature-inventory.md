# Feature Inventory: Flash parity gaps (2026-10-16)

**Goal:** The port should match the Flash original at almost all times during gameplay.
**Method:** Systematic comparison of `core/GameEngine.as` vs `src/GameEngine.js`,
`loadfromXML` node wiring, block `update()`/`gameScroll()` implementations, and
in-game UI. Menus are out of scope (separate work).
**Scope:** In-game RUNTIME features only. Not covering: menus, level editor,
online/PHP, Mochi (intentionally dropped per AGENTS.md).

Priorities: **P0** = breaks level completion/progression · **P1** = noticeable
gameplay gap · **P2** = polish.

---

## P0 — Breaks levels

| Feature | Original behavior (`Jump--goober--Jump--`) | Port status | Notes |
|---|---|---|---|
| Auto camera-follow `gameScroll()` | `GameEngine.as:520` — called **every tick** (`update`, line 470). When `testguy.y < 250`, scrolls all blocks + player by `SCROLL_SPD = roundDec((250 - testguy.y)/9, 1)`, advances `currenty`, parallax `bg_y`, `calc_bg_scroll_rect()` | **Missing** — `src/GameEngine.js` `gameScroll(scroll_spd)` exists but is only called when `debugScrollSpeed != 0` (PageUp/PageDown). Normal play never scrolls | User-reported: "scroll camera following player doesnt seem to work". Breaks every vertical level |
| Goal triggers level completion | `blocks/Goal.as:91` — `update()` checks `hitTestObject`, calls `g.loadnextlevel(true)` | **Broken** — `src/blocks/Goal.js` `update()` only animates; never advances the level | Nothing else calls `loadnextlevel(true)`. Levels cannot be completed |
| `rocketboss` XML nodes | `core/GameEngine.as:207` — `clvlxml.rocketboss` → `new RocketBoss(x, y)` pushed to `deathwall` array | **Missing** — no `case 'rocketboss'` in `_createBlockFromRecord`; falls to `default: return null`, silently skipped | `src/blocks/RocketBoss.js` was ported today but is not imported or instantiated |
| Boost pads | `blocks/Boost.as:55` — on guy touch: `vy -= 3` (if `vy > -20`), boost sound w/ 35-tick cooldown, `jumpCounter += 4` | **Missing** — `src/blocks/Boost.js` is a visual-only stub (18 lines, no `update()`) | Boost surfaces do nothing |
| Boost fruit | `blocks/BoostFruit.as:43` — on touch: `testguy.boost = 3`, `canJump = true`, fruit sound, eat animation | **Missing** — `src/blocks/BoostFruit.js` is a visual-only stub (18 lines, no `update()`) | Air-jump/boost mechanic completely dead. `Guy.js` faithful path reads `boost` but nothing ever sets it |

---

## P1 — Noticeable gameplay gaps

| Feature | Original behavior | Port status | Notes |
|---|---|---|---|
| Block update y-range gating | `GameEngine.as:437` — per tick, blocks get `update()` only if `y` in `(-500, 1000)`; `simpleupdate()` only if `y <= -500` | **Diverged** — `src/GameEngine.js` `tick()` calls `simpleupdate()` then `update()` on **every** block unconditionally | Bosses/hazards far offscreen run full logic; perf + behavior risk (e.g. launchers firing from offscreen) |
| `clearAbove` block recycling | `GameEngine.as:480` — per block: removes when `y <= -500`, **re-adds** when back in `[-500, 1000]` (`memRemoved=false`) | **Diverged** — port's `_clearByBounds` only removes; never re-adds | Blocks scrolled off the top won't come back if the player descends |
| Death walls | `GameEngine.as:141` — `deathwall` XML → `new FalldownBlock(...)` in `deathwall` array; kill via `innerhitbox` touch in `FalldownBlock.update` | **Diverged** — port creates tinted `Wall` instances; `FalldownBlock.js` (ported today) not imported/wired; death handled via `Guy.checkDeathCollision` bridge | Hitbox semantics differ (inner vs full). Wire `FalldownBlock.js` and move death trigger into it per source |
| Offscreen death bounds | `GameEngine.as:503` — `x < -25 \|\| x > 525 \|\| y > 505 \|\| y < -300`, plays `fallsound`, `timer.stop()`, `reload()` | **Diverged** — port uses `-64/564/-220/620` and calls `testguy.explode()` (no fallsound) | Die at different positions; different death feedback |
| RocketLauncher | `blocks/RocketLauncher.as:28` — charges, fires homing `Rocket` into `deathwall`, uses `rocketparticlesreuse` pool | **Missing** — `src/blocks/RocketLauncher.js` is a 21-line stub, no `update()` | No rockets in levels that have launchers. `Rocket.js`/`RocketParticle.js` ported but unused |
| LaserLauncher | `blocks/LaserLauncher.as:28` — fires `Bullet` projectiles, `simpleupdate` for offscreen | **Missing** — 22-line stub, no `update()` | `Bullet.js` ported but unused |
| TrackBlade | `blocks/TrackBlade.as:39` — blade moves along track, kills on `innerhitbox` touch | **Missing** — 18-line stub | Moving blade hazards don't exist |
| TrackWall / ActivateTrackWall | `blocks/TrackWall.as` (237 lines), `ActivateTrackWall.as` (100) — walls riding tracks, activator triggers | **Missing** — both stubs (18/19 lines) | Track-wall puzzles don't function |
| FlowerBoss / CloudBoss / BossActivate | Full boss state machines (`FlowerBoss.as` 196 lines, `CloudBoss.as` 213, `BossActivate.as` 172) | **Missing** — all stubs (18–21 lines) | Boss fights don't work. `RocketBoss.js` ported but unwired (see P0) |
| Background parallax + scroll rect | `GameEngine.as:512,526` — `calc_bg_scroll_rect()` every tick in `gameScroll()`; `bg_y`/`bgcounter` parallax | **Broken** — port's `createScrollRectMask()` runs once; `bg_y` only updates in debug `gameScroll` | Tied to the missing auto-`gameScroll()`; background won't track the camera |

---

## P2 — Polish

| Feature | Original behavior | Port status | Notes |
|---|---|---|---|
| Music fade-in | `GameEngine.as:370` — `soundfadein()` every tick: `+0.03` volume until 1.0 (unless muted) | **Missing** — `SoundManager.soundfadein()` exists but is never called | Music starts at full volume or not faded |
| ESC timing | `GameEngine.as:555` — `pausebuttonaction()` on ESC **keyup** | **Diverged** — port handles Escape on **keydown** (`handleMenuButton`) | Minor input-timing difference |
| F1 mute shortcut | `GameEngine.as:560` — `mutebuttonaction()` on F1 keyup | **Missing** — port has no F1 binding |  |
| `moveUiToFront` ordering | `GameEngine.as:451` — runs every tick, brings bosses/pausedcover/testguy/UI to front in source order | **Diverged** — port runs it per render frame in `update()`, not per tick | Probably fine visually; noted for completeness |

---

## Newly ported, not yet wired (from 2026-10-16 grind)

These files exist in `src/` but are **not imported or instantiated** by
`GameEngine.js` / `BootScene.js`. Wiring them in is prerequisite for the P0/P1
items above that reference them.

- `src/blocks/FalldownBlock.js` — needs `case 'deathwall'` in `_createBlockFromRecord` (replacing the tinted-`Wall` placeholder)
- `src/blocks/Rocket.js`, `src/blocks/RocketParticle.js` — need imports in `RocketLauncher.js` + launcher behavior port
- `src/blocks/RocketBoss.js` — needs `case 'rocketboss'` in `_createBlockFromRecord` (push to `deathwall`, per `GameEngine.as:207`)
- `src/misc/*.js` (13 files) — menus/editor/online; out of runtime scope for now
- ~15 new texture keys need `BootScene.js` preload entries before visuals appear (listed in each file's header)

## Verified working (no action)

- Fixed 33.3ms timestep, key-stack input, `Guy.as` verbatim movement (8/8 e2e passing)
- `BaseBlock.gameScroll` matches source
- `Track` static (its `update` is commented out in the AS3 source — stub is correct)
- HUD `TIME`/`DEATHS` text format and per-frame update
- Pause toggle, mute button, skip button, menu button wiring
- `inputStackMove`, `jumpUnpressed`, DOWN brake, key aliases

---

## Suggested implementation order

1. Auto `gameScroll()` in `tick()` (P0 — unblocks vertical play; also fixes bg parallax)
2. Goal → `loadnextlevel(true)` (P0 — unblocks level completion)
3. Wire `FalldownBlock.js` to `deathwall` nodes; wire `rocketboss` case (P0)
4. Port `Boost.update` + `BoostFruit.update` (P0 — core mechanics)
5. Port `RocketLauncher`/`LaserLauncher`/`TrackBlade` behaviors (P1 hazards)
6. Port `TrackWall`/`ActivateTrackWall`, then bosses (P1)
7. Block y-range gating + `clearAbove` recycling (P1)
8. Offscreen-death bounds/fallsound, `soundfadein`, key shortcuts (P1/P2)

---

## Second-pass findings (2026-10-16, evening)

Divergences missed by the first inventory. Do NOT re-list items from above.

### Critical: Block array placements diverge from source

`GameEngine.as` pushes blocks to specific arrays that determine collision
(`Guy.update` only checks `walls`) and update ordering. The port uses
different arrays:

| Block | Original (`GameEngine.as`) | Port (`_createBlockFromRecord`) | Impact |
|---|---|---|---|
| `trackwall` | `walls` (line 169) | `tracks` | Guy will not collide — `Guy.update(walls)` only tests `walls` |
| `activatetrackwall` | `walls` (line 179) | `tracks` | Guy will not collide |
| `trackblade` | `deathwall` (line 174) | `tracks` | Wrong update path; `moveUiToFront` skips it |
| `rocketlauncher` | `deathwall` (line 199) | `otherblocks` | Wrong update path |
| `laserlauncher` | `deathwall` (line 204) | `otherblocks` | Wrong update path |
| `bossactivate` | `particles` (line 214) | `otherblocks` | Wrong update path |
| `flowerboss` | `deathwall` (line 184) | `otherblocks` | Wrong update path |
| `cloudboss` | `deathwall` (line 194) | `otherblocks` | Wrong update path |

The port added an `otherblocks` array (not in the original) to `blocksarrays`,
so these blocks do get `update()` calls — but collision and boss-z-ordering
behave differently than the source.

### Constructor argument mismatches

- `flowerboss`: original is `new FlowerBoss(node.@y)` — only Y is passed
  (`GameEngine.as:183`). Port calls `new FlowerBoss(x, y)`.
- `cloudboss`: original is `new CloudBoss()` — no arguments
  (`GameEngine.as:193`). Port calls `new CloudBoss(x, y)`.
- `trackblade`: original is `new TrackBlade(node.@x, node.@y)` — only X,Y
  (`GameEngine.as:173`). Port also passes width/height.

### `Track.js` incomplete (blocks track followers)

`src/blocks/Track.js` is still first-pass. Missing from `blocks/Track.as`:
- `direction` — `HORIZ (true)` if `w > h`, else `VERT (false)`
- `start` / `end` — `x` / `x+w` for horizontal, `y` / `y+h` for vertical
- Negative-dimension normalization: if `w < 0` then `x += w; w = -w`
  (same for `h`)

`TrackBlade.findTrack()` and `TrackWall` read these to move; without them,
blades/walls on tracks will not move.

### Missing texture preloads in `BootScene.js`

These keys are referenced by the newly-ported blocks (guarded by
`scene.textures.exists()`) but have no preload entry — visuals will be
placeholder shapes until added:
- `flowershot_img`, `launcher1_img`, `launcherbase_img`, `rocket_img`,
  `trackblade_img`

### `Guy.explode()` visual simplification (minor)

Original `Guy.as` `explode()` spawns 24 green particles in a radial pattern
after the 4-frame animation. The port shows the explosion frames but skips
the particle burst. Visual-only; no gameplay impact.

### Verified matching (no action)

- `BaseBlock.gameScroll()` matches source (`y += scroll_spd`)
- `Wall`/`Goal` do not override `gameScroll` in either codebase
- `simpleupdate()` overrides exist for the same 5 classes in both
  (`BaseBlock`, `LaserLauncher`, `RocketBoss`, `TrackBlade`, `TrackWall`)
- `Guy` hitboxes match source: 26x22 at (0,2), inner 24x20 at (1,4)
- `updateImg()` vy double-flip quirk mirrored; boost decrement on wall-hit
  present in both Y and X chunk loops
- `loadfromXML` attribute sets match for `wall`, `deathwall`, `goal`,
  `boost`, `boostfruit`, `track`, `textfield`
- `loadnextlevel` / `reload` / `clear` flow structure matches
- `makeui` text content and button positions match
