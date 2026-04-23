// GameScene.js - Phaser wrapper for the GameEngine runtime.

import GameEngine from '../GameEngine.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.mode = data.mode;
        this.world = data.world || 1;
        this.level = data.level || 1;
        this.cacheKey = data.cacheKey || `world${this.world}_level${this.level}`;
        this.clvlxml = data.clvlxml || null;
        this.levelName = data.name || `world ${this.world}-${this.level}`;
    }

    create() {
        if (window.jumpDieCreateMain) {
            window.jumpDieCreateMain.setScene(this);
        }
        this._createGameEngine();
        this._createInput();
    }

    _createGameEngine() {
        const levelText = this.clvlxml || this.cache.text.get(this.cacheKey) || this.cache.text.get('world1_level1');
        this.gameEngine = new GameEngine(this, {
            clvlxml: levelText,
            name: this.levelName,
            usebackbutton: false,
            useBg: this.world,
            hasskip: true,
            deathcount: 0,
            curfunction: window.jumpDieCreateMain ? window.jumpDieCreateMain.curfunction : null,
        });
    }

    _createInput() {
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.gameEngine) {
                this.gameEngine.clear();
                this.gameEngine = null;
            }
            this.scene.start('MenuScene');
        });

        this.input.keyboard.on('keydown-PAGE_UP', () => {
            this.gameEngine.setDebugScrollSpeed(8);
        });

        this.input.keyboard.on('keyup-PAGE_UP', () => {
            this.gameEngine.setDebugScrollSpeed(0);
        });

        this.input.keyboard.on('keydown-PAGE_DOWN', () => {
            this.gameEngine.setDebugScrollSpeed(-8);
        });

        this.input.keyboard.on('keyup-PAGE_DOWN', () => {
            this.gameEngine.setDebugScrollSpeed(0);
        });
    }

    update(time, delta) {
        if (this.gameEngine) {
            this.gameEngine.update(time, delta);
        }
    }
}
