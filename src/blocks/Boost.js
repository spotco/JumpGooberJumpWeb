// Boost.js - Yellow boost surface.
// Mirrors blocks/Boost.as at first-pass XML/runtime coverage.

import BaseBlock from './BaseBlock.js';

export default class Boost extends BaseBlock {
    constructor(scene, parentContainer, x, y, w, h) {
        super(scene, parentContainer, x, y, w, h);

        this.fill = scene.add.tileSprite(0, 0, this.w, this.h, 'yellowblock')
            .setOrigin(0, 0);
        this.container.add(this.fill);

        this.playstatus = false;
        this.playcooldown = 0;
    }

    update(gameEngine) {
        // Mirrors blocks/Boost.as update(): on guy touch, vy -= 3
        // (clamped), boost sound with 35-tick cooldown, jumpCounter += 4.
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
