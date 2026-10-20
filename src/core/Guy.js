// Guy.js - Player character runtime.
// Mirrors core/Guy.as.
//
// FAITHFUL PHYSICS (default): the Flash original ran game logic on a 30ms
// Timer (33.3fps logic tick; the stage rendered at 60fps). updateFaithful()
// ports Guy.as update() verbatim for the fixed 33.3ms logic tick driven by
// GameEngine.tick(): vy += 1 gravity, vx snapped to +-5 by the key stack,
// vy = -15 jumps, vx = 10 wall-slide shove, vx *= .99 / vy *= .99 friction,
// SIG() = +-0.1 push-out steps. No retuning.
//
// TUNED ESCAPE HATCH: Guy.USE_TUNED_JUMP = true restores the pre-2026-10-16
// tuned physics (1.0s release-buffer super jump, accel movement, separate
// wall jump) via updateTuned(). GameEngine also flips its logic tick to
// 60fps in that case. Disabled by default.

export default class Guy {
    // Escape hatch: true restores the pre-2026-10-16 tuned physics.
    static USE_TUNED_JUMP = false;

    static JUSTTOUCHED_ERROR_TIME = 120;
    static JUMPCDTIMER = 10;
    // Hitbox dims mirror Guy.as: drawRect(0,2,26,22) and drawRect(1,4,24,20).
    static HITBOX_OFFSET_X = 0;
    static HITBOX_OFFSET_Y = 2;
    static HITBOX_WIDTH = 26;
    static HITBOX_HEIGHT = 22;
    static INNER_HITBOX_OFFSET_X = 1;
    static INNER_HITBOX_OFFSET_Y = 4;
    static INNER_HITBOX_WIDTH = 24;
    static INNER_HITBOX_HEIGHT = 20;
    static MOVE_ACCEL = 0.45;
    static MOVE_MAX = 3.4;
    static GROUND_FRICTION = 0.72;
    static AIR_FRICTION = 0.92;
    static GRAVITY = 0.46;
    static MAX_FALL = 8;
    static JUMP_SPEED = 8.4;
    static BOOST_JUMP_SPEED = 10.2;
    static WALL_JUMP_X_SPEED = 4.4;
    static WALL_JUMP_Y_SPEED = 7.7;
    static SUPER_JUMP_X_SPEED = 10;
    // SUPER JUMP PORTING NOTE:
    // Flash did not have an explicit timer for this. The behavior came from
    // KeyboardEvent/input-stack ordering: if wall-slide input was released as
    // jump became the top key, the hard-coded wall-slide vx shove survived. In
    // browsers that exact key event ordering is less reliable, so the port uses
    // this seconds-based grace window to preserve the intended feel while making
    // the timing reachable with real keyboard input.
    static SUPER_JUMP_RELEASE_BUFFER_SECONDS = 1.0;
    static WALL_SLIDE_MAX_FALL = 1.8;
    static WALL_SLIDE_FRICTION = 0.82;
    static WALL_RECOIL_SPEED = 0.35;
    static MOVE_CHUNK_SIZE = 1;
    static PUSH_OUT_LIMIT = 8;

