// Goal.js - Green goal block.
// Mirrors blocks/Goal.as for the first rendering slice.

import BaseBlock from './BaseBlock.js';

export default class Goal extends BaseBlock {
    constructor(scene, parentContainer, x, y, w, h, noEdge = false) {
        super(scene, parentContainer, x, y, w, h);

        this.animationcounter = 0;
        this.animationphase = 0;
        this.mainfillcontainer = scene.add.tileSprite(0, 0, this.w, this.h, 'goal_green_1')
            .setOrigin(0, 0);
        this.container.add(this.mainfillcontainer);

        if (!noEdge) {
            const top = scene.add.tileSprite(0, -16, this.w, 16, 'goal_green_top')
                .setOrigin(0, 0);
            const left = scene.add.tileSprite(-16, 0, 16, this.h, 'goal_green_left')
                .setOrigin(0, 0);
            const bottom = scene.add.tileSprite(0, this.h, this.w, 14, 'goal_green_bottom')
                .setOrigin(0, 0);
            const right = scene.add.tileSprite(this.w, 0, 17, this.h, 'goal_green_right')
                .setOrigin(0, 0);

            this.container.add([top, left, bottom, right]);
        }
    }

    update(_gameEngine) {
        this.animate();
        return false;
    }

    animate() {
        this.animationcounter++;
        if (this.animationcounter <= 15) {
            return false;
        }

        this.animationcounter = 0;
        this.animationphase = this.animationphase === 0 ? 1 : 0;
        this.mainfillcontainer.setTexture(this.animationphase === 0 ? 'goal_green_1' : 'goal_green_2');
        return false;
    }

    type() {
        return 'goal';
    }
}
