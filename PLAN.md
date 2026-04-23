# Jump Goober Jump Web - Active Development Plan

**Last Updated**: 2026-04-22

## Active Focus

Set up the initial static Phaser project scaffold for a faithful port of the
original Flash game.

## Current Scope

- Preserve original-game feature scope only.
- Keep the project structure close to `Save-the-Princess-Web`.
- Copy original assets and level XML into browser-servable folders.
- Provide bootable Phaser stubs without committing to the exact final coding
  file breakdown yet.

## Next Porting Areas

1. Port the original level XML parser from `core/GameEngine.as`.
2. Port `core/Guy.as` movement, wall-jump, gravity, boost, and collision logic.
3. Port block classes from `blocks/*.as`.
4. Port world/menu flow from `JumpDieCreateMain.as` and `currentfunction/*.as`.
5. Port local save progression from `SharedObject` to `localStorage`.
6. Stub or replace original online/Mochi/ad integrations with local web-safe
   equivalents only where needed for original feature parity.

## Notes

- Detailed per-file coding plans are intentionally deferred until a later run.
- The original source reference is `/Users/betty/dev/Jump--goober--Jump--`.
- The reference web port shape is `/Users/betty/dev/Save-the-Princess-Web`.

## Instructions For Agents

Always check this file before starting work. Keep it focused on active work and
near-term porting direction only.
