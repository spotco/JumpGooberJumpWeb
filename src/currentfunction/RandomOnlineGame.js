import { MUSIC } from '../Constants.js';
import CurrentFunction from './CurrentFunction.js';
import JumpDieCreateMenu from './JumpDieCreateMenu.js';

export default class RandomOnlineGame extends CurrentFunction {
    constructor(main) {
        super(main);
        this.currentGame = null;
        this.currentlevelxml = null;
        this.currentlevelinfo = null;
        this.numdeath = -1;
        this.startsong = true;
        this.makeloadbg('Online random levels are stubbed in this browser port.');
    }

    makeloadbg(message = 'Loading...') {
        this.add(this.scene.add.image(250, 260, 'menu_bg'));
        this.add(JumpDieCreateMenu.getTextBubble(this.scene));
        this.add(this.scene.add.text(118, 220, message, this.main.getTextFormat(14)).setWordWrapWidth(270));
        const back = this.add(this.scene.add.text(214, 340, 'Back', this.main.getTextFormat(16)).setInteractive({ useHandCursor: true }));
        back.on('pointerdown', () => this.destroy());
    }

    getNewLevel() {}

    startLevel() {
        if (this.startsong) {
            this.main.playSpecific(MUSIC.ONLINE);
            this.startsong = false;
        }
    }

    nextLevel(hitgoal) {
        this.destroy();
    }

    destroy() {
        this.clearObjects();
        this.main.stop();
        if (!this.main.suppressMenuRecreate) {
            this.main.curfunction = new JumpDieCreateMenu(this.main);
        }
    }
}
