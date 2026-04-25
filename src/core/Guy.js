// Guy.js - Player character runtime.
// Mirrors core/Guy.as.

export default class Guy {
    static JUSTTOUCHED_ERROR_TIME = 120;
    static JUMPCDTIMER = 10;
    static HITBOX_OFFSET_X = 5;
    static HITBOX_OFFSET_Y = 2;
    static HITBOX_WIDTH = 16;
    static HITBOX_HEIGHT = 20;
    static INNER_HITBOX_OFFSET_X = 7;
    static INNER_HITBOX_OFFSET_Y = 4;
    static INNER_HITBOX_WIDTH = 12;
    static INNER_HITBOX_HEIGHT = 16;
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
        this.explodereload = 30;
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
        this.container.x = this.x;
        this.container.y = this.y;
        this.updateHitboxes();
    }

    update(walls, justWallJumped) {
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
            this.vx = -Guy.SIG(horizontalResult.amount) * Guy.WALL_RECOIL_SPEED;
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
            const chunk = Guy.SIG(remaining) * chunkMagnitude;
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

    updateImg() {
        const horizontalMotion = Math.abs(this.vx);
        const verticalMotion = this.vy;
        const movingLeft = this.vx < -0.25;
        const movingRight = this.vx > 0.25;

        if (movingLeft) {
            this.facing = -1;
        } else if (movingRight) {
            this.facing = 1;
        } else if (this.wallJumpDirection !== 0) {
            this.facing = this.wallJumpDirection;
        }

        if (this.isslide) {
            this.guydisplay.setTexture(this.facing < 0 ? 'guy_slide_left' : 'guy_slide_right');
            return;
        }

        if (verticalMotion < -0.25) {
            if (movingLeft) {
                this.guydisplay.setTexture('guy_up_left');
            } else if (movingRight) {
                this.guydisplay.setTexture('guy_up_right');
            } else {
                this.guydisplay.setTexture('guy_up');
            }
            return;
        }

        if (verticalMotion > 0.25) {
            if (movingLeft) {
                this.guydisplay.setTexture('guy_down_left');
            } else if (movingRight) {
                this.guydisplay.setTexture('guy_down_right');
            } else {
                this.guydisplay.setTexture('guy_down');
            }
            return;
        }

        if (horizontalMotion > 0.25) {
            this.animcounter += 1;
            this.toggle = Math.floor(this.animcounter / 6) % 2 === 0;
            if (this.facing < 0) {
                this.guydisplay.setTexture(this.toggle ? 'guy_left' : 'guy_left2');
            } else {
                this.guydisplay.setTexture(this.toggle ? 'guy_right' : 'guy_right2');
            }
            return;
        }

        this.animcounter = 0;
        this.toggle = false;
        this.guydisplay.setTexture('guy_stand');
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
        if (num === 0) {
            return 0;
        }
        return num < 0 ? -1 : 1;
    }

    static SIG_ONE(num) {
        return num < 0 ? -1 : 1;
    }
}
