# Jump Goober Jump Web - Source-Matching Port Plan

**Last Updated**: 2026-04-23

---

This file tracks the active checklist for the direct ActionScript 3 to Phaser 3
port. The target is a source-matching, file-for-file port of the original Flash
game wherever the source file represents runtime behavior.

Original source reference:

```text
/Users/betty/dev/Jump--goober--Jump--
```

Planning style reference:

```text
/Users/betty/dev/Save-the-Princess-Web/PLAN_COMPLETED.md
```

---

## Human notes: Do not start on these unless specifically prompted.
- [ ] Super jump javascript must release arrow key first then jump. Make any order work, and hold other direction work.
- [ ] Air resistance feels different than flash game, try tweaking.
- [ ] debug input lag

---

## Phase 0: Project Setup And Source Inventory

- [x] Initialize `JumpGooberJumpWeb` as a static Phaser 3 project.
- [x] Add `index.html`, `AGENTS.md`, `PLAN.md`, `.gitignore`, `run.sh`, and
  `run.bat`.
- [x] Copy checked-in Phaser from the reference web port.
- [x] Copy original `img/` assets.
- [x] Copy original `snd/` assets.
- [x] Copy original fonts from `misc/Bienvenu.ttf` and `misc/acknowtt.ttf`.
- [x] Copy original bundled XML levels:
  - [x] `misc/world_1/*.xml` -> `data/world_1/`
  - [x] `misc/world_2/*.xml` -> `data/world_2/`
  - [x] `misc/world_3/*.xml` -> `data/world_3/`
  - [x] `misc/challenge/*.xml` -> `data/challenge/`
  - [x] `misc/challenge.xml` -> `data/challenge.xml`
  - [x] `misc/blank.xml` -> `data/blank.xml`
- [x] Audit copied runtime assets against the Flash source:
  - [x] `img/`: 171 source files, 171 web files, checksum match.
  - [x] `snd/`: 89 source files, 89 web files, checksum match.
  - [x] fonts/XML: 41 checked pairs, 0 missing, 0 mismatches.
- [x] Scan active ActionScript source files outside `old/`.
- [x] Update `AGENTS.md` to require source-matching and file-for-file porting.
- [x] Add an `ASSET_AUDIT.md` with copied, omitted, and Flash-only asset notes.
- [x] Decide whether to archive source-present Flash output `jumpdiecreate.swf`
  in the web repo. It is not needed for Phaser runtime.

---

## Phase 1: Boot, Shell, Constants, Audio, Save, And Runtime Owner

Primary source:

- `Main.as`
- `Preloader.as`
- `JumpDieCreateMain.as`

### 1a. Phaser shell and Flash preloader replacement

- [x] Create `index.html` to load Phaser and `src/Main.js`.
- [x] Create `src/Main.js` with Phaser config and scene list.
- [x] Create `src/Constants.js` with first menu/mode constants.
- [x] Create `src/scenes/BootScene.js` as a Phaser boot/preload wrapper.
- [x] Port the relevant non-ad/non-SWF loading flow from `Main.as`.
- [x] Document Flash-only `preloader_bar.png`, `preloader_bg.png`, and
  `startgame_bg.png` references, which are missing from the source checkout.
- [x] Document `Preloader.as` SWF loading as omitted for Phaser runtime.
- [x] Remove Flash ad and SWF bridge calls from the web boot path.
  See `ASSET_AUDIT.md`; Phaser boot now preloads assets directly and skips
  CPMStar, intro SWF, compiled game SWF, and SWFBridge behavior.

### 1b. `JumpDieCreateMain.as` direct port

- [x] Create `src/JumpDieCreateMain.js`.
- [x] Port static mode constants:
  `LEVELEDITOR`, `RANDOMONLINE`, `MOSTPLAYEDONLINE`, `NEWESTONLINE`,
  `SPECIFICONLINE`, `WORLD1`, `WORLD2`, `WORLD3`, `WORLD_SPECIAL`.
