// RocketLauncher.js - Rocket spawner.
// Mirrors blocks/RocketLauncher.as at first-pass XML/runtime coverage.

import BaseBlock from './BaseBlock.js';

export default class RocketLauncher extends BaseBlock {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, 32, 32);

        this.base = scene.add.rectangle(0, 0, 32, 32, 0x7b1a1a, 0.95)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xda9b9b, 1);
        this.nozzle = scene.add.rectangle(24, 8, 10, 16, 0xc84646, 1)
            .setOrigin(0, 0);
        this.container.add([this.base, this.nozzle]);
    }

    type() {
        return 'rocketlauncher';
    }
}
