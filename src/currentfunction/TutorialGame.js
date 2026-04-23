// TutorialGame.js - Campaign world select/progression port.

import { MUSIC } from '../Constants.js';
import GameEngine from '../GameEngine.js';
import CurrentFunction from './CurrentFunction.js';
import JumpDieCreateMenu from './JumpDieCreateMenu.js';

export default class TutorialGame extends CurrentFunction {
    constructor(main, options = {}) {
        super(main);
        this.levels = [];
        this.clvl = 1;
        this.currentGame = null;
        this.switchsong = false;
        this.buttonarray = [];
        this.thisnametext = options.name || 'World 1';
        this.thisworld = options.world || 1;
        this.maxlvl = 1;
        this.prev_game_time_store = 0;
        this.keyHandler = this.kblmanager.bind(this);
        this.selector = null;
        this.besttimebubble = null;
        this.besttimeText = null;

        this.makeLevelArray();
        this.getsave();
        this.levelSelect();
        if (this.maxlvl >= 12) {
            this.add(this.scene.add.text(20, 15, 'World Complete!', this.main.getTextFormat(60, 2)));
        }
    }

    getsave() {
        this.maxlvl = this.main.localdata.data[`world${this.thisworld}`] || 1;
    }

    makeKbListeners() {
        this.scene.input.keyboard.on('keyup', this.keyHandler);
    }

    kblmanager(e) {
        if (e.key === 'ArrowUp') {
            this.clvl -= 1;
            if (this.clvl === 0) {
                this.clvl = -1;
            } else if (this.clvl < -1) {
                this.clvl = 11;
            }
            if (this.clvl > this.maxlvl) {
                this.clvl = this.maxlvl;
            }
            this.moveclvl();
        } else if (e.key === 'ArrowDown') {
            this.clvl += 1;
            if (this.clvl > 11) {
                this.clvl = -1;
            } else if (this.clvl === 0) {
                this.clvl = 1;
            }
            if (this.clvl > this.maxlvl) {
                this.clvl = -1;
            }
            this.moveclvl();
        } else if (e.code === 'Space') {
            if (this.clvl === -1) {
                this.destroy();
            } else {
                this.playGame();
            }
        }
    }

    moveclvl() {
        const target = this.buttonarray.find((button) => button.clvl === this.clvl);
        if (!target) {
            return;
        }
        const rightColumn = this.clvl >= 6 && this.clvl <= 10;
        this.selector.setPosition(target.x + (rightColumn ? 99 : -26), target.y);
        this.besttimebubble.setPosition(rightColumn ? 20 : 0, -50);
        const stostr = `${this.thisworld}-${this.clvl}`;
        if (this.main.localdata.data[stostr]) {
            const rank = TutorialGame.parserank(
                TutorialGame.parsetime(this.main.localdata.data[stostr]),
                this.thisworld,
                this.clvl,
                this.main.rankdata,
            );
            this.besttimeText.setText(`Best time:\n${this.main.localdata.data[stostr]} Rank:${rank}`);
            this.besttimebubble.setVisible(true);
        } else {
            this.besttimebubble.setVisible(false);
        }
    }

    getScrollingBg() {
        return `bg${this.thisworld}`;
    }

    levelSelect() {
        const bg = this.add(this.scene.add.tileSprite(250, 260, 500, 520, this.getScrollingBg()));
        this.scene.tweens.add({ targets: bg, tilePositionY: -1050, duration: 42000, repeat: -1 });
        this.add(this.scene.add.image(250, 260, 'transparentmenu').setAlpha(0.85));
        this.add(JumpDieCreateMenu.getTextBubble(this.scene));
        this.add(this.scene.add.text(215, 131, this.thisnametext, this.main.getTextFormat(16)));

        for (let i = 1; i <= 11; i += 1) {
            let x;
            let y;
            if (i <= 5) {
                x = 140;
                y = 159 + 28 * (i - 1);
            } else if (i <= 10) {
                x = 268;
                y = 159 + 28 * (i - 6);
            } else {
                x = 168;
                y = 303;
            }
            this.createLevelButton(x, y, i, `Level ${i}`, i > this.maxlvl);
        }

        this.createLevelButton(227, 349, -1, 'Back', false);
        this.selector = this.add(this.scene.add.container(0, 0));
        this.selector.add(this.scene.add.image(0, 0, 'guy_stand').setScale(0.8));
        this.besttimebubble = this.scene.add.container(0, -50);
        this.besttimebubble.add(this.scene.add.image(-40, 0, 'text_speechbubble').setScale(0.55).setAlpha(0.9));
        this.besttimeText = this.scene.add.text(-104, -24, '', this.main.getTextFormat(10)).setWordWrapWidth(120);
        this.besttimebubble.add(this.besttimeText);
        this.selector.add(this.besttimebubble);
        this.makeKbListeners();
        this.moveclvl();
    }