- [x] Port static music IDs:
  `MENU_MUSIC`, `LEVELEDITOR_MUSIC`, `WIN_SOUND`, `BOSSSONG`,
  `BOSSENDSONG`, `SONG1`, `SONG2`, `SONG3`, `SONG4`, `SONG1END`,
  `SONG2END`, `SONG3END`, `ONLINE`, `ONLINEEND`.
- [x] Port global flags:
  `MOCHI_ENABLED`, `ONLINE_DB_URL`, `HAS_CHALLENGE_LEVELS`, `IS_MUTED`,
  `CONTEST_MODE`, `LEVELS_UNLOCKED`.
- [x] Port `verifysave()` to localStorage-backed state.
- [x] Port `menuStart(menupos)` routing to source-mapped currentfunction
  classes.
  Phase 2 will replace the placeholder route objects with direct
  `src/currentfunction/*.js` class instances.
- [x] Port `clearDisplay()` as a Phaser-safe display cleanup helper.
- [x] Port `getChecksum(a, b)`.
- [x] Port `playSpecific(tar, repeat)` through a source-mapped sound manager.
- [x] Port `stop()`.
- [x] Port `playsfx(s, t)`.
- [x] Port `getTextFormat(size, type)` semantics to shared text style helpers.
- [x] Port `initrankdata()` through `src/misc/RankData.js`.

### 1c. Audio and save helpers

- [x] Create `src/SoundManager.js` or keep audio ownership in
  `JumpDieCreateMain.js` with source-compatible methods.
- [x] Load and map all music assets from `JumpDieCreateMain.as`.
  `SONG4` has no active embed/file in source and is kept as an explicit unmapped
  ID until the original behavior path is reached.
- [x] Load and map all SFX assets from `JumpDieCreateMain.as`.
- [x] Preserve jump sound sequence behavior used by `GameEngine.playjumpsound()`.
- [x] Preserve mute behavior and sound fade-in behavior.
- [x] Create `src/SaveManager.js` only if it stays source-compatible with
  `SharedObject` fields from `JumpDieCreateMain.as` and `TutorialGame.as`.

---

## Phase 2: CurrentFunction Mode System And Menus

Primary source directory:

```text
currentfunction/
```

### 2a. CurrentFunction base and menu

- [x] Create `src/currentfunction/CurrentFunction.js` from
  `currentfunction/CurrentFunction.as`.
- [x] Create `src/currentfunction/JumpDieCreateMenu.js` from
  `currentfunction/JumpDieCreateMenu.as`.
- [x] Preserve `destroy()`, `startLevel()`, and `nextLevel(hitgoal)` method
  shape.
- [x] Fix menu visibility so only the active menu option set is visible at one
  time. Current bug: main, world, and online options are all visible together.
- [x] Re-check `currentfunction/JumpDieCreateMenu.as` before the fix and keep
  the JavaScript menu state transitions source-matched.
- [x] Port main menu, world menu, online menu arrays, and menu swap behavior.
- [x] Port menu cursor `Guy` usage and description bubble behavior.
- [x] Port mute button behavior.
- [x] Port status display behavior with web-safe online-status stub.
- [x] Keep `src/scenes/MenuScene.js` as a thin Phaser wrapper around
  `JumpDieCreateMenu`.

### 2b. Campaign world select and progression

- [x] Create `src/currentfunction/TutorialGame.js` from
  `currentfunction/TutorialGame.as`.
- [x] Create `src/currentfunction/WorldTwoGame.js` from
  `currentfunction/WorldTwoGame.as`.
- [x] Create `src/currentfunction/WorldThreeGame.js` from
  `currentfunction/WorldThreeGame.as`.
- [x] Port level array construction for 11 levels per world.
- [x] Port level select screen layout, scrolling background, selector `Guy`,
  keyboard and mouse selection, locked-level alpha, and back button.
