// Bullet.js - Flower boss projectile.
// Mirrors misc/Bullet.as.
//
// ASSET NOTE (for BootScene.js preload; BootScene.js is intentionally not
// modified here):
//   'flowershot_img' <- img/boss/flowershot.png (NOT preloaded yet)
// The bullet still flies and collides without the image.
//
// PORT NOTE: the AS3 reuses Bullet instances through g.bulletsreuse by
// removing them from the display list. The port's BaseBlock.removeFromMemory
// destroys the container, so pooled bullets use activate()/deactivate()
// instead: deactivate() hides the bullet and returns it to the pool, and the
// spawner (FlowerBoss, Phase 5d) must call activate() when reusing one.

import FalldownBlock from '../blocks/FalldownBlock.js';

export default class Bullet extends FalldownBlock {
    constructor(scene, parentContainer, x, y, vx, vy) {
        // noedge=true, then clear the (invisible) red fill like the AS3
        // graphics.clear().
        super(scene, parentContainer, 0, 0, 0, 0, true);
        if (this.fill) {
            this.fill.destroy();
            this.fill = null;
        }

        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;

        if (scene.textures.exists('flowershot_img')) {
            this.bulletimg = scene.add.image(0, 0, 'flowershot_img')
                .setOrigin(0.5, 0.5);
            this.container.add(this.bulletimg);
        }

        this.syncPosition();
    }

    syncPosition() {
        this.container.x = this.x;
        this.container.y = this.y;
    }

    activate() {
        this.activated = true;
        this.container.setVisible(true);
        this.syncPosition();
    }

    deactivate(g) {
        const idx = g.deathwall.indexOf(this);
        if (idx >= 0) {
            g.deathwall.splice(idx, 1);
        } else {
            console.warn('bullet not part of array');
        }
        this.container.setVisible(false);
        this.activated = false;
        g.bulletsreuse.push(this);
    }

    update(g) {
        this.x += this.vx;
        this.y -= this.vy;
        this.syncPosition();

        // Note: the AS3 only checks y < -100 (no upper bound); mirrored here.
        if (this.x < -100 || this.x > 600 || this.y < -100) {
            this.deactivate(g);
        }

        return super.update(g);
    }
}
