// BaseBlock.js - Shared block interface.
// Mirrors blocks/BaseBlock.as.

export default class BaseBlock {
    constructor(scene, parentContainer, x, y, w, h) {
        const bounds = BaseBlock.normalizeBounds(x, y, w, h);

        this.scene = scene;
        this.parentContainer = parentContainer;
        this.x = bounds.x;
        this.y = bounds.y;
        this.w = bounds.w;
        this.h = bounds.h;
        this.memRemoved = false;
        this.activated = true;
        this.container = scene.add.container(this.x, this.y);

        if (parentContainer) {
            parentContainer.add(this.container);
        }
    }

    static normalizeBounds(x, y, w, h) {
        if (w < 0) {
            x += w;
            w = Math.abs(w);
        }

        if (h < 0) {
            y += h;
            h = Math.abs(h);
        }

        return { x, y, w, h };
    }

    type() {
        return null;
    }

    internaltext() {
        return '';
    }

    update(_gameEngine) {
        return false;
    }

    simpleupdate(_gameEngine) {
    }

    gameScroll(scroll_spd) {
        this.y += scroll_spd;
        this.container.y = this.y;
    }

    removeFromMemory() {
        this.memRemoved = true;
        this.activated = false;

        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }

    destroy() {
        this.removeFromMemory();
    }
}