    constructor(scene, parentContainer, x, y) {
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.x = x;
        this.y = y;
        this.w = 26;
        this.h = 24;

        this.vx = 0;
        this.vy = 0;
        this.boost = 0;
        this.canJump = false;
        this.jumpCounter = 0;
        this.justtouched = 0;
        this.JUSTTOUCHED_ERROR_TIME = Guy.JUSTTOUCHED_ERROR_TIME;
        this.isslide = false;
        this.hashitwall = false;
        this.jumpavailable = true;
        this.jumpcd = 0;
        this.JUMPCDTIMER = Guy.JUMPCDTIMER;
        this.animcounter = 0;
        this.toggle = false;
        this.facing = 1;
        this.boosttouching = false;
        this.wallJumpDirection = 0;
        this.superJumpReleaseBuffer = 0;
        this.superJumpBufferedWallDirection = 0;
        this.exploded = false;
        this.explodecounter = 0;
        this.explodetimer = 0;
        // AS3 FalldownBlock.as uses Timer(1200,1) before reload: 1200ms at
        // the 33.33ms tick = 36 ticks.
        this.explodereload = 36;
        this.explodeframe = 0;
        this.memRemoved = false;
        this.activated = true;

        this.container = scene.add.container(this.x, this.y);
        this.guydisplay = scene.add.image(0, 0, 'guy_stand').setOrigin(0, 0);
        this.container.add(this.guydisplay);
        if (parentContainer) {
            parentContainer.add(this.container);
        }

        this.hitbox = new Phaser.Geom.Rectangle(this.x + Guy.HITBOX_OFFSET_X, this.y + Guy.HITBOX_OFFSET_Y, Guy.HITBOX_WIDTH, Guy.HITBOX_HEIGHT);
        this.innerhitbox = new Phaser.Geom.Rectangle(this.x + Guy.INNER_HITBOX_OFFSET_X, this.y + Guy.INNER_HITBOX_OFFSET_Y, Guy.INNER_HITBOX_WIDTH, Guy.INNER_HITBOX_HEIGHT);
        this.updateHitboxes();
    }

    changePos(chx, chy) {
        this.x += chx;
        this.y += chy;
        this.syncDisplay();
    }

    update(walls, justWallJumped) {
        if (Guy.USE_TUNED_JUMP) {
            return this.updateTuned(walls, justWallJumped);
        }
        return this.updateFaithful(walls, justWallJumped);
    }

    // updateFaithful() - verbatim port of Guy.as update().
    // Runs once per fixed 33.3ms logic tick (GameEngine.tick), mirroring the
    // original's Timer(30). Per-tick constants are the original's literals.
    updateFaithful(walls, justWallJumped) {
        if (this.exploded) {
            this.updateExplosion();
            return false;
        }

        if (!this.jumpavailable) {
            this.jumpcd--;
            if (this.jumpcd === 0) {
                this.jumpavailable = true;
            }
        }

        let isItSlide = false;
        this.updateImg();
        this.vy += 1;
        this.vy = Guy.roundDec(this.vy, 1);
        const checkDepth = 5;
        for (let i = 0; i < Math.abs(this.vy); i += checkDepth) { // move y by vy, break into chunks
            this.y += Guy.SIG_ONE(this.vy - i, checkDepth);
            this.syncDisplay();
            if (this.checkCollision(walls).length > 0) {
                if (this.boost > 0) {
                    this.boost--;
                }
                break;
            }
        }

        let yhit = false;
        for (let i = 0; i < walls.length; i++) {
            if (this.hitWall(walls[i])) { // if hitting a wall
                this.justtouched = 5; // Guy.as JUSTTOUCHED_ERROR_TIME
                this.canJump = true;
                yhit = true;
                this.y = Guy.roundDec(this.y, 1); // round position to one decimal

                // move reverse direction in increments until not hit
                const inity = this.y;
                let sum = 0;
                while (this.hitWall(walls[i]) && this.vy !== 0) {
                    sum += Guy.SIG(this.vy);
                    this.y = inity - sum;
                    this.syncDisplay();
                    if (!this.hitWall(walls[i])) {
                        break;
                    }
                    this.y = inity + sum;
                    this.syncDisplay();
                    if (!this.hitWall(walls[i])) {
                        break;
                    }
                }
                if (this.hitWall(walls[i])) { // only for spawning inside block, I think
                    this.recursiveOut(walls, 1);
                    return false;
                }
            }
        }
        if (yhit) { // note: do the reverse outside the loop (else will break 2 block case)
            this.vy = 0;
            this.vx = this.vx / 1.2;
        }

        for (let i = 0; i < Math.abs(this.vx); i += checkDepth) { // move x by vx, break into chunks
            this.x += Guy.SIG_ONE(this.vx - i, checkDepth);
            this.syncDisplay();
            if (this.checkCollision(walls).length > 0) {
                if (this.boost > 0) {
                    this.boost--;
                }
                break;
            }
        }

        let xhit = false;
        for (let i = 0; i < walls.length; i++) {
            if (this.hitWall(walls[i])) {
                this.justtouched = 5; // Guy.as JUSTTOUCHED_ERROR_TIME
                isItSlide = true;
                if (!justWallJumped) {
                    this.canJump = true;
                }
                xhit = true;
                this.x = Guy.roundDec(this.x, 1);
                while (this.hitWall(walls[i]) && this.vx !== 0) {
                    this.x = this.x - Guy.SIG(this.vx);
                    this.syncDisplay();
                }
                if (this.hitWall(walls[i])) { // if stuck inside object, recursive out
                    this.recursiveOut(walls, 1);
                    return false;
                }
            }
        }
        if (xhit && Math.abs(this.vx) > 5 && !this.isslide) {
            this.vx = -this.vx / 2;
        } else if (xhit) {
            this.vx = -this.vx / 1.1;
            // vx = 0; (commented out in source)
        }
        if (!xhit && !yhit && this.justtouched > 0) {
            this.justtouched--;
        }

        this.hashitwall = (xhit || yhit);
        this.isslide = isItSlide; // for walljumping
        if (Math.abs(this.vx) < 0.01) {
            this.vx = 0;
        }
        this.vx *= 0.99; // friction
        this.vy *= 0.99;

        // Port bridge: the original triggers explode from FalldownBlock's
        // update; until that block is wired, the death check lives here.
        if (this.checkDeathCollision()) {
            this.explode();
            return false;
        }

        return false;
    }

