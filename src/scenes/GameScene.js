// GameScene.js - Phaser wrapper for the GameEngine runtime.

import GameEngine from '../GameEngine.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.sceneData = { ...data };
        this.mode = data.mode;
        this.world = data.world || 1;
        this.level = data.level || 1;
        this.cacheKey = data.cacheKey || `world${this.world}_level${this.level}`;
        this.clvlxml = data.clvlxml || null;
        this.levelName = data.name || `world ${this.world}-${this.level}`;
        this.usebackbutton = Boolean(data.usebackbutton);
        this.hasskip = data.hasskip !== false;
        this.deathcount = data.deathcount || 0;
    }

    create() {
        if (window.jumpDieCreateMain) {
            window.jumpDieCreateMain.setScene(this);
        }
        this._createGameEngine();
    }

    _createGameEngine() {
        // Source XML remains canonical for campaign/challenge levels during the direct port.
        const levelText = this.clvlxml || this.cache.text.get(this.cacheKey) || this.cache.text.get('world1_level1');
        this.gameEngine = new GameEngine(this, {
            clvlxml: levelText,
            name: this.levelName,
            usebackbutton: this.usebackbutton,
            useBg: this.world,
            hasskip: this.hasskip,
            deathcount: this.deathcount,
            curfunction: window.jumpDieCreateMain ? window.jumpDieCreateMain.curfunction : null,
            sceneData: this.sceneData,
        });
    }

    update(time, delta) {
        if (this.gameEngine) {
            this.gameEngine.update(time, delta);
        }
    }
}
