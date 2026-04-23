import { MUSIC } from '../Constants.js';
import CurrentFunction from './CurrentFunction.js';
import JumpDieCreateMenu from './JumpDieCreateMenu.js';

export default class LevelEditor extends CurrentFunction {
    constructor(main) {
        super(main);
        this.xmllist = [];
        this.rectList = [];
        this.currenty = 0;
        this.currenttype = LevelEditor.WALL;
        this.currentgame = null;
        this.main.stop();
        this.makeui();
        this.main.playSpecific(MUSIC.LEVELEDITOR_MUSIC);
    }

    makeui() {
        this.add(this.scene.add.rectangle(250, 260, 500, 520, 0x000000));
        this.add(this.scene.add.rectangle(250, 510, 500, 40, 0x202020));
        this.add(this.scene.add.text(20, 20, 'Level Editor source-mapped stub', this.main.getTextFormat(18)));
        this.add(this.scene.add.text(20, 52, 'Full editor drawing/export is planned after campaign gameplay blocks.', this.main.getTextFormat(11)));
        const back = this.add(this.scene.add.text(20, 488, 'Back', this.main.getTextFormat(14)).setInteractive({ useHandCursor: true }));
        back.on('pointerdown', () => this.destroy());
    }

    startLevel() {}

    nextLevel(hitgoal) {}

    destroy() {
        this.clearObjects();
        this.main.stop();
        if (!this.main.suppressMenuRecreate) {
            this.main.curfunction = new JumpDieCreateMenu(this.main);
        }
    }
}

LevelEditor.WALL = 0;
LevelEditor.DEATHBLOCK = 1;
LevelEditor.BOOST = 2;
LevelEditor.GOAL = 3;
LevelEditor.TEXT = 4;
LevelEditor.DELETE = 5;
LevelEditor.MOVE = 6;
LevelEditor.BOOSTFRUIT = 7;
LevelEditor.TRACK = 8;
LevelEditor.TRACKWALL = 9;
LevelEditor.TRACKBLADE = 10;
LevelEditor.FLOWERBOSS = 11;
LevelEditor.CLOUDBOSS = 12;
LevelEditor.ROCKETLAUNCHER = 13;
LevelEditor.LASERCW = 14;
LevelEditor.LASERCCW = 15;
LevelEditor.ACTIVATETRACKWALL = 16;
LevelEditor.ROCKETBOSS = 17;
