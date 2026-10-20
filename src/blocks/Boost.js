// Boost.js - Yellow boost surface.
// Mirrors blocks/Boost.as at first-pass XML/runtime coverage.

import BaseBlock from './BaseBlock.js';

export default class Boost extends BaseBlock {
    constructor(scene, parentContainer, x, y, w, h) {
        super(scene, parentContainer, x, y, w, h);

        // Mirrors Boost.as: bitmap-fill cycles yellowblock0..4, alpha 0.8,
        // and a 2px orange (0xFFAA33) border frame on top.
        this.animarray = ['yellowblock0', 'yellowblock1', 'yellowblock2', 'yellowblock3', 'yellowblock4'];
        this.animframe = 0;
        this.animslowtimer = 0;
        this.fill = scene.add.tileSprite(0, 0, this.w, this.h, this.animarray[0])
            .setOrigin(0, 0);
        this.fill.setAlpha(0.8);
        this.container.add(this.fill);
        this.frame = scene.add.graphics();
        this.frame.lineStyle(2, 0xFFAA33);
        this.frame.strokeRect(0, 0, this.w, this.h);
        this.container.add(this.frame);

        this.playstatus = false;
        this.playcooldown = 0;
    }

    // Mirrors Boost.as updateAnimation(): every 6 ticks advance the fill
    // frame; skipped while far off-screen (y < -1000 or y > 700).
    updateAnimation() {
        if (this.y < -1000 || this.y > 700) {
            return;
        }
        if (this.animslowtimer > 5) {
            this.animframe++;
            if (this.animframe > this.animarray.length - 1) {
                this.animframe = 0;
            }
            this.fill.setTexture(this.animarray[this.animframe]);
            this.animslowtimer = 0;
        }
        this.animslowtimer++;
    }

    update(gameEngine) {
        // Mirrors blocks/Boost.as update(): on guy touch, vy -= 3
        // (clamped), boost sound with 35-tick cooldown, jumpCounter += 4.
        this.updateAnimation();
        if (this.playcooldown > 0) {
            this.playcooldown--;
        }
        const guy = gameEngine ? gameEngine.testguy : null;
        const hit = !!(guy && typeof guy.hitTestObject === 'function' && guy.hitTestObject(this));
        if (hit) {
            if (!this.playstatus && this.playcooldown === 0) {
                const main = typeof window !== 'undefined' ? window.jumpDieCreateMain : null;
                if (main && typeof main.playsfx === 'function') {
                    main.playsfx('boost');
                }
                this.playcooldown = 35;
            }
            if (guy.vy > -20) {
                guy.vy -= 3;
            }
            guy.jumpCounter += 4;
        }
        this.playstatus = hit;
        return false;
    }

    type() {
        return 'boost';
    }
}
