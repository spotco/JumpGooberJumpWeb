// BossActivate.js - Boss activation trigger zone.
// Mirrors blocks/BossActivate.as at first-pass XML/runtime coverage.

import BaseBlock from './BaseBlock.js';

export default class BossActivate extends BaseBlock {
    constructor(scene, parentContainer, x, y, w, h, hp, explode) {
        super(scene, parentContainer, x, y, w, h);

        this.hp = hp;
        this.explode = explode;
        this.zone = scene.add.rectangle(0, 0, this.w, this.h, 0xffa500, 0.12)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xffd36a, 0.9);
        this.container.add(this.zone);
    }

    type() {
        return 'bossactivate';
    }
}