    syncDisplay() {
        // Push logical x/y to the Phaser container and hitboxes, mirroring how
        // the original's hitTestObject read live display positions.
        if (this.container) {
            this.container.x = this.x;
            this.container.y = this.y;
        }
        this.updateHitboxes();
    }

    hitWall(wall) {
        if (!wall || wall.memRemoved || wall.activated === false) {
            return false;
        }
        const wallRect = new Phaser.Geom.Rectangle(wall.x, wall.y, wall.w, wall.h);
        return Phaser.Geom.Intersects.RectangleToRectangle(this.hitbox, wallRect);
    }

    hitTestObject(obj) {
        // Mirrors Flash DisplayObject.hitTestObject: bounding-box intersection.
        // Used by Goal, Boost, BoostFruit for touch detection.
        if (!obj || obj.memRemoved) {
            return false;
        }
        // Handle negative dimensions (normalize like BaseBlock does)
        let x = obj.x, y = obj.y, w = obj.w, h = obj.h;
        if (w < 0) { x += w; w = -w; }
        if (h < 0) { y += h; h = -h; }
        const objRect = new Phaser.Geom.Rectangle(x, y, w, h);
        return Phaser.Geom.Intersects.RectangleToRectangle(this.hitbox, objRect);
    }

    // ---- TUNED PHYSICS (escape hatch; only runs when Guy.USE_TUNED_JUMP) ----
    updateTuned(walls, justWallJumped) {
        if (this.exploded) {
            this.updateExplosion();
            return false;
        }

        const engine = this.scene && this.scene.gameEngine ? this.scene.gameEngine : null;
        const moveInput = engine ? engine.inputx : 0;
        const jumpPressed = Boolean(engine && (engine.keyState.Space || engine.inputy < 0));
        const preMoveWallState = this.detectWallState(walls, moveInput);
        const wasSlidingBeforeJump = this.isslide;
        const superJumpWallState = this.getSuperJumpWallState(wasSlidingBeforeJump, preMoveWallState);
        let jumpedThisFrame = false;

        const frameDeltaSeconds = engine && typeof engine.frameDeltaSeconds === 'number'
            ? engine.frameDeltaSeconds
            : 1 / 60;
        this.updateSuperJumpReleaseBuffer(wasSlidingBeforeJump, moveInput, frameDeltaSeconds);
        if (this.jumpcd > 0) {
            this.jumpcd -= 1;
        }
        if (this.justtouched > 0) {
            this.justtouched = Math.max(0, this.justtouched - 16);
        }
        this.refreshBoostState();
        if (!jumpPressed) {
            this.jumpavailable = true;
        }

        if (jumpPressed && this.jumpavailable && this.jumpcd <= 0) {
            if (this.isSuperJumpStart(wasSlidingBeforeJump, superJumpWallState, justWallJumped)) {
                this.applySuperJump(superJumpWallState, engine);
                jumpedThisFrame = true;
            } else if (this.canJump || this.justtouched > 0) {
                this.vy = -(this.boost > 0 ? Guy.BOOST_JUMP_SPEED : Guy.JUMP_SPEED);
                this.boost = 0;
                this.canJump = false;
                this.justtouched = 0;
                this.jumpCounter += 1;
                this.jumpavailable = false;
                this.jumpcd = this.JUMPCDTIMER;
                this.isslide = false;
                jumpedThisFrame = true;
            } else if (preMoveWallState.touching && !justWallJumped) {
                this.vx = preMoveWallState.jumpDir * Guy.WALL_JUMP_X_SPEED;
                this.vy = -Guy.WALL_JUMP_Y_SPEED;
                this.canJump = false;
                this.justtouched = 0;
                this.jumpCounter += 1;
                this.jumpavailable = false;
                this.jumpcd = this.JUMPCDTIMER;
                this.isslide = false;
                this.hashitwall = true;
                this.wallJumpDirection = preMoveWallState.jumpDir;
                jumpedThisFrame = true;
                if (engine) {
                    engine.justWallJumped = true;
                }
            }
        }

        if (!jumpedThisFrame) {
            if (moveInput < 0) {
                this.vx = Math.max(this.vx - Guy.MOVE_ACCEL, -Guy.MOVE_MAX);
            } else if (moveInput > 0) {
                this.vx = Math.min(this.vx + Guy.MOVE_ACCEL, Guy.MOVE_MAX);
            } else {
                const friction = this.canJump ? Guy.GROUND_FRICTION : Guy.AIR_FRICTION;
                this.vx *= friction;
                if (Math.abs(this.vx) < 0.05) {
                    this.vx = 0;
                }
            }
        }

        this.vy = Math.min(this.vy + Guy.GRAVITY, Guy.MAX_FALL);
        const horizontalResult = this.resolveHorizontalMovement(walls);
        let grounded = this.resolveVerticalMovement(walls);
        grounded = this.resolveEmbeddedCollisions(walls) || grounded;

        if (grounded) {
            this.canJump = true;
            this.justtouched = this.JUSTTOUCHED_ERROR_TIME;
            this.jumpCounter = 0;
        } else {
            this.canJump = false;
        }

        const wallState = this.detectWallState(walls, moveInput);
        this.hashitwall = wallState.touching;
        this.wallJumpDirection = wallState.jumpDir;
        this.isslide = Boolean(
            !grounded
            && !jumpedThisFrame
            && !justWallJumped
            && moveInput !== 0
            && wallState.touching
            && moveInput === wallState.inputDir
            && this.vy >= 0
        );
        if (this.isslide && this.vy > Guy.WALL_SLIDE_MAX_FALL) {
            this.vy = Guy.WALL_SLIDE_MAX_FALL;
            this.vx *= Guy.WALL_SLIDE_FRICTION;
        }
        if (this.isslide) {
            this.superJumpBufferedWallDirection = wallState.jumpDir;
        }

        if (horizontalResult.collided && !grounded && !jumpedThisFrame && Math.abs(horizontalResult.amount) > 0.5) {
            this.vx = -Math.sign(horizontalResult.amount) * Guy.WALL_RECOIL_SPEED;
        }

        if (this.checkDeathCollision()) {
            this.explode();
            return false;
        }

        this.updateImg();
        return false;
    }

