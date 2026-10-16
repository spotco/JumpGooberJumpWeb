// ReviewSubmitMenu.js - Online level rating UI shown after beating an online
// level, with celebration fireworks.
// Mirrors misc/ReviewSubmitMenu.as.
//
// ASSET NOTE (for BootScene.js preload; BootScene.js is intentionally not
// modified here):
//   'starfill'  <- img/misc/starfill.png  (NOT preloaded yet)
//   'starempty' <- img/misc/starempty.png (NOT preloaded yet)
//   'btn_skip'  <- img/button/skip.png    (already preloaded; the AS3
//                                          GameEngine.mb3)
//   TextWindow.OK_BUTTON_KEY ('btn_ok')   (NOT preloaded yet)
//
// PORT NOTE: submitplaycount() / submitrating() POSTed to the PHP endpoints
// updateplaycount.php / submitreview.php. The PHP online service surface is
// Phase 8 (see AGENTS.md); the rating UI flow is fully ported but the network
// calls are not sent. Mochi achievement calls are omitted (MochiManager
// intentionally not ported). this.main is the JumpDieCreateMain runtime
// owner, mirroring the AS3.

import Fireworks from './Fireworks.js';
import ReviewStar from './ReviewStar.js';
import SubmitMenu from './SubmitMenu.js';
import TextWindow from './TextWindow.js';
import JumpDieCreateMenu from '../currentfunction/JumpDieCreateMenu.js';
import { MUSIC } from '../Constants.js';

export default class ReviewSubmitMenu {
    constructor(scene, parentContainer, caller, callback, main, currentlevelinfo) {
        this.scene = scene;
        this.caller = caller;
        this.callback = callback;
        this.main = main;
        this.currentlevelinfo = currentlevelinfo;

        this.stararray = [];
        this.ui = null;
        this.fireworks = null;

        this.container = scene.add.container(0, 0);
        if (parentContainer) {
            parentContainer.add(this.container);
        }

        this.submitplaycount();
        main.playsfx('cheer');
        main.playSpecific(MUSIC.ONLINEEND, false);
        this.initbg();
        this.initratingui();

        this.fireworks = new Fireworks(scene, this.container);

        const localdata = main.localdata;
        if (localdata && localdata.data) {
            if (localdata.data['online_levels_played']) {
                localdata.data['online_levels_played']++;
            } else {
                localdata.data['online_levels_played'] = 1;
            }
            try {
                localdata.flush();
            } catch (e) {
                console.warn('write error');
            }
        }
    }

    // The owner should call this once per game tick to drive the fireworks.
    update() {
        if (this.fireworks && !this.fireworks.finished) {
            this.fireworks.update();
        }
    }

    submitplaycount() {
        // Phase 8 stub. The original requested ONLINE_DB_URL +
        // 'updateplaycount.php' with nocache, level id, and a checksum, and
        // traced the response.
    }

    submitrating(r) {
        // Phase 8 stub. The original requested ONLINE_DB_URL +
        // 'submitreview.php' with nocache, level id, rating, and a checksum.

        let dispinfo = 'Rating submitted!\n\n';
        dispinfo += 'Level Name: ' + this.currentlevelinfo.level_name + '\n';
        dispinfo += 'Creator Name: ' + this.currentlevelinfo.creator_name + '\n';
        dispinfo += 'Created: ' + this.currentlevelinfo.date_created + '\n\n';
        dispinfo += 'Total plays: ' + this.currentlevelinfo.playcount + '\n';
        dispinfo += 'Avg Rating: ' + this.currentlevelinfo.ratingavg + '\n';
        dispinfo += '(from ' + this.currentlevelinfo.ratingcount + ' ratings)\n';

        this.loadingmessagedisplay.setText(dispinfo);

        if (this.ui) {
            this.ui.destroy();
        }
        this.ui = this.scene.add.container(0, 0);
        const skip = this.scene.add.container(240, 330);
        const skipImg = TextWindow.addButtonImage(
            this.scene, skip, TextWindow.OK_BUTTON_KEY);
        if (skipImg) {
            skip.setSize(skipImg.width, skipImg.height);
            skip.setInteractive({ useHandCursor: true });
        }
        skip.on('pointerdown', () => {
            this.callback.call(this.caller);
        });
        this.ui.add(skip);
        this.container.add(this.ui);

        const localdata = this.main.localdata;
        if (localdata && localdata.data) {
            if (r === 1) {
                localdata.data['1star'] = true;
            } else if (r === 5) {
                localdata.data['5star'] = true;
            }
            // AS3 also called mochimanager.update_achievements_rating();
            // Mochi is intentionally not ported.
            try {
                localdata.flush();
            } catch (e) {
                console.warn('write error');
            }
        }
    }

