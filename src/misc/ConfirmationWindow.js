// ConfirmationWindow.js - Yes/No confirmation dialog.
// Mirrors misc/ConfirmationWindow.as.
//
// The AS3 passes stop=true to the TextWindow constructor so TextWindow skips
// its own UI build; ConfirmationWindow then rebuilds the window via
// makewindow(). The port mirrors that flow exactly.

import TextWindow from './TextWindow.js';

export default class ConfirmationWindow extends TextWindow {
    constructor(scene, parentContainer, questiontext, currentfunction, yfunction, nfunction) {
        super(scene, parentContainer, '', currentfunction, () => {}, true);

        this.gamefont = TextWindow.getTextFormat(13);

        this.makewindow(questiontext);

        this.yes = scene.add.container(180, 276);
        const yesImg = TextWindow.addButtonImage(scene, this.yes, TextWindow.YES_BUTTON_KEY);
        if (yesImg) {
            this.yes.setSize(yesImg.width, yesImg.height);
            this.yes.setInteractive({ useHandCursor: true });
        }
        this.yes.on('pointerdown', () => {
            yfunction();
        });
        this.container.add(this.yes);

        this.no = scene.add.container(270, 276);
        const noImg = TextWindow.addButtonImage(scene, this.no, TextWindow.NO_BUTTON_KEY);
        if (noImg) {
            this.no.setSize(noImg.width, noImg.height);
            this.no.setInteractive({ useHandCursor: true });
        }
        this.no.on('pointerdown', () => {
            nfunction();
        });
        this.container.add(this.no);
    }
}
