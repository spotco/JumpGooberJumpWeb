// MenuScene.js - Initial main menu stub.
// Mirrors currentfunction/JumpDieCreateMenu.as at a placeholder level.

import { MODES } from '../Constants.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        this._playMenuMusic();
        this._createBackground();
        this._createMenuOptions();
    }

    _playMenuMusic() {
        if (!this.sound.locked && !this.sound.get('menu_music')) {
            this.sound.play('menu_music', { loop: true, volume: 0.7 });
        }
    }

    _createBackground() {
        this.add.image(250, 260, 'menu_bg');
        this.add.image(250, 94, 'title_logo');
    }

    _createMenuOptions() {
        const options = [
            { imageKey: 'world1', mode: MODES.WORLD1, y: 212 },
            { imageKey: 'world2', mode: MODES.WORLD2, y: 282 },
            { imageKey: 'world3', mode: MODES.WORLD3, y: 352 },
            { imageKey: 'special', mode: MODES.WORLD_SPECIAL, y: 422 },
        ];

        for (const option of options) {
            const image = this.add.image(250, option.y, option.imageKey)
                .setInteractive({ useHandCursor: true });
            image.on('pointerdown', () => this._menuStart(option.mode));
        }
    }

    _menuStart(mode) {
        this.scene.start('GameScene', {
            mode,
            world: mode === MODES.WORLD2 ? 2 : mode === MODES.WORLD3 ? 3 : 1,
            level: 1,
        });
    }
}
