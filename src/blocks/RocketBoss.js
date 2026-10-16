// RocketBoss.js - World 3 rocket boss.
// Mirrors blocks/RocketBoss.as.
//
// ASSET NOTE (for BootScene.js preload; BootScene.js is intentionally not
// modified here):
//   'rocketboss_img'        <- img/boss/rocketboss.png         (NOT preloaded yet)
//   'rocketboss2_img'       <- img/boss/rocketboss2.png        (NOT preloaded yet)
//   'rocketpropeller1_img'  <- img/boss/rocketpropeller1.png   (NOT preloaded yet)
//   'rocketpropeller2_img'  <- img/boss/rocketpropeller2.png   (NOT preloaded yet)
//   'rocketpropeller3_img'  <- img/boss/rocketpropeller3.png   (NOT preloaded yet)
// Visuals are skipped when their texture is missing; boss logic runs regardless.

import FalldownBlock from './FalldownBlock.js';
import RocketParticle from './RocketParticle.js';

export default class RocketBoss extends FalldownBlock {
    static LEFT = true;
    static RIGHT = false;

    constructor(scene, parentContainer, x, y) {
        // noedge=true: the AS3 drew invisible zero-size red strips here.
        super(scene, parentContainer, 0, 0, 0, 0, true);

        this.x = x;
        this.y = y;

        this.activatecontroller = null;

        this.animtimer = 0;
        this.doParticles = true;
        this.speed = 7;

        this.side = RocketBoss.LEFT;

        this.init = false;

        this.flashtimer = 0;
        this.flashcount = 0;
        this.flashstatus = false;

        this.doExplode = false;

        this.deathanimcounter = 0;

        // Hitbox offset from the boss origin; the AS3 hitbox sprite graphics
        // were commented out, so only the offset matters (see die()).
        this.hitboxX = 0;
        this.hitboxY = 0;

        this.bossbody = scene.add.container(0, 0);
        this.rotatecontainer = scene.add.container(0, 0);

        this.bodyimg = this.addBossImage(scene, 'rocketboss_img');
        this.bodyimg2 = this.addBossImage(scene, 'rocketboss2_img');
        if (this.bodyimg2) {
            this.bodyimg2.setVisible(false);
        }

        // Propeller frames at the AS3 rp1/rp2/rp3 positions (52-29, 104).
        this.rp1 = this.addBossImage(scene, 'rocketpropeller1_img', 52 - 29, 104);
        this.rp2 = this.addBossImage(scene, 'rocketpropeller2_img', 52 - 29, 104);
        this.rp3 = this.addBossImage(scene, 'rocketpropeller3_img', 52 - 29, 104);
        if (this.rp1) {
            this.rp1.setVisible(true);
        }
        if (this.rp2) {
            this.rp2.setVisible(false);
        }
        if (this.rp3) {
            this.rp3.setVisible(false);
        }

        // Center the rotation container on the body, mirroring
        // rotatecontainer.x = -.5 * bossbody.width.
        const bodyW = this.bodyimg ? this.bodyimg.width : 0;
        const bodyH = this.bodyimg ? this.bodyimg.height : 0;
        this.rotatecontainer.x = -0.5 * bodyW;
        this.rotatecontainer.y = -0.5 * bodyH;
        this.bossbody.add(this.rotatecontainer);
        this.container.add(this.bossbody);

        this.container.setScale(0.75);

        this.syncPosition();
    }

    addBossImage(scene, key, x = 0, y = 0) {
        if (!scene.textures.exists(key)) {
            return null;
        }
        const img = scene.add.image(x, y, key).setOrigin(0, 0);
        this.rotatecontainer.add(img);
        return img;
    }

