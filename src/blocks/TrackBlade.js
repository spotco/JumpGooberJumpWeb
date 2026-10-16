// TrackBlade.js - Track-mounted spinning hazard.
// Mirrors blocks/TrackBlade.as.
//
// The AS3 extends FalldownBlock. Track direction constants (Track.HORIZ,
// Track.VERT) are defined here because the port's Track.js is still
// first-pass and does not expose direction/start/end yet; findTrack() reads
// them defensively.

import FalldownBlock from './FalldownBlock.js';

export default class TrackBlade extends FalldownBlock {
    // Mirrors Track.HORIZ / Track.VERT in Track.as.
    static HORIZ = true;
    static VERT = false;

    constructor(scene, parentContainer, x, y, w = 50, h = 55) {
        // noedge=true: the AS3 clears the red-block graphics.
        super(scene, parentContainer, x, y, w, h, true);

        this.direction = null;
        this.start = 0;
        this.end = 0;
        this.hasFoundDirection = false;

        this.directiontoggle = false; // t left/up, f right/down
        this.speed = 0;

        // Spinning blade wrapper, mirrors the AS3 wrapper Sprite.
        this.wrapper = scene.add.container(this.w / 2, this.h / 2);
        if (scene.textures.exists('trackblade_img')) {
            this.bladeimg = scene.add.image(0, 0, 'trackblade_img')
                .setOrigin(0.5, 0.5);
            this.wrapper.add(this.bladeimg);
        } else {
            this.blade = scene.add.rectangle(0, 0, this.w, this.h, 0xcd3535, 0.85)
                .setStrokeStyle(2, 0x6e1111, 1);
            this.wrapper.add(this.blade);
        }
        this.container.add(this.wrapper);

        this.syncPosition();
    }

    syncPosition() {
        this.container.x = this.x;
        this.container.y = this.y;
    }

    // The AS3 hitbox is a 22px-radius circle. Test it against a rect.
    circleHitsRect(rect) {
        const nearestX = Math.max(rect.x, Math.min(this.x, rect.x + rect.width));
        const nearestY = Math.max(rect.y, Math.min(this.y, rect.y + rect.height));
        const dx = this.x - nearestX;
        const dy = this.y - nearestY;
        return dx * dx + dy * dy <= 22 * 22;
    }

    rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    update(g) {
        return this.rupdate(g, false);
    }

    rupdate(g, simple) {
        if (!simple) {
            this.wrapper.angle += 8;
        }

        // Bring to front (mirrors g.main.setChildIndex).
        if (this.container && this.container.parentContainer) {
            this.container.parentContainer.bringToTop(this.container);
        }

        if (!this.hasFoundDirection) {
            this.hasFoundDirection = true;
            this.findTrack(g);
        }

        if (this.direction === TrackBlade.VERT && this.speed !== 0) {
            if (this.directiontoggle) { // up
                this.y -= this.speed;
                if (this.y - g.currenty < Math.min(this.start, this.end)) {
                    this.directiontoggle = !this.directiontoggle;
                }
            } else { // down
                this.y += this.speed;
                if (this.y - g.currenty > Math.max(this.start, this.end)) {
                    this.directiontoggle = !this.directiontoggle;
                }
            }
        } else if (this.direction === TrackBlade.HORIZ && this.speed !== 0) {
            if (this.directiontoggle) { // left
                this.x -= this.speed;
                if (this.x < Math.min(this.start, this.end)) {
                    this.directiontoggle = !this.directiontoggle;
                }
            } else { // right
                this.x += this.speed;
                if (this.x > Math.max(this.start, this.end)) {
                    this.directiontoggle = !this.directiontoggle;
                }
            }
        }
        this.syncPosition();

        if (!simple && g.testguy && g.testguy.innerhitbox &&
            this.circleHitsRect(g.testguy.innerhitbox)) {
            return FalldownBlock.guyhit(g);
        }
        return false;
    }

    simpleupdate(g) {
        this.rupdate(g, true);
    }

    findTrack(g) {
        if (!g.tracks) {
            return;
        }
        for (const t of g.tracks) {
            if (!t || t.memRemoved) {
                continue;
            }
            if (this.rectsOverlap(this.x, this.y, this.w, this.h, t.x, t.y, t.w, t.h)) {
                // The port's Track.js is first-pass and may not expose
                // direction/start/end yet; only adopt them when present.
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
        return 'trackblade';
    }
}
