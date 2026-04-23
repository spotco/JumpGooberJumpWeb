// JumpDieCreateMenu.js - Main menu port of currentfunction/JumpDieCreateMenu.as.

import { FLAGS, MODES, MUSIC } from '../Constants.js';
import CurrentFunction from './CurrentFunction.js';

class MenuOption {
    constructor(scene, x, y, imageKey, menuoption) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.imageKey = imageKey;
        this.menuoption = menuoption;
        this.guycursor = null;
        this.image = scene.add.image(x, y, imageKey)
            .setDepth(15)
            .setVisible(false);
        this.guycursorX = -(this.image.width / 2) - 30;
        this.guycursorY = -(this.image.height / 2) - 4;
        this.image.buttonmaster = this;
        this._onPointerOver = null;
        this._onPointerDown = null;
    }

    addEvents(menu) {
        this.removeEvents();
        this._onPointerOver = () => {
            menu.menupos = menu.use_menu.indexOf(this);
            menu.updateCursor();
        };
        this._onPointerDown = () => {
            menu.activate();
        };
        this.image.setVisible(true);
        this.image.setActive(true);
        this.image.setInteractive({ useHandCursor: true });
        this.image.on('pointerover', this._onPointerOver);
        this.image.on('pointerdown', this._onPointerDown);
    }

    removeEvents() {
        if (!this.image || !this.image.active) {
            return;
        }
        if (this._onPointerOver) {
            this.image.off('pointerover', this._onPointerOver);
        }
        if (this._onPointerDown) {
            this.image.off('pointerdown', this._onPointerDown);
        }
        this._onPointerOver = null;
        this._onPointerDown = null;
        this.image.disableInteractive();
        this.image.setVisible(false);
    }

    destroy() {
        this.removeEvents();
        if (this.image && typeof this.image.destroy === 'function') {
            this.image.destroy();
        }
        this.image = null;
        this.guycursor = null;
    }
}

export default class JumpDieCreateMenu extends CurrentFunction {
    constructor(main) {
        super(main);
        this.menubuttonwrapper = [];
        this.mutebutton = null;
        this.menupos = 0;
        this.cursor = null;
        this.use_menu = null;
        this.main_menu = null;
        this.world_menu = null;
        this.online_menu = null;
        this.statusdisplaycontainer = null;
        this.statusdisplay = null;
        this.desc = {};
        this.titlelogo = null;
        this.logo = null;
        this.sponsorlogo = null;
        this.keyPressed = this.keyPressed.bind(this);

        this.initdesc();
        this.initmenu();
        if (!main.pmenufix) {
            main.playSpecific(MUSIC.MENU_MUSIC);
        }
        this.add(this.scene.add.image(250, 260, 'menu_bg'));
        this.titlelogo = this.add(this.scene.add.image(250, 94, 'title_logo'));
        this.makelogo();
        this.use_menu = this.main_menu;
        this.loadOptions();
        this.makeCursor();
        this.checkonline();
        this.makemutebutton();
        this.updateCursor();
        this.scene.input.keyboard.on('keyup', this.keyPressed);
    }

    makelogo() {
        this.logo = this.add(this.scene.add.text(0, 490, 'Game by SPOTCO(www.spotcos.com)\nMusic by (www.openheartsound.com)', this.main.getTextFormat(12)).setDepth(20));
        this.sponsorlogo = null;
    }

    checkonline() {
        this.statusdisplaycontainer = this.add(this.scene.add.container(-10, 504));
        const bg = this.scene.add.rectangle(0, 0, 520, 18, 0xffffff, 0.7).setOrigin(0, 0);
        this.statusdisplay = this.scene.add.text(12, 2, 'SERVER STATUS: local web port, online services stubbed', this.main.getTextFormat(10));
        this.statusdisplaycontainer.add([bg, this.statusdisplay]);
        this.statusdisplaycontainer.setVisible(false);
    }

