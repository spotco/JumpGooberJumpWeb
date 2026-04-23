# Jump Goober Jump Web - High-Level Port Plan

**Last Updated**: 2026-04-23

---

This file tracks the current high-level plan for the Flash-to-Phaser port.

The plan is intentionally system-level right now. Future runs should expand each
phase into exact JavaScript files, method mappings, and implementation tasks.

Original source reference:

```text
/Users/betty/dev/Jump--goober--Jump--
```

Reference web-port style:

```text
/Users/betty/dev/Save-the-Princess-Web
```

---

## Phase 0: Project Setup

Status: scaffolded.

- [x] Initialize `JumpGooberJumpWeb` as a static Phaser 3 project.
- [x] Copy original image assets from `img/`.
- [x] Copy original sound assets from `snd/`.
- [x] Copy original fonts from `misc/Bienvenu.ttf` and `misc/acknowtt.ttf`.
- [x] Copy bundled XML levels from:
  - `misc/world_1/*.xml`
  - `misc/world_2/*.xml`
  - `misc/world_3/*.xml`
  - `misc/challenge*.xml`
  - `misc/blank.xml`
- [x] Add initial boot/menu/game stubs.
- [x] Add `AGENTS.md`, `.gitignore`, and run scripts.

Future expansion hook:
Document the final source tree once the first real gameplay modules are created.

---

## Phase 1: Boot, Asset Loading, And Global Runtime

Primary source:

- `Main.as`
- `Preloader.as`
- `JumpDieCreateMain.as`

Porting approach:

- Keep the web app static, with Phaser loaded from `lib/phaser.min.js`.
- Treat `Main.as` and `Preloader.as` as Flash shell/preloader references only.
  The ad container, SWF bridge, and external sponsor navigation are not core
  gameplay and should stay stubbed or omitted.
- Port the game ownership role of `JumpDieCreateMain.as` into JavaScript:
  constants, mode switching, save ownership, audio ownership, rank data, global
  mute state, and shared helpers.
- Preserve the original internal resolution: `500x520`.
- Load source assets by explicit Phaser keys so later entity classes can refer
  to the original AS3 embed names and asset paths.

Systems to create or expand later:

- `BootScene`: full asset preload and progress display.
- `JumpGooberMain` or equivalent runtime owner: mode routing and shared state.
- `SoundManager`: music IDs, looping behavior, one-shot SFX, mute/fade support.
- `SaveManager`: `SharedObject` replacement using `localStorage`.
- `RankData`: rank thresholds from `misc/RankData.as`.

Future expansion hook:
Add a complete asset manifest and sound ID mapping after all entities are
ported enough to prove which duplicate HQ/LQ/old assets are needed.

---

## Phase 2: Mode And Scene Flow

Primary source:

- `currentfunction/CurrentFunction.as`
- `currentfunction/JumpDieCreateMenu.as`
- `currentfunction/TutorialGame.as`
- `currentfunction/WorldTwoGame.as`
- `currentfunction/WorldThreeGame.as`
- `currentfunction/SpecialGame.as`
- `currentfunction/SimpleGame.as`

Porting approach:

- Preserve the original `CurrentFunction` concept as the mode/session layer
  above gameplay. In Phaser this can be scene data plus small controller
  classes, but the AS3 method names should remain recognizable:
  `destroy()`, `startLevel()`, and `nextLevel(hitgoal)`.
- Port menu hierarchy before online/editor additions:
  main menu, adventure/world menu, online menu shell, level select, challenge
  select, mute button, cursor behavior, and description bubbles.
- Port world progression exactly:
  3 worlds, 11 levels per world, per-world unlock counters, per-level best
  times, rank display, world completion art, and final credits after World 3.
- Port special/challenge levels as local bundled content.
- Keep online mode menu entries visible only if we choose to preserve the
  original surface; remote behavior should be stubbed until local gameplay is
  stable.

Systems to create or expand later:

