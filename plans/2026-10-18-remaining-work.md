# Remaining Work Inventory (2026-10-18)

Survey of everything NOT yet ported in JumpGooberJumpWeb, focused on level
editor, menus, online/backend, and misc gaps. The game runtime (physics,
blocks, GameEngine) is complete per the three prior scans — see
`plans/2026-10-16-feature-inventory.md`.

**Scope notes:**
- `old/`, `mochi/`, `CPMStar/`, `com/gskinner/` in the original are deprecated
  SDKs/examples — intentionally out of scope.
- `misc/MochiManager.as` intentionally dropped per AGENTS.md.
- Complexity: S = <100 LOC straightforward, M = 100-400 LOC or moderate logic,
  L = 400+ LOC or complex interactive logic.

---

## 1. Level Editor

The level editor is the largest single unported feature. The port has only a
57-line stub with a "planned later" message.

| File | Purpose | LOC (as3) | Port Status | Complexity |
|---|---|---|---|---|
| `currentfunction/LevelEditor.as` | Full level editor: grid, block palette (18 types), mouse place/drag/move/delete, undo, scroll, XML export, playtest | 783 | **Stub** (57 LOC) | L |

Key methods to port (`LevelEditor.as`):
- `drawGrid()` — editor background grid
- `onMouseDown` / `onMouseUp` / `mousePreviewCreate` / `mousePreviewMove` — ghost preview + drag placement
- `getTopMouseOverBlock()` — hit-test for move/delete
- `onKeyPress` / `onKeyUp` — nudge selected block, scroll
- `levelEditorScroll(n)` — vertical scroll
- `outputXML(name)` — serialize `xmllist` to level XML
- `undo()` — 40-line undo stack
- `makeui()` / `unmakeui()` — 18-button toolbar (wall, death, boost, goal, text, delete, move, fruit, track, trackwall, blade, bosses, launchers, etc.)
- `remake()` / `clear()` / `clearlisteners()` — lifecycle

Block type constants already exist in the port stub (`WALL` through `ROCKETBOSS`).

---

## 2. Menus & Game Modes

`src/scenes/MenuScene.js` is a 14-line stub. The `currentfunction/` ports exist
but most are stubs or partial.

| File | Purpose | LOC (as3) | Port Status | Complexity |
|---|---|---|---|---|
| `currentfunction/JumpDieCreateMenu.as` | Main menu: JUMP/DIE/CREATE top row, ADVENTURE/ONLINE/LEVEL EDITOR, options, mute, cursor nav | 511 | **Partial** (308 LOC, has TODOs) | M |
| `currentfunction/TutorialGame.as` | World 1 campaign: level select grid, progression/save, scrolling bg, credits | 683 | **Partial** (356 LOC) | L |
| `currentfunction/SpecialGame.as` | Challenge/special levels mode | 244 | **Partial** (137 LOC) | M |
| `currentfunction/WorldTwoGame.as` | World 2 campaign (extends TutorialGame pattern) | 113 | **Stub** (24 LOC) | M |
| `currentfunction/WorldThreeGame.as` | World 3 campaign (extends TutorialGame pattern) | 114 | **Stub** (24 LOC) | M |
| `currentfunction/SimpleGame.as` | Single-level wrapper (XML + name) | 42 | **OK** (33 LOC) | S |
| `currentfunction/TypeNameGame.as` | Online: prompt for level name, fetch by name | 83 | **Stub** (13 LOC) | S |
| `currentfunction/CurrentFunction.as` | Base class for game modes | 25 | **OK** (32 LOC) | S |
| `src/scenes/MenuScene.js` | Phaser menu scene (new, no AS3 counterpart) | — | **Stub** (14 LOC) | M |

Menu-specific gaps in `JumpDieCreateMenu` port (has TODO markers):
- Online submenu wiring (browse most played/recent, random, search)
- Options panel (mute toggle already in GameEngine; menu-level options missing)

---

## 3. Online / Browse

All online browse modes are stubs in the port. They depend on the PHP backend
(see §5).

| File | Purpose | LOC (as3) | Port Status | Complexity |
|---|---|---|---|---|
| `currentfunction/BrowseMostPlayedGame.as` | Browse levels sorted by play count (paginated, 5/page) | 295 | **Stub** (30 LOC) | M |
| `currentfunction/BrowseMostRecentGame.as` | Browse levels sorted by date (paginated) | 38 | **Stub** (11 LOC) | S |
| `currentfunction/BrowseSpecificGame.as` | Play level by ID | 76 | **Stub** (28 LOC) | S |
| `currentfunction/RandomOnlineGame.as` | Play random online level | 190 | **Stub** (44 LOC) | M |

