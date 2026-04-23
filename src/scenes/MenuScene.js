// MenuScene.js - Thin Phaser wrapper around currentfunction/JumpDieCreateMenu.js.

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        if (window.jumpDieCreateMain) {
            window.jumpDieCreateMain.setScene(this);
            window.jumpDieCreateMain.showMenu();
        }
    }
}