    isSuperJumpStart(wasSlidingBeforeJump, preMoveWallState, justWallJumped) {
        return Boolean(
            (wasSlidingBeforeJump || this.superJumpReleaseBuffer > 0)
            && preMoveWallState.touching
            && !justWallJumped
            && preMoveWallState.moveInput !== preMoveWallState.inputDir
        );
    }

    getSuperJumpWallState(wasSlidingBeforeJump, preMoveWallState) {
        if (preMoveWallState.touching || (!wasSlidingBeforeJump && this.superJumpReleaseBuffer <= 0)) {
            return preMoveWallState;
        }

        const jumpDir = this.wallJumpDirection || this.superJumpBufferedWallDirection;
        if (jumpDir === 0) {
            return preMoveWallState;
        }

        return {
            touching: true,
            jumpDir,
            inputDir: -jumpDir,
            moveInput: preMoveWallState.moveInput,
            fromPreviousSlide: true,
        };
    }

    updateSuperJumpReleaseBuffer(wasSlidingBeforeJump, moveInput, frameDeltaSeconds) {
        if (this.superJumpReleaseBuffer > 0) {
            this.superJumpReleaseBuffer = Math.max(0, this.superJumpReleaseBuffer - frameDeltaSeconds);
        }

        if (!wasSlidingBeforeJump || this.wallJumpDirection === 0) {
            return;
        }

        const inputIntoWall = -this.wallJumpDirection;
        const releasedOrPressedAway = moveInput !== inputIntoWall;
        if (releasedOrPressedAway) {
            this.superJumpReleaseBuffer = Guy.SUPER_JUMP_RELEASE_BUFFER_SECONDS;
            this.superJumpBufferedWallDirection = this.wallJumpDirection;
        }
    }

