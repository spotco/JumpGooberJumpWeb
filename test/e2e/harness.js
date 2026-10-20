// harness.js - deterministic e2e runner for the faithful physics port.
//
// Boots the real game, starts GameScene directly on a synthetic test level,
// then feeds each test's pre-programmed key-press time series while stepping
// the fixed 33.3ms logic tick manually (engine.tick). No wall-clock timing
// is involved in the physics: ms timings are quantized to ticks exactly like
// the original Flash game's Timer(30) did.
//
// Key presses are fed directly to the engine's input handlers (bypassing the
// DOM/Phaser event plumbing, which is Phaser's responsibility, not the
// game's). Results are written to #e2e-results as DONE|<json> or ERROR|<message>.

import { TESTS } from './tests.js';

const TICK_MS = 1000 / 30;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(fn, timeoutMs, label) {
  const start = Date.now();
  for (;;) {
    const value = fn();
    if (value) {
      return value;
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error('timeout waiting for ' + label);
    }
    await sleep(50);
  }
}

function dispatchKey(engine, code, type) {
  if (type === 'down') {
    engine.onKeyPress({ code });
  } else {
    engine.onKeyUp({ code });
  }
}

function releaseAll(engine) {
  for (const code of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyA', 'KeyD', 'KeyW', 'KeyZ', 'Enter']) {
    dispatchKey(engine, code, 'up');
  }
}

function snapshot(engine, tick) {
  const g = engine.testguy;
  if (!g) {
    return null; // Level completed (loadnextlevel cleared testguy)
  }
  return {
    tick,
    x: +g.x.toFixed(3),
    y: +g.y.toFixed(3),
    vx: +g.vx.toFixed(3),
    vy: +g.vy.toFixed(3),
    isslide: !!g.isslide,
    canJump: !!g.canJump,
    hashitwall: !!g.hashitwall,
    justtouched: g.justtouched,
    exploded: !!g.exploded,
  };
}

async function runTest(game, test) {
  const xml = await (await fetch('./levels/' + test.level)).text();

  const oldScene = game.scene.getScene('GameScene');
  if (oldScene && oldScene.gameEngine && typeof oldScene.gameEngine.clear === 'function') {
    try {
      oldScene.gameEngine.clear();
    } catch (e) {
      /* best effort */
    }
  }
  try {
    game.scene.stop('MenuScene');
  } catch (e) {
    /* best effort */
  }
  game.scene.start('GameScene', {
    clvlxml: xml,
    name: 'e2e-' + test.name,
    usebackbutton: false,
    hasskip: false,
    world: 1,
    level: 1,
    cacheKey: 'e2e_' + test.name,
  });

  const scene = await waitFor(() => {
    const s = game.scene.getScene('GameScene');
    return s && s.scene.isActive() && s.gameEngine && s.gameEngine.testguy ? s : null;
  }, 30000, 'GameScene for ' + test.name);
  const engine = scene.gameEngine;
  engine.e2eManualStep = true;
  engine.tickAccumulator = 0;

  // For replays: set player to recorded start position (mid-level recordings).
  // If startWorldY is set, scroll the world so the player appears at screen-y=250,
  // preserving relative positions and avoiding the offscreen death check.
  if (test.startX !== undefined && engine.testguy) {
    if (test.startWorldY !== undefined) {
      const scroll = 250 - test.startWorldY;
      for (const arr of engine.blocksarrays) {
        for (const b of arr) {
          if (b && typeof b.y === 'number') {
            b.y += scroll;
            if (b.container) b.container.y = b.y;
          }
        }
      }
      engine.currenty = scroll;
      engine.testguy.x = test.startX;
      engine.testguy.y = 250;
    } else if (test.startY !== undefined) {
      engine.testguy.x = test.startX;
      engine.testguy.y = test.startY;
    }
    engine.testguy.vx = 0;
    engine.testguy.vy = 0;
    if (typeof engine.testguy.syncDisplay === 'function') {
      engine.testguy.syncDisplay();
    }
  }

  const script = [...test.script].sort((a, b) => a.t - b.t);
  let si = 0;
  const snaps = [];
  for (let tick = 0; tick < test.ticks; tick++) {
    const nowMs = tick * TICK_MS;
    while (si < script.length && script[si].t <= nowMs) {
      const ev = script[si++];
      dispatchKey(engine, ev.code, ev.type);
    }
    engine.tick();
    const snap = snapshot(engine, tick);
    if (!snap) {
      break; // Level completed via goal touch
    }
    snaps.push(snap);
    if (engine.testguy && engine.testguy.exploded) {
      break;
    }
  }
  releaseAll(engine);

  let outcome;
  try {
    outcome = test.check(snaps, { engine, TICK_MS });
  } catch (e) {
    outcome = { pass: false, details: 'check threw: ' + (e && e.message) };
  }
  return { name: test.name, pass: !!outcome.pass, details: outcome.details || '' };
}