    activate() {
        const option = this.use_menu[this.menupos];
        if (option.menuoption > 0) {
            this.main.menuStart(option.menuoption);
        } else if (option.menuoption < 0) {
            this.swapMenu(option.menuoption);
        }
    }

    swapMenu(n) {
        this.menupos = 0;
        if (n === JumpDieCreateMenu.ADVENTURE) {
            this.use_menu = this.world_menu;
        } else if (n === JumpDieCreateMenu.BACK_TO_MAIN) {
            this.use_menu = this.main_menu;
        } else if (n === JumpDieCreateMenu.ONLINE) {
            this.use_menu = this.online_menu;
        }
        this.loadOptions();
        this.updateCursor();
    }

    loadOptions() {
        for (const option of this.all_menu_options) {
            option.removeEvents();
        }
        this.menubuttonwrapper = [];
        for (const option of this.use_menu) {
            option.addEvents(this);
            this.menubuttonwrapper.push(option);
        }
    }

    makemutebutton() {
        this.mutebutton = this.add(this.scene.add.image(470, 22, this.main.mute ? 'soundoff' : 'soundon')
            .setInteractive({ useHandCursor: true }));
        this.mutebutton.on('pointerdown', () => {
            this.main.stop();
            this.main.setMute(!this.main.mute);
            this.changemutebuttonicon();
            if (!this.main.mute) {
                this.main.pmenufix = false;
                this.main.playSpecific(MUSIC.MENU_MUSIC);
            }
        });
    }

    changemutebuttonicon() {
        if (this.mutebutton) {
            this.mutebutton.setTexture(this.main.mute ? 'soundoff' : 'soundon');
        }
    }

    keyPressed(e) {
        if (e.key === 'ArrowDown') {
            this.menupos += 1;
            if (this.menupos >= this.use_menu.length) {
                this.menupos = 0;
            }
            this.updateCursor();
        } else if (e.key === 'ArrowUp') {
            this.menupos -= 1;
            if (this.menupos < 0) {
                this.menupos = this.use_menu.length - 1;
            }
            this.updateCursor();
        } else if (e.code === 'Space') {
            this.activate();
        }
    }

    makeCursor() {
        this.cursor = this.add(this.scene.add.container(0, 0).setDepth(30));
        this.cursor.add(this.scene.add.image(0, 0, 'guy_stand').setScale(0.8));
        this.descBubble = this.scene.add.container(0, 0);
        this.cursor.add(this.descBubble);
    }

    updateCursor() {
        for (const option of this.use_menu) {
            option.guycursor = null;
        }
        const selected = this.use_menu[this.menupos];
        selected.guycursor = this.cursor;
        this.cursor.setPosition(selected.x + selected.guycursorX, selected.y + selected.guycursorY - 2);
        this.descBubble.removeAll(true);
        const text = this.desc[this.getopt()];
        if (text) {
            const bubble = this.scene.add.image(6, -58, 'menububble').setScale(-0.45, 0.45).setAlpha(0.9);
            const label = this.scene.add.text(-112, -84, text, this.main.getTextFormat(10)).setWordWrapWidth(105);
            this.descBubble.add([bubble, label]);
        }
        const inOnline = this.use_menu === this.online_menu;
        if (this.statusdisplaycontainer) {
            this.statusdisplaycontainer.setVisible(inOnline);
        }
        if (this.logo) {
            this.logo.setVisible(!inOnline);
        }
        this.main.playsfx('beep', 0.35);
    }

    getopt() {
        if (this.use_menu === this.main_menu) {
            return ['adventure', 'online', 'level editor', 'challenge'][this.menupos] || '';
        }
        if (this.use_menu === this.online_menu) {
            return ['random online', 'newest online', 'most plays online', 'specific online'][this.menupos] || '';
        }
        if (this.use_menu === this.world_menu) {
            return ['world 1', 'world 2', 'world 3'][this.menupos] || '';
        }
        return '';
    }

