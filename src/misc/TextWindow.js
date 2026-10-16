// TextWindow.js - Message window with text entry field and OK button.
// Mirrors misc/TextWindow.as.
//
// ASSET NOTE (for BootScene.js preload; BootScene.js is intentionally not
// modified here):
//   'btn_yes' <- img/button/yes.png (NOT preloaded yet)
//   'btn_no'  <- img/button/no.png  (NOT preloaded yet)
//   'btn_ok'  <- img/button/ok.png  (NOT preloaded yet)
// 'menu_bg' (img/misc/menubg0.png, the AS3 t1c) and 'menububble' are already
// preloaded.
//
// PORT NOTE: the AS3 entryfield is a Flash input TextField. The port uses a
// plain DOM <input> overlay positioned over the canvas (no Phaser DOM plugin
// needed). this.entryfield exposes a .text getter/setter proxying the input
// value, so callers keep the AS3 contract (e.g. menuprompt.entryfield.text).
// JumpDieCreateMain.add_mouse_over is replaced by
// setInteractive({ useHandCursor: true }).

import JumpDieCreateMenu from '../currentfunction/JumpDieCreateMenu.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../Constants.js';

export default class TextWindow {
    // Port equivalents of the AS3 static embedded button bitmaps.
    static YES_BUTTON_KEY = 'btn_yes';
    static NO_BUTTON_KEY = 'btn_no';
    static OK_BUTTON_KEY = 'btn_ok';

    constructor(scene, parentContainer, questiontext, currentfunction, nfunction, stop = false) {
        this.scene = scene;
        this.currentfunction = currentfunction;
        this.nfunction = nfunction;

        this.container = scene.add.container(0, 0);
        if (parentContainer) {
            parentContainer.add(this.container);
        }

        this.entryInput = null;
        this.entryfield = null;
        this.ok = null;

        if (stop) {
            return;
        }

        this.gamefont = TextWindow.getTextFormat(13);

        this.makewindow(questiontext);

        this.entryInput = TextWindow.makeEntryInput(scene, 150, 284, 150, 20);
        document.body.appendChild(this.entryInput);
        // AS3 contract: callers read entryfield.text.
        this.entryfield = {
            get text() {
                return this.entryInput ? this.entryInput.value : '';
            },
            set text(value) {
                if (this.entryInput) {
                    this.entryInput.value = value;
                }
            },
            entryInput: this.entryInput,
        };

        this.ok = scene.add.container(310, 276);
        const okImg = TextWindow.addButtonImage(scene, this.ok, TextWindow.OK_BUTTON_KEY);
        if (okImg) {
            this.ok.setSize(okImg.width, okImg.height);
            this.ok.setInteractive({ useHandCursor: true });
        }
        this.ok.on('pointerdown', () => {
            this.nfunction();
        });
        this.container.add(this.ok);
    }

    static getTextFormat(size) {
        const main = window.jumpDieCreateMain;
        return main.getTextFormat(size);
    }

    static addButtonImage(scene, container, key) {
        if (!scene.textures.exists(key)) {
            return null;
        }
        const img = scene.add.image(0, 0, key).setOrigin(0, 0);
        container.add(img);
        return img;
    }

    // DOM text entry overlay. Positioned over the canvas by mapping game
    // coordinates through the canvas bounding rect.
    static makeEntryInput(scene, x, y, w, h) {
        const input = document.createElement('input');
        input.type = 'text';
        const rect = scene.game.canvas.getBoundingClientRect();
        const scaleX = rect.width / GAME_WIDTH;
        const scaleY = rect.height / GAME_HEIGHT;
        input.style.position = 'absolute';
        input.style.left = `${rect.left + x * scaleX}px`;
        input.style.top = `${rect.top + y * scaleY}px`;
        input.style.width = `${w * scaleX}px`;
        input.style.height = `${h * scaleY}px`;
        input.style.border = '1px solid #000000';
        input.style.zIndex = '70';
        return input;
    }

    makewindow(questiontext) {
        const bg = this.scene.add.image(0, 0, 'menu_bg').setOrigin(0, 0);
        this.container.add(bg);

        const bubble = JumpDieCreateMenu.getTextBubble(this.scene);
        bubble.setAlpha(0.7);
        this.container.add(bubble);

        this.displaytext = this.scene.add.text(140, 150, questiontext, {
            ...this.gamefont,
            wordWrap: { width: 230 },
        });
        this.displaytext.setSize(230, 400);
        this.container.add(this.displaytext);
    }

    destroy() {
        if (this.entryInput && this.entryInput.parentNode) {
            this.entryInput.parentNode.removeChild(this.entryInput);
        }
        this.entryInput = null;
        this.entryfield = null;
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}
