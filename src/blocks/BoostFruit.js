// BoostFruit.js - Fruit pickup with trail effect.
// Mirrors blocks/BoostFruit.as.
//
// The AS3 has three parts: `hitbox` (the fruit image, which sways by
// rotating +/-30 degrees and hides/shows with `ready`), and `trailbox`
// (a drawing layer that paints a yellow circle trail behind the player
// while their fruit-granted boost lasts, then fades and lets the fruit
// respawn). `initgrowth` is a 20-tick scale-in that runs when the fruit
// (re)appears.

import BaseBlock from './BaseBlock.js';

export default class BoostFruit extends BaseBlock {
    constructor(scene, parentContainer, x, y, w = 24, h = 28) {
        super(scene, parentContainer, x, y, w, h);

        // hitbox: rotates for the sway animation; centered on the block.
        this.hitbox = scene.add.container(this.w / 2, this.h / 2);
        this.fruitimg = scene.add.image(0, 0, 'boostfruit')
            .setDisplaySize(this.w, this.h);
        this.hitbox.add(this.fruitimg);
        this.container.add(this.hitbox);

        // trailbox: draws the yellow player trail (does not rotate).
        this.trail = scene.add.graphics();
        this.container.add(this.trail);

        this.ready = true;
        this.eatAtCounter = 0;
        this.initgrowth = 0;
        this.animphase = 0;
        this.animcounter = 0;
        this.rotatepos = true;
        this.fadeTimer = null;
        this.trailAlpha = 1;
    }

    type() {
        return 'boostfruit';
    }

    eat(gameEngine) {
        // Mirrors BoostFruit.as eat(): mark eaten, hide the fruit image.
        this.ready = false;
        if (gameEngine && gameEngine.testguy) {
            this.eatAtCounter = gameEngine.testguy.jumpCounter;
        }
    }

    update(gameEngine) {
        // Mirrors blocks/BoostFruit.as update().
        this.animate(gameEngine);
        if (this.initgrowth > 0) {
            this.initgrowth--;
            const s = (20 - this.initgrowth) / 20;
            this.container.setScale(s, s);
            return false;
        }
        const guy = gameEngine ? gameEngine.testguy : null;
        if (this.ready && guy && typeof guy.hitTestObject === 'function' && guy.hitTestObject(this)) {
            // AS3 only plays the fruit sound if trailbox.alpha == 1 (fresh).
            if (this.trailAlpha === 1) {
                const main = typeof window !== 'undefined' ? window.jumpDieCreateMain : null;
                if (main && typeof main.playsfx === 'function') {
                    main.playsfx('fruit');
                }
            }
            guy.boost = 3;
            guy.canJump = true;
            this.eat(gameEngine);
        }
        return false;
    }

    animate(gameEngine) {
        // Mirrors BoostFruit.as animate(): while the fruit is eaten and the
        // trail is fresh, paint a yellow circle at the player each tick.
        const guy = gameEngine ? gameEngine.testguy : null;
        if (guy && this.trailAlpha === 1 && !this.ready) {
            // AS3 draws in the fruit's local coords:
            // circle((guy.x+13)-x, (guy.y+12)-y, 4*boost).
            const lx = (guy.x + 13) - this.x;
            const ly = (guy.y + 12) - this.y;
            const r = Math.max(0, 4 * guy.boost);
            if (r > 0) {
                this.trail.fillStyle(0xFFFF00, 1);
                this.trail.fillCircle(lx, ly, r);
            }
            if ((guy.boost === 0 || guy.jumpCounter >= this.eatAtCounter + 3) && this.fadeTimer == null) {
                // Start the fade: trail alpha drops, then the trail clears
                // and the fruit becomes ready (respawns).
                this.fadeTimer = this.scene.time.addEvent({
                    delay: 40,
                    loop: true,
                    callback: () => {
                        // Guard: the block may be destroyed by a level reload.
                        if (!this.container || !this.trail) {
                            if (this.fadeTimer) this.fadeTimer.remove();
                            this.fadeTimer = null;
                            return;
                        }
                        this.trailAlpha -= 0.1;
                        if (this.trailAlpha <= 0) {
                            this.trail.clear();
                            this.trailAlpha = 1;
                            this.ready = true;
                            this.fadeTimer.remove();
                            this.fadeTimer = null;
                        }
                        this.updateAnimation();
                    },
                });
            }
        }
        this.updateAnimation();
        return false;
    }

    updateAnimation() {
        // Mirrors BoostFruit.as updateAnimation(): the fruit sways
        // (rotation oscillates between -30 and +30 degrees), scales with the
        // trail fade, and hides while eaten.
        const scale = this.trailAlpha === 1 ? 1 : 1 - this.trailAlpha;
        this.hitbox.setScale(scale, scale);
        this.hitbox.setVisible(this.ready);
        if (this.rotatepos) {
            this.hitbox.angle++;
            if (this.hitbox.angle >= 30) {
                this.rotatepos = false;
            }
        } else {
            this.hitbox.angle--;
            if (this.hitbox.angle <= -30) {
                this.rotatepos = true;
            }
        }
    }

    destroy() {
        if (this.fadeTimer) {
            this.fadeTimer.remove();
            this.fadeTimer = null;
        }
        super.destroy();
    }
}