    applySuperJump(preMoveWallState, engine) {
        // SUPER JUMP:
        // In the Flash source this was emergent, not a named move. GameEngine.as
        // used the same vertical jump impulse for regular jumps and wall-slide
        // jumps, but if Guy.as still had isslide from the previous wall-collision
        // frame it also forced vx = 10. On a right wall the old collision solver
        // pushed the player out and bounced that hard-coded +10 into a large
        // away-from-wall velocity; releasing toward-wall input on the jump frame
        // let that horizontal velocity survive, creating the "super jump". This
        // port uses the previous slide frame's wall direction when the release
        // happens near the jump, matching the Flash input-stack quirk with a small
        // SUPER_JUMP_RELEASE_BUFFER_SECONDS grace window for keyboard event timing.
        // That grace window is the deliberate divergence from Flash: it replaces
        // fragile same-frame KeyboardEvent ordering with an explicit timer, while
        // keeping the actual super jump effect limited to the horizontal vx shove.
        // If the player is still holding into the wall, do not use this path; the
        // Flash input stack starts fighting the shove immediately, so this port
        // falls back to the normal wall jump instead.
        // This port applies that shove through jumpDir so the quirk works from
        // either wall. Keep this named and centralized for future tuning. Do not
        // give it extra upward velocity; Flash's super jump distance came from vx.
        this.vx = preMoveWallState.jumpDir * Guy.SUPER_JUMP_X_SPEED;
        this.vy = -Guy.JUMP_SPEED;
        this.boost = 0;
        this.canJump = false;
        this.justtouched = 0;
        this.jumpCounter += 1;
        this.jumpavailable = false;
        this.jumpcd = this.JUMPCDTIMER;
        this.isslide = false;
        this.superJumpReleaseBuffer = 0;
        this.superJumpBufferedWallDirection = 0;
        this.hashitwall = true;
        this.wallJumpDirection = preMoveWallState.jumpDir;
        if (engine) {
            engine.justWallJumped = true;
        }
    }

    checkDeathCollision() {
        const engine = this.scene && this.scene.gameEngine ? this.scene.gameEngine : null;
        if (!engine || !Array.isArray(engine.deathwall) || this.exploded) {
            return false;
        }

        return this.checkCollision(engine.deathwall, this.hitbox).length > 0;
    }

