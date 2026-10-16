// BoostFruit.js - Fruit pickup.
// Mirrors blocks/BoostFruit.as at first-pass XML/runtime coverage.

import BaseBlock from './BaseBlock.js';

export default class BoostFruit extends BaseBlock {
    constructor(scene, parentContainer, x, y, w = 24, h = 28) {
        super(scene, parentContainer, x, y, w, h);

        this.sprite = scene.add.image(this.w / 2, this.h / 2, 'boostfruit')
            .setDisplaySize(this.w, this.h);
        this.container.add(this.sprite);
    }

    type() {
        return 'boostfruit';
    }

    update(gameEngine) {
        // Mirrors blocks/BoostFruit.as update(): on touch, grants the guy
        // 3 air-jumps (boost = 3) and canJump, then plays the eat animation.
        const guy = gameEngine ? gameEngine.testguy : null;
        if (this.ready && guy && typeof guy.hitTestObject === 'function' && guy.hitTestObject(this)) {
            const main = typeof window !== 'undefined' ? window.jumpDieCreateMain : null;
            if (main && typeof main.playsfx === 'function') {
                main.playsfx('fruit');
            }
            guy.boost = 3;
            guy.canJump = true;
            this.eat(gameEngine);
        }
        return false;
    }

    eat(gameEngine) {
        // Mirrors BoostFruit.as eat(): mark eaten, hide the fruit.
        this.ready = false;
        if (gameEngine && gameEngine.testguy) {
            this.eatAtCounter = gameEngine.testguy.jumpCounter;
        }
        if (this.container) {
            this.container.setVisible(false);
        }
    }
}
