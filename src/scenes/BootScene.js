// BootScene.js - Initial asset preload.
// Mirrors the loader role of Preloader.as without Flash ad/SWF shell behavior.

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this._createLoadBar();

        this.load.image('menu_bg', 'img/misc/menubg0.png');
        this.load.image('menububble', 'img/misc/menububble.png');
        this.load.image('transparentmenu', 'img/misc/transparentmenu.png');
        this.load.image('title_logo', 'img/misc/titlelogo.png');
        this.load.image('adventure', 'img/misc/adventure.png');
        this.load.image('online_menu_img', 'img/misc/online.png');
        this.load.image('leveleditor', 'img/misc/leveleditor.png');
        this.load.image('world1', 'img/misc/world1.png');
        this.load.image('world2', 'img/misc/world2.png');
        this.load.image('world3', 'img/misc/world3.png');
        this.load.image('special', 'img/misc/special.png');
        this.load.image('challenge', 'img/misc/challenge.png');
        this.load.image('playrandom', 'img/misc/playrandom.png');
        this.load.image('mostplayed', 'img/misc/mostplayed.png');
        this.load.image('newestsubmitted', 'img/misc/newestsubmitted.png');
        this.load.image('entername', 'img/misc/entername.png');
        this.load.image('back_menu', 'img/misc/back.png');
        this.load.image('complete1', 'img/misc/complete1.png');
        this.load.image('complete2', 'img/misc/complete2.png');
        this.load.image('complete3', 'img/misc/complete3.png');
        this.load.image('creditslist', 'img/misc/creditslist.png');
        this.load.image('sitelogo', 'img/sitelogo.png');
        this.load.image('soundon', 'img/soundon.png');
        this.load.image('soundoff', 'img/soundoff.png');

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

        this.load.image('playbutton_preloader', 'img/playbutton.png');

        this.load.audio('menu_music', 'snd/menu.mp3');
        this.load.audio('song1', 'snd/song1.mp3');
        this.load.audio('song1end', 'snd/song1end.mp3');
        this.load.audio('song2', 'snd/song2.mp3');
        this.load.audio('song2end', 'snd/song2end.mp3');
        this.load.audio('song3', 'snd/song3.mp3');
        this.load.audio('song3end', 'snd/song3end.mp3');
        this.load.audio('boss', 'snd/boss.mp3');
        this.load.audio('bossend', 'snd/bossend.mp3');
        this.load.audio('online', 'snd/online.mp3');
        this.load.audio('onlineend', 'snd/onlineend.mp3');
        this.load.audio('leveleditor_music', 'snd/leveleditor.mp3');
        this.load.audio('explode', 'snd/explode.mp3');
        this.load.audio('cheer', 'snd/cheer.mp3');
        this.load.audio('wow', 'snd/wow.mp3');
        this.load.audio('fruit', 'snd/fruit.mp3');
        this.load.audio('thunder', 'snd/thunder.mp3');
        this.load.audio('jump1', 'snd/jump/jump1.mp3');
        this.load.audio('jump2', 'snd/jump/jump2.mp3');
        this.load.audio('jump3', 'snd/jump/jump3.mp3');
        this.load.audio('jump4', 'snd/jump/jump4.mp3');
        this.load.audio('fall', 'snd/fall.mp3');
        this.load.audio('rocketexplode', 'snd/rocketexplode.mp3');
        this.load.audio('shoot', 'snd/shoot.mp3');
        this.load.audio('boost', 'snd/boost.mp3');
        this.load.audio('rocketboss', 'snd/rocketboss.mp3');
        this.load.audio('rocketbossdie', 'snd/rocketbossdie.mp3');
        this.load.audio('pause', 'snd/pause.mp3');
        this.load.audio('unpause', 'snd/unpause.mp3');
        this.load.audio('beep', 'snd/beep.mp3');

        for (let world = 1; world <= 3; world += 1) {
            for (let level = 1; level <= 11; level += 1) {
                this.load.text(`world${world}_level${level}`, `data/world_${world}/level${level}.xml`);
            }
        }
        this.load.text('challenge_level1', 'data/challenge/Challenge1.xml');
        this.load.text('challenge_level2', 'data/challenge/Challenge2.xml');
        this.load.text('challenge_level3', 'data/challenge/Challenge3.xml');
        this.load.text('blank_level', 'data/blank.xml');
    }

    create() {
        if (window.jumpDieCreateMain) {
            window.jumpDieCreateMain.setScene(this);
        }
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
