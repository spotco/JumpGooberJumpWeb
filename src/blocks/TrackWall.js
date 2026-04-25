// TrackWall.js - Wall attached to a track.
// Mirrors blocks/TrackWall.as at first-pass XML/runtime coverage.

import Wall from './Wall.js';

export default class TrackWall extends Wall {
    constructor(scene, parentContainer, x, y, w, h) {
        super(scene, parentContainer, x, y, w, h);

        this.bolt = scene.add.rectangle(this.w / 2, this.h / 2, 10, 10, 0xd9e7f4, 0.95)
            .setStrokeStyle(2, 0x5e7387, 1);
        this.container.add(this.bolt);
    }

    type() {
        return 'trackwall';
    }
}
