// Boost.js - Yellow boost surface.
// Mirrors blocks/Boost.as at first-pass XML/runtime coverage.

import BaseBlock from './BaseBlock.js';

export default class Boost extends BaseBlock {
    constructor(scene, parentContainer, x, y, w, h) {
        super(scene, parentContainer, x, y, w, h);

        this.fill = scene.add.tileSprite(0, 0, this.w, this.h, 'yellowblock')
            .setOrigin(0, 0);
        this.container.add(this.fill);
    }

    type() {
        return 'boost';
    }
}