Shared pattern (from `BrowseMostPlayedGame.as`):
- `getXMLListURL()` → `ONLINE_DB_URL + '<endpoint>.php'`
- `addURLParam(vars)` → adds `offset` for pagination
- `makexmldisplay(e)` → parses `<levellist><level .../>...</levellist>` into selectable entries
- Selection → `OnlineBrowseSelection` → loads level XML via `getbyid.php`

---

## 4. Online Backend (PHP) — Stub for Later

10 PHP scripts in `misc/web/` (plus 4 deprecated in `old/web/`). The port's
`SubmitMenu.js` / `ReviewSubmitMenu.js` have the AS3 logic ported but the
`fetch()` calls are commented stubs.

**Base URL** (`JumpDieCreateMain.as`): `http://flashegames.net/spotco/` (was
`http://spotcos.com/jumpdiecreate/dbscripts/`). For the port, this will be a
new backend; the PHP is reference for the API contract.

### Write endpoints

| Endpoint | Method | Params | Response |
|---|---|---|---|
| `submit.php` | POST | `level_name` (alphanumeric 3-16), `creator_name` (alphanumeric 3-16), `level_data` (XML), `pass`="jumpdiecreatesubmit" | Text: `"Your level, <name>, was successfully uploaded!..."` |
| `submitreview.php` | POST | `level` (numeric id), `rating` (numeric), `checksum` | `"success"` / `"failure"` / `"success1"` |
| `updateplaycount.php` | POST | `level` (numeric id), `checksum` | `"success"` |

### Read endpoints

| Endpoint | Method | Params | Response |
|---|---|---|---|
| `getbyid.php` | GET | `id` | Raw level XML (`<level>...`) |
| `getbyname.php` | GET | `targetname`, `offset` (numeric) | `<levellist>` XML (see below) |
| `getmostplayed.php` | GET | `offset` (numeric) | `<levellist>` XML, 5 per page, ordered by playcount DESC |
| `getrecent.php` | GET | `offset` (numeric) | `<levellist>` XML, ordered by date DESC |
| `getrandomid.php` | GET | (none) | Single random level's `<levellist>` entry |
| `getnumlevels.php` | GET | (none) | Counts (used by `JumpDieCreateMenu`) |

### `<levellist>` response format

```xml
<levellist>
  <level id="123"
         level_name="MyLevel"
         creator_name="Shiny"
         date_created="2026-10-18 12:00:00"
         ratingavg="4.5"
         ratingcount="10"
         playcount="42" />
  ...
</levellist>
```

### DB tables (from PHP)

- `level` (id, xml, creator_name, level_name, date_created)
- `level_review` (level_id, rating)
- `level_playcount` (level_id, playcount)

### Checksum

`submitreview.php` and `updateplaycount.php` use `evalChecksum(action, level, checksum)`
from `common.php` — a shared-secret hash to prevent forged requests. The port's
backend must implement the same scheme or replace it.

---

## 5. Misc Gaps

| File | Purpose | LOC (as3) | Port Status | Complexity |
|---|---|---|---|---|
| `misc/RankData.as` | Online level rating data holder | 165 | **Partial** (111 LOC) | S |
| `misc/SubmitMenu.as` | Level submit dialog (name/creator inputs) | 232 | **Ported** (253 LOC, PHP stubbed) | S |
| `misc/ReviewSubmitMenu.as` | Star-rating dialog | 205 | **Ported** (241 LOC, PHP stubbed) | S |
| `misc/OnlineBrowseSelection.as` | Online level list entry UI | 68 | **Ported** (87 LOC) | S |

---

## Suggested Order

1. **Menus** (`JumpDieCreateMenu` completion + `MenuScene`) — unlocks navigation to everything else. M.
2. **Campaign** (`TutorialGame` completion, `WorldTwoGame`, `WorldThreeGame`) — uses existing `data/world_*` levels. L.
3. **Level Editor** — largest single item; block palette + canvas + XML export. L.
4. **Backend stubs** — define the API (e.g. Cloudflare Worker or simple Node server) implementing the 10 endpoints above against a new DB. M.
5. **Online browse** (`BrowseMost*`, `RandomOnlineGame`, `TypeNameGame`) — needs backend first. M.
6. **Submit/review UI wiring** — connect the already-ported dialogs to the backend. S.