    refreshBoostState() {
        const engine = this.scene && this.scene.gameEngine ? this.scene.gameEngine : null;
        if (!engine || !Array.isArray(engine.boostlist) || this.exploded) {
            this.boosttouching = false;
            this.boost = 0;
            return false;
        }

        const touchingBoost = this.checkCollision(engine.boostlist, this.hitbox).length > 0;
        if (touchingBoost) {
            if (!this.boosttouching) {
                const main = window.jumpDieCreateMain;
                if (main && typeof main.playsfx === 'function') {
                    main.playsfx('boost');
                }
            }
            this.boosttouching = true;
            this.boost = 1;
            return true;
        }

        this.boosttouching = false;
        this.boost = 0;
        return false;
    }

    resolveHorizontalMovement(walls) {
        const result = this.moveChunked('x', this.vx, walls);
        if (result.collided && this.vx !== 0) {
            this.vx = 0;
        }
        return result;
    }

    resolveVerticalMovement(walls) {
        const result = this.moveChunked('y', this.vy, walls);
        if (result.collided && this.vy !== 0) {
            this.vy = 0;
        }
        return result.grounded;
    }

    moveChunked(axis, amount, walls) {
        const result = {
            collided: false,
            grounded: false,
            amount,
        };

        if (amount === 0) {
            return result;
        }

        let remaining = amount;
        while (Math.abs(remaining) > 0.0001) {
            const chunkMagnitude = Math.min(Math.abs(remaining), Guy.MOVE_CHUNK_SIZE);
            const chunk = Math.sign(remaining) * chunkMagnitude;
            const nextX = axis === 'x' ? this.x + chunk : this.x;
            const nextY = axis === 'y' ? this.y + chunk : this.y;
            const hitbox = this.getHitboxAt(nextX, nextY);
            const collisions = this.checkCollision(walls, hitbox);

            if (collisions.length > 0) {
                this.snapToCollision(axis, chunk, collisions);
                result.collided = true;
                result.grounded = axis === 'y' && chunk > 0;
                return result;
            }

            this.changePos(axis === 'x' ? chunk : 0, axis === 'y' ? chunk : 0);
            remaining -= chunk;
        }

        return result;
    }

    snapToCollision(axis, amount, collisions) {
        if (axis === 'x') {
            let resolvedX = this.x;
            for (const wall of collisions) {
                if (amount > 0) {
                    resolvedX = Math.min(resolvedX, wall.x - Guy.HITBOX_OFFSET_X - Guy.HITBOX_WIDTH);
                } else {
                    resolvedX = Math.max(resolvedX, wall.x + wall.w - Guy.HITBOX_OFFSET_X);
                }
            }
            this.changePos(resolvedX - this.x, 0);
            return;
        }

        let resolvedY = this.y;
        for (const wall of collisions) {
            if (amount > 0) {
                resolvedY = Math.min(resolvedY, wall.y - Guy.HITBOX_OFFSET_Y - Guy.HITBOX_HEIGHT);
            } else {
                resolvedY = Math.max(resolvedY, wall.y + wall.h - Guy.HITBOX_OFFSET_Y);
            }
        }
        this.changePos(0, resolvedY - this.y);
    }

    resolveEmbeddedCollisions(walls, depth = 0) {
        if (depth >= Guy.PUSH_OUT_LIMIT) {
            return false;
        }

        const collisions = this.checkCollision(walls, this.hitbox);
        if (collisions.length === 0) {
            return false;
        }

        const push = this.getSmallestPushOut(collisions[0]);
        if (!push) {
            return false;
        }

        this.changePos(push.x, push.y);

        if (push.x !== 0) {
            this.vx = 0;
        }
        let grounded = false;

        if (push.y !== 0) {
            this.vy = 0;
            if (push.y < 0) {
                this.canJump = true;
                this.justtouched = this.JUSTTOUCHED_ERROR_TIME;
                grounded = true;
            }
        }

        return this.resolveEmbeddedCollisions(walls, depth + 1) || grounded;
    }

