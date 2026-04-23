// Main.js - Boot, config, and scene management.
// Mirrors the ownership role of JumpDieCreateMain.as.

import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './Constants.js';
import JumpDieCreateMain from './JumpDieCreateMain.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#000000',
    pixelArt: false,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
        BootScene,
        MenuScene,
        GameScene,
    ],
};

window.jumpDieCreateMain = new JumpDieCreateMain();
window.jumpGooberJumpGame = new Phaser.Game(config);
