// BootScene.js - Initial asset preload.
// Mirrors the loader role of Preloader.as without Flash ad/SWF shell behavior.

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this._createLoadBar();

        this.load.image('menu_bg', 'img/misc/menubg0.png');
        this.load.image('title_logo', 'img/misc/titlelogo.png');
        this.load.image('world1', 'img/misc/world1.png');
        this.load.image('world2', 'img/misc/world2.png');
        this.load.image('world3', 'img/misc/world3.png');
        this.load.image('special', 'img/misc/special.png');

        this.load.image('bg1', 'img/block/bg1.png');
        this.load.image('bg2', 'img/block/bg2.png');
        this.load.image('bg3', 'img/block/bg3.png');

        this.load.image('guy_stand', 'img/guystand.png');
        this.load.image('guy_left', 'img/guyleft.png');
        this.load.image('guy_left2', 'img/guyleft2.png');
        this.load.image('guy_right', 'img/guyright.png');
        this.load.image('guy_right2', 'img/guyright2.png');
        this.load.image('guy_up', 'img/guyup.png');
        this.load.image('guy_down', 'img/guydown.png');

        this.load.image('wall_blue', 'img/block/blueblock.png');
        this.load.image('wall_blue_tall', 'img/block/blueblocktall.png');
        this.load.image('wall_blue_top', 'img/block/blue/top.png');
        this.load.image('goal_green_1', 'img/block/greenblock.png');
        this.load.image('goal_green_2', 'img/block/greenblock2.png');
        this.load.image('goal_green_top', 'img/block/green/top.png');
        this.load.image('goal_green_left', 'img/block/green/left.png');
        this.load.image('goal_green_bottom', 'img/block/green/bottom.png');
        this.load.image('goal_green_right', 'img/block/green/right.png');
        this.load.image('text_bug_1', 'img/block/textbug/textbug1.png');
        this.load.image('text_bug_2', 'img/block/textbug/textbug2.png');
        this.load.image('text_speechbubble', 'img/block/textbug/speechbubble.png');
        this.load.image('yellowblock', 'img/block/yellowblock.png');
        this.load.image('redblock', 'img/block/redblock.png');
        this.load.image('boostfruit', 'img/editoricon/boostfruit.png');

        this.load.audio('menu_music', 'snd/menu.mp3');
        this.load.audio('song1', 'snd/song1.mp3');
        this.load.audio('jump1', 'snd/jump/jump1.mp3');
        this.load.audio('fall', 'snd/fall.mp3');

        this.load.text('world1_level1', 'data/world_1/level1.xml');
    }

    create() {
        this.scene.start('MenuScene');
    }

    _createLoadBar() {
        const barWidth = 320;
        const barHeight = 16;
        const x = (this.scale.width - barWidth) / 2;
        const y = this.scale.height - 42;
        const outline = this.add.rectangle(x, y, barWidth, barHeight, 0x111111).setOrigin(0, 0);
        const fill = this.add.rectangle(x + 2, y + 2, 1, barHeight - 4, 0xffdd33).setOrigin(0, 0);

        this.load.on('progress', function(progress) {
            fill.width = Math.max(1, (barWidth - 4) * progress);
        });

        this.load.on('complete', function() {
            outline.destroy();
            fill.destroy();
        });
    }
}
