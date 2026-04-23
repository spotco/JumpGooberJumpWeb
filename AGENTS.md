# AGENTS.md - Jump Goober Jump HTML5 / Phaser 3 Port

## Project Overview

This is a faithful HTML5 port of the original Flash game
[Jump--goober--Jump--](https://github.com/spotco/Jump--goober--Jump--) using
Phaser 3 and vanilla JavaScript.

The JavaScript source should mirror the original ActionScript 3 code as closely
as practical in structure, names, gameplay behavior, timing, visual style, and
audio behavior. The source reference is local at:

```text
/Users/betty/dev/Jump--goober--Jump--
```

This project is set up similarly to:

```text
/Users/betty/dev/Save-the-Princess-Web
```

## Core Principles

- Fidelity first for original features.
  Preserve the Flash game's movement feel, collision quirks, level behavior,
  menus, assets, sounds, level XML format, save progression, and mode flow.
- ActionScript-recognizable style.
  Keep JavaScript classes and methods descriptive and close to the AS3 source.
  Avoid clever modern-JS rewrites when porting original logic.
- Phaser 3 static app.
  No bundler, no framework, no package manager requirement, and no dependency
  beyond checked-in Phaser unless explicitly requested.
- Original feature scope first.
  Do not add new features until the original game port is complete or the user
  explicitly asks for additions.
- Web-service features need local equivalents.
  Original Mochi, ad, and remote PHP/database behavior should be stubbed,
  disabled, or represented by local browser-safe equivalents unless explicitly
  required later.

## Tech Stack

- Phaser 3 loaded from `lib/phaser.min.js`
- Vanilla JavaScript ES modules
- Static files served by a local HTTP server

## Assets

- `img/` - Original Flash image assets copied from the source repo
- `snd/` - Original sound assets copied from the source repo
- `fonts/` - Original TTF files copied from `misc/`
- `data/` - Original XML level files copied from `misc/world_*` and
  `misc/challenge`

## How To Run

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Phaser ES modules require HTTP. Do not rely on `file://`.

## Initial Source Mapping

| Original ActionScript | Port Target | Notes |
|---|---|---|
| `Main.as` | `index.html` / boot flow | Flash preloader/ad shell is not gameplay-critical. |
| `Preloader.as` | `src/scenes/BootScene.js` | Load Phaser assets and start the menu. |
| `JumpDieCreateMain.as` | `src/Main.js` | Game constants, scene routing, save/audio ownership. |
| `currentfunction/JumpDieCreateMenu.as` | `src/scenes/MenuScene.js` | Main mode/world selection. |
| `core/GameEngine.as` | `src/scenes/GameScene.js` | Runtime level loading, update loop, UI. |
| `core/Guy.as` | Future player class | Player movement, wall jumping, collision quirks. |
| `blocks/*.as` | Future block/object classes | Walls, goals, hazards, bosses, boosts, tracks. |
| `currentfunction/*.as` | Future mode classes/scenes | Worlds, challenge, editor, online/local browse. |
| `misc/*.as` | Future UI/helper classes | Menus, submit/review stubs, particles, win animation. |

## Development Workflow

1. Read `PLAN.md` before starting non-trivial work.
2. Reference the matching original `.as` file before porting behavior.
3. Keep changes small and source-faithful.
4. Test with a local HTTP server before calling browser/game behavior done.
5. Update `PLAN.md` only for active planning. Do not turn it into a detailed
   coding-file plan until the user asks for that later run.

## Current Scaffold Notes

- The app currently boots into Phaser and shows an initial menu stub.
- XML levels and original assets are present so the next implementation pass can
  port loader/runtime behavior directly.
- Online database, Mochi, ad, and external navigation behavior are intentionally
  out of initial scope unless needed to reproduce local original-game features.
