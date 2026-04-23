import { MUSIC } from '../Constants.js';
import CurrentFunction from './CurrentFunction.js';
import JumpDieCreateMenu from './JumpDieCreateMenu.js';

export default class SpecialGame extends CurrentFunction {
    constructor(main) {
        super(main);
        this.currentgame = null;
        this.clvl = 1;
        this.lvl_select_options = {};
        this.deathcount = -1;
        this.keyHandler = this.kbl_press.bind(this);
        this.make_level_select();
        this.scene.input.keyboard.on('keyup', this.keyHandler);
        this.moveclvl();
    }

    kbl_press(e) {
        if (e.key === 'ArrowUp') {
            this.clvl -= 1;
            if (this.clvl < 1) {
                this.clvl = 4;
            }
            this.moveclvl();
        } else if (e.key === 'ArrowDown') {
            this.clvl += 1;
            if (this.clvl > 4) {
                this.clvl = 1;
            }
            this.moveclvl();
        } else if (e.code === 'Space') {
            if (this.clvl === 4) {
                this.destroy();
            } else {
                this.start_game(this.clvl);
            }
        }
    }

    make_level_select() {
        this.add(this.scene.add.tileSprite(250, 260, 500, 520, 'bg1'));
        this.add(this.scene.add.image(250, 260, 'transparentmenu').setAlpha(0.85));
        this.add(JumpDieCreateMenu.getTextBubble(this.scene));
        this.add(this.scene.add.text(175, 131, 'Challenge Levels', this.main.getTextFormat(16)));
        this.cursor = this.add(this.scene.add.image(-100, -100, 'guy_stand').setScale(0.8));
        for (let i = 1; i < 4; i += 1) {
            this.lvl_select_options[i] = this.makeOption(185, 165 + 28 * (i - 1), i, `Challenge ${i}`);
        }
        this.lvl_select_options[4] = this.makeOption(227, 349, 4, 'Back');
    }

    makeOption(x, y, clvl, label) {
        const button = this.add(this.scene.add.text(x, y, label, this.main.getTextFormat(14))
            .setInteractive({ useHandCursor: true }));
        button.clvl = clvl;
        button.on('pointerover', () => {
            this.clvl = clvl;
            this.moveclvl();
        });
        button.on('pointerdown', () => {
            if (clvl === 4) {
                this.destroy();
            } else {
                this.start_game(clvl);
            }
        });
        return button;
    }

    moveclvl() {
        const option = this.lvl_select_options[this.clvl];
        if (option) {
            this.cursor.setPosition(option.x - 26, option.y + 8);
        }
    }

    start_game(clvl) {
        this.scene.input.keyboard.off('keyup', this.keyHandler);
        this.clvl = clvl;
        this.xml = `challenge_level${clvl}`;
        this.main.playSpecific(MUSIC.BOSSSONG);
        this.clearObjects();
        this.startLevel();
    }

    startLevel() {
        this.deathcount += 1;
        this.scene.scene.start('GameScene', {
            mode: null,
            world: -1,
            level: this.clvl,
            cacheKey: this.xml,
            currentfunction: 'SpecialGame',
            deathcount: this.deathcount,
        });
    }

    nextLevel(hitgoal) {
        if (hitgoal) {
            this.win_screen();
        } else {
            this.destroy();
        }
    }

    win_screen() {
        this.clearObjects();
        this.add(this.scene.add.image(250, 260, 'menu_bg'));
        this.add(JumpDieCreateMenu.getTextBubble(this.scene));
        this.add(this.scene.add.text(20, 15, 'Level Complete!', this.main.getTextFormat(60, 2)));
        this.add(this.scene.add.text(127, 210, `Deaths: ${this.deathcount}\n\nPress Space\nto Continue`, this.main.getTextFormat(17)).setAlign('center'));
        const handler = (e) => {
            if (e.code === 'Space') {
                this.scene.input.keyboard.off('keyup', handler);
                this.destroy();
            }
        };
        this.scene.input.keyboard.on('keyup', handler);
    }

    destroy() {
        if (this.scene && this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.off('keyup', this.keyHandler);
        }
        this.clearObjects();
        this.main.stop();
        this.main.curfunction = null;
        if (this.main.suppressMenuRecreate) {
            return;
        }
        if (this.scene && this.scene.scene.key !== 'MenuScene') {
            this.scene.scene.start('MenuScene');
        } else {
            this.main.curfunction = new JumpDieCreateMenu(this.main);
        }
    }
}
