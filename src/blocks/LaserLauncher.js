// LaserLauncher.js - Rotating laser hazard.
// Mirrors blocks/LaserLauncher.as.
//
// The AS3 extends RocketLauncher; the port does the same. The `dir`
// XML attribute is the rotation speed (rotspd).

import RocketLauncher from './RocketLauncher.js';
import Particle from '../misc/Particle.js';
import FalldownBlock from './FalldownBlock.js';

export default class LaserLauncher extends RocketLauncher {
    constructor(scene, parentContainer, x, y, dir = 0) {
        super(scene, parentContainer, x, y);

        // Laser sight: mirrors laserSight at (19-75/2+18, 32-68/2-9).
        this.laserSight = scene.add.graphics();
        this.laserSight.x = -0.5;
        this.laserSight.y = -11;
        this.launcherContainer.add(this.laserSight);

        this.particletrail = [];
        this.rotspd = Number(dir) || 0;
    }

    pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }

    update(g) {
        if (this.guyTouchesHitbox(g.testguy)) {
            return FalldownBlock.guyhit(g);
        }

        this.launcherContainer.angle += this.rotspd;

        const searchDepth = 8;
        const rad = this.launcherContainer.angle * (Math.PI / 180);
        const dy = Math.cos(rad) * searchDepth;
        const dx = -Math.sin(rad) * searchDepth;

        let cx = this.x;
        let cy = this.y;

        // Fade the old trail particles; recycle them to the pool.
        for (let i = this.particletrail.length - 1; i >= 0; i--) {
            const p = this.particletrail[i];
            p.alpha -= 0.2;
            if (p.alpha <= 0) {
                this.particletrail.splice(i, 1);
                p.clear();
                p.alpha = 1;
                if (g.particlesreuse) {
                    g.particlesreuse.push(p);
                }
            }
        }

        let newp;
        if (!g.particlesreuse || g.particlesreuse.length === 0) {
            newp = new Particle(this.scene);
        } else {
            newp = g.particlesreuse.pop();
        }
        // The AS3 adds the trail particle as a child of the launcher, so
        // beam dots are drawn in launcher-local coordinates.
        this.container.add(newp);
        this.particletrail.push(newp);
        newp.fillStyle(0xff0000, 1);

        outerLoop: while (Math.sqrt(Math.pow(cx - this.x, 2) + Math.pow(cy - this.y, 2)) < 300) {
            for (const wall of g.walls) {
                if (!wall || wall.memRemoved) {
                    continue;
                }
                // Guy hit test first (mirrors the AS3 order).
                if (g.testguy && g.testguy.hitbox &&
                    Phaser.Geom.Rectangle.Contains(g.testguy.hitbox, cx, cy)) {
                    return FalldownBlock.guyhit(g);
                }
                if (this.pointInRect(cx, cy, wall.x, wall.y, wall.w, wall.h)) {
                    break outerLoop;
                }
            }
            newp.fillCircle(cx - this.x, cy - this.y, 3 * Math.random());
            cx += dx;
            cy += dy;
        }

        this.laserSight.clear();
        const dist = Math.sqrt(Math.pow(cx - this.x, 2) + Math.pow(cy - this.y, 2));
        if (dist > 45) {
            this.laserSight.lineStyle(4, 0xff0000, 1);
            this.laserSight.lineTo(0, dist);
        }
        return false;
    }

    simpleupdate(g) {
        this.launcherContainer.angle += this.rotspd;
    }

    type() {
        return 'laserlauncher';
    }
}
