// Textdisplay.js - Text bubble helper.
// Mirrors blocks/Textdisplay.as at first-pass rendering fidelity.

import BaseBlock from './BaseBlock.js';

export default class Textdisplay extends BaseBlock {
    constructor(scene, parentContainer, x, y, text) {
        super(scene, parentContainer, x, y, 156, 70);

        this.message = text;
        this.buganimationtimer = 0;
        this.buganimationphase = 0;

        this.textcontainer = scene.add.container(0, 0);
        this.bubble = scene.add.image(0, 0, 'text_speechbubble').setOrigin(0, 0);
        this.textObject = scene.add.text(5, 3, text, {
            fontFamily: 'Bienvenu, Arial, sans-serif',
            fontSize: '10px',
            color: '#111111',
            wordWrap: { width: 145 },
        });
        this.textcontainer.add([this.bubble, this.textObject]);
        this.container.add(this.textcontainer);

        this.bugcontainer = scene.add.container(0, 0);
        this.bug = scene.add.image(0, 0, 'text_bug_1').setOrigin(0, 0);
        this.bugcontainer.add(this.bug);
        this.container.add(this.bugcontainer);

        if (x > 250) {
            this.bubble.setScale(-1, 1);
            this.bubble.x += this.bubble.width;
            this.bug.setScale(-1, 1);
            this.bug.x += this.bug.width;
            this.bugcontainer.x += 148;
            this.bugcontainer.y += 62;
        } else {
            this.bugcontainer.x -= 15;
            this.bugcontainer.y += 47;
        }
    }

    update(_gameEngine) {
        this.animate();
        return false;
    }

    animate() {
        if (this.y < -200 || this.y > 700) {
            return false;
        }

        this.buganimationtimer++;
        if (this.buganimationtimer <= 5) {
            return false;
        }

        this.buganimationtimer = 0;
        this.buganimationphase = this.buganimationphase === 0 ? 1 : 0;
        this.bug.setTexture(this.buganimationphase === 0 ? 'text_bug_1' : 'text_bug_2');
        return false;
    }

    type() {
        return 'textfield';
    }

    internaltext() {
        return this.message;
    }
}
