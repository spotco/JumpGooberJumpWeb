// RocketLauncher.js - Homing rocket launcher.
// Mirrors blocks/RocketLauncher.as.
//
// The AS3 extends FalldownBlock; the homing math statics (getTarAngle/rotDir)
// live on Rocket (see Rocket.js) to avoid duplication.

import FalldownBlock from './FalldownBlock.js';
import Rocket from './Rocket.js';
import RocketParticle from './RocketParticle.js';

export default class RocketLauncher extends FalldownBlock {
    constructor(scene, parentContainer, x, y) {
        // noedge=true: the AS3 draws its own launcher images, not red edges.
        super(scene, parentContainer, x, y, 20, 20, true);

        this.reattack = 125;
        this.range = 450;

        // Launcher visuals. The AS3 uses launcherbase.png/launcher1.png;
        // those textures are not preloaded yet, so draw placeholders and
        // swap in the real images when available.
        this.launcherContainer = scene.add.container(0, 0);
        if (scene.textures.exists('launcherbase_img')) {
            this.baseimg = scene.add.image(0, 0, 'launcherbase_img')
                .setOrigin(0.5, 0.5);
            this.container.add(this.baseimg);
        } else {
            this.base = scene.add.rectangle(0, 0, 32, 32, 0x7b1a1a, 0.95)
                .setOrigin(0.5, 0.5)
                .setStrokeStyle(2, 0xda9b9b, 1);
            this.container.add(this.base);
        }
        if (scene.textures.exists('launcher1_img')) {
            this.launcherimg = scene.add.image(0, 0, 'launcher1_img')
                .setOrigin(0.5, 0.5);
            this.launcherContainer.add(this.launcherimg);
        } else {
            this.nozzle = scene.add.rectangle(10, 0, 20, 14, 0xc84646, 1)
                .setOrigin(0.5, 0.5);
            this.launcherContainer.add(this.nozzle);
        }
        // Charge dot: mirrors chargeDot (red circle, alpha 0..1).
        this.chargeDot = scene.add.circle(8, -6, 3, 0xff0000, 1)
            .setAlpha(0);
        this.launcherContainer.add(this.chargeDot);
        this.container.add(this.launcherContainer);

        this.syncPosition();
    }

    syncPosition() {
        this.container.x = this.x;
        this.container.y = this.y;
    }

    // The AS3 hitbox is a 30px-radius circle at the launcher position.
    // Flash hitTestObject uses bounding boxes, so test a 60x60 rect.
    guyTouchesHitbox(guy) {
        if (!guy || !guy.hitbox) {
            return false;
        }
        const hitRect = new Phaser.Geom.Rectangle(this.x - 30, this.y - 30, 60, 60);
        return Phaser.Geom.Intersects.RectangleToRectangle(guy.hitbox, hitRect);
    }

    playSound(key) {
        const main = window.jumpDieCreateMain;
        if (main && typeof main.playsfx === 'function') {
            main.playsfx(key);
        }
    }

    update(g) {
        if (this.guyTouchesHitbox(g.testguy)) {
            return FalldownBlock.guyhit(g);
        }

        const tarAngle = Rocket.getTarAngle(this.x, this.y, g);
        const dxGuy = this.x - g.testguy.x + 13;
        const dyGuy = this.y - g.testguy.y + 12;
        if (Math.sqrt(dxGuy * dxGuy + dyGuy * dyGuy) < this.range) {
            for (let i = 0; i < 4; i++) {
                this.launcherContainer.angle += Rocket.rotDir(this.launcherContainer.angle, tarAngle);
            }
            if (this.launcherContainer.angle < -180) {
                this.launcherContainer.angle = -180;
            }
            this.chargeDot.alpha += (1 / this.reattack);

            if (this.chargeDot.alpha >= 1) {
                this.playSound('shoot');
                this.chargeDot.alpha = 0;

                const rad = this.launcherContainer.angle * (Math.PI / 180);
                const dy = Math.cos(rad) * 40;
                const dx = -Math.sin(rad) * 40;

                for (let i = 0; i < 24; i++) {
                    let particle;
                    if (!g.rocketparticlesreuse || g.rocketparticlesreuse.length === 0) {
                        particle = new RocketParticle(this.scene);
                    } else {
                        particle = g.rocketparticlesreuse.pop();
                    }

                    const randSpd = Math.random() * 10;
                    particle.graphics.fillStyle(0xcc6666, 1);
                    particle.graphics.fillCircle(0, 0, 5 * Math.random());
                    particle.alphaspd = 0.05;
                    particle.x = this.x + dx;
                    particle.y = this.y + dy;
                    particle.vx = Math.sin(i * (Math.PI / 12)) * randSpd;
                    particle.vy = Math.cos(i * (Math.PI / 12)) * randSpd;
                    particle.activate();
                    // The AS3 adds particles to the world root; the port's
                    // particle container must be in the display list.
                    if (particle.container.parentContainer !== this.parentContainer && this.parentContainer) {
                        this.parentContainer.add(particle.container);
                    }
                    g.particles.push(particle);
                }

                const newrocket = new Rocket(
                    this.scene, this.parentContainer,
                    this.x + dx, this.y + dy,
                    this.launcherContainer.angle
                );
                g.deathwall.push(newrocket);
            }
        } else {
            this.chargeDot.alpha = 0;
            if (this.launcherContainer.angle > 0) {
                this.launcherContainer.angle--;
            } else if (this.launcherContainer.angle < 0) {
                this.launcherContainer.angle++;
            }
        }
        return false;
    }

    type() {
        return 'rocketlauncher';
    }
}
