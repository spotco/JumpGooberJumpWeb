// GameScene.js - Initial runtime stub.
// This will grow into the Phaser equivalent of core/GameEngine.as.

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.mode = data.mode;
        this.world = data.world || 1;
        this.level = data.level || 1;
    }

    create() {
        this._createPlaceholderLevel();
        this._createUi();
        this._createInput();
    }

    _createPlaceholderLevel() {
        const backgroundKey = this.world === 2 ? 'bg2' : this.world === 3 ? 'bg3' : 'bg1';
        this.add.image(250, 260, backgroundKey);

        this.add.rectangle(250, 475, 500, 90, 0x3e9b45);
        this.add.rectangle(250, 475, 500, 90).setStrokeStyle(2, 0x172d16);
        this.add.image(250, 400, 'guy_stand');

        const levelText = this.cache.text.get('world1_level1') || '';
        const match = levelText.match(/<level name="([^"]+)"/);
        const displayName = match ? match[1] : `world ${this.world}-${this.level}`;

        this.add.text(16, 16, displayName, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        });

        this.add.text(250, 235, 'Gameplay port stubs are ready for the next pass.', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
        }).setOrigin(0.5);
    }

    _createUi() {
        this.add.text(484, 8, 'TIME: 00:00:00\nDEATHS: 0', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#ffffff',
            align: 'right',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(1, 0);
    }

    _createInput() {
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MenuScene');
        });
    }
}
