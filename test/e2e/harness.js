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
    snaps.push(snapshot(engine, tick));
    if (engine.testguy.exploded) {
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

async function main() {
  const resultsEl = document.getElementById('e2e-results');
  try {
    const game = await waitFor(() => window.jumpGooberJumpGame, 60000, 'game boot');
    await waitFor(() => {
      const s = game.scene.getScene('MenuScene');
      return s && s.scene.isActive() ? s : null;
    }, 120000, 'menu (boot)');

    const results = [];
    for (const test of TESTS) {
      results.push(await runTest(game, test));
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