async function loadRecording(name) {
  // Loads a human-recorded input session from test/e2e/recordings/.
  // Returns a test object compatible with runTest().
  const resp = await fetch('./recordings/' + name);
  if (!resp.ok) {
    throw new Error('Recording not found: ' + name);
  }
  const rec = await resp.json();
  const params = new URLSearchParams(window.location.search);
  const levelFile = params.get('level') || 'flat.xml';
  // Convert events to script format. New recordings use absolute `tick`;
  // old recordings use `t` in ms. Normalize tick -> t for runTest().
  const events = rec.events || [];
  const startTick = rec.startTick || 0;
  const hasTicks = events.length > 0 && typeof events[0].tick === 'number';
  const script = events.map((ev) => {
    if (typeof ev.tick === 'number') {
      // Keep ABSOLUTE tick positions: the replay idle-advances startTick
      // ticks first, then feeds events at their recorded ticks. This keeps
      // time-dependent objects (track blades, bosses, timers) in sync with
      // the original playthrough, as the recorder starts mid-session.
      return { t: ev.tick * TICK_MS, code: ev.code, type: ev.type };
    }
    return ev; // already has t (ms)
  });
  const maxAbsTick = events.reduce((m, ev) => Math.max(m, ev.tick || 0), 0);
  const ticks = hasTicks
    ? startTick + (rec.totalTicks || (maxAbsTick - startTick)) + 10
    : Math.ceil((rec.durationMs || 5000) / TICK_MS) + 10;
  return {
    name: 'replay-' + rec.name,
    level: levelFile,
    ticks: ticks,
    script: script,
    startTick: startTick,
    startX: rec.startX,
    startY: rec.startY,
    startWorldY: rec.startWorldY,
    check(snaps, { engine }) {
      const pass = snaps.length > 0;
      const final = snaps[snaps.length - 1];
      const died = engine.testguy && engine.testguy.exploded;
      const minY = Math.min(...snaps.map(s => s.y));
      return {
        pass,
        details: `ticks=${snaps.length}/${ticks} final=(${final.x.toFixed(1)},${final.y.toFixed(1)}) minY=${minY.toFixed(1)} events=${rec.events.length}${died ? ' (died)' : ''}`,
      };
    },
  };
}

async function main() {
  const resultsEl = document.getElementById('e2e-results');
  try {
    const game = await waitFor(() => window.jumpGooberJumpGame, 60000, 'game boot');
    await waitFor(() => {
      const s = game.scene.getScene('MenuScene');
      return s && s.scene.isActive() ? s : null;
    }, 120000, 'menu (boot)');

    const params = new URLSearchParams(window.location.search);
    const replayName = params.get('replay');

    const results = [];
    if (replayName) {
      // Replay mode: run a single human recording instead of the test suite.
      const test = await loadRecording(replayName);
      results.push(await runTest(game, test));
    } else {
      for (const test of TESTS) {
        results.push(await runTest(game, test));
      }
    }
    const passed = results.filter((r) => r.pass).length;
    resultsEl.textContent = 'DONE|' + JSON.stringify({
      summary: `${passed}/${results.length} passed`,
      tests: results,
    });
  } catch (e) {
    resultsEl.textContent = 'ERROR|' + ((e && e.stack) || String(e));
  }
}

main();
