// TrackBlade.js - Track-mounted hazard.
// Mirrors blocks/TrackBlade.as at first-pass XML/runtime coverage.

import BaseBlock from './BaseBlock.js';

export default class TrackBlade extends BaseBlock {
    constructor(scene, parentContainer, x, y, w = 50, h = 55) {
        super(scene, parentContainer, x, y, w, h);

        this.blade = scene.add.rectangle(this.w / 2, this.h / 2, this.w, this.h, 0xcd3535, 0.85)
            .setStrokeStyle(2, 0x6e1111, 1);
        this.container.add(this.blade);
    }

    type() {
        return 'trackblade';
    }
}
