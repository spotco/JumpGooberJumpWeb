// ButtonMessage.js - Level editor popup message panels (selector / info /
// help / background picker).
// Mirrors misc/ButtonMessage.as.
//
// ASSET NOTE (for BootScene.js preload; BootScene.js is intentionally not
// modified here). Suggested keys map 1:1 to img/editoricon/<name>.png:
//   editor_window_l, editor_window_m, editor_window_r  <- editorwindowL/M/R.png
//   editor_nexthelp                                    <- nexthelp.png
//   editor_blue, editor_red, editor_yellow, editor_green
//   editor_delete, editor_move, editor_text            <- delete/move/text.png
//   editor_boostfruit, editor_track, editor_trackwall, editor_trackblade,
//   editor_bossplant, editor_bosscloud, editor_rocketlauncher,
//   editor_lasercw, editor_laserccw, editor_activatetrackwall,
//   editor_rocketboss, editor_bg1sel, editor_bg2sel, editor_bg3sel
// (none preloaded yet)
//
// PORT NOTE: the AS3 passes embedded Bitmaps into
// leveleditor.makeBitmapWrapper(bitmap). The port passes the asset key string
// instead; LevelEditor.makeBitmapWrapper(key) is implemented in Phase 7.
// TextFields become scene.add.text with wordWrap; MouseEvent.CLICK becomes
// pointerdown and MOUSE_OVER becomes pointerover.

import Wall from '../blocks/Wall.js';
import FalldownBlock from '../blocks/FalldownBlock.js';
import Boost from '../blocks/Boost.js';
import Goal from '../blocks/Goal.js';
import LevelEditor from '../currentfunction/LevelEditor.js';

const BG_KEYS = {
    selector: 'editor_window_l',
    info: 'editor_window_m',
    help: 'editor_window_r',
    bg: 'editor_window_r',
};

export default class ButtonMessage {
    constructor(scene, type, leveleditor, helpphase = 0) {
        // Message that appears when a button in the level editor is clicked;
        // add this as a child to the button. Specify which button in param;
        // helpphase is for the help button cycling through help text array.
        this.scene = scene;
        this.leveleditor = leveleditor;

        this.textStyle = ButtonMessage.getTextStyle();

        this.container = scene.add.container(0, -113);

        this.helpmessages = [
            'Welcome to the level editor! To start placing blocks, select the type with the button to the far left. Pick your type from the menu.',
            'To place your block, click and drag. Your block needs to be at least 10x10 pixels to be saved',
            'Delete tiles with the trashcan tool in the selector, move them with the move tool.',
            'Or, use the undo(z) button to remove your last block.',
            'Move up using the arrow keys, or use pageup and page down to move faster.',
            'Press play(p) to test your level out! To submit your level, reach the goal(the green square) and follow the instructions.',
        ];

        if (type === 'selector') {
            this.container.x = 0;
            this.addBackgroundImage('selector');
            this.selector();
        } else if (type === 'info') {
            this.container.x = -47;
            this.addBackgroundImage('info');
            this.info();
        } else if (type === 'help') {
            this.container.x = -95;
            this.addBackgroundImage('help');
            this.help(helpphase);
        } else if (type === 'bg') {
            this.container.x = -48;
            this.addBackgroundImage('bg');
            this.bg();
        }
    }

    static getTextStyle() {
        const main = window.jumpDieCreateMain;
        return main.getTextFormat(10);
    }

    addBackgroundImage(kind) {
        const key = BG_KEYS[kind];
        if (!this.scene.textures.exists(key)) {
            return null;
        }
        const img = this.scene.add.image(0, 0, key).setOrigin(0, 0);
        this.container.add(img);
        return img;
    }

    addText(x, y, w, h, text) {
        const msg = this.scene.add.text(x, y, text, {
            ...this.textStyle,
            wordWrap: { width: w },
        });
        msg.setSize(w, h);
        this.container.add(msg);
        return msg;
    }

    // Wraps leveleditor.makeBitmapWrapper(key); returns the container holding
    // the image, positioned and clickable like the AS3 Sprite.
    addIconButton(key, x, y, onClick, onOver) {
        const holder = this.scene.add.container(x, y);
        const wrapped = this.leveleditor.makeBitmapWrapper(key);
        if (wrapped) {
            holder.add(wrapped);
            const w = wrapped.width || wrapped.displayWidth || 0;
            const h = wrapped.height || wrapped.displayHeight || 0;
            holder.setSize(w, h);
        }
        holder.setInteractive({ useHandCursor: true });
        holder.on('pointerdown', onClick);
        if (onOver) {
            holder.on('pointerover', onOver);
        }
        this.container.add(holder);
        return holder;
    }