    initdesc() {
        this.desc.adventure = 'Play the levels!\nLots of surprises await!';
        this.desc.online = 'Browse and play user-made levels online!';
        this.desc['level editor'] = 'Create and submit your own levels!';
        this.desc['random online'] = 'Play a randomly selected level.';
        this.desc['world 1'] = "The first world and tutorial! You don't want to skip this!";
        this.desc['world 2'] = 'The second world!\nIt only gets harder from here!';
        this.desc['world 3'] = 'The third and final world! Only for the truly hardcore.';
        this.desc['newest online'] = 'Browse the newest submitted levels online!';
        this.desc['most plays online'] = 'Browse the most played levels online!';
        this.desc['specific online'] = 'Enter a specific level to play online!';
        this.desc.challenge = 'Exclusive challenge levels!';
        if (FLAGS.CONTEST_MODE) {
            this.desc.adventure = 'Contest entry database!';
            this.desc.online = 'Create and submit your own entry!';
        }
    }

    initmenu() {
        if (FLAGS.HAS_CHALLENGE_LEVELS) {
            this.main_menu = [
                new MenuOption(this.scene, 250, 235, 'adventure', JumpDieCreateMenu.ADVENTURE),
                new MenuOption(this.scene, 250, 285, 'online_menu_img', JumpDieCreateMenu.ONLINE),
                new MenuOption(this.scene, 250, 335, 'leveleditor', MODES.LEVELEDITOR),
                new MenuOption(this.scene, 250, 385, 'challenge', MODES.WORLD_SPECIAL),
            ];
        } else if (FLAGS.CONTEST_MODE) {
            this.main_menu = [
                new MenuOption(this.scene, 250, 270, 'online_menu_img', JumpDieCreateMenu.ONLINE),
                new MenuOption(this.scene, 250, 330, 'leveleditor', MODES.LEVELEDITOR),
            ];
        } else {
            this.main_menu = [
                new MenuOption(this.scene, 250, 260, 'adventure', JumpDieCreateMenu.ADVENTURE),
                new MenuOption(this.scene, 250, 310, 'online_menu_img', JumpDieCreateMenu.ONLINE),
                new MenuOption(this.scene, 250, 360, 'leveleditor', MODES.LEVELEDITOR),
            ];
        }

        this.world_menu = [
            new MenuOption(this.scene, 250, 260, 'world1', MODES.WORLD1),
            new MenuOption(this.scene, 250, 310, 'world2', MODES.WORLD2),
            new MenuOption(this.scene, 250, 360, 'world3', MODES.WORLD3),
            new MenuOption(this.scene, 250, 410, 'back_menu', JumpDieCreateMenu.BACK_TO_MAIN),
        ];

        this.online_menu = [
            new MenuOption(this.scene, 250, 225, 'playrandom', MODES.RANDOMONLINE),
            new MenuOption(this.scene, 250, 275, 'newestsubmitted', MODES.NEWESTONLINE),
            new MenuOption(this.scene, 250, 325, 'mostplayed', MODES.MOSTPLAYEDONLINE),
            new MenuOption(this.scene, 250, 375, 'entername', MODES.SPECIFICONLINE),
            new MenuOption(this.scene, 250, 425, 'back_menu', JumpDieCreateMenu.BACK_TO_MAIN),
        ];

        this.all_menu_options = [
            ...this.main_menu,
            ...this.world_menu,
            ...this.online_menu,
        ];
    }

    destroy() {
        if (this.scene && this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.off('keyup', this.keyPressed);
        }
        for (const option of this.all_menu_options) {
            option.destroy();
        }
        this.clearObjects();
    }

    static getTextBubble(scene) {
        return scene.add.image(250, 260, 'menububble').setAlpha(0.7);
    }
}

JumpDieCreateMenu.ADVENTURE = -3;
JumpDieCreateMenu.ONLINE = -1;
JumpDieCreateMenu.BACK_TO_MAIN = -2;
