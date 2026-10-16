// FlowerBoss.js - Flower boss that tracks and shoots at the player.
// Mirrors blocks/FlowerBoss.as.
//
// The AS3 extends FalldownBlock. Boss images (flowerhead.png etc.) are not
// preloaded yet; placeholders are used until the textures exist.

import FalldownBlock from './FalldownBlock.js';
import Bullet from '../misc/Bullet.js';
import Particle from '../misc/Particle.js';

export default class FlowerBoss extends FalldownBlock {
    constructor(scene, parentContainer, x, y) {
        // The AS3 hardcodes x=0 (super(0,y,500,300)); the XML has no x.
        super(scene, parentContainer, 0, y, 500, 300, true);

        this.bulletcounter = -50;
        this.bulletspeed = 60;
        this.headanimatetimer = 0;

        this.particlesarray = [];

        // Particle field for the orbital background particles.
        this.particlefield = scene.add.container(0, 0);
        this.container.add(this.particlefield);
        this.addparticles();

        // Head wrapper at (253,-48), rotates to track the player.
        this.headwrapper = scene.add.container(253, -48);
        this.headimg = scene.add.ellipse(0, 0, 60, 60, 0xe15d8e, 0.9)
            .setStrokeStyle(3, 0x8e224d, 1);
        this.headwrapper.add(this.headimg);
        this.container.add(this.headwrapper);

        // Stem visual.
        this.stemimg = scene.add.rectangle(247, -20, 32, 40, 0x3a8e3a, 0.9);
        this.container.add(this.stemimg);

        this.syncPosition();
    }

    syncPosition() {
        this.container.x = this.x;
        this.container.y = this.y;
    }

    static getangle(ax, ay, bx, by) {
        return Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
    }

    addparticles() {
        for (let i = 0; i < 20; i++) {
            const np = new Particle(this.scene);
            np.fillStyle(0xcc6666, 1);
            np.fillCircle(0, 0, 2);
            np.vx = Math.random() * 500;
            np.vy = -Math.random() * 150;
            np.theta = Math.random() * Math.PI;
            np.c = Math.random() * 50 + 50;
            this.particlefield.add(np);
            this.particlesarray.push(np);
        }
    }

    updateparticles() {
        for (const p of this.particlesarray) {
            p.theta += 0.04;
            const r = p.c * Math.sin(3 * p.theta);
            p.x = p.vx + r * Math.cos(p.theta);
            p.y = p.vy + r * Math.sin(p.theta);
            if (p.theta > 2 * Math.PI) {
                p.theta = 0;
            }
        }
    }

    animatehead() {
        if (this.headanimatetimer > 0) {
            this.headanimatetimer--;
            // The AS3 cycles flowerhead1/2/3 visibility; the port tints
            // the head placeholder to show the animation phase.
            if (this.headanimatetimer === 3) {
                this.headimg.setFillStyle(0xe15d8e, 0.9);
            } else if (this.headanimatetimer === 2) {
                this.headimg.setFillStyle(0xc74a7a, 0.9);
            } else {
                this.headimg.setFillStyle(0xa83a66, 0.9);
            }
        }
    }

    clearhead() {
        this.headimg.setFillStyle(0xe15d8e, 0.9);
    }

    playSound(key) {
        const main = window.jumpDieCreateMain;
        if (main && typeof main.playsfx === 'function') {
            main.playsfx(key);
        }
    }

    update(g) {
        this.updateparticles();

        const guy = g.testguy;
        const guyW = (guy && guy.w) || 26;
        const guyH = (guy && guy.h) || 24;
        this.headwrapper.angle = FlowerBoss.getangle(
            this.x + 260, this.y - 40,
            guy.x + guyW, guy.y + guyH
        ) + 90;

        this.bulletcounter++;
        if (this.bulletcounter % 5 === 0) {
            this.animatehead();
        }

        if (this.bulletcounter > this.bulletspeed) {
            this.bulletcounter = 0;
            if (this.bulletspeed > 30) {
                this.bulletspeed -= 2;
            }
            const angle = -(this.headwrapper.angle + 90);
            const rad = angle * (Math.PI / 180);
            this.playSound('shoot');

            let newbullet;
            if (!g.bulletsreuse || g.bulletsreuse.length === 0) {
                newbullet = new Bullet(
                    this.scene, this.parentContainer,
                    this.x + 253, this.y - 48,
                    -Math.cos(rad) * 7, -Math.sin(rad) * 7
                );
            } else {
                newbullet = g.bulletsreuse.pop();
                newbullet.x = this.x + 253;
                newbullet.y = this.y - 48;
                newbullet.vx = -Math.cos(rad) * 7;
                newbullet.vy = -Math.sin(rad) * 7;
                newbullet.activate();
            }
            g.deathwall.push(newbullet);

            this.clearhead();
            this.headanimatetimer = 4;
        }

        const spdmov = Math.max((this.y - guy.y) / 75, 0.5);
        this.y -= spdmov;
        this.syncPosition();

        return this.checkhit(g);
    }

    checkhit(g) {
        if (!g.testguy || !g.testguy.innerhitbox) {
            return false;
        }
        const inner = g.testguy.innerhitbox;
        const body = new Phaser.Geom.Rectangle(this.x, this.y, 500, 300);
        const stem = new Phaser.Geom.Rectangle(this.x + 232, this.y - 40, 32, 40);
        const head = new Phaser.Geom.Rectangle(this.x + 218, this.y - 80, 60, 60);

        if (Phaser.Geom.Intersects.RectangleToRectangle(inner, body) ||
            Phaser.Geom.Intersects.RectangleToRectangle(inner, stem) ||
            Phaser.Geom.Intersects.RectangleToRectangle(inner, head)) {
            return FalldownBlock.guyhit(g);
        }
        return false;
    }

    type() {
        return 'flowerboss';
    }
}
