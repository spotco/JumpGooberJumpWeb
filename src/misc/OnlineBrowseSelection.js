// OnlineBrowseSelection.js - Online level browser list entry.
// Mirrors misc/OnlineBrowseSelection.as.
//
// ASSET NOTE (for BootScene.js preload; BootScene.js is intentionally not
// modified here):
//   'starfill'  <- img/misc/starfill.png  (NOT preloaded yet)
//   'starempty' <- img/misc/starempty.png (NOT preloaded yet)

import SubmitMenu from './SubmitMenu.js';

export default class OnlineBrowseSelection {
    constructor(scene, parentContainer, x, y, info, mode) {
        this.scene = scene;
        this.info = info;
        this.mode = mode;

        this.container = scene.add.container(x, y);
        if (parentContainer) {
            parentContainer.add(this.container);
        }

        this.graphics = scene.add.graphics();
        this.container.add(this.graphics);
        this.draw(0);

        this.inittext();
    }

    inittext() {
        const namedisplay = SubmitMenu.maketextdisplay(
            this.scene, 0, -8, this.info.level_name, 23, 355, 60);
        this.container.add(namedisplay);

        const creatordisplay = SubmitMenu.maketextdisplay(
            this.scene, 0, 42, 'Created by: ' + this.info.creator_name,
            12, 200, 20);
        this.container.add(creatordisplay);

        let topleftdisplay;
        if (this.mode) {
            topleftdisplay = SubmitMenu.maketextdisplay(
                this.scene, 207, 0,
                '\tDate created:\n' + this.info.date_created, 12, 200, 50);
        } else {
            topleftdisplay = SubmitMenu.maketextdisplay(
                this.scene, 230, 0,
                'Play count: ' + this.info.playcount, 12, 200, 20);
        }
        this.container.add(topleftdisplay);

        const ratingavg = Math.round(Number(this.info.ratingavg));
        for (let i = 1; i <= 5; i++) {
            const star = this.scene.add.container(164 + 31 * i, 30);
            let img = null;
            if (i <= ratingavg) {
                // AS3: new ReviewSubmitMenu.starfill as Bitmap.
                if (this.scene.textures.exists('starfill')) {
                    img = this.scene.add.image(0, 0, 'starfill');
                }
            } else {
                // AS3: new ReviewSubmitMenu.starempty as Bitmap.
                if (this.scene.textures.exists('starempty')) {
                    img = this.scene.add.image(0, 0, 'starempty');
                }
            }
            if (img) {
                img.setOrigin(0, 0);
                star.add(img);
            }
            this.container.add(star);
        }
    }

    draw(a) {
        this.graphics.lineStyle(2, 0x000000);
        this.graphics.strokeRect(0, 0, 355, 60);
        this.graphics.fillStyle(0x000000, a);
        this.graphics.fillRect(0, 0, 355, 60);
    }

    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}
