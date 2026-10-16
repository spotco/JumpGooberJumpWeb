// TrackWall.js - Wall riding a track, carries the player.
// Mirrors blocks/TrackWall.as.
//
// Track direction constants live on TrackBlade (the port's Track.js is
// still first-pass and does not expose direction/start/end yet).

import Wall from './Wall.js';
import TrackBlade from './TrackBlade.js';
import FalldownBlock from './FalldownBlock.js';

export default class TrackWall extends Wall {
    constructor(scene, parentContainer, x, y, w, h) {
        super(scene, parentContainer, x, y, w, h);

        this.direction = null;
        this.start = 0;
        this.end = 0;
        this.hasFoundDirection = false;

        this.directiontoggle = false; // t left/up, f right/down
        this.speed = 0;

        // Friction box: rect (0,-1,w,h/2) in block-local coordinates.
        // Used to detect the guy standing on top.
        this.frictionbox = { x: 0, y: -1, w: this.w, h: this.h / 2 };

        // Bolt visual (the stub's bolt, kept).
        this.bolt = scene.add.rectangle(this.w / 2, this.h / 2, 10, 10, 0xd9e7f4, 0.95)
            .setStrokeStyle(2, 0x5e7387, 1);
        this.container.add(this.bolt);

        this.syncPosition();
    }

    syncPosition() {
        this.container.x = this.x;
        this.container.y = this.y;
    }

    // Block rect in world coordinates.
    blockRect() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    // Friction box rect in world coordinates.
    frictionRect() {
        return {
            x: this.x + this.frictionbox.x,
            y: this.y + this.frictionbox.y,
            w: this.frictionbox.w,
            h: this.frictionbox.h,
        };
    }

    rectsOverlap(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x &&
               a.y < b.y + b.h && a.y + a.h > b.y;
    }

    guyRect(g) {
        if (!g.testguy || !g.testguy.hitbox) {
            return null;
        }
        const hb = g.testguy.hitbox;
        return { x: hb.x, y: hb.y, w: hb.width, h: hb.height };
    }

    hitboxHitsGuy(g) {
        const gr = this.guyRect(g);
        return gr !== null && this.rectsOverlap(this.blockRect(), gr);
    }

    frictionHitsGuy(g) {
        const gr = this.guyRect(g);
        return gr !== null && this.rectsOverlap(this.frictionRect(), gr);
    }

    update(g) {
        if (this.container && this.container.parentContainer) {
            this.container.parentContainer.bringToTop(this.container);
        }

        if (!this.hasFoundDirection) {
            this.hasFoundDirection = true;
            this.findTrack(g);
        }
        if (this.speed === 0) {
            return false;
        }

        if (this.direction === TrackBlade.VERT) {
            if (this.directiontoggle) { // up
                this.y -= this.speed;
                this.syncPosition();
                if (this.y - g.currenty + this.h / 2 < Math.min(this.start, this.end)) {
                    this.directiontoggle = !this.directiontoggle;
                }
                if (this.hitboxHitsGuy(g)) {
                    g.testguy.changePos(0, -this.speed);
                    // For non-standard sizes, keep moving until out.
                    let guard = 0;
                    while (this.hitboxHitsGuy(g) && guard < 1000) {
                        g.testguy.changePos(0, -0.1);
                        guard++;
                    }
                    return this.checkSmash(g);
                }
            } else { // down
                let hitfriction = false;
                if (this.frictionHitsGuy(g)) {
                    g.testguy.changePos(0, this.speed);
                    hitfriction = true;
                }
                this.y += this.speed;
                this.syncPosition();
                if (hitfriction) {
                    let guard = 0;
                    while (this.hitboxHitsGuy(g) && g.testguy.y < this.y && guard < 1000) {
                        g.testguy.changePos(0, -0.1);
                        guard++;
                    }
                    for (const b of g.walls) {
                        if (!b || b.memRemoved || b === this) {
                            continue;
                        }
                        guard = 0;
                        while (this.guyHitsWall(g, b) && guard < 1000) {
                            g.testguy.changePos(0, -0.1);
                            guard++;
                        }
                    }
                }
                let guard = 0;
                while (this.hitboxHitsGuy(g) && g.testguy.y > this.y && guard < 1000) {
                    g.testguy.changePos(0, 0.1);
                    guard++;
                }
                if (this.y - g.currenty + this.h / 2 > Math.max(this.start, this.end)) {
                    this.directiontoggle = !this.directiontoggle;
                }
                return this.checkSmash(g);
            }
        } else if (this.direction === TrackBlade.HORIZ) {
            if (this.directiontoggle) { // left
                this.x -= this.speed;
                this.syncPosition();
                if (this.x + this.w / 2 < Math.min(this.start, this.end)) {
                    this.directiontoggle = !this.directiontoggle;
                }
                if (this.hitboxHitsGuy(g)) {
                    g.testguy.changePos(-this.speed, 0);
                    let guard = 0;
                    while (this.hitboxHitsGuy(g) && guard < 1000) {
                        g.testguy.changePos(-0.1, 0);
                        guard++;
                    }
                    return this.checkSmash(g);
                }
                if (this.frictionHitsGuy(g)) {
                    g.testguy.changePos(-this.speed, 0);
                    if (this.guyhitting(g)) {
                        g.testguy.changePos(this.speed, 0);
                    }
                }
            } else { // right
                this.x += this.speed;
                this.syncPosition();
                if (this.x + this.w / 2 > Math.max(this.start, this.end)) {
                    this.directiontoggle = !this.directiontoggle;
                }
                if (this.hitboxHitsGuy(g)) {
                    g.testguy.changePos(this.speed, 0);
                    let guard = 0;
                    while (this.hitboxHitsGuy(g) && guard < 1000) {
                        g.testguy.changePos(0.1, 0);
                        guard++;
                    }
                    return this.checkSmash(g);
                }
                if (this.frictionHitsGuy(g)) {
                    g.testguy.changePos(this.speed, 0);
                    if (this.guyhitting(g)) {
                        g.testguy.changePos(-this.speed, 0);
                    }
                }
            }
        }
        return false;
    }

