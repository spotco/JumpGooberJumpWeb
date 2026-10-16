// Rocket.js - Homing rocket projectile.
// Mirrors blocks/Rocket.as.
//
// ASSET NOTE (for BootScene.js preload; BootScene.js is intentionally not
// modified here):
//   'rocket_img' <- img/block/red/rocket.png (NOT preloaded yet)
// The rocket still flies and collides without the image; only the visual is
// skipped until the texture is preloaded.
//
// PORT NOTE: the homing math (getTarAngle / rotDir) is source-mapped from
// RocketLauncher.as. It lives here as Rocket.getTarAngle / Rocket.rotDir
// because RocketLauncher.js is still first-pass and existing files must not
// be modified. Move these to RocketLauncher.js when it is completed.

import FalldownBlock from './FalldownBlock.js';
import RocketParticle from './RocketParticle.js';
import RocketBoss from './RocketBoss.js';

export default class Rocket extends FalldownBlock {
    constructor(scene, parentContainer, x, y, rotation) {
        // noedge=true: the AS3 drew invisible zero-size red strips here.
        super(scene, parentContainer, 0, 0, 0, 0, true);

        this.x = x;
        this.y = y;
        this.speed = 7;
        this.hitRadius = 25 / 2;

        // Mirrors the AS3 rocketBody/flipimg nesting. flipimg is rotated 180
        // degrees; rocketBody carries the flight rotation (degrees, like AS3).
        this.rocketBody = scene.add.container(0, 0);
        this.flipimg = scene.add.container(0, 0);
        this.flipimg.setAngle(180);
        if (scene.textures.exists('rocket_img')) {
            this.rocketimg = scene.add.image(0, 0, 'rocket_img')
                .setOrigin(0.5, 0.5);
            this.flipimg.add(this.rocketimg);
        }
        this.rocketBody.add(this.flipimg);
        this.rocketBody.setAngle(rotation);
        this.container.add(this.rocketBody);

        this.syncPosition();
    }

    syncPosition() {
        this.container.x = this.x;
        this.container.y = this.y;
    }

    playSound(key) {
        const main = window.jumpDieCreateMain;
        if (main && typeof main.playsfx === 'function') {
            main.playsfx(key);
        }
    }

    circleHitsRect(rect) {
        const nearestX = Math.max(rect.x, Math.min(this.x, rect.x + rect.w));
        const nearestY = Math.max(rect.y, Math.min(this.y, rect.y + rect.h));
        const dx = this.x - nearestX;
        const dy = this.y - nearestY;
        return dx * dx + dy * dy <= this.hitRadius * this.hitRadius;
    }

    circleHitsBoss(boss) {
        // Derived from RocketBoss.die()'s manual two-circle calculation, which
        // uses a 50px boss radius.
        const dx = this.x - boss.x;
        const dy = this.y - boss.y;
        const r = 50 + this.hitRadius;
        return dx * dx + dy * dy <= r * r;
    }

    removeFromDeathwall(g) {
        const idx = g.deathwall.indexOf(this);
        if (idx !== -1) {
            g.deathwall.splice(idx, 1);
        }
        this.removeFromMemory();
    }

    update(g) {
        const rad = this.rocketBody.angle * Math.PI / 180;
        const dx = -Math.sin(rad) * this.speed;
        const dy = Math.cos(rad) * this.speed;
        this.x += dx;
        this.y += dy;
        this.syncPosition();

        const tarAngle = Rocket.getTarAngle(this.x, this.y, g);
        this.rocketBody.angle += Rocket.rotDir(this.rocketBody.angle, tarAngle) * 3;

        if (this.x < -20 || this.x > 520 || this.y < -20 || this.y > 590) {
            this.removeFromDeathwall(g);
            return false;
        }

        if (super.update(g)) {
            return true;
        }

        for (const w of g.walls) {
            if (this.circleHitsRect(w)) {
                this.playSound('rocketexplode');
                return this.explode(g);
            }
        }

        for (const b of g.deathwall) {
            if (b instanceof RocketBoss && this.circleHitsBoss(b)) {
                b.hitByRocket();
                this.playSound('rocketexplode');
                return this.explode(g);
            }
        }

        let newp;
        if (g.rocketparticlesreuse.length === 0) {
            newp = new RocketParticle(this.scene);
        } else {
            newp = g.rocketparticlesreuse.pop();
        }

        newp.x = this.x + dx * -2;
        newp.y = this.y + dy * -2;
        newp.vx = -dx + Math.random() * 3 - 1.5;
        newp.vy = -dy + Math.random() * 3 - 1.5;
        newp.graphics.fillStyle(0xcc6666, 1);
        newp.graphics.fillCircle(0, 0, Math.random() * 4);
        newp.activate();
        g.particles.push(newp);
        return false;
    }

    explode(g) {
        for (let i = 0; i < 24; i++) {
            let particle;
            if (g.rocketparticlesreuse.length === 0) {
                particle = new RocketParticle(this.scene);
            } else {
                particle = g.rocketparticlesreuse.pop();
            }

            const randSpd = Math.random() * 10;
            particle.graphics.fillStyle(0xcc6666, 1);
            particle.graphics.fillCircle(0, 0, 3 * Math.random());
            particle.alphaspd = 0.05;
            particle.x = this.x;
            particle.y = this.y;
            particle.vx = Math.sin(i * (Math.PI / 12)) * randSpd;
            particle.vy = Math.cos(i * (Math.PI / 12)) * randSpd;
            particle.ay = 0.5;
            particle.activate();
            g.particles.push(particle);
        }
        this.removeFromDeathwall(g);
        return false;
    }

    type() {
        return 'rocket';
    }

    // Source-mapped from RocketLauncher.getTarAngle in RocketLauncher.as.
    static getTarAngle(x, y, g) {
        let tarAngle = Math.round(
            Rocket.getAngle(x, y, g.testguy.x + 13, g.testguy.y + 12) - 90
        );
        if (tarAngle < -180) {
            tarAngle = 360 - Math.abs(tarAngle);
        }
        return tarAngle;
    }

    // Source-mapped from FlowerBoss.getangle in FlowerBoss.as.
    static getAngle(ax, ay, bx, by) {
        return Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
    }

    // Source-mapped from RocketLauncher.rotDir in RocketLauncher.as.
    // Returns -1, 0, or 1: the shortest rotation direction from cur to tar.
    static rotDir(cur, tar) {
        let cwtestcount = 0;
        let testcur = cur;
        while (testcur !== tar) {
            testcur++;
            cwtestcount++;
            if (testcur > 180) {
                testcur = -180;
            }
        }
        let ccwtestcount = 0;
        testcur = cur;
        while (testcur !== tar) {
            testcur--;
            ccwtestcount++;
            if (testcur < -180) {
                testcur = 180;
            }
        }
        if (cur === tar) {
            return 0;
        } else if (cwtestcount > ccwtestcount) {
            return -1;
        } else {
            return 1;
        }
    }
}
