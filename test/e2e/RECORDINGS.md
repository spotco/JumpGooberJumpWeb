# Input Recording & Replay for e2e

Record human gameplay as pure input timing data, then replay it deterministically
as an e2e test. This bridges human playtesting (with exploit-level precision)
and automated regression testing.

## Recording (opt-in)

1. Play the game in a browser (desktop with keyboard).
2. Press **F9** to start recording. The console logs `[recorder] Started recording: ...`.
3. Play normally. Only gameplay keys are captured (arrows, WASD, Space, Enter, Z).
4. Press **F9** again to stop. A JSON file downloads automatically.

The recording format matches the e2e test script format:
```json
{
  "name": "recording-2026-10-18T12-00-00",
  "level": "1-1",
  "world": 1,
  "levelNum": 1,
  "events": [
    {"t": 0, "code": "ArrowRight", "type": "down"},
    {"t": 500, "code": "Space", "type": "down"},
    {"t": 700, "code": "Space", "type": "up"}
  ],
  "durationMs": 3000
}
```
- `t` is milliseconds since recording start.
- `code` is the KeyboardEvent.code.
- `type` is 'down' or 'up'.

## Sharing

Place recording JSON files in `test/e2e/recordings/`. Commit them to the repo
to share with others or preserve as regression tests.

## Replaying

Run the e2e harness with replay parameters:
```
http://127.0.0.1:8123/test/e2e/harness.html?replay=my-recording.json&level=flat.xml
```

- `replay`: filename in `test/e2e/recordings/` (required).
- `level`: test level XML file (optional, defaults to `flat.xml`).

The replay runs the recording's input sequence deterministically through the
fixed 33.3ms tick loop. It passes if the replay completes without crashing.
Player death during the recording is fine — the test verifies deterministic
replay, not survival.

## Why this is valuable

- **Human exploits become regression tests.** If you find a precise jump sequence
  that beats a level, record it. The replay proves the port can replicate it.
- **Parity verification.** Record the same inputs on the original Flash game
  (if available) and the port; compare the resulting state trajectories.
- **No manual test writing.** Just play, record, share.