- [x] Port save progress per world.
- [x] Port per-level best-time display and rank display.
- [x] Port `getsong()` and `playWinSound()` overrides per world.
- [x] Port level-complete screen, time display, rank display, total time,
  deaths, `WinAnimation`, `Fireworks`, and continue flow.
  `WinAnimation` and `Fireworks` are represented as a source-positioned
  completion screen hook until their `misc/*.as` files are ported in Phase 6.
- [x] Port world-complete art and World 3 credits flow.

### 2c. Challenge, simple, editor, and online mode entry classes

- [x] Create `src/currentfunction/SpecialGame.js` from
  `currentfunction/SpecialGame.as`.
- [x] Create `src/currentfunction/SimpleGame.js` from
  `currentfunction/SimpleGame.as`.
- [x] Create `src/currentfunction/LevelEditor.js` from
  `currentfunction/LevelEditor.as`.
- [x] Create `src/currentfunction/RandomOnlineGame.js` from
  `currentfunction/RandomOnlineGame.as`.
- [x] Create `src/currentfunction/BrowseMostPlayedGame.js` from
  `currentfunction/BrowseMostPlayedGame.as`.
- [x] Create `src/currentfunction/BrowseMostRecentGame.js` from
  `currentfunction/BrowseMostRecentGame.as`.
- [x] Create `src/currentfunction/BrowseSpecificGame.js` from
  `currentfunction/BrowseSpecificGame.as`.
- [x] Create `src/currentfunction/TypeNameGame.js` from
  `currentfunction/TypeNameGame.as`.
- [x] Keep remote/PHP behavior stubbed until local campaign parity is stable.
  Online classes preserve source entry shape and route names, but do not call
  PHP endpoints.

---

## Phase 3: Core Runtime And Level XML Loading

Primary source:

- `core/GameEngine.as`
- campaign/challenge XML under `misc/`

### 3a. GameEngine direct port

- [x] Create first `src/GameEngine.js` runtime skeleton.
- [x] Initialize AS3-equivalent arrays:
  `deathwall`, `boostlist`, `textdisplays`, `walls`, `goals`, `boostfruits`,
  `tracks`, `particles`, `particlesreuse`, `rocketparticlesreuse`,
  `bulletsreuse`.
- [x] Create `src/LevelXmlParser.js` for XML parsing.
- [x] Parse `data/world_1/level1.xml`.
- [x] Preserve negative width/height normalization.
- [x] Add first `loadfromXML()` implementation for `wall`, `goal`, and
  `textfield`.
- [x] Add first `makeui()` pass with level display, time, death text, and debug
  scroll help.
- [x] Add `GameEngine.gettimet(n)`.
- [x] Add `gameScroll(scroll_spd)` foundation.
- [x] Add `clear()` foundation.
- [x] Wire `src/scenes/GameScene.js` to create `GameEngine` from
  `world1_level1`.
- [x] Add debug PageUp/PageDown vertical scroll.
- [x] Port `GameEngine.loadfromXML()` support for every node type in source
  order.
- [x] Port `makeui()` fully: menu, back/skip, mute, pause/unpause,
  leveldisplay image, time/death text, and paused cover.
- [x] Port `update(e)` fully: timing, pause, input, player update, block update,
  scroll, UI layering, and early-return behavior.
- [x] Port `moveUiToFront()`.
- [x] Port `clearAbove()` and `clearBelow()` behavior.
- [x] Port `checkOffScreenDeath()`.
- [x] Port background scrollRect behavior.
- [x] Port `onKeyPress()`, `onKeyUp()`, `inputStackMove()`, and
  `playjumpsound()`.
- [x] Port `reload()`, `loadnextlevel(hitgoal)`, and callback contracts to
  `CurrentFunction`.
- [x] Port `clear()` fully, including listener cleanup and object cleanup.

### 3b. XML data coverage

- [x] Copy all bundled campaign/challenge XML files.
- [x] Verify World 1 Level 1 actual counts:
  17 walls, 7 text fields, 1 goal.
