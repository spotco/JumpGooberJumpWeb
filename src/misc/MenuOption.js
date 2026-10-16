// MenuOption.js - Clickable main-menu option with guy cursor anchor.
// Mirrors misc/MenuOption.as.
//
// PORT NOTE: JumpDieCreateMenu.js currently defines an equivalent MenuOption
// class inline and constructs it with (scene, x, y, imageKey, menuoption).
// This file is the file-for-file home for that class; the two should be
// consolidated when the menu port is next touched. Behavior here matches the
// inline version exactly, including its pointerover/pointerdown wiring.
// (The AS3 centered the bitmap at (-width/2, -height/2); the port places the
// image at (x, y) and keeps the cursor offsets relative, which is what the
// live menu was verified against.)

export default class MenuOption {
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

    // AS3 spelled these onmouseover / onclick; the port wires them as
    // pointerover / pointerdown handlers (see addEvents).
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