    bg() {
        const redraw = () => {
            this.leveleditor.unmakeui();
            this.leveleditor.makeui();
        };
        const s0 = this.addIconButton('editor_bg1sel', 10, 5, () => {
            this.leveleditor.bg = 1; redraw();
        });
        const s1 = this.addIconButton('editor_bg2sel', 64, 5, () => {
            this.leveleditor.bg = 2; redraw();
        });
        const s2 = this.addIconButton('editor_bg3sel', 118, 5, () => {
            this.leveleditor.bg = 3; redraw();
        });

        let drawbox = s0;
        if (this.leveleditor.bg === 2) {
            drawbox = s1;
        } else if (this.leveleditor.bg === 3) {
            drawbox = s2;
        }
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(4, 0x000000);
        graphics.strokeRect(0, 0, drawbox.width || 0, drawbox.height || 0);
        drawbox.add(graphics);
    }

    help(helpphase) {
        this.addText(5, 5, 150, 100, this.helpmessages[helpphase] || '');

        if (helpphase < this.helpmessages.length - 1) {
            this.addIconButton('editor_nexthelp', 125, 75, () => {
                this.leveleditor.clearButtonMessage();
                const next = new ButtonMessage(
                    this.scene, 'help', this.leveleditor, helpphase + 1);
                // AS3: leveleditor.helpbutton.addChild(...).
                this.leveleditor.helpbutton.add(next.container);
            });
        }
    }

    info() {
        const msg = this.addText(5, 5, 150, 100, '');
        // 0 wall, 1 death, 2 boost, 3 goal (text blocks are not counted).
        const blockcount = [0, 0, 0, 0];
        for (const b of this.leveleditor.rectList) {
            if (b instanceof Wall) {
                blockcount[0]++;
            } else if (b instanceof FalldownBlock) {
                blockcount[1]++;
            } else if (b instanceof Boost) {
                blockcount[2]++;
            } else if (b instanceof Goal) {
                blockcount[3]++;
            }
        }
        msg.setText(
            'Total Objects:' + this.leveleditor.xmllist.length +
            '\n   Blue:' + blockcount[0] +
            '\n   Red:' + blockcount[1] +
            '\n   Yellow:' + blockcount[2] +
            '\n   Green:' + blockcount[3] + ' ' +
            '\nCurrentHeight:' + -this.leveleditor.currenty + 'px'
        );
    }

    selector() {
        const msg = this.addText(10, 75, 156, 14, '');

        const setHover = (label) => () => { msg.setText(label); };
        const pick = (typeConst) => () => {
            this.leveleditor.currenttype = typeConst;
            this.leveleditor.unmakeui();
            this.leveleditor.makeui();
        };

        let setx = 10;
        const sety = 10;
        const incrx = 23;
        const incry = 23;

        const specs = [
            // key, label, LevelEditor type constant
            ['editor_blue', 'Wall', LevelEditor.WALL],
            ['editor_red', 'Spikey Vines', LevelEditor.DEATHBLOCK],
            ['editor_yellow', 'Boost Pad', LevelEditor.BOOST],
            ['editor_green', 'Goal', LevelEditor.GOAL],
            ['editor_text', 'Text Bug', LevelEditor.TEXT],
            ['editor_delete', 'Delete', LevelEditor.DELETE],
            ['editor_move', 'Move', LevelEditor.MOVE],
        ];
        for (const [key, label, typeConst] of specs) {
            this.addIconButton(key, setx, sety, pick(typeConst), setHover(label));
            setx += incrx;
        }

        setx = 10;
        const sety2 = sety + incry; // 2nd row
        const specs2 = [
            ['editor_boostfruit', 'Jump Fruit', LevelEditor.BOOSTFRUIT],
            ['editor_track', 'Moving Track', LevelEditor.TRACK],
            ['editor_trackwall', 'Moving Wall', LevelEditor.TRACKWALL],
            ['editor_trackblade', 'Moving Blade', LevelEditor.TRACKBLADE],
            ['editor_bossplant', 'World 1 Boss', LevelEditor.FLOWERBOSS],
            ['editor_bosscloud', 'World 2 Boss', LevelEditor.CLOUDBOSS],
            ['editor_rocketboss', 'World 3 Boss', LevelEditor.ROCKETBOSS],
        ];
        for (const [key, label, typeConst] of specs2) {
            this.addIconButton(key, setx, sety2, pick(typeConst), setHover(label));
            setx += incrx;
        }

        setx = 10;
        const sety3 = sety2 + incry; // 3rd row
        const specs3 = [
            ['editor_rocketlauncher', 'Rocket Launcher', LevelEditor.ROCKETLAUNCHER],
            ['editor_lasercw', 'Clockwise Laser', LevelEditor.LASERCW],
            ['editor_laserccw', 'Counterclockwise Laser', LevelEditor.LASERCCW],
            ['editor_activatetrackwall', 'Mobile Wall', LevelEditor.ACTIVATETRACKWALL],
        ];
        for (const [key, label, typeConst] of specs3) {
            this.addIconButton(key, setx, sety3, pick(typeConst), setHover(label));
            setx += incrx;
        }

        // The AS3 scales every Sprite child to 1.5 (text fields are skipped).
        for (const child of this.container.list) {
            if (child.type !== 'Text' && typeof child.setScale === 'function') {
                child.setScale(1.5);
            }
        }
    }

    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}