    getSmallestPushOut(wall) {
        const playerLeft = this.hitbox.x;
        const playerRight = this.hitbox.x + this.hitbox.width;
        const playerTop = this.hitbox.y;
        const playerBottom = this.hitbox.y + this.hitbox.height;
        const wallLeft = wall.x;
        const wallRight = wall.x + wall.w;
        const wallTop = wall.y;
        const wallBottom = wall.y + wall.h;
        const moves = [
            { x: wallLeft - playerRight, y: 0 },
            { x: wallRight - playerLeft, y: 0 },
            { x: 0, y: wallTop - playerBottom },
            { x: 0, y: wallBottom - playerTop },
        ];

        let bestMove = null;
        for (const move of moves) {
            const magnitude = Math.abs(move.x) + Math.abs(move.y);
            if (magnitude === 0) {
                continue;
            }
            const verticalMove = move.y !== 0;
            if (
                !bestMove
                || magnitude < bestMove.magnitude
                || (magnitude === bestMove.magnitude && verticalMove && bestMove.y === 0)
            ) {
                bestMove = {
                    x: move.x,
                    y: move.y,
                    magnitude,
                };
            }
        }

        return bestMove;
    }

    recursiveOut(walls, dist) {
        // Mirrors Guy.as recursiveOut (trace calls omitted).
        this.x += dist;
        this.syncDisplay();
        // regular
        if (this.checkCollision(walls).length === 0) {
            return;
        }
        this.x -= dist;
        this.syncDisplay();

        this.y += dist;
        this.syncDisplay();
        if (this.checkCollision(walls).length === 0) {
            return;
        }
        this.y -= dist;
        this.syncDisplay();

        this.x -= dist;
        this.syncDisplay();
        if (this.checkCollision(walls).length === 0) {
            return;
        }
        this.x += dist;
        this.syncDisplay();

        this.y -= dist;
        this.syncDisplay();
        if (this.checkCollision(walls).length === 0) {
            return;
        }
        this.y += dist;
        this.syncDisplay();

        this.recursiveOut(walls, dist + 1);
    }

    detectWallState(walls, moveInput) {
        const leftProbe = this.getHitboxAt(this.x - 1, this.y);
        const rightProbe = this.getHitboxAt(this.x + 1, this.y);
        const leftTouch = this.checkCollision(walls, leftProbe).length > 0;
        const rightTouch = this.checkCollision(walls, rightProbe).length > 0;

        if (moveInput < 0 && leftTouch) {
            return { touching: true, jumpDir: 1, inputDir: -1, moveInput };
        }
        if (moveInput > 0 && rightTouch) {
            return { touching: true, jumpDir: -1, inputDir: 1, moveInput };
        }
        if (leftTouch) {
            return { touching: true, jumpDir: 1, inputDir: -1, moveInput };
        }
        if (rightTouch) {
            return { touching: true, jumpDir: -1, inputDir: 1, moveInput };
        }

        return { touching: false, jumpDir: 0, inputDir: 0, moveInput };
    }

    checkCollision(walls, rect = this.hitbox) {
        const collisions = [];

        for (const wall of walls) {
            if (!wall || wall.memRemoved || wall.activated === false) {
                continue;
            }

            const wallRect = new Phaser.Geom.Rectangle(wall.x, wall.y, wall.w, wall.h);
            if (Phaser.Geom.Intersects.RectangleToRectangle(rect, wallRect)) {
                collisions.push(wall);
            }
        }

        return collisions;
    }

