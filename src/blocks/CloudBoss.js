// CloudBoss.js - Cloud boss placeholder.
// Mirrors blocks/CloudBoss.as at first-pass XML/runtime coverage.

import BaseBlock from './BaseBlock.js';

export default class CloudBoss extends BaseBlock {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, 96, 54);

        this.body = scene.add.ellipse(48, 27, 96, 54, 0xd7edf8, 0.95)
            .setStrokeStyle(3, 0x8bb6ca, 1);
        this.container.add(this.body);
    }

    type() {
        return 'cloudboss';
    }
}
