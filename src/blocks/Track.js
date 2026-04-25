// Track.js - Moving track guide.
// Mirrors blocks/Track.as at first-pass XML/runtime coverage.

import BaseBlock from './BaseBlock.js';

export default class Track extends BaseBlock {
    constructor(scene, parentContainer, x, y, w, h) {
        super(scene, parentContainer, x, y, w, h);

        this.rail = scene.add.rectangle(0, 0, this.w, this.h, 0x6d7f94, 0.45)
            .setOrigin(0, 0);
        this.outline = scene.add.rectangle(0, 0, this.w, this.h)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xd8e6f2, 0.8);
        this.container.add([this.rail, this.outline]);
    }

    type() {
        return 'track';
    }
}
