// WinAnimation.js - Guy victory animation (frames then blinking loop).
// Mirrors misc/WinAnimation.as.
//
// ASSET NOTE (for BootScene.js preload; BootScene.js is intentionally not
// modified here):
//   'guywin_1' .. 'guywin_9'       <- img/guywin/1.png .. 9.png   (NOT preloaded yet)
//   'guywin_blink1', 'guywin_blink2' <- img/guywin/blink1.png, blink2.png (NOT preloaded yet)
// The animation runs (timers advance) even without the textures; frames are
// skipped while their texture is missing.
//
// PORT NOTE: Flash Timers become scene.time events. The AS3 phase-2 loop has
// a dead check (`if (numChildren < 0)`); it is mirrored as a comment since it
// can never be true.

export default class WinAnimation {
    constructor(scene, parentContainer) {
        this.scene = scene;

        this.container = scene.add.container(0, 0);
        if (parentContainer) {
            parentContainer.add(this.container);
        }

        this.frameKeys = [
            'guywin_1', 'guywin_2', 'guywin_3',
            'guywin_4', 'guywin_5', 'guywin_6',
            'guywin_7', 'guywin_8', 'guywin_9',
        ];
        this.blinkKeys = ['guywin_9', 'guywin_blink1', 'guywin_9', 'guywin_blink2'];

        this.animarray = [...this.frameKeys];
        this.animphase = 0;
        this.stopped = false;

        this.frame = scene.add.image(0, 0, this.animarray[0]);
        this.frame.setOrigin(0, 0);
        if (!scene.textures.exists(this.animarray[0])) {
            this.frame.setVisible(false);
        }
        this.container.add(this.frame);
    }

    showFrame(key) {
        if (this.scene.textures.exists(key)) {
            this.frame.setTexture(key);
            this.frame.setVisible(true);
        } else {
            this.frame.setVisible(false);
        }
    }

    // "this code makes me laught and it should make you too" — AS3 comment,
    // preserved in spirit.
    start() {
        const phase1 = this.scene.time.addEvent({
            delay: 70,
            repeat: this.animarray.length - 1,
            callback: () => {
                // AS3: removeChildAt(0); addChild(animarray[animphase]).
                this.showFrame(this.animarray[this.animphase]);
                this.animphase++;
            },
        });
        phase1.once('complete', () => {
            this.animarray = [...this.blinkKeys];
            this.animphase = 0;
            this.blinkTimer = this.scene.time.addEvent({
                delay: 250,
                loop: true,
                callback: () => {
                    if (this.stopped) {
                        return;
                    }
                    // AS3 dead check mirrored: `if (numChildren < 0)` can never
                    // be true; the frame is always swapped.
                    this.showFrame(this.animarray[this.animphase]);
                    this.animphase++;
                    if (this.animphase === this.animarray.length) {
                        this.animphase = 0;
                    }
                    // AS3: if (stage == null) animtimer.stop().
                    if (!this.container || !this.container.scene) {
                        this.stop();
                    }
                },
            });
        });
    }

    stop() {
        this.stopped = true;
        if (this.blinkTimer) {
            this.blinkTimer.remove();
            this.blinkTimer = null;
        }
    }

    destroy() {
        this.stop();
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}