    createLevelButton(x, y, clvl, text, locked) {
        const container = this.add(this.scene.add.container(x, y));
        const bg = this.scene.add.rectangle(0, 0, 104, 23, 0xffffff, locked ? 0.22 : 0.75)
            .setStrokeStyle(1, 0x222222, locked ? 0.25 : 0.8)
            .setInteractive({ useHandCursor: !locked });
        const label = this.scene.add.text(-42, -9, text, this.main.getTextFormat(12));
        container.add([bg, label]);
        container.clvl = clvl;
        container.x = x;
        container.y = y;
        this.buttonarray.push(container);
        if (!locked) {
            bg.on('pointerover', () => {
                this.clvl = clvl;
                this.moveclvl();
            });
            bg.on('pointerdown', () => {
                this.clvl = clvl;
                if (clvl === -1) {
                    this.destroy();
                } else {
                    this.playGame();
                }
            });
        }
        return container;
    }

    playGame() {
        this.scene.input.keyboard.off('keyup', this.keyHandler);
        this.numDeath = 0;
        this.switchsong = true;
        this.clearObjects();
        this.main.stop();
        this.startLevel();
    }

    startLevel() {
        if (this.clvl >= this.levels.length) {
            this.worldcompleteart();
            return;
        }
        if (this.currentGame != null) {
            this.prev_game_time_store += this.currentGame.game_time || 0;
        }
        this.currentGame = null;
        if (this.switchsong) {
            this.getsong();
            this.switchsong = false;
        }
        this.scene.scene.start('GameScene', {
            mode: this.main.currentMode,
            world: this.thisworld,
            level: this.clvl,
            currentfunction: this.constructor.name,
        });
    }

    worldcompleteart() {
        this.main.stop();
        this.clearObjects();
        this.main.playsfx('wow');
        this.add(this.scene.add.image(250, 260, `complete${this.thisworld}`));
        this.add(this.scene.add.rectangle(250, 491, 500, 58, 0xffffff, 0.5));
        this.add(this.scene.add.text(60, 470, `World ${this.thisworld} complete!`, this.main.getTextFormat(45, 2)));
        this.add(this.scene.add.text(260, 500, '(Press space to continue)', this.main.getTextFormat(10)));
        const handler = (e) => {
            if (e.code === 'Space') {
                this.scene.input.keyboard.off('keyup', handler);
                if (this.thisworld === 3) {
                    this.credits();
                } else {
                    this.destroy();
                }
            }
        };
        this.scene.input.keyboard.on('keyup', handler);
    }

    credits() {
        this.clearObjects();
        this.add(this.scene.add.image(250, 260, 'menu_bg'));
        const creditslist = this.add(this.scene.add.image(250, 0, 'creditslist').setOrigin(0.5, 0).setAlpha(0));
        this.add(this.scene.add.image(250, 260, 'transparentmenu'));
        this.add(this.scene.add.text(365, 502, '(Press space to skip)', this.main.getTextFormat(10)));
        this.main.playSpecific(MUSIC.ONLINE);
        this.scene.tweens.add({
            targets: creditslist,
            y: -1950,
            alpha: 1,
            duration: 34000,
            onComplete: () => this.destroy(),
        });
        const handler = (e) => {
            if (e.code === 'Space') {
                this.scene.input.keyboard.off('keyup', handler);
                this.destroy();
            }
        };
        this.scene.input.keyboard.on('keyup', handler);
    }

