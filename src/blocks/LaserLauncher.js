// LaserLauncher.js - Rotating laser source.
// Mirrors blocks/LaserLauncher.as at first-pass XML/runtime coverage.

import BaseBlock from './BaseBlock.js';

export default class LaserLauncher extends BaseBlock {
    constructor(scene, parentContainer, x, y, dir = 0) {
        super(scene, parentContainer, x, y, 28, 28);

        this.dir = dir;
        this.base = scene.add.rectangle(0, 0, 28, 28, 0x4b0f0f, 0.95)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xff8a8a, 1);
        this.beam = scene.add.rectangle(14, 14, 22, 4, 0xff4444, 0.95)
            .setAngle(dir * 30);
        this.container.add([this.base, this.beam]);
    }

    type() {
        return 'laserlauncher';
    }
}