- [x] Parse all World 1 levels without unsupported-node crashes.
- [x] Parse all World 2 levels without unsupported-node crashes.
- [x] Parse all World 3 levels without unsupported-node crashes.
- [x] Parse all challenge levels without unsupported-node crashes.
- [x] Add parser diagnostics that report unsupported node type, file, and count.
- [x] Keep XML as canonical source format during the faithful port.

---

## Phase 4: Core Player

Primary source:

- `core/Guy.as`

- [x] Create `src/core/Guy.js`.
- [x] Port fields:
  `vx`, `vy`, `boost`, `canJump`, `jumpCounter`, `justtouched`,
  `JUSTTOUCHED_ERROR_TIME`, `guydisplay`, `hitbox`, `innerhitbox`,
  `isslide`, `hashitwall`, `jumpavailable`, `jumpcd`, `JUMPCDTIMER`,
  `animcounter`, `toggle`, explosion fields, and animation state.
- [x] Port constructor spawn, display setup, hitbox setup, and sprite offsets.
- [x] Port `changePos(chx, chy)`.
- [x] Port `update(walls, justWallJumped)`.
- [x] Port collision chunking, y collision, x collision, recursive out behavior,
  wall-slide behavior, recoil, friction, and gravity.
- [x] Port `checkCollision(walls)`.
- [x] Port `updateImg()`.
- [x] Port `explode()`, explosion animation update, and reload timing handoff.
- [x] Port math helpers from `Guy.as` such as `roundDec`, `SIG`, and
  `SIG_ONE`.
- [x] Validate movement parity: flat jump, wall slide, wall jump, boost jump,
  side fall death, top/bottom offscreen death, and negative-dimension walls.

---

## Phase 5: Blocks Directory File-For-File Port

Primary source directory:

```text
blocks/
```

### 5a. Base and simple blocks

- [x] Create first `src/blocks/BaseBlock.js` from `blocks/BaseBlock.as`.
- [x] Create first `src/blocks/Wall.js` from `blocks/Wall.as`.
- [x] Create first `src/blocks/Goal.js` from `blocks/Goal.as`.
- [x] Create first `src/blocks/Textdisplay.js` from `blocks/Textdisplay.as`.
- [ ] Complete `BaseBlock.js`: `getTransparent`, `makeBitmap`, `type`,
  `internaltext`, `update`, `simpleupdate`, and `gameScroll` equivalents.
- [ ] Complete `Wall.js`, including visual parity and `whitemode()`.
- [ ] Complete `Goal.js`, including collision and `loadnextlevel(true)`.
- [ ] Complete `Textdisplay.js`, including bug animation and proximity alpha.
- [ ] Create `src/blocks/FalldownBlock.js`.
- [ ] Create `src/blocks/Boost.js`.
- [ ] Create `src/blocks/BoostFruit.js`.

### 5b. Tracks and moving hazards

- [ ] Create `src/blocks/Track.js`.
- [ ] Create `src/blocks/TrackWall.js`.
- [ ] Create `src/blocks/ActivateTrackWall.js`.
- [ ] Create `src/blocks/TrackBlade.js`.
- [ ] Preserve track activation, movement, collision, and draw-order behavior.

### 5c. Projectiles and launchers

- [ ] Create `src/blocks/RocketLauncher.js`.
- [ ] Create `src/blocks/Rocket.js`.
- [ ] Create `src/blocks/RocketParticle.js`.
- [ ] Create `src/blocks/LaserLauncher.js`.
- [ ] Create `src/misc/Bullet.js`.
- [ ] Preserve projectile reuse pools and explosion behavior.

### 5d. Bosses and boss activation

- [ ] Create `src/blocks/BossActivate.js`.
- [ ] Create `src/blocks/FlowerBoss.js`.
- [ ] Create `src/blocks/CloudBoss.js`.
- [ ] Create `src/blocks/RocketBoss.js`.
- [ ] Preserve boss HP, activation, particles, sounds, and death/completion
  behavior.

