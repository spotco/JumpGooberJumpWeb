// ActivateTrackWall.js - Player-activated moving wall.
// Mirrors blocks/ActivateTrackWall.as.
//
// The AS3 extends TrackWall; the port does the same. Touching the top
// activates vertical movement, touching a side activates horizontal
// movement in the push direction.

import TrackWall from './TrackWall.js';
import TrackBlade from './TrackBlade.js';

export default class ActivateTrackWall extends TrackWall {
    constructor(scene, parentContainer, x, y, w, h) {
        super(scene, parentContainer, x, y, w, h);

        // Animation frames: the AS3 uses mech1.png/mech2.png (not preloaded
        // yet); use placeholder visuals and toggle them.
        this.animframe1 = scene.add.rectangle(0, 0, this.w, this.h, 0x45a4c4, 0.3)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xb7efff, 0.9);
        this.animframe2 = scene.add.rectangle(0, 0, this.w, this.h, 0x5ac8e0, 0.45)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xe0f7ff, 0.9)
            .setVisible(false);
        this.container.add([this.animframe1, this.animframe2]);

        this.isactive = false;
        this.animcounter = 0;

        // The AS3 sets these in the constructor (no track lookup needed).
        this.direction = TrackBlade.VERT;
        this.speed = 0;
        this.hasFoundDirection = true;
        this.directiontoggle = true;
    }

    // Left hitbox: rect (-1,0,w,h) in block-local coordinates.
    leftRect() {
        return { x: this.x - 1, y: this.y, w: this.w, h: this.h };
    }

    // Right hitbox: rect (1,0,w,h) in block-local coordinates.
    rightRect() {
        return { x: this.x + 1, y: this.y, w: this.w, h: this.h };
    }

    update(g) {
        const gr = this.guyRect(g);
        if (gr) {
            if (this.rectsOverlap(gr, this.frictionRect())) {
                this.direction = TrackBlade.VERT;
                this.directiontoggle = true;
                this.speed = 3;
                this.isactive = true;
            } else if (this.rectsOverlap(gr, this.leftRect())) {
                this.direction = TrackBlade.HORIZ;
                this.directiontoggle = true;
                this.speed = 3;
                this.isactive = true;
            } else if (this.rectsOverlap(gr, this.rightRect())) {
                this.direction = TrackBlade.HORIZ;
                this.directiontoggle = false;
                this.speed = 3;
                this.isactive = true;
            } else {
                this.speed = 0;
                this.isactive = false;
            }
        } else {
            this.speed = 0;
            this.isactive = false;
        }

        if (this.isactive) {
            this.animcounter++;
            if (this.animcounter > 10) {
                this.animcounter = 0;
                if (this.animframe1.visible) {
                    this.animframe1.setVisible(false);
                    this.animframe2.setVisible(true);
                } else {
                    this.animframe1.setVisible(true);
                    this.animframe2.setVisible(false);
                }
            }
        }

        return super.update(g);
    }

    type() {
        return 'activatetrackwall';
    }
}
