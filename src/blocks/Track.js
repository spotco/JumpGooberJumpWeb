// Track.js - Moving track guide.
// Mirrors blocks/Track.as at first-pass XML/runtime coverage.

import BaseBlock from './BaseBlock.js';

export default class Track extends BaseBlock {
    static HORIZ = true;
    static VERT = false;

    constructor(scene, parentContainer, x, y, w, h) {
        // Mirrors blocks/Track.as: normalize negative dimensions.
        if (w < 0) {
            x += w;
            w = -w;
        }
        if (h < 0) {
            y += h;
            h = -h;
        }
        super(scene, parentContainer, x, y, w, h);

        // Mirrors Track.as: direction is HORIZ if w > h, else VERT.
        // start/end are the track endpoints for followers.
        if (w > h) {
            this.direction = Track.HORIZ;
            this.start = x;
            this.end = x + w;
        } else {
            this.direction = Track.VERT;
            this.start = y;
            this.end = y + h;
        }

        this.rail = scene.add.rectangle(0, 0, this.w, this.h, 0x6d7f94, 0.45)
            .setOrigin(0, 0);
        this.outline = scene.add.rectangle(0, 0, this.w, this.h)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xd8e6f2, 0.8);
        this.container.add([this.rail, this.outline]);
    }

    type() {
        return 'track';
    }
}
