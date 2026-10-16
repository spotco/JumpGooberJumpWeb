// Particle.js - Generic particle / invisible click-area display object.
// Mirrors misc/Particle.as.
//
// AS3 NOTE: Particle extends Sprite purely so callers can draw on
// `particle.graphics` and addChild the particle itself. The port extends
// Phaser.GameObjects.Graphics instead, so the AS3 call shapes map as:
//   p.graphics.beginFill(color, alpha) -> p.fillStyle(color, alpha)
//   p.graphics.drawCircle(x, y, r)     -> p.fillCircle(x, y, r)
//   p.graphics.drawRect(x, y, w, h)    -> p.fillRect(x, y, w, h)
//   p.graphics.lineStyle(...)          -> p.lineStyle(...)
//   p.graphics.clear()                -> p.clear()
// rotationX / rotationY / rotationZ from the AS3 are plain numeric fields.

export default class Particle extends Phaser.GameObjects.Graphics {
    constructor(scene) {
        super(scene);
        scene.add.existing(this);

        this.vx = 0;
        this.vy = 0;

        this.rx = 0;
        this.ry = 0;
        this.rz = 0;

        this.ay = 0;

        this.theta = 0;
        this.c = 0;

        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;

        this.buttonmaster = null;
    }
}
