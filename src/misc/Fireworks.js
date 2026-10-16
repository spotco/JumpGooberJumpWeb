// Fireworks.js - Win celebration particle fountain.
// Mirrors misc/Fireworks.as.
//
// PORT NOTE: the AS3 ran its own Timer(30) driving update(). The port has no
// per-object timers; the owner calls update() once per game tick instead.
// When the show ends, update() sets this.finished = true so the owner can
// remove it (the AS3 nulled its own arrays and stopped its timer).

import Particle from './Particle.js';

export default class Fireworks {
    constructor(scene, parentContainer) {
        this.scene = scene;

        this.container = scene.add.container(0, 0);
        if (parentContainer) {
            parentContainer.add(this.container);
        }

        this.particles = [];
        this.recycle = [];
        this.firecounter = 30;
        this.finished = false;
    }

    update() {
        if (this.finished) {
            return;
        }

        for (const p of [...this.particles]) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.ay;
            p.rotationX += p.rx;
            p.rotationY += p.ry;
            p.rotationZ += p.rz;
            p.setAlpha(p.alpha - 0.01);
            if (p.alpha <= 0) {
                this.container.remove(p);
                this.particles.splice(this.particles.indexOf(p), 1);
                p.clear();
                p.setAlpha(1);
                this.recycle.push(p);
            }
        }

        if (this.firecounter > 0) {
            this.generateParticle(-5, 250, 1);
            this.generateParticle(505, 250, -1);
            this.firecounter--;
        } else if (this.particles.length === 0) {
            this.finished = true;
            this.particles = null;
            this.recycle = null;
        }
    }

    generateParticle(x, y, vx) {
        let newp;
        if (this.recycle.length === 0) {
            newp = new Particle(this.scene);
        } else {
            newp = this.recycle.pop();
        }

        newp.x = x;
        newp.y = y;
        newp.vy = -12 + Math.random() * 5;
        newp.vx = (2 + Math.random() * 3) * vx;
        newp.ay = 0.2;

        newp.rx = Math.random() * 3;
        newp.ry = Math.random() * 3;
        // Mirrors the AS3 typo exactly: rx is assigned twice, rz never is.
        newp.rx = Math.random() * 3;

        newp.rotationX = Math.random() * 360 - 180;
        newp.rotationY = Math.random() * 360 - 180;
        newp.rotationZ = Math.random() * 360 - 180;

        const size = Math.random() * 5 + 3;
        newp.lineStyle(0.5, 0x222222);
        newp.strokeRect(0, 0, size, size);

        const color = Math.floor(Math.random() * 3);
        if (color === 1) {
            newp.fillStyle(0xffff00, 0.8);
        } else if (color === 2) {
            newp.fillStyle(0xffa500, 0.8);
        } else {
            newp.fillStyle(0x00ff00, 0.8);
        }
        newp.fillRect(0, 0, size, size);

        this.container.add(newp);
        this.particles.push(newp);
    }

    destroy() {
        this.finished = true;
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        this.particles = null;
        this.recycle = null;
    }
}
