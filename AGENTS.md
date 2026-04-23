# AGENTS.md - Jump Goober Jump HTML5 / Phaser 3 Port

## Project Overview

This is a direct, source-matching port of the original
[Jump--goober--Jump--](https://github.com/spotco/Jump--goober--Jump--) Flash /
ActionScript 3 game to HTML5 using Phaser 3.

The JavaScript source is intended to mirror the original ActionScript source as
closely as practical in file layout, class names, method names, field names,
state machines, timing, gameplay behavior, visual/audio behavior, and level XML
semantics. This is a file-for-file port whenever the source file represents
runtime game behavior.

Original repo: https://github.com/spotco/Jump--goober--Jump--
Original source reference:

```text
/Users/betty/dev/Jump--goober--Jump--
```

Reference web-port style:

```text
/Users/betty/dev/Save-the-Princess-Web
```

---

## Core Principles (Always Follow)

- Fidelity first for ported code
  Preserve the original Flash gameplay feel, mechanics, collision quirks,
  update timing, level behavior, menus, save progression, visuals, and audio.
- ActionScript-recognizable style
  Keep JavaScript intentionally AS3-like: descriptive class names, explicit
  methods, mutable fields, source-order logic, and direct state transitions.
  Do not modernize into clever idiomatic JavaScript unless explicitly asked.
- File-for-file mapping
  Every runtime `.as` file should have a clear JavaScript equivalent. If a file
  cannot or should not be directly ported because it is Flash shell, ad, Mochi,
  SWF bridge, PHP service, or authoring infrastructure, keep an explicit stub or
  mapping note instead of silently absorbing it elsewhere.
- Source XML stays canonical
  The original level XML files in `data/` are the campaign/custom-level source
  format during the faithful port. Do not replace them with a new JSON/TMX
  format unless the user asks.
- Original feature scope first
  Do not add new gameplay, new UI flows, new editor formats, or new online
  systems until the original Flash feature has been ported or the user
  explicitly asks for additions.
- Browser-safe replacements
  Flash systems such as `SharedObject` and `SoundChannel` should be represented
  with local browser-safe equivalents. Ad networks, Mochi services, SWF bridges,
  PHP endpoints, source-only archives, and authoring files are not gameplay and
  should not be ported unless the user explicitly asks for archival/service
  work.
- Simplicity
  No build step, no bundler, and no dependency beyond checked-in Phaser 3 unless
  explicitly requested.

---

## Tech Stack

- Phaser 3 loaded from `lib/phaser.min.js`
- Vanilla JavaScript ES modules
- Static files served by a local HTTP server

### Assets

- `img/` - Original Flash image assets copied from `img/`
- `snd/` - Original sound assets copied from `snd/`
- `fonts/` - Original TTF files copied from `misc/`
- `data/` - Original XML level files copied from `misc/world_*`,
  `misc/challenge`, and `misc/blank.xml`

### Original source reference

The original ActionScript source lives at:

```text
/Users/betty/dev/Jump--goober--Jump--
```

Always read the matching `.as` source file before porting or changing gameplay
logic.

---

## How To Run

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Phaser ES modules do not work through `file://`. Use a local server when the
user asks for browser verification. Do not start a web server unless requested.

---

## File Structure

```text
JumpGooberJumpWeb/
|- index.html                  # Entry point - loads Phaser and src/Main.js
|- src/                        # JavaScript source, mapped from AS3 source
|  |- Main.js                  # Runtime entry/config; maps JumpDieCreateMain.as shell role
|  |- Constants.js             # Shared constants from JumpDieCreateMain.as
|  |- GameEngine.js            # Maps core/GameEngine.as
|  |- LevelXmlParser.js        # XML construction path from GameEngine.as
|  |- blocks/                  # Maps blocks/*.as file-for-file
|  |- core/                    # Future direct ports of core/*.as
|  |- currentfunction/         # Future direct ports of currentfunction/*.as
|  |- misc/                    # Future direct ports of misc/*.as
|  '- scenes/                  # Phaser wrappers only; keep thin
|- img/                        # Original image assets
|- snd/                        # Original sound assets
|- fonts/                      # Original fonts copied from misc/
|- data/                       # Original XML levels
|- AGENTS.md                   # This file
|- PLAN.md                     # Active source-matching checklist
|- run.sh
'- run.bat
```

Phaser scenes are wrappers around source-mapped classes. Put behavior in the
source-mapped modules whenever possible; do not let scene files become a
replacement for `GameEngine.as`, `JumpDieCreateMenu.as`, or other source files.

---

## Original ActionScript Source -> JavaScript Mapping

### Root / Shell

| Original source | JS equivalent | Notes |
|---|---|---|
| `Main.as` | `index.html` + `src/scenes/BootScene.js` shell notes | Flash preloader/ad click shell only; keep gameplay out. |
| `Preloader.as` | `src/scenes/BootScene.js` + no-op SWF bridge notes | SWF loading is Flash-only. |
| `JumpDieCreateMain.as` | `src/Main.js`, `src/Constants.js`, future `src/JumpDieCreateMain.js` | Main game owner, constants, routing, sound/save/rank ownership. |

### Core

| Original source | JS equivalent | Notes |
|---|---|---|
| `core/GameEngine.as` | `src/GameEngine.js` | Main runtime loop, XML load, UI, scrolling, reload/next callbacks. |
| `core/Guy.as` | `src/core/Guy.js` | Player movement, collision, animations, death. |

### Blocks

Each `blocks/*.as` file should map to the same basename under `src/blocks/`.

| Original source | JS equivalent |
|---|---|
| `blocks/BaseBlock.as` | `src/blocks/BaseBlock.js` |
| `blocks/Wall.as` | `src/blocks/Wall.js` |
| `blocks/FalldownBlock.as` | `src/blocks/FalldownBlock.js` |
| `blocks/Boost.as` | `src/blocks/Boost.js` |
| `blocks/BoostFruit.as` | `src/blocks/BoostFruit.js` |
| `blocks/Goal.as` | `src/blocks/Goal.js` |
| `blocks/Textdisplay.as` | `src/blocks/Textdisplay.js` |
| `blocks/Track.as` | `src/blocks/Track.js` |
| `blocks/TrackWall.as` | `src/blocks/TrackWall.js` |
| `blocks/ActivateTrackWall.as` | `src/blocks/ActivateTrackWall.js` |
| `blocks/TrackBlade.as` | `src/blocks/TrackBlade.js` |
| `blocks/RocketLauncher.as` | `src/blocks/RocketLauncher.js` |
| `blocks/Rocket.as` | `src/blocks/Rocket.js` |
| `blocks/RocketParticle.as` | `src/blocks/RocketParticle.js` |
| `blocks/LaserLauncher.as` | `src/blocks/LaserLauncher.js` |
| `blocks/BossActivate.as` | `src/blocks/BossActivate.js` |
| `blocks/FlowerBoss.as` | `src/blocks/FlowerBoss.js` |
| `blocks/CloudBoss.as` | `src/blocks/CloudBoss.js` |
| `blocks/RocketBoss.as` | `src/blocks/RocketBoss.js` |

### Current Functions / Modes

Each `currentfunction/*.as` file should map to the same basename under
`src/currentfunction/`.

| Original source | JS equivalent |
|---|---|
| `currentfunction/CurrentFunction.as` | `src/currentfunction/CurrentFunction.js` |
| `currentfunction/JumpDieCreateMenu.as` | `src/currentfunction/JumpDieCreateMenu.js` |
| `currentfunction/TutorialGame.as` | `src/currentfunction/TutorialGame.js` |
| `currentfunction/WorldTwoGame.as` | `src/currentfunction/WorldTwoGame.js` |
| `currentfunction/WorldThreeGame.as` | `src/currentfunction/WorldThreeGame.js` |
| `currentfunction/SpecialGame.as` | `src/currentfunction/SpecialGame.js` |
| `currentfunction/SimpleGame.as` | `src/currentfunction/SimpleGame.js` |
| `currentfunction/LevelEditor.as` | `src/currentfunction/LevelEditor.js` |
| `currentfunction/RandomOnlineGame.as` | `src/currentfunction/RandomOnlineGame.js` |
| `currentfunction/BrowseMostPlayedGame.as` | `src/currentfunction/BrowseMostPlayedGame.js` |
| `currentfunction/BrowseMostRecentGame.as` | `src/currentfunction/BrowseMostRecentGame.js` |
| `currentfunction/BrowseSpecificGame.as` | `src/currentfunction/BrowseSpecificGame.js` |
| `currentfunction/TypeNameGame.as` | `src/currentfunction/TypeNameGame.js` |

### Misc Helpers

Each `misc/*.as` file should map to the same basename under `src/misc/`, except
`misc/Bullet.as` may be imported by block/projectile code but should still live
at `src/misc/Bullet.js` to preserve source mapping.

| Original source | JS equivalent |
|---|---|
| `misc/Bullet.as` | `src/misc/Bullet.js` |
| `misc/ButtonMessage.as` | `src/misc/ButtonMessage.js` |
| `misc/ConfirmationWindow.as` | `src/misc/ConfirmationWindow.js` |
| `misc/Fireworks.as` | `src/misc/Fireworks.js` |
| `misc/LevelSelectButton.as` | `src/misc/LevelSelectButton.js` |
| `misc/MenuOption.as` | `src/misc/MenuOption.js` |
| `misc/OnlineBrowseSelection.as` | `src/misc/OnlineBrowseSelection.js` |
| `misc/Particle.as` | `src/misc/Particle.js` |
| `misc/RankData.as` | `src/misc/RankData.js` |
| `misc/ReviewStar.as` | `src/misc/ReviewStar.js` |
| `misc/ReviewSubmitMenu.as` | `src/misc/ReviewSubmitMenu.js` |
| `misc/SubmitMenu.as` | `src/misc/SubmitMenu.js` |
| `misc/TextWindow.as` | `src/misc/TextWindow.js` |
| `misc/WinAnimation.as` | `src/misc/WinAnimation.js` |

### Intentionally Not Ported

These source folders/files are not gameplay and should not be ported in the
faithful Phaser game unless the user explicitly requests archival or service
work.

| Original source | Decision | Reason |
|---|---|---|
| `CPMStar/` | Do not port | External ad SWF loader; no gameplay. |
| `mochi/as3/` | Do not port | Mochi ad/social/coin/score/achievement service library; no gameplay mechanics. |
| `misc/MochiManager.as` | Do not port | Only connects optional Mochi achievements/login widgets to save stats. Remove or no-op call sites. |
| `com/gskinner/utils/` | Do not port | SWF bridge used only by Flash preloader/intro SWF handoff. |
| `misc/web/` | Do not port as PHP | Server-side online-level backend; replace with browser-safe local/static service only if online mode is later requested. |
| `old/` | Do not port | Legacy experiments, backups, PSDs, old SWFs, old web scripts. |
| `*.fla`, `*.swf`, `*.psd`, `*.sql.gz` | Do not port | Authoring/build/archive artifacts, not Phaser runtime assets. |

Other suggested non-port areas:

- `CPMStar/adloadas3.fla`
- root `intro.fla`, `jumpdiecreate.fla`, `jumpdiecreate.swf`
- root `spotco_jumpdiecreatelevels.sql.gz`
- `misc/crossdomain.xml` and `misc/web/crossdomain.xml`

If ported source references these systems, remove the call or keep a tiny local
no-op helper near the call site rather than creating full source-mapped modules.

---

## Coding Guidelines

- Mirror the original AS3 structure and naming wherever possible.
- Before editing an existing JS file, inspect the corresponding `.as` file and
  nearby JS file conventions.
- Preserve method names like `loadfromXML`, `makeui`, `gameScroll`,
  `startLevel`, `nextLevel`, `destroy`, and source field names like
  `deathwall`, `boostlist`, `testguy`, `curfunction`, and `clvl` when porting
  matching behavior.
- Do not rename methods/properties, collapse classes, move behavior into Phaser
  scenes, or introduce broad abstractions unless the source structure already
  implies it or the user asks.
- Behavioral fixes should be minimal and source-neutral whenever possible.
- Use Phaser APIs as the rendering/input/audio substrate, but keep game logic in
  source-mapped classes.
- Save/load state via `localStorage`, preserving the source field semantics from
  `SharedObject`.
- Keep comments useful: note where Flash-only concepts are intentionally
  replaced, stubbed, or deferred.
- Do not introduce new dependencies.
- Do not change the no-build workflow.

---

## Development Workflow

1. Read `PLAN.md` before starting any non-trivial task.
2. Read the corresponding original `.as` source file before porting logic.
3. Work on one source-mapped file or tightly related source group at a time.
4. Update `PLAN.md` checkboxes when a source file or system is ported.
5. Test with a local server when browser behavior must be verified, but only
   start a server when the user asks.
6. Keep non-source additions clearly marked as web wrappers, no-op stubs, or
   user-approved additions.

Use checkbox format `[ ]` / `[x]` in planning docs.

---

## When Making Changes

- Always preserve the direct source-matching goal.
- If a JS file already exists for a source file, edit that file rather than
  creating a replacement abstraction.
- If a Phaser scene needs behavior from an AS3 class, instantiate or delegate to
  the source-mapped class instead of moving the behavior into the scene.
- If a Flash-only source file is not directly portable, create a stub with the
  same public surface when other code references it.
- Maintain the goal: "Feels like the original Flash version."