    simpleupdate(g) {
        if (!this.hasFoundDirection) {
            this.hasFoundDirection = true;
            this.findTrack(g);
        }
        if (this.speed === 0) {
            return;
        }
        if (this.direction === TrackBlade.VERT) {
            if (this.directiontoggle) { // up
                this.y -= this.speed;
                if (this.y - g.currenty + this.h / 2 < Math.min(this.start, this.end)) {
                    this.directiontoggle = !this.directiontoggle;
                }
            } else { // down
                this.y += this.speed;
                if (this.y - g.currenty + this.h / 2 > Math.max(this.start, this.end)) {
                    this.directiontoggle = !this.directiontoggle;
                }
            }
        } else if (this.direction === TrackBlade.HORIZ) {
            if (this.directiontoggle) { // left
                this.x -= this.speed;
                if (this.x + this.w / 2 < Math.min(this.start, this.end)) {
                    this.directiontoggle = !this.directiontoggle;
                }
            } else { // right
                this.x += this.speed;
                if (this.x + this.w / 2 > Math.max(this.start, this.end)) {
                    this.directiontoggle = !this.directiontoggle;
                }
            }
        }
        this.syncPosition();
    }

    guyhitting(g) {
        const gr = this.guyRect(g);
        if (!gr) {
            return false;
        }
        for (const w of g.walls) {
            if (!w || w.memRemoved || w === this) {
                continue;
            }
            if (this.rectsOverlap(gr, { x: w.x, y: w.y, w: w.w, h: w.h })) {
                return true;
            }
        }
        return false;
    }

    guyHitsWall(g, wall) {
        const gr = this.guyRect(g);
        if (!gr) {
            return false;
        }
        return this.rectsOverlap(gr, { x: wall.x, y: wall.y, w: wall.w, h: wall.h });
    }

    checkSmash(g) {
        const gr = this.guyRect(g);
        if (!gr) {
            return false;
        }
        for (const w of g.walls) {
            if (!w || w.memRemoved) {
                continue;
            }
            if (this.rectsOverlap(gr, { x: w.x, y: w.y, w: w.w, h: w.h })) {
                return FalldownBlock.guyhit(g);
            }
        }
        return false;
    }

    findTrack(g) {
        if (!g.tracks) {
            return;
        }
        for (const t of g.tracks) {
            if (!t || t.memRemoved) {
                continue;
            }
            if (this.rectsOverlap(this.blockRect(), { x: t.x, y: t.y, w: t.w, h: t.h })) {
                if (t.direction !== undefined && t.start !== undefined && t.end !== undefined) {
                    this.direction = t.direction;
                    this.start = t.start;
                    this.end = t.end;
                    this.speed += 3;
                }
            }
        }
    }

    type() {
        return 'trackwall';
    }
}
