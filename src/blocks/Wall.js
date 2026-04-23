// Wall.js - Blue static wall block.
// Mirrors blocks/Wall.as.

import BaseBlock from './BaseBlock.js';

export default class Wall extends BaseBlock {
    constructor(scene, parentContainer, x, y, w, h, nodetails = false) {
        super(scene, parentContainer, x, y, w, h);

        const fillKey = this.h > 58 ? 'wall_blue_tall' : 'wall_blue';
        const fill = scene.add.tileSprite(0, 0, this.w, this.h, fillKey)
            .setOrigin(0, 0);
        this.container.add(fill);

        if (!nodetails) {
            const top = scene.add.tileSprite(0, -32, this.w, 32, 'wall_blue_top')
                .setOrigin(0, 0);
            this.container.add(top);
        }
    }

    type() {
        return 'wall';
    }
}
