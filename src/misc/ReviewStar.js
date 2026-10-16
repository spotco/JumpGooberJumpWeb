// ReviewStar.js - Single clickable rating star.
// Mirrors misc/ReviewStar.as, which declares only the fields; ReviewSubmitMenu
// assigns val/fill/empty and positions each star.

export default class ReviewStar extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        scene.add.existing(this);

        this.val = 0;
        this.fill = null;
        this.empty = null;
    }
}
