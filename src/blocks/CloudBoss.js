// CloudBoss.js - Cloud boss that tracks the player and strikes lightning.
// Mirrors blocks/CloudBoss.as.
//
// The AS3 extends FalldownBlock. Boss images (cloud1.png etc.) are not
// preloaded yet; placeholders are used until the textures exist.

import FalldownBlock from './FalldownBlock.js';
import Particle from '../misc/Particle.js';

export default class CloudBoss extends FalldownBlock {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, 0, 0, 0, 0, true);

        this.followtime = 75;
        this.flashtime = 50;
        this.snowspeed = 2;

        this.trackingtimer = this.followtime;
        this.tracking = true;

        // Cloud container (tracks the player horizontally).
        this.cloudcontainer = scene.add.container(0, 0);

        // Thunder hitbox: rect (0,0,28,520) in cloud-container coordinates.
        // Thunder body visual, hidden until the strike.
        this.thunderbody = scene.add.container(-25, 25);
        this.thunderimg = scene.add.rectangle(14, 260, 28, 520, 0xfff176, 0.9);
        this.thunderbody.add(this.thunderimg);
        this.thunderbody.setVisible(false);
        this.thunderbody.setAlpha(0);
        this.cloudcontainer.add(this.thunderbody);

        // Cloud body with three flash frames.
        this.cloudbody = scene.add.container(-144, -75);
        this.cloud1 = scene.add.ellipse(72, 37, 144, 75, 0xd7edf8, 0.95)
            .setStrokeStyle(3, 0x8bb6ca, 1);
        this.cloud2 = scene.add.ellipse(72, 37, 144, 75, 0xbfe0f2, 0.95)
            .setStrokeStyle(3, 0x8bb6ca, 1)
            .setVisible(false);
        this.cloud3 = scene.add.ellipse(72, 37, 144, 75, 0x9ecfe8, 0.95)
            .setStrokeStyle(3, 0x8bb6ca, 1)
            .setVisible(false);
        this.cloudbody.add([this.cloud1, this.cloud2, this.cloud3]);
        this.cloudcontainer.add(this.cloudbody);
        this.container.add(this.cloudcontainer);

        // Background snow container.
        this.backgroundcontainer = scene.add.container(0, 0);
        this.backgroundfill = scene.add.rectangle(0, 0, 500, 520, 0x000000, 1)
            .setOrigin(0, 0)
            .setAlpha(0.1);
        this.backgroundcontainer.add(this.backgroundfill);
        this.container.add(this.backgroundcontainer);

        this.particlesarray = [];

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

    update(g) {
        if (this.container && this.container.parentContainer) {
            this.container.parentContainer.bringToTop(this.container);
        }

        this.backgroundupdate(g);

        if (this.tracking) {
            this.cloudflash(0);
            this.cloudtrack(g.testguy.x, 7);

            this.trackingtimer--;
            if (this.trackingtimer <= 0) {
                if (Math.abs(this.cloudcontainer.x - g.testguy.x) > 5) {
                    this.trackingtimer = 1;
                    return false;
                }
                this.trackingtimer = this.flashtime;
                this.tracking = false;
            }
        } else {
            if (this.trackingtimer > 10) { // flash phase
                this.cloudflash(this.trackingtimer % 10);
                this.trackingtimer--;
            } else { // thunder phase
                if (this.trackingtimer === 10) {
                    this.playSound('thunder');
                }
                this.thunderbody.setVisible(true);
                if (this.trackingtimer > 5) {
                    this.thunderbody.setAlpha((10 - this.trackingtimer) / 5);
                } else {
                    this.thunderbody.setAlpha(this.trackingtimer / 5);
                }
                this.trackingtimer--;
                if (this.trackingtimer === 5) {
                    this.harder();
                }
                if (this.trackingtimer <= 0) {
                    this.thunderbody.setVisible(false);
                    this.tracking = true;
                    this.trackingtimer = this.followtime;
                }
                if (this.thunderbody.alpha > 0.3) {
                    return this.checkhit(g);
                }
            }
        }
        return false;
    }

    harder() {
        if (this.snowspeed < 10) {
            this.snowspeed++;
        }
        if (this.backgroundfill.alpha < 0.6) {
            this.backgroundfill.alpha += 0.03;
        }
        if (this.followtime > 25) {
            this.followtime -= 5;
        }
    }

    checkhit(g) {
        if (!g.testguy || !g.testguy.hitbox) {
            return false;
        }
        // Thunder hitbox in world coordinates.
        const thunderRect = new Phaser.Geom.Rectangle(
            this.x + this.cloudcontainer.x,
            this.y + this.cloudcontainer.y,
            28, 520
        );
        if (Phaser.Geom.Intersects.RectangleToRectangle(g.testguy.hitbox, thunderRect)) {
            this.thunderbody.setAlpha(1);
            return FalldownBlock.guyhit(g);
        }
        return false;
    }

    backgroundupdate(g) {
        for (let i = 1; i < (Math.random() * this.snowspeed); i++) {
            let newp;
            if (!g.particlesreuse || g.particlesreuse.length === 0) {
                newp = new Particle(this.scene);
            } else {
                newp = g.particlesreuse.pop();
            }
            newp.vx = 7;
            newp.vy = 5;
            if (Math.round(Math.random() * 10) > 5) {
                newp.x = 500 * Math.random();
            } else {
                newp.y = 500 * Math.random();
            }
            newp.fillStyle(0xffffff, 1);
            newp.fillCircle(0, 0, 1);
            this.backgroundcontainer.add(newp);
            this.particlesarray.push(newp);
        }
        for (let i = this.particlesarray.length - 1; i >= 0; i--) {
            const p = this.particlesarray[i];
            p.x += p.vx;
            p.y += p.vy;
            if ((p.x > 500 || p.y > 520)) {
                this.backgroundcontainer.remove(p);
                this.particlesarray.splice(i, 1);
                p.clear();
                p.setAlpha(1);
                p.x = 0;
                p.y = 0;
                if (g.particlesreuse) {
                    g.particlesreuse.push(p);
                }
            }
        }
    }

    cloudtrack(tarx, spd) {
        if (Math.abs(tarx - this.cloudcontainer.x) < spd) {
            spd = Math.abs(tarx - this.cloudcontainer.x);
        }
        if (tarx > this.cloudcontainer.x) {
            this.cloudcontainer.x += spd;
        } else if (tarx < this.cloudcontainer.x) {
            this.cloudcontainer.x -= spd;
        }
    }

    cloudflash(t) {
        if (t > 7) {
            this.cloud1.setVisible(true);
            this.cloud2.setVisible(false);
            this.cloud3.setVisible(false);
        } else if (t > 3) {
            this.cloud1.setVisible(false);
            this.cloud2.setVisible(true);
            this.cloud3.setVisible(false);
        } else {
            this.cloud1.setVisible(false);
            this.cloud2.setVisible(false);
            this.cloud3.setVisible(true);
        }
    }

    gameScroll(scroll_spd) {
        // The AS3 overrides gameScroll as a no-op; the boss stays fixed.
        return;
    }

    type() {
        return 'cloudboss';
    }
}