---

## Phase 6: Misc Helpers And UI Effects File-For-File Port

Primary source directory:

```text
misc/
```

- [ ] Create `src/misc/ButtonMessage.js` from `misc/ButtonMessage.as`.
- [ ] Create `src/misc/ConfirmationWindow.js` from
  `misc/ConfirmationWindow.as`.
- [ ] Create `src/misc/Fireworks.js` from `misc/Fireworks.as`.
- [ ] Create `src/misc/LevelSelectButton.js` from
  `misc/LevelSelectButton.as`.
- [ ] Create `src/misc/MenuOption.js` from `misc/MenuOption.as`.
- [ ] Remove or no-op calls to `misc/MochiManager.as`; Mochi achievements and
  login widgets are external service features, not gameplay.
- [ ] Create `src/misc/OnlineBrowseSelection.js` from
  `misc/OnlineBrowseSelection.as`.
- [ ] Create `src/misc/Particle.js` from `misc/Particle.as`.
- [ ] Create `src/misc/RankData.js` from `misc/RankData.as`.
- [ ] Create `src/misc/ReviewStar.js` from `misc/ReviewStar.as`.
- [ ] Create `src/misc/ReviewSubmitMenu.js` from
  `misc/ReviewSubmitMenu.as`.
- [ ] Create `src/misc/SubmitMenu.js` from `misc/SubmitMenu.as`.
- [ ] Create `src/misc/TextWindow.js` from `misc/TextWindow.as`.
- [ ] Create `src/misc/WinAnimation.js` from `misc/WinAnimation.as`.
- [ ] Preserve original text formatting through shared text style helpers.
- [ ] Preserve UI image assets and source coordinates wherever practical.

---

## Phase 7: Level Editor Direct Port

Primary source:

- `currentfunction/LevelEditor.as`
- editor-supporting `misc/*.as`
- `misc/blank.xml`

- [ ] Port `LevelEditor.as` after campaign gameplay and all block types are
  stable.
- [ ] Preserve editor constants:
  `WALL`, `DEATHBLOCK`, `BOOST`, `GOAL`, `TEXT`, `DELETE`, `MOVE`,
  `BOOSTFRUIT`, `TRACK`, `TRACKWALL`, `TRACKBLADE`, `FLOWERBOSS`,
  `CLOUDBOSS`, `ROCKETLAUNCHER`, `LASERCW`, `LASERCCW`,
  `ACTIVATETRACKWALL`, `ROCKETBOSS`.
- [ ] Port blank XML loading.
- [ ] Port grid drawing and current-y scroll behavior.
- [ ] Port mouse preview create/move behavior.
- [ ] Port create, delete, move, undo, scroll, type selection, and text entry.
- [ ] Port `outputXML(name)`.
- [ ] Port editor test-play through `GameEngine`.
- [ ] Port submit prompt surface with browser-local export/stubbed remote
  upload.

---

## Phase 8: Online / PHP Service Surface

Primary source:

- `currentfunction/RandomOnlineGame.as`
- `currentfunction/BrowseMostPlayedGame.as`
- `currentfunction/BrowseMostRecentGame.as`
- `currentfunction/BrowseSpecificGame.as`
- `currentfunction/TypeNameGame.as`
- `misc/OnlineBrowseSelection.as`
- `misc/ReviewSubmitMenu.as`
- `misc/web/*.php`
- `misc/web/levelschema.xsd`

- [ ] Preserve online menu entries and mode classes.
- [ ] Create a browser-safe `src/services/OnlineLevelService.js` stub that
  exposes source-equivalent operations.
