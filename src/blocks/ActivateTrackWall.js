// ActivateTrackWall.js - Track wall activator.
// Mirrors blocks/ActivateTrackWall.as at first-pass XML/runtime coverage.

import BaseBlock from './BaseBlock.js';

export default class ActivateTrackWall extends BaseBlock {
    constructor(scene, parentContainer, x, y, w, h) {
        super(scene, parentContainer, x, y, w, h);

        this.fill = scene.add.rectangle(0, 0, this.w, this.h, 0x45a4c4, 0.3)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xb7efff, 0.9);
        this.container.add(this.fill);
    }

    type() {
        return 'activatetrackwall';
    }
}