- `MenuScene` / `MenuController`.
- `WorldSelectController`.
- `LevelSelectController`.
- `ChallengeSelectController`.
- `LevelCompleteScene` or overlay.
- `CreditsScene`.
- `CurrentFunction`-style session controllers for campaign, challenge, custom,
  and online flows.

Future expansion hook:
Define the exact scene/controller split after the core `GameEngine` loop has a
working death, reload, and goal transition path.

---

## Phase 3: Level XML Loading And GameEngine Runtime

First concrete coding target:

Render `data/world_1/level1.xml` in Phaser from the original XML data, with
faithful block positions, negative width/height normalization, text fields,
goal rendering, the original 500x520 playfield, and the initial vertical
camera/scroll structure in place. This first slice is for visual/runtime
foundation only; full player movement parity belongs to Phase 4.

Primary source:

- `core/GameEngine.as`
- `blocks/BaseBlock.as`
- `blocks/Wall.as`
- `blocks/Goal.as`
- `blocks/Textdisplay.as`
- `misc/world_*/*.xml`
- `misc/challenge/*.xml`
- `misc/blank.xml`

Porting approach:

- Keep the original XML format as the canonical campaign data format for now.
- Parse XML nodes into the same runtime lists as AS3:
  `walls`, `deathwall`, `boostlist`, `textdisplays`, `goals`, `boostfruits`,
  `tracks`, `particles`, plus reuse pools for particles, rockets, and bullets.
- Preserve negative width/height normalization because existing levels rely on
  it.
- Preserve the vertical climbing camera model:
  player stays near the scroll threshold, blocks scroll downward, and the
  background uses a scroll window equivalent.
- Preserve timer and death-count semantics:
  game time excludes pause, reload increments death count, and goal completion
  passes `hitgoal=true` to the owning mode.
- Preserve UI controls:
  menu, back/skip, pause/unpause, mute, level display, time/deaths display.
- Preserve memory-removal behavior in spirit:
  remove or hide far-offscreen blocks without changing gameplay.

### 3a. Files And Module Shape

Initial files to create or expand:

- `src/GameEngine.js`
  AS3-style runtime owner for one loaded level. Holds object arrays, current
  vertical offset, background, timer/death placeholders, and update/render
  calls.
- `src/LevelXmlParser.js`
  Parses XML strings into typed node records and builds block instances in the
  same node order as `GameEngine.loadfromXML()`.
- `src/blocks/BaseBlock.js`
  Shared block interface with `type()`, `internaltext()`, `update(gameEngine)`,
  `simpleupdate(gameEngine)`, `gameScroll(scrollSpeed)`, `destroy()`, and
  normalized bounds helpers.
- `src/blocks/Wall.js`
  Phaser equivalent of `blocks/Wall.as`, using the original blue block textures.
- `src/blocks/Goal.js`
  Phaser equivalent of `blocks/Goal.as`, using the original green goal textures
  and simple two-frame fill animation.
- `src/blocks/Textdisplay.js`
  Phaser equivalent of `blocks/Textdisplay.as`, using Phaser text plus the
  original text bubble styling where practical.
- `src/scenes/GameScene.js`
  Replace placeholder rendering with `GameEngine` construction for World 1
  Level 1.
- `src/scenes/BootScene.js`
  Expand preloads only for the assets required by this slice.

Future expansion hook:
After this slice works, split shared drawing/fill behavior into helper modules
only if repeated block classes make the duplication meaningful.

### 3b. XML Parser Scope

Implement first:

- Read XML from Phaser text cache:
  `data/world_1/level1.xml`.
- Parse the root `<level>` attributes:
  `name`, optional `bg`.
- Parse child nodes into records with numeric attributes:
  `x`, `y`, `width`, `height`, plus string attributes such as `text`.
- Support the World 1 Level 1 node types:
  `wall`, `textfield`, and `goal`.
- Preserve source order for construction where it matters visually.
- Normalize negative dimensions exactly like AS3 constructors:
  if `width < 0`, add width to `x` and make width positive;
  if `height < 0`, add height to `y` and make height positive.
