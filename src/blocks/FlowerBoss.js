// FlowerBoss.js - Flower boss placeholder.
// Mirrors blocks/FlowerBoss.as at first-pass XML/runtime coverage.

import BaseBlock from './BaseBlock.js';

export default class FlowerBoss extends BaseBlock {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, 72, 72);

        this.body = scene.add.ellipse(36, 36, 72, 72, 0xe15d8e, 0.9)
            .setStrokeStyle(3, 0x8e224d, 1);
        this.container.add(this.body);
    }

    type() {
        return 'flowerboss';
    }
}
