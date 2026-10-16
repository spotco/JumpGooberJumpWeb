// BossActivate.js - Rocket boss battle trigger zone.
// Mirrors blocks/BossActivate.as.
//
// When the guy enters the zone, spawns the RocketBoss, shows the HP bar,
// and arms nearby RocketLaunchers. When the boss HP hits zero, ends the
// battle and reveals the hidden BoostFruits.

import BaseBlock from './BaseBlock.js';
import RocketBoss from './RocketBoss.js';
import Rocket from './Rocket.js';

export default class BossActivate extends BaseBlock {
    constructor(scene, parentContainer, x, y, w, h, hp = 6, explode = 'no') {
        super(scene, parentContainer, x, y, w, h);

        this.hp = Number(hp) || 6;
        this.maxhp = this.hp;
        this.initialfillcounter = 0;

        this.startbattle = false;
        this.startbattledoneanim = false;

        this.init = false;

        this.battlelaunchers = [];
        this.showafter = [];
        this.theboss = null;

        this.doExplode = (explode === 'yes');

        // HP bar visuals (created in initbattle).
        this.hpbar = null;
        this.hpinnerbar = null;

        // Debug zone visual (the stub's, kept).
        this.zone = scene.add.rectangle(0, 0, this.w, this.h, 0xffa500, 0.12)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xffd36a, 0.9);
        this.container.add(this.zone);
    }

    rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    zoneHitsGuy(g) {
        if (!g.testguy || !g.testguy.hitbox) {
            return false;
        }
        const hb = g.testguy.hitbox;
        return this.rectsOverlap(
            this.x, this.y, this.w, this.h,
            hb.x, hb.y, hb.width, hb.height
        );
    }

    zoneHitsBlock(b) {
        if (!b || b.memRemoved) {
            return false;
        }
        return this.rectsOverlap(
            this.x, this.y, this.w, this.h,
            b.x, b.y, b.w, b.h
        );
    }

    playSound(key) {
        const main = window.jumpDieCreateMain;
        if (main && typeof main.playsfx === 'function') {
            main.playsfx(key);
        }
    }

    update(g) {
        if (!this.init) {
            this.init = true;
            this.ingameinit(g);
        }
        if (!this.startbattle && this.zoneHitsGuy(g)) {
            this.startbattle = true;
            this.initbattle(g);
        }
        if (this.initialfillcounter > 0) {
            this.initialfillcounter--;
            if (this.hpinnerbar) {
                this.hpinnerbar.scaleX = (70 - this.initialfillcounter) / 70;
            }
        }
        if (this.initialfillcounter === 0 && this.startbattle && this.hp > 0) {
            const tarscale = this.hp / this.maxhp;
            if (this.hpinnerbar && this.hpinnerbar.scaleX > tarscale) {
                this.hpinnerbar.scaleX -= 0.02;
            }
        }
        if (this.hp === 0 && !this.startbattledoneanim) {
            this.startbattledoneanim = true;
            this.endbattle(g);
        }
        return false;
    }

    addShowAfter(g) {
        if (this.hpbar) {
            this.hpbar.destroy();
            this.hpbar = null;
        }
        for (const bf of this.showafter) {
            if (!bf || bf.memRemoved) {
                continue;
            }
            bf.visible = true;
            bf.activated = true;
            bf.initgrowth = 20;
            if (bf.container) {
                bf.container.setVisible(true);
            }
        }
        // Remove self from the world and the particle list.
        this.removeFromMemory();
        if (g.particles) {
            const idx = g.particles.indexOf(this);
            if (idx !== -1) {
                g.particles.splice(idx, 1);
            }
        }
    }

    endbattle(g) {
        if (this.hpinnerbar) {
            this.hpinnerbar.scaleX = 0;
        }
        for (const b of this.battlelaunchers) {
            if (b && !b.memRemoved) {
                b.range = 2;
            }
        }
        // Explode all active rockets.
        for (const r of [...g.deathwall]) {
            if (r instanceof Rocket) {
                r.explode(g);
            }
        }
        this.playSound('rocketbossdie');
        if (this.theboss && typeof this.theboss.tempdeathanim === 'function') {
            this.theboss.tempdeathanim();
        }
    }

    hit() {
        this.hp--;
    }

    initbattle(g) {
        // HP bar frame.
        this.hpbar = this.scene.add.graphics();
        this.hpbar.lineStyle(3, 0xff0000, 0.7);
        this.hpbar.moveTo(25, 15);
        this.hpbar.lineTo(475, 15);
        this.hpbar.lineTo(475, 50);
        this.hpbar.lineTo(25, 50);
        this.hpbar.lineTo(25, 15);
        this.hpbar.strokePath();

        this.hpinnerbar = this.scene.add.rectangle(30, 20, 440, 25, 0xff0000, 0.7)
            .setOrigin(0, 0);
        this.hpinnerbar.scaleX = 0;
        this.initialfillcounter = 70;

        this.theboss = new RocketBoss(this.scene, this.parentContainer, -99, 250);
        if (g.testguy.x > 250) {
            this.theboss.side = RocketBoss.RIGHT;
        } else {
            this.theboss.side = RocketBoss.LEFT;
        }

        this.theboss.activatecontroller = this;
        if (this.doExplode) {
            this.theboss.doExplode = true;
        }
        g.deathwall.push(this.theboss);

        for (const b of this.battlelaunchers) {
            if (b && !b.memRemoved) {
                b.range = 450;
            }
        }
    }

    ingameinit(g) {
        for (const b of g.deathwall) {
            if (b && !b.memRemoved && b.type() === 'rocketlauncher' && this.zoneHitsBlock(b)) {
                this.battlelaunchers.push(b);
                b.range = 2;
            }
        }
        for (const bf of g.boostfruits) {
            if (bf && !bf.memRemoved && this.zoneHitsBlock(bf)) {
                this.showafter.push(bf);
                bf.visible = false;
                bf.activated = false;
                if (bf.container) {
                    bf.container.setVisible(false);
                }
            }
        }
    }

    type() {
        return 'bossactivate';
    }
}