- Return an explicit unsupported-node list for later levels. Do not silently
  drop unsupported nodes after World 1 Level 1.

Defer:

- `boost`, `deathwall`, `boostfruit`, `track`, `trackwall`,
  `trackblade`, `activatetrackwall`, bosses, launchers, projectiles, and
  editor-only serialization behavior.
- XML export.
- Remote/online XML metadata.

Validation checklist:

- `world 1-1` appears as the level display name.
- The parser reports zero unsupported nodes for `world_1/level1.xml`.
- Walls with negative dimensions render in their normalized positions:
  for example the wall at `x=363 y=-579 width=-293 height=-26` becomes a
  positive `293x26` wall at `x=70 y=-605`.

### 3c. World 1 Level 1 Rendering

Implement first:

- Use the original `500x520` coordinate space.
- Add background `bg1` with a scroll-window equivalent or a Phaser container
  strategy that can later match `bg.scrollRect`.
- Render all `wall` nodes as blue textured rectangles:
  use `img/block/blueblock.png` or `img/block/blueblocktall.png` for fill,
  and `img/block/blue/top.png` for the top detail, matching `Wall.as`.
- Render all `goal` nodes as green textured rectangles:
  use `img/block/greenblock.png`, `img/block/greenblock2.png`, and edge
  textures from `img/block/green/`.
- Render all `textfield` nodes as readable text at the source coordinates.
  Start with Phaser text using the original text string; add the bubble art
  after basic placement is correct.
- Put all level objects inside a single world container so vertical scrolling
  can be implemented by moving the container or by updating each block through
  `gameScroll()`.

Defer:

- Pixel-perfect bitmap fill parity for every block edge.
- Complex text bubble animation.
- Goal collision/completion.
- Player-controlled scrolling.

Validation checklist:

- All 19 walls, 6 text fields, and 1 goal from World 1 Level 1 are created.
- The first screen shows the ground/platform layout from the XML.
- Offscreen negative-`y` objects exist in the runtime arrays even if not
  visible before scrolling.
- No placeholder rectangle remains from the scaffold.

### 3d. GameEngine Runtime Skeleton

Implement first:

- Constructor shape should mirror:
  `new GameEngine(main, curfunction, clvlxml, name, usebackbutton, useBg,
  hasskip, deathcount)`.
  In JS/Phaser this can be an options object, but retain the same field names
  internally.
- Initialize AS3-equivalent arrays:
  `deathwall`, `boostlist`, `textdisplays`, `walls`, `goals`, `boostfruits`,
  `tracks`, `particles`, `particlesreuse`, `rocketparticlesreuse`,
  `bulletsreuse`.
- Add `loadfromXML(xmlText)` with the same node-type ordering as
  `GameEngine.as`.
- Add `makeui()` as a minimal first pass:
  level name, `TIME: 0:00:000`, `DEATHS:0`, and a back/menu placeholder.
- Add `update(time, delta)` even if it only runs goal animation and text/block
  animation for this slice.
- Add `clear()` that destroys Phaser objects and clears arrays.
- Add `gettimet(n)` equivalent early so timer display formatting is settled.

Defer:

- Real `CurrentFunction` callbacks.
- Death/reload behavior.
- Pause/mute button behavior beyond noninteractive placeholders.
- Object memory removal until scrolling and player movement are active.

Validation checklist:

- `GameScene` can create and clear a `GameEngine` instance without leaking
  visible objects during scene restart.
- Timer text uses the same `m:ss:ms` shape as AS3.
- Runtime arrays contain the expected World 1 Level 1 counts.

### 3e. Camera And Scroll Foundation

Implement first:

- Keep `currenty` and `bg_y` fields from `GameEngine.as`.
- Define a `gameScroll(scrollSpeed)` path that can move every block through its
  own `gameScroll()` method.
- For the first visual pass, expose temporary keyboard scroll controls for
  testing the vertical level without claiming gameplay parity:
  for example PageUp/PageDown or debug-only keys.
