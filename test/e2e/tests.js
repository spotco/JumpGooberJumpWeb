// tests.js - e2e test definitions for the faithful physics port.
//
// Each test feeds a pre-programmed time series of key presses (human-like ms
// timings, mirroring how a player actually hits the keys) while the harness
// steps the fixed 33.3ms logic tick manually. Checks assert on the resulting
// state snapshots. All expected numbers are the original Flash game's
// per-tick constants (see core/Guy.as, core/GameEngine.as).
//
// NOTE on ground speed: the original applies vx = vx/1.2 on every grounded
// tick (yhit), so the observable post-tick vx while running on flat ground
// is 5/1.2*0.99 = 4.125 (moving 4.1667 px/tick). In the air there is no
// yhit cut, so vx snapshots are 4.95. Both are asserted below.

export const TESTS = [
  {
    name: 'ground-run-speed',
    level: 'flat.xml',
    ticks: 60,
    script: [{ t: 0, code: 'ArrowRight', type: 'down' }],
    check(snaps) {
      // Key stack sets vx=5, then the original's yhit does vx/=1.2, then
      // friction: 5/1.2*0.99 = 4.125, moving 4.1667 px/tick.
      const tail = snaps.slice(5);
      const bad = tail.find((s) => Math.abs(s.vx - 4.125) > 0.02);
      const dx = snaps[snaps.length - 1].x - snaps[0].x;
      const pass = !bad && Math.abs(dx - 245.8) < 4;
      return { pass, details: `vx=${tail[tail.length - 1].vx} dx=${dx.toFixed(1)}${bad ? ` bad@${bad.tick}` : ''}` };
    },
  },
  {
    name: 'ground-jump-impulse',
    level: 'flat.xml',
    ticks: 110,
    script: [
      { t: 700, code: 'Space', type: 'down' },
      { t: 900, code: 'Space', type: 'up' },
    ],
    check(snaps) {
      // Original: vy = -15 on jump (no separate "wall jump" speed).
      // First snapshot after firing shows -14 * 0.99 = -13.86.
      const minVy = Math.min(...snaps.map((s) => s.vy));
      const yBefore = snaps[20].y;
      const minY = Math.min(...snaps.slice(21).map((s) => s.y));
      const pass = minVy <= -13.5 && minY < yBefore - 80;
      return { pass, details: `minVy=${minVy.toFixed(2)} rise=${(yBefore - minY).toFixed(1)}` };
    },
  },
  {
    name: 'wall-slide-state',
    level: 'slide.xml',
    ticks: 90,
    script: [{ t: 0, code: 'ArrowRight', type: 'down' }],
    check(snaps) {
      // Pushing into the wall sets isslide (slide sprite + arms super jump).
      // Original has NO fall-speed clamp while sliding.
      const slideCount = snaps.filter((s) => s.isslide).length;
      const pass = slideCount >= 20;
      return { pass, details: `slideTicks=${slideCount}` };
    },
  },
  {
    name: 'super-jump-release-then-jump',
    level: 'slide.xml',
    ticks: 100,
    script: [
      { t: 0, code: 'ArrowRight', type: 'down' },
      { t: 600, code: 'Space', type: 'down' },
      { t: 700, code: 'Space', type: 'up' },
      { t: 1333, code: 'ArrowRight', type: 'up' },
      { t: 1333, code: 'Space', type: 'down' },
      { t: 1433, code: 'Space', type: 'up' },
    ],
    check(snaps) {
      // Slide into the wall airborne, release the direction key, then jump:
      // vx = 10 shove bounces off the right wall to ~-9.09, vy = -15.
      const sliding = snaps.some((s) => s.tick >= 20 && s.tick <= 39 && s.isslide);
      const after = snaps.filter((s) => s.tick >= 40 && s.tick <= 52);
      const minVx = Math.min(...after.map((s) => s.vx));
      const minVy = Math.min(...after.map((s) => s.vy));
      const pass = sliding && minVx <= -8 && minVy <= -13.5;
      return { pass, details: `sliding=${sliding} minVx=${minVx.toFixed(2)} minVy=${minVy.toFixed(2)}` };
    },
  },
  {
    name: 'super-jump-hold-into-wall',
    level: 'slide.xml',
    ticks: 100,
    script: [
      { t: 0, code: 'ArrowRight', type: 'down' },
      { t: 600, code: 'Space', type: 'down' },
      { t: 700, code: 'Space', type: 'up' },
      // NOTE: ArrowRight stays held - the original super-jumps anyway.
      { t: 1333, code: 'Space', type: 'down' },
      { t: 1433, code: 'Space', type: 'up' },
    ],
    check(snaps) {
      const sliding = snaps.some((s) => s.tick >= 20 && s.tick <= 39 && s.isslide);
      const after = snaps.filter((s) => s.tick >= 40 && s.tick <= 52);
      const minVx = Math.min(...after.map((s) => s.vx));
      const minVy = Math.min(...after.map((s) => s.vy));
      const pass = sliding && minVx <= -8 && minVy <= -13.5;
      return { pass, details: `sliding=${sliding} minVx=${minVx.toFixed(2)} minVy=${minVy.toFixed(2)}` };
    },
  },
  {
    name: 'air-friction-matches-original',
    level: 'flat.xml',
    ticks: 80,
    script: [
      { t: 0, code: 'ArrowRight', type: 'down' },
      { t: 1000, code: 'Space', type: 'down' },
      { t: 1066, code: 'Space', type: 'up' },
      { t: 1100, code: 'ArrowRight', type: 'up' },
    ],
    check(snaps) {
      // Airborne: no yhit cut. After the jump, Right resets vx=5 each tick
      // (-> 4.95 post-friction). 11 ticks after release at tick 33:
      // 4.95 * 0.99^11 = 4.4317. (The 60fps retune used 0.92 -> ~1.98.)
      const vHeld = snaps[32].vx;
      const vLater = snaps[43].vx;
      const pass = Math.abs(vHeld - 4.95) < 0.05 && Math.abs(vLater - 4.4317) < 0.25;
      return { pass, details: `vx@32=${vHeld.toFixed(3)} vx@43=${vLater.toFixed(3)}` };
    },
  },
  {
    name: 'down-brake',
    level: 'flat.xml',
    ticks: 80,
    script: [
      { t: 0, code: 'ArrowRight', type: 'down' },
      { t: 700, code: 'Space', type: 'down' },
      { t: 800, code: 'Space', type: 'up' },
      { t: 1100, code: 'ArrowRight', type: 'up' },
      { t: 1133, code: 'ArrowDown', type: 'down' },
      { t: 1233, code: 'ArrowDown', type: 'up' },
    ],
    check(snaps) {
      // Original: DOWN keydown does vx = vx / 1.3 instantly. Done airborne
      // to avoid the yhit cut: 4.9005/1.3 = 3.7696, then friction -> 3.732.
      const v = snaps[34].vx;
      const pass = Math.abs(v - 3.732) < 0.25;
      return { pass, details: `vx@34=${v.toFixed(3)} (was ${snaps[32].vx.toFixed(3)})` };
    },
  },
  {
    name: 'key-stack-most-recent-wins',
    level: 'flat.xml',
    ticks: 60,
    script: [
      { t: 0, code: 'ArrowRight', type: 'down' },
      { t: 500, code: 'ArrowLeft', type: 'down' },
      { t: 1000, code: 'ArrowLeft', type: 'up' },
    ],
    check(snaps) {
      // Original key stack: most-recently-pressed direction wins.
      // Grounded snapshots include the yhit cut: -4.125 / 4.125.
      const vLeft = snaps[20].vx;
      const vRight = snaps[35].vx;
      const pass = Math.abs(vLeft - -4.125) < 0.05 && Math.abs(vRight - 4.125) < 0.05;
      return { pass, details: `vx@20=${vLeft.toFixed(3)} vx@35=${vRight.toFixed(3)}` };
    },
  },
  {
    name: 'scroll-with-removed-blocks',
    level: 'scroll.xml',
    ticks: 60,
    script: [],
    check(snaps, { engine }) {
      // Regression test for BaseBlock.gameScroll null container crash.
      // Setup: player spawns on y=100 wall (y<250, so autoScroll runs every
      // tick); a wall at y=-600 is removed by clearAbove on tick 1
      // (container=null). autoScroll -> gameScroll must not crash on it.
      // If we get 60 snapshots without a TypeError, the fix works.
      const minY = Math.min(...snaps.map((s) => s.y));
      const pass = snaps.length === 60 && minY < 250;
      return { pass, details: `ticks=${snaps.length} minY=${minY.toFixed(1)}` };
    },
  },
  {
    name: 'goal-reachable-from-top-platform',
    level: 'goalreach.xml',
    ticks: 120,
    script: [
      { t: 0, code: 'Space', type: 'down' },
      { t: 100, code: 'Space', type: 'up' },
    ],
    check(snaps, { engine }) {
      // Player spawns on the -1308 platform (need to set spawn).
      // Jump and see if goal at -1603 is touched.
      // If loadnextlevel fired, testguy is null (level completed).
      const completed = !engine.testguy;
      const minY = snaps.length > 0 ? Math.min(...snaps.map(s => s.y)) : 0;
      return { pass: completed, details: `completed=${completed} minY=${minY.toFixed(1)} ticks=${snaps.length}` };
    },
  },
  {
    name: 'goal-touch-advances-level',
    level: 'goal.xml',
    ticks: 30,
    script: [],
    check(snaps, { engine }) {
      // Player spawns touching the goal. Goal.update should call
      // loadnextlevel(true), which clears testguy (null).
      // If testguy is null, the goal touch worked and level advanced.
      const levelCompleted = !engine.testguy;
      const hasHitTest = !engine.testguy || typeof engine.testguy.hitTestObject === 'function';
      const pass = levelCompleted && hasHitTest;
      return { pass, details: `ticks=${snaps.length} levelCompleted=${levelCompleted} hasHitTest=${hasHitTest}` };
    },
  },
  {
    name: 'block-recycling-when-scrolling',
    level: 'high.xml',
    ticks: 60,
    script: [],
    check(snaps, { engine }) {
      // Regression test: blocks removed by clearAbove (y<=-500) must be
      // recycled (re-shown) when scrolled back into view. The wall at y=-600
      // is hidden on tick 1; autoScroll moves it down; when y>=-500 it must
      // become visible again (memRemoved=false, container visible).
      const wall = engine.blocksarrays.flat().find((b) => b && b.w === 500 && b.h === 20 && b.y < 0);
      if (!wall) {
        return { pass: false, details: 'wall not found' };
      }
      const visible = wall.container ? wall.container.visible : false;
      const pass = !wall.memRemoved && visible && wall.y >= -500;
      return { pass, details: `y=${wall.y.toFixed(1)} memRemoved=${wall.memRemoved} visible=${visible}` };
    },
  },
];
