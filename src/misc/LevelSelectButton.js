// LevelSelectButton.js - Campaign level select entry.
// Mirrors misc/LevelSelectButton.as.

import Particle from './Particle.js';
import { TEXT_FORMAT_TYPES } from '../Constants.js';

export default class LevelSelectButton {
    constructor(scene, parentContainer, x, y, clvl) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.clvl = clvl;

        this.container = scene.add.container(x, y);
        if (parentContainer) {
            parentContainer.add(this.container);
        }

        let label;
        if (clvl === 11) {
            label = 'Level ' + this.clvl + ' (boss)';
        } else {
            label = 'Level ' + this.clvl;
        }
        this.text = LevelSelectButton.makeLevelSelectText(scene, 0, 0, label);
        this.container.add(this.text);

        // The AS3 uses a Particle with an invisible fill as the click area and
        // stashes the button on clickArea.buttonmaster.
        this.clickArea = new Particle(scene);
        this.clickArea.buttonmaster = this;
        this.clickArea.fillStyle(0x00ff00, 0);
        this.clickArea.fillRect(0, 0, this.text.width, this.text.height);
        this.clickArea.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, this.text.width, this.text.height),
            Phaser.Geom.Rectangle.Contains
        );
        this.container.add(this.clickArea);
    }

    // Mirrors the static makeLevelSelectText. The AS3 built the TextFormat
    // once from JumpDieCreateMain.getTextFormat(24, 2); the port resolves it
    // per call through the same helper.
    static makeLevelSelectText(scene, x, y, text) {
        const main = window.jumpDieCreateMain;
        const style = main.getTextFormat(24, TEXT_FORMAT_TYPES.MENU);
        return scene.add.text(x, y, text, style);
    }

    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        this.text = null;
        this.clickArea = null;
    }
}