- Keep the scroll threshold logic documented in code comments for Phase 4:
  original scroll speed is `roundDec((250 - testguy.y) / 9, 1)` when
  `testguy.y < 250`.

Defer:

- Player-driven scrolling.
- Background scrollRect exactness.
- Offscreen death bounds.
- `clearAbove()` and `clearBelow()` pruning.

Validation checklist:

- Debug scrolling can reveal the goal at the top of World 1 Level 1.
- Blocks and text move together without drifting apart.
- Background movement can be refined later without rewriting block placement.

### 3f. Asset Loading For This Slice

Add only the required assets first:

- `bg1`: `img/block/bg1.png`
- `wall_blue`: `img/block/blueblock.png`
- `wall_blue_tall`: `img/block/blueblocktall.png`
- `wall_blue_top`: `img/block/blue/top.png`
- `goal_green_1`: `img/block/greenblock.png`
- `goal_green_2`: `img/block/greenblock2.png`
- `goal_green_top`: `img/block/green/top.png`
- `goal_green_left`: `img/block/green/left.png`
- `goal_green_bottom`: `img/block/green/bottom.png`
- `goal_green_right`: `img/block/green/right.png`
- Text display bubble assets from `img/block/textbug/` only if the first text
  pass uses them.
- `world1_level1`: `data/world_1/level1.xml`

Defer:

- Full manifest for all worlds.
- Boss/projectile/track assets.
- Sound preloads not used by this visual slice.

### 3g. Manual Test Plan

Do not start a web server automatically unless the user asks.

When testing is requested:

- Serve the folder over HTTP.
- Open `GameScene` through the existing menu stub.
- Confirm there are no browser console errors.
- Confirm World 1 Level 1 renders from XML, not from hardcoded rectangles.
- Confirm debug scroll can inspect from the spawn area to the goal.
- Confirm scene restart/return to menu cleans up the previous level objects.

### 3h. Completion Criteria For Phase 3 First Slice

This phase slice is complete when:

- World 1 Level 1 is parsed from `data/world_1/level1.xml`.
- `wall`, `textfield`, and `goal` nodes render at source-faithful positions.
- Negative dimensions normalize exactly like the AS3 constructors.
- `GameEngine` owns runtime arrays and basic UI placeholders.
- The level can be debug-scrolled vertically to inspect all objects.
- The code shape leaves obvious hooks for Phase 4 player movement and Phase 5
  block expansion.

Systems to keep expanding later:

- `GameScene`: Phaser scene wrapper.
- `GameEngine`: AS3-style runtime loop and level object manager.
- `LevelXmlParser`: XML-to-runtime-object construction.
- `GameUi`: bottom buttons and top-right timer/death text.
- `TimeFormatter`: `GameEngine.gettimet()` equivalent.

Future expansion hook:
After this slice lands, expand Phase 3 again for full campaign XML coverage:
all node types, all worlds, challenge levels, pause/death/goal callbacks, and
complete UI controls.

---

## Phase 4: Player Movement And Collision

Primary source:

- `core/Guy.as`
- `core/GameEngine.as` input methods

Porting approach:

- Port `Guy.as` before complex blocks, because most block behavior depends on
  exact hitbox, velocity, and wall-jump semantics.
- Preserve original fields and quirks:
  `vx`, `vy`, `boost`, `canJump`, `jumpCounter`, `justtouched`,
  `jumpavailable`, `jumpcd`, `isslide`, `hashitwall`, and separate hitboxes.
- Preserve input stack behavior:
  last pressed movement key wins, jump is edge-triggered, down dampens
  horizontal velocity, `ESC` pauses, and `F1` toggles mute.
- Preserve movement constants:
  gravity increment, friction, wall collision recoil, wall-jump horizontal
  impulse, jump velocity, and boost behavior.
- Port animation selection from movement state using the original sprite set.
- Preserve death animation handoff through `Guy.explode()` and delayed reload.

Systems to create or expand later:

