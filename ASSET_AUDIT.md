# Jump Goober Jump Web - Asset Audit

**Last Updated**: 2026-04-23

This file records what was copied from the original Flash source repo and what
is intentionally excluded from the Phaser port.

Original source:

```text
/Users/betty/dev/Jump--goober--Jump--
```

---

## Copied Runtime Assets

- [x] `img/` copied to `img/`
  - Source file count: 171
  - Web repo file count: 171
  - Checksum audit: matched
- [x] `snd/` copied to `snd/`
  - Source file count: 89
  - Web repo file count: 89
  - Checksum audit: matched
- [x] Fonts copied to `fonts/`
  - `misc/Bienvenu.ttf` -> `fonts/Bienvenu.ttf`
  - `misc/acknowtt.ttf` -> `fonts/acknowtt.ttf`
- [x] Bundled XML level data copied to `data/`
  - `misc/world_1/*.xml` -> `data/world_1/`
  - `misc/world_2/*.xml` -> `data/world_2/`
  - `misc/world_3/*.xml` -> `data/world_3/`
  - `misc/challenge/*.xml` -> `data/challenge/`
  - `misc/challenge.xml` -> `data/challenge.xml`
  - `misc/blank.xml` -> `data/blank.xml`
- [x] Font/XML checksum audit
  - Checked pairs: 41
  - Missing: 0
  - Mismatches: 0

---

## Active Embed Audit

Active AS3 `[Embed(source=...)]` references were scanned outside `old/`.

- Unique active embed refs found: 223
- Present in the web repo through current asset mapping: 218
- Referenced by active AS3 but missing from the original source checkout:
  - `preloader_bar.png`
  - `preloader_bg.png`
  - `startgame_bg.png`
  - `intro.swf`
- Present in the original source checkout but intentionally not copied:
  - `jumpdiecreate.swf`

`jumpdiecreate.swf` is a compiled Flash game output loaded by `Preloader.as`.
It is not a Phaser runtime asset and should not be archived in this web repo
unless the user explicitly requests archival completeness.

---

## Intentionally Excluded

These files/folders are not part of the Phaser runtime port.

- `old/`
  Legacy experiments, old SWFs, backups, PSDs, docs, and old web scripts.
- `CPMStar/`
  External ad SWF loader. Not gameplay.
- `mochi/as3/`
  Mochi ad/social/coin/score/achievement service library. Not gameplay.
- `misc/MochiManager.as`
  Optional Mochi achievement/login widget integration. It reads save/rank data
  but does not affect gameplay mechanics or progression.
- `com/gskinner/utils/`
  SWF bridge code used by Flash preloader/intro SWF handoff.
- `misc/web/`
  Legacy PHP backend for online levels and reviews. Online mode should use a
  browser-safe local/static service only if requested later.
- Root authoring/build/archive files:
  - `intro.fla`
  - `jumpdiecreate.fla`
  - `jumpdiecreate.swf`
  - `spotco_jumpdiecreatelevels.sql.gz`
- Crossdomain/service policy files:
  - `misc/crossdomain.xml`
  - `misc/web/crossdomain.xml`

---

## Decision

Do not copy or port `jumpdiecreate.swf` for the Phaser runtime. The project is
a source port, not a Flash artifact archive.