    initratingui() {
        this.ui = this.scene.add.container(0, 0);
        for (let i = 1; i <= 5; i++) {
            const s = new ReviewStar(this.scene);
            s.val = i;
            if (this.scene.textures.exists('starfill')) {
                s.fill = this.scene.add.image(0, 0, 'starfill').setOrigin(0, 0);
                s.add(s.fill);
            }
            if (this.scene.textures.exists('starempty')) {
                s.empty = this.scene.add.image(0, 0, 'starempty').setOrigin(0, 0);
                s.add(s.empty);
            }
            if (s.fill) {
                s.fill.setVisible(false);
            }
            s.x = 90 + i * 32;
            s.y = 250;
            const w = (s.fill && s.fill.width) || (s.empty && s.empty.width) || 0;
            const h = (s.fill && s.fill.height) || (s.empty && s.empty.height) || 0;
            s.setSize(w, h);
            s.setInteractive({ useHandCursor: true });
            s.on('pointerdown', () => {
                this.ui.destroy();
                this.ui = null;
                this.submitrating(s.val);
            });
            s.on('pointerover', () => {
                for (let j = 1; j <= 5; j++) {
                    const star = this.stararray[j];
                    if (!star) {
                        continue;
                    }
                    if (j <= s.val) {
                        if (star.empty) {
                            star.empty.setVisible(false);
                        }
                        if (star.fill) {
                            star.fill.setVisible(true);
                        }
                    } else {
                        if (star.empty) {
                            star.empty.setVisible(true);
                        }
                        if (star.fill) {
                            star.fill.setVisible(false);
                        }
                    }
                }
            });
            this.ui.add(s);
            this.stararray[i] = s;
        }

        const skip = this.scene.add.container(340, 355);
        if (this.scene.textures.exists('btn_skip')) {
            const skipImg = this.scene.add.image(0, 0, 'btn_skip')
                .setOrigin(0, 0);
            skip.add(skipImg);
            skip.setSize(skipImg.width, skipImg.height);
            skip.setInteractive({ useHandCursor: true });
        }
        skip.on('pointerdown', () => {
            this.callback.call(this.caller);
        });
        // AS3: JumpDieCreateMain.add_mouse_over(skip); covered by useHandCursor.
        this.ui.add(skip);
        this.container.add(this.ui);
    }

    initbg() {
        let dispinfo = 'Level Complete!\n\n';
        dispinfo += 'Level Name: ' + this.currentlevelinfo.level_name + '\n';
        dispinfo += 'Creator Name: ' + this.currentlevelinfo.creator_name + '\n';
        dispinfo += 'Created: ' + this.currentlevelinfo.date_created + '\n\n';
        dispinfo += 'Rate it!';

        const bg = this.scene.add.container(0, 0);
        bg.add(this.scene.add.image(0, 0, 'menu_bg').setOrigin(0, 0));
        const spbubble = JumpDieCreateMenu.getTextBubble(this.scene);
        spbubble.setAlpha(0.8);
        bg.add(spbubble);

        this.loadingmessagedisplay = SubmitMenu.maketextdisplay(
            this.scene, 118, 135, dispinfo, 13, 276, 243);
        bg.add(this.loadingmessagedisplay);

        const backbutton = this.scene.add.container(0, 503);
        if (this.scene.textures.exists('btn_back')) {
            const backImg = this.scene.add.image(0, 0, 'btn_back')
                .setOrigin(0, 0);
            backbutton.add(backImg);
            backbutton.setSize(backImg.width, backImg.height);
            backbutton.setInteractive({ useHandCursor: true });
        }
        backbutton.on('pointerdown', () => {
            this.caller.destroy();
        });
        bg.add(backbutton);

        this.container.add(bg);
    }

    destroy() {
        if (this.fireworks) {
            this.fireworks.destroy();
            this.fireworks = null;
        }
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}
