// FalldownBlock.js - Red death wall block.
// Mirrors blocks/FalldownBlock.as.
//
// ASSET NOTE (for BootScene.js preload; BootScene.js is intentionally not
// modified here):
//   'redblock'        <- img/block/redblock.png        (already preloaded)
//   'red_top'         <- img/block/red/top.png         (NOT preloaded yet)
//   'red_left'        <- img/block/red/left.png        (NOT preloaded yet)
//   'red_bottom'      <- img/block/red/bottom.png      (NOT preloaded yet)
//   'red_right'       <- img/block/red/right.png       (NOT preloaded yet)
// Edge strips are drawn only when their texture exists; the death behavior
// works regardless.

import BaseBlock from './BaseBlock.js';

export default class FalldownBlock extends BaseBlock {
    constructor(scene, parentContainer, x, y, w, h, noedge = false) {
        super(scene, parentContainer, x, y, w, h);

        this.fill = scene.add.tileSprite(0, 0, this.w, this.h, 'redblock')
            .setOrigin(0, 0);
        this.container.add(this.fill);

        if (noedge) {
            return;
        }

        // Edge strips mirror the AS3 top/left/bottom/right repeat containers.
        // The AS3 used beginBitmapFill (tiled); tileSprite is the port equivalent.
        this.addEdge(scene, 'red_top', 0, -9, this.w, 9);
        this.addEdge(scene, 'red_left', -11, 0, 11, this.h);
        this.addEdge(scene, 'red_bottom', 0, this.h, this.w, 10);
        this.addEdge(scene, 'red_right', this.w, 0, 8, this.h);
    }

    addEdge(scene, key, x, y, w, h) {
        if (!scene.textures.exists(key)) {
            return;
        }
        const edge = scene.add.tileSprite(x, y, w, h, key).setOrigin(0, 0);
        this.container.add(edge);
    }

    type() {
        return 'deathwall';
    }

    update(g) {
        // Flash: g.main.setChildIndex(this, g.main.numChildren - 1).
        // Port: bring the container to the top of its parent.
        if (this.container && this.container.parentContainer) {
            this.container.parentContainer.bringToTop(this.container);
        }

        if (g.testguy && this.overlapsInnerHitbox(g.testguy)) {
            return FalldownBlock.guyhit(g);
        }
        return false;
    }

    overlapsInnerHitbox(guy) {
        if (!guy.innerhitbox) {
            return false;
        }
        return Phaser.Geom.Intersects.RectangleToRectangle(
            guy.innerhitbox,
            new Phaser.Geom.Rectangle(this.x, this.y, this.w, this.h)
        );
    }

    static guyhit(g) {
        g.moveUiToFront();
        g.kill = true;
        const main = window.jumpDieCreateMain;
        if (main && typeof main.playsfx === 'function') {
            main.playsfx('explode');
        }
        // Flash: g.timer.stop() then a one-shot Timer(1200, 1) calls g.reload().
        // Port: Guy.explode() plays the explosion animation and calls
        // gameEngine.queueReload() when it finishes.
        if (g.testguy && typeof g.testguy.explode === 'function') {
            g.testguy.explode();
        }
        return true;
    }
}