    updateImg() { // updates animation - mirrors Guy.as (vy flipped twice; net physics effect zero)
        this.animcounter++;
        if (this.animcounter < 5) {
            return;
        }
        this.animcounter = 0;
        this.toggle = !this.toggle;

        this.vy = -this.vy;
        if (this.isslide) {
            this.guydisplay.setTexture(this.vx > 0 ? 'guy_slide_right' : 'guy_slide_left');
        } else if (this.vx < -2) {
            if (this.vy < -0.5) {
                this.guydisplay.setTexture('guy_down_left');
            } else if (this.vy > 1.4) {
                this.guydisplay.setTexture('guy_up_left');
            } else {
                this.guydisplay.setTexture(this.toggle ? 'guy_left' : 'guy_left2');
            }
        } else if (this.vx > 2) {
            if (this.vy < -0.5) {
                this.guydisplay.setTexture('guy_down_right');
            } else if (this.vy > 1.4) {
                this.guydisplay.setTexture('guy_up_right');
            } else {
                this.guydisplay.setTexture(this.toggle ? 'guy_right' : 'guy_right2');
            }
        } else if (this.vy > 0.99) {
            this.guydisplay.setTexture('guy_up');
        } else if (this.vy < -0.99) {
            this.guydisplay.setTexture('guy_down');
        } else {
            this.guydisplay.setTexture('guy_stand');
        }
        this.vy = -this.vy;
    }

    explode() {
        if (this.exploded) {
            return;
        }

        this.exploded = true;
        this.explodecounter = 0;
        this.explodetimer = 0;
        this.explodeframe = 0;
        this.vx = 0;
        this.vy = 0;
        this.canJump = false;
        this.jumpavailable = false;
        this.hashitwall = false;
        this.isslide = false;
        this.guydisplay.setTexture('guy_explode_0');

        const main = window.jumpDieCreateMain;
        if (main && typeof main.playsfx === 'function') {
            main.playsfx('explode');
        }
    }

    updateExplosion() {
        this.explodetimer += 1;
        if (this.explodetimer % 4 === 0 && this.explodeframe < 3) {
            this.explodeframe += 1;
            this.guydisplay.setTexture(`guy_explode_${this.explodeframe}`);
        }

        this.explodecounter += 1;
        if (this.explodecounter >= this.explodereload && this.scene && this.scene.gameEngine) {
            this.scene.gameEngine.queueReload();
        }
    }

    gameScroll(scroll_spd) {
        this.changePos(0, scroll_spd);
    }

    updateHitboxes() {
        this.hitbox.x = this.x + Guy.HITBOX_OFFSET_X;
        this.hitbox.y = this.y + Guy.HITBOX_OFFSET_Y;
        this.innerhitbox.x = this.x + Guy.INNER_HITBOX_OFFSET_X;
        this.innerhitbox.y = this.y + Guy.INNER_HITBOX_OFFSET_Y;
    }

    getHitboxAt(x, y) {
        return new Phaser.Geom.Rectangle(x + Guy.HITBOX_OFFSET_X, y + Guy.HITBOX_OFFSET_Y, Guy.HITBOX_WIDTH, Guy.HITBOX_HEIGHT);
    }

    getInnerHitboxAt(x, y) {
        return new Phaser.Geom.Rectangle(
            x + Guy.INNER_HITBOX_OFFSET_X,
            y + Guy.INNER_HITBOX_OFFSET_Y,
            Guy.INNER_HITBOX_WIDTH,
            Guy.INNER_HITBOX_HEIGHT,
        );
    }

    destroy() {
        this.memRemoved = true;
        this.activated = false;
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }

    static roundDec(num, dec) {
        const mult = Math.pow(10, dec);
        return Math.round(num * mult) / mult;
    }

    static SIG(num) {
        // Mirrors Guy.as: +-0.1 push-out steps.
        if (num < 0) {
            return -0.1;
        } else if (num > 0) {
            return 0.1;
        } else {
            return 0;
        }
    }

    static SIG_ONE(n, tar) {
        // Mirrors Guy.as: clamped chunk of +-tar.
        if (Math.abs(n) > tar) {
            if (n < 0) {
                return -tar;
            } else if (n > 0) {
                return tar;
            } else {
                return 0;
            }
        } else {
            return n;
        }
    }
}