- `Guy` / `Player`.
- `InputStack`.
- `Hitbox` helpers.
- `PlayerAnimation`.
- Optional debug hitbox rendering.

Future expansion hook:
Create a focused movement parity checklist after `Guy` is ported: flat jump,
wall slide, wall jump, boost jump, offscreen death, and collision with negative
dimension walls.

---

## Phase 5: Blocks, Hazards, Goals, And Interactive Objects

Primary source:

- `blocks/BaseBlock.as`
- `blocks/Wall.as`
- `blocks/FalldownBlock.as`
- `blocks/Boost.as`
- `blocks/BoostFruit.as`
- `blocks/Goal.as`
- `blocks/Textdisplay.as`
- `blocks/Track.as`
- `blocks/TrackWall.as`
- `blocks/ActivateTrackWall.as`
- `blocks/TrackBlade.as`
- `blocks/RocketLauncher.as`
- `blocks/Rocket.as`
- `blocks/RocketParticle.as`
- `blocks/LaserLauncher.as`
- `blocks/BossActivate.as`
- `blocks/FlowerBoss.as`
- `blocks/CloudBoss.as`
- `blocks/RocketBoss.as`
- `misc/Bullet.as`

Porting approach:

- Keep `BaseBlock` as the common object interface:
  `type()`, `internaltext()`, `update(gameEngine)`, `simpleupdate(gameEngine)`,
  and `gameScroll(scrollSpeed)`.
- Port simple static and goal objects first:
  `Wall`, `FalldownBlock`, `Boost`, `BoostFruit`, `Goal`, `Textdisplay`.
- Port track systems second:
  `Track`, `TrackWall`, `ActivateTrackWall`, and `TrackBlade`.
- Port projectile and launcher systems third:
  `RocketLauncher`, `Rocket`, `RocketParticle`, `LaserLauncher`, and `Bullet`.
- Port bosses after their supporting projectiles and activation blocks are in:
  `FlowerBoss`, `CloudBoss`, `RocketBoss`, and `BossActivate`.
- Preserve original draw order expectations where gameplay depends on it.
- Preserve block animation counters and update ranges rather than converting to
  Phaser tweens too early.

Systems to create or expand later:

- `src/blocks/` module tree mirroring `blocks/*.as`.
- Shared block texture/tile-fill helpers.
- Projectile reuse pools.
- Boss activation and boss HP/state controllers.

Future expansion hook:
After the core player loop works, expand this phase into a block-by-block port
order based on which XML nodes appear in World 1 before World 2/3 boss content.

---

## Phase 6: Audio, Save Data, Ranks, And Achievements Surface

Primary source:

- `JumpDieCreateMain.as`
- `misc/RankData.as`
- `misc/MochiManager.as`
- `currentfunction/TutorialGame.as`

Porting approach:

- Replace Flash `SharedObject` with `localStorage`.
- Preserve save keys conceptually:
  per-world unlock counters and per-level best-time strings.
- Preserve rank thresholds from `RankData.as`.
- Preserve music selection by mode/world:
  menu, editor, world songs, boss music, ending music, online music, and
  one-shot win/end variants.
- Preserve SFX triggers:
  jump sequence, fall, explode, boost, fruit, cheer, wow, thunder, shoot,
  rocket explode, rocket boss sounds, pause, and unpause.
- Treat Mochi achievements as a local/no-op surface initially. The original
  achievements can become browser-local badges later if requested, but they
  should not block gameplay parity.

Systems to create or expand later:

- `SaveManager`.
- `RankData`.
- `SoundManager`.
- `AchievementManager` stub.

Future expansion hook:
Add a compatibility note for migrating old Flash save fields only if there is
an explicit source of legacy save data to import.

---

## Phase 7: Level Editor And Custom Level Format

Primary source:

- `currentfunction/LevelEditor.as`
- `misc/SubmitMenu.as`
- `misc/ButtonMessage.as`
- `misc/ConfirmationWindow.as`
- `misc/TextWindow.as`
- `misc/blank.xml`

Porting approach:

