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
}