    setImageVisible(img, visible) {
        if (img) {
            img.setVisible(visible);
        }
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

    simpleupdate(g) {
        this.update(g);
    }

    update(g) {
        const rad = this.bossbody.angle * Math.PI / 180;
        const dx = Math.sin(rad);
        const dy = -Math.cos(rad);

        this.animatePropeller();
        this.animateParticles(dx, dy, g);
        this.flashanimation();

        if (this.deathanimcounter > 0) {
            if (this.flashtimer === 0) {
                this.flashtimer = 10;
                this.flashcount = 0;
            }
            this.deathanimcounter--;
            this.bossbody.angle += 15;
            if (this.doExplode) {
                this.dieExplode(g);
            } else {
                this.dieNoExplode(g);
            }
            return this.die(g);
        }

        this.hitboxX = dx * 15;
        this.hitboxY = dy * 15;

        this.x += dx * this.speed;
        this.y += dy * this.speed;

        if (!this.init) {
            this.init = true;
            this.x = -105;
            this.y = 250;
        }

        if (this.x < -100 || this.x > 600 || this.y < -100 || this.y > 600) {
            this.playSound('rocketboss');
            this.side = !this.side;
            if (this.side === RocketBoss.LEFT) {
                this.x = -99;
            } else {
                this.x = 599;
            }
            this.y = Math.random() * 400 - 100;

            const guy = g.testguy;
            const guyW = (guy && guy.w) || 26;
            const guyH = (guy && guy.h) || 24;
            this.bossbody.angle = RocketBoss.getAngle(
                this.x, this.y,
                guy.x + guyW / 2, guy.y + guyH / 2
            ) + 90;
        }

        this.syncPosition();
        return this.die(g);
    }

    // Manual two-circle hitbox calculation, mirrored from the AS3 die().
    die(g) {
        const guy = g.testguy;
        if (!guy) {
            return false;
        }
        const guyW = guy.w || 26;
        const guyH = guy.h || 24;
        const calcdist = Math.sqrt(
            Math.pow(this.x + this.hitboxX - (guy.x + guyW / 2), 2) +
            Math.pow(this.y + this.hitboxY - (guy.y + 2 + guyH / 2), 2)
        );
        if (calcdist < 50 + 5) {
            return FalldownBlock.guyhit(g);
        }
        return false;
    }

    dieNoExplode(g) {
        if (this.deathanimcounter === 0) {
            this.deathanimcounter = 1;
            this.bossbody.angle = 0;
            this.y -= 7;
            if (this.y < -50) {
                const idx = g.deathwall.indexOf(this);
                if (idx !== -1) {
                    g.deathwall.splice(idx, 1);
                }
                this.removeFromMemory();
                // BossActivate.addShowAfter is not ported yet (first-pass stub).
                if (this.activatecontroller &&
                    typeof this.activatecontroller.addShowAfter === 'function') {
                    this.activatecontroller.addShowAfter(g);
                }
            }
        }
    }

    dieExplode(g) {
        for (let i = 0; i < 6; i++) {
            let particle;
            if (g.rocketparticlesreuse.length === 0) {
                particle = new RocketParticle(this.scene);
            } else {
                particle = g.rocketparticlesreuse.pop();
            }

            const randSpd = Math.random() * 10;
            particle.graphics.fillStyle(0xcc6666, 1);
            particle.graphics.fillCircle(0, 0, Math.random() * 4);
            particle.alphaspd = 0.05;
            particle.x = this.x + Math.random() * 105 - 50;
            particle.y = this.y + Math.random() * 105 - 50;
            particle.vx = Math.sin(i * (Math.PI / 3)) * randSpd;
            particle.vy = Math.cos(i * (Math.PI / 3)) * randSpd;
            particle.activate();
            g.particles.push(particle);
        }
        if (this.deathanimcounter === 0) {
            for (let i = 0; i < 24; i++) {
                let particle;
                if (g.rocketparticlesreuse.length === 0) {
                    particle = new RocketParticle(this.scene);
                } else {
                    particle = g.rocketparticlesreuse.pop();
                }

                const randSpd = Math.random() * 10;
                particle.graphics.fillStyle(0xcc6666, 1);
                particle.graphics.fillCircle(0, 0, 7 * Math.random());
                particle.alphaspd = 0.025;
                particle.x = this.x;
                particle.y = this.y;
                particle.vx = Math.sin(i * (Math.PI / 12)) * randSpd;
                particle.vy = Math.cos(i * (Math.PI / 12)) * randSpd;
                particle.ay = 0.25;
                particle.activate();
                g.particles.push(particle);
            }
            const idx = g.deathwall.indexOf(this);
            if (idx !== -1) {
                g.deathwall.splice(idx, 1);
            }
            this.removeFromMemory();
            // BossActivate.addShowAfter is not ported yet (first-pass stub).
            if (this.activatecontroller &&
                typeof this.activatecontroller.addShowAfter === 'function') {
                this.activatecontroller.addShowAfter(g);
            }
        }
    }

    tempdeathanim() {
        this.deathanimcounter = 65;
    }

    hitByRocket() {
        this.flashtimer = 10;
        this.flashcount = 0;
        // BossActivate.hit is not ported yet (first-pass stub).
        if (this.activatecontroller &&
            typeof this.activatecontroller.hit === 'function') {
            this.activatecontroller.hit();
        }
    }

    flashanimation() {
        if (this.flashtimer > 0) {
            this.flashtimer--;
            this.flashcount++;
            if (this.flashcount > 3) {
                this.flashcount = 0;
                this.flashstatus = !this.flashstatus;
            }
            if (this.flashstatus) {
                this.setImageVisible(this.bodyimg, false);
                this.setImageVisible(this.bodyimg2, true);
            } else {
                this.setImageVisible(this.bodyimg, true);
                this.setImageVisible(this.bodyimg2, false);
            }
        } else {
            this.setImageVisible(this.bodyimg, true);
            this.setImageVisible(this.bodyimg2, false);
        }
    }

    animateParticles(dx, dy, g) {
        if (!this.doParticles) {
            return;
        }
        dx = dx * 5;
        dy = dy * 5;

        let newp;
        if (g.rocketparticlesreuse.length === 0) {
            newp = new RocketParticle(this.scene);
        } else {
            newp = g.rocketparticlesreuse.pop();
        }

        newp.x = this.x + dx * -12;
        newp.y = this.y + dy * -12;
        newp.vx = -dx + Math.random() * 6 - 1.5;
        newp.vy = -dy + Math.random() * 6 - 1.5;
        newp.ay = 0.75;
        newp.alphaspd = 0.05;
        newp.graphics.fillStyle(0xcc6666, 1);
        newp.graphics.fillCircle(0, 0, Math.random() * 4);
        newp.activate();
        g.particles.push(newp);
    }

    animatePropeller() {
        this.animtimer++;
        if (this.animtimer > 3) {
            this.animtimer = 0;
            const rp1Visible = this.rp1 ? this.rp1.visible : false;
            const rp2Visible = this.rp2 ? this.rp2.visible : false;
            if (rp1Visible) {
                this.setImageVisible(this.rp1, false);
                this.setImageVisible(this.rp2, true);
                this.setImageVisible(this.rp3, false);
            } else if (rp2Visible) {
                this.setImageVisible(this.rp1, false);
                this.setImageVisible(this.rp2, false);
                this.setImageVisible(this.rp3, true);
            } else {
                this.setImageVisible(this.rp1, true);
                this.setImageVisible(this.rp2, false);
                this.setImageVisible(this.rp3, false);
            }
        }
    }

    type() {
        return 'rocketboss';
    }

    // Source-mapped from FlowerBoss.getangle in FlowerBoss.as.
    // Move next to Rocket.getAngle when the boss ports are completed.
    static getAngle(ax, ay, bx, by) {
        return Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
    }
}
