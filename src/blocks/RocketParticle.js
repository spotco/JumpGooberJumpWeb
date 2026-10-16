// RocketParticle.js - Reusable explosion / trail particle.
// Mirrors blocks/RocketParticle.as.
//
// The AS3 extends FalldownBlock only for the reuse-pool shape; the deathwall
// overlap behavior is never triggered for particles. The port keeps the same
// inheritance for source mapping.
//
// PORT NOTE: pooled particles are hidden (visible=false, activated=false)
// instead of removed from the display list, so the g.rocketparticlesreuse
// pool keeps working. Call activate() when taking one from the pool.
// The AS3 quirk `vy += ax` (ax applied to vy, not vx) is preserved verbatim.

import FalldownBlock from './FalldownBlock.js';

export default class RocketParticle extends FalldownBlock {
    static num = 0;

    constructor(scene) {
        // noedge=true: the AS3 drew invisible zero-size red strips here.
        super(scene, null, 0, 0, 0, 0, true);

        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.alphaspd = 0.1;

        this.graphics = scene.add.graphics();
        this.container.add(this.graphics);

        this.container.setVisible(false);
        this.activated = false;

        RocketParticle.num += 1;
    }

    activate() {
        this.activated = true;
        this.container.setVisible(true);
        this.container.setAlpha(1);
        this.syncPosition();
    }

    syncPosition() {
        this.container.x = this.x;
        this.container.y = this.y;
    }

    deactivate(g) {
        const idx = g.particles.indexOf(this);
        if (idx !== -1) {
            g.particles.splice(idx, 1);
        }
        this.graphics.clear();
        this.container.setAlpha(1);
        this.container.setVisible(false);
        this.activated = false;
        g.rocketparticlesreuse.push(this);
    }

    update(g) {
        this.x += this.vx;
        this.y += this.vy;
        this.syncPosition();

        this.container.setAlpha(this.container.alpha - this.alphaspd);
        if (this.container.alpha <= 0.1) {
            this.deactivate(g);
        }

        this.vy += this.ax;
        this.vy += this.ay;
        return false;
    }

    type() {
        return 'rocketparticle';
    }
}