- [ ] Map `getrandomid.php` behavior to stub/static data.
- [ ] Map `getbyid.php` behavior to stub/static data.
- [ ] Map `getbyname.php` behavior to stub/static data.
- [ ] Map `getmostplayed.php` behavior to stub/static data.
- [ ] Map `getrecent.php` behavior to stub/static data.
- [ ] Map `getnumlevels.php` behavior to stub/static data.
- [ ] Map `submit.php`, `submitreview.php`, and `updateplaycount.php` to
  no-op/local behavior unless the user requests a real service.
- [ ] Keep core gameplay independent of remote network access.

---

## Phase 9: Excluded Flash Services And Source-Only Artifacts

These systems were analyzed and should not be ported for gameplay parity.

### 9a. CPMStar

- [x] Analyze `CPMStar/AdLoader.as`.
- [x] Confirm CPMStar only loads `http://server.cpmstar.com/adviewas3.swf`
  with a content spot ID.
- [x] Confirm CPMStar has no gameplay state, level behavior, input behavior,
  save behavior, or rendering needed by the game.
- [x] Remove CPMStar from the port plan.
- [ ] Remove CPMStar imports/calls while porting `Main.as`,
  `JumpDieCreateMain.as`, and `TutorialGame.as`.

### 9b. Mochi

- [x] Analyze `misc/MochiManager.as`.
- [x] Analyze `mochi/as3/*.as` usage.
- [x] Confirm Mochi code is an external service layer for achievements, awards,
  login widget, social/profile APIs, scores, coins, user data, and ads.
- [x] Confirm Mochi achievement checks read save/rank data but do not affect
  gameplay mechanics, level progression, collision, physics, or level content.
- [x] Remove `mochi/as3/` from the port plan.
- [x] Remove `misc/MochiManager.as` from the required source-file port list.
- [ ] Remove or local-no-op Mochi call sites while porting menus, submit/review
  flows, and `JumpDieCreateMain.as`.

### 9c. Other folders/files that should not be ported

- [x] Mark `com/gskinner/utils/` as not ported. It is only used for Flash SWF
  bridge handoff in `Preloader.as`.
- [x] Mark `misc/web/` PHP files as not ported. They are a legacy server-side
  online-level backend, not browser gameplay. Online mode can later use a
  browser-safe local/static service if requested.
- [x] Mark `old/` as not ported. It contains legacy experiments, old SWFs,
  backups, PSDs, docs, and old service files.
- [x] Mark root `.fla`, `.swf`, `.psd`, `.sql.gz`, and `crossdomain.xml` style
  files as source-only or Flash-service artifacts.
- [ ] Add `ASSET_AUDIT.md` documenting copied runtime assets and intentionally
  omitted artifacts.

---

## Phase 10: Asset Manifest, Preload Completion, And Browser Verification

- [ ] Build a full source-mapped asset manifest from active `[Embed]`
  references outside `old/`.
- [ ] Load all image assets needed by ported runtime files.
- [ ] Load all sound assets needed by ported runtime files.
- [ ] Keep `old/`, `.fla`, `.psd`, PHP service files, and source SQL archives
  out of runtime unless explicitly requested.
- [ ] Verify boot, menu, level select, World 1-1, death/reload, goal
  completion, world completion, credits, challenge levels, editor test-play,
  and online stubs in browser.
- [ ] Add screenshots or manual parity notes only after the user asks for
  browser verification.

---

## Current Implementation Priority

1. Finish Phase 3 direct `GameEngine.as` parity around the existing XML-render
   skeleton.
2. Port Phase 4 `core/Guy.as`.
3. Complete Phase 5 simple blocks needed by World 1.
4. Port Phase 2 campaign level select enough to play all bundled World 1
   levels.
5. Continue file-for-file through remaining blocks, modes, misc helpers, editor,
   online stubs, and Flash-only service stubs.

---

## Notes For Future Runs

- Do not replace XML campaign data with a different format during the faithful
  port.
- Do not move source behavior into Phaser scene files when a source-mapped class
  should own it.
- Do not implement new online services before local source parity.
- Do not implement editor additions before the source editor can round-trip XML.
- Update checkboxes as each source file or source behavior is ported.