- Defer editor implementation until campaign gameplay is stable.
- Preserve the original editor feature shape when implemented:
  place, resize, move, delete, undo, scroll, background selection, text entry,
  player spawn, XML output, and test-play flow.
- Keep XML import/export as the first editor file format because original
  online and bundled levels use XML.
- Stub remote submission at first. Browser-local export/import should replace
  the old PHP upload path unless remote services are intentionally rebuilt.
- Preserve editor test-play behavior:
  run the current XML in `GameEngine`, then return to the editor on back/death
  or offer submit after completion.

Systems to create or expand later:

- `LevelEditorScene`.
- `EditorToolState`.
- `EditorXmlSerializer`.
- `EditorPalette`.
- `EditorTestPlaySession`.
- `SubmitMenu` local/export replacement.

Future expansion hook:
Create a separate editor plan after all campaign block types can round-trip
through XML.

---

## Phase 8: Online And Remote-Level Features

Primary source:

- `currentfunction/RandomOnlineGame.as`
- `currentfunction/BrowseMostPlayedGame.as`
- `currentfunction/BrowseMostRecentGame.as`
- `currentfunction/BrowseSpecificGame.as`
- `currentfunction/TypeNameGame.as`
- `misc/OnlineBrowseSelection.as`
- `misc/ReviewSubmitMenu.as`
- `misc/web/*.php`

Porting approach:

- Defer true online behavior until local original gameplay is complete.
- Preserve the menu surface and data model hooks where practical:
  random level, most played, newest, specific/name lookup, play count, and
  rating/review flow.
- Replace PHP service calls with local stubs initially.
- Later options can include static bundled community levels, GitHub-hosted JSON,
  or a rebuilt service. Do not couple core gameplay to any remote dependency.

Systems to create or expand later:

- `OnlineLevelService` stub.
- `OnlineBrowseScene`.
- `ReviewSubmitMenu` local/no-op shell.
- `LevelMetadata` object mapping the old XML response fields.

Future expansion hook:
Write a separate online-data plan only after the user chooses whether online
features should be local-only, static-hosted, or backed by a service.

---

## Phase 9: UI Helpers, Effects, And Completion Polish

Primary source:

- `misc/MenuOption.as`
- `misc/LevelSelectButton.as`
- `misc/TextWindow.as`
- `misc/ConfirmationWindow.as`
- `misc/Fireworks.as`
- `misc/Particle.as`
- `misc/WinAnimation.as`
- `misc/ReviewStar.as`
- `misc/OnlineBrowseSelection.as`

Porting approach:

- Port helper classes as needed by the gameplay phases instead of all at once.
- Preserve original UI layout and image assets for faithful screens.
- Use Phaser text where replacing Flash `TextField`, but keep font, size,
  alignment, and text content close to the source.
- Preserve particle and fireworks timing for win/complete screens.
- Preserve the final credits scroll timing and skip behavior.

Systems to create or expand later:

- `MenuOption`.
- `LevelSelectButton`.
- `TextWindow`.
- `ConfirmationWindow`.
- `Fireworks`.
- `Particle`.
- `WinAnimation`.
- `CreditsScene`.

Future expansion hook:
Add UI parity screenshots/checklists after the game can navigate from menu to
level, complete a level, and return to menu.

---

## Current Implementation Priorities

1. Expand boot asset loading enough to support XML-rendered World 1 Level 1.
2. Implement `LevelXmlParser` and simple block construction.
3. Port `GameEngine` scroll/update structure.
4. Port `Guy` movement and collision.
5. Port simple blocks and goal completion.
6. Build campaign level select and save progression.
7. Add complex blocks, projectiles, bosses, editor, and online hooks in that
   order.

---

## Notes For Future Runs

- Do not replace the XML campaign data with a new format during the faithful
  port unless a later task explicitly asks for it.
- Do not implement online services before local campaign parity.
- Do not implement the editor before all campaign block types exist.
- Keep detailed per-file task breakdowns out of this file until the user asks
  for the next planning pass.