    getsong() {
        if (this.clvl === 11) {
            this.main.playSpecific(MUSIC.BOSSSONG);
        } else {
            this.main.playSpecific(MUSIC.SONG1);
        }
    }

    nextLevel(hitgoal) {
        if (hitgoal) {
            this.levelcompletescreen();
        } else {
            this.loadNextLevel();
        }
        this.prev_game_time_store = 0;
    }

    save(msectotal, displaytime) {
        const worldKey = `world${this.thisworld}`;
        this.main.localdata.data[worldKey] = Math.max(this.clvl + 1, this.main.localdata.data[worldKey] || 1);
        const stostr = `${this.thisworld}-${this.clvl}`;
        if (!this.main.localdata.data[stostr] || TutorialGame.parsetime(this.main.localdata.data[stostr]) > msectotal) {
            this.main.localdata.data[stostr] = displaytime;
        }
        this.main.localdata.flush();
    }

    static parsetime(t) {
        const saveddat = String(t).split(':');
        let savedsum = 0;
        for (let i = 0; i < saveddat.length; i += 1) {
            if (i === 0) {
                savedsum += 60000 * Number(saveddat[i]);
            } else if (i === 1) {
                savedsum += 1000 * Number(saveddat[i]);
            } else if (i === 2) {
                savedsum += Number(saveddat[i]);
            }
        }
        return savedsum;
    }

    static parserank(ctime, thisworld, clvl, rankdata) {
        const key = `world${thisworld}_level${clvl}_`;
        if (ctime < TutorialGame.parsetime(rankdata[`${key}A`])) {
            return 'A';
        }
        if (ctime < TutorialGame.parsetime(rankdata[`${key}B`])) {
            return 'B';
        }
        if (ctime < TutorialGame.parsetime(rankdata[`${key}C`])) {
            return 'C';
        }
        return 'F';
    }

    levelcompletescreen() {
        const gameTime = this.currentGame ? this.currentGame.game_time : 0;
        const displaytime = GameEngine.gettimet(gameTime);
        const totaldisplaytime = GameEngine.gettimet(this.prev_game_time_store + gameTime);
        this.main.playsfx('cheer');
        this.save(gameTime, displaytime);
        const rank = TutorialGame.parserank(gameTime, this.thisworld, this.clvl, this.main.rankdata);
        this.clearObjects();
        this.add(this.scene.add.image(250, 260, 'menu_bg'));
        this.add(JumpDieCreateMenu.getTextBubble(this.scene));
        this.add(this.scene.add.text(20, 15, 'Level Complete!', this.main.getTextFormat(60, 2)));
        this.add(this.scene.add.text(127, 210, `Time: ${displaytime}\nRank: ${rank}\n\nTotal Time: ${totaldisplaytime}\nDeaths: ${this.numDeath}\n\nPress Space\nto Continue`, this.main.getTextFormat(17)).setAlign('center'));
        this.main.stop();
        this.playWinSound();
        const handler = (e) => {
            if (e.code === 'Space') {
                this.scene.input.keyboard.off('keyup', handler);
                this.loadNextLevel();
            }
        };
        this.scene.input.keyboard.on('keyup', handler);
    }

    playWinSound() {
        if (this.clvl === 11) {
            this.main.playSpecific(MUSIC.BOSSENDSONG, false);
        } else {
            this.main.playSpecific(MUSIC.SONG1END, false);
        }
    }

    loadNextLevel() {
        this.numDeath = 0;
        this.currentGame = null;
        this.clvl += 1;
        this.switchsong = true;
        this.startLevel();
    }

    destroy() {
        if (this.scene && this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.off('keyup', this.keyHandler);
        }
        this.clearObjects();
        this.main.curfunction = null;
        this.currentGame = null;
        this.levels = null;
        if (this.main.suppressMenuRecreate) {
            return;
        }
        if (this.scene && this.scene.scene.key !== 'MenuScene') {
            this.scene.scene.start('MenuScene');
        } else {
            this.main.curfunction = new JumpDieCreateMenu(this.main);
        }
    }

    makeLevelArray() {
        this.levels = [null];
        for (let i = 1; i <= 11; i += 1) {
            this.levels.push(`world${this.thisworld}_level${i}`);
        }
    }
}
