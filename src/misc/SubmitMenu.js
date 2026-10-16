// SubmitMenu.js - Level editor submit flow: ask -> info entry -> verify.
// Mirrors misc/SubmitMenu.as.
//
// ASSET NOTE (for BootScene.js preload; BootScene.js is intentionally not
// modified here):
//   TextWindow.YES_BUTTON_KEY ('btn_yes'), NO ('btn_no'), OK ('btn_ok')
//   <- img/button/yes.png, no.png, ok.png (NOT preloaded yet)
//   'btn_back' <- img/button/back.png (already preloaded)
//
// PORT NOTE: the AS3 POSTed the level to JumpDieCreateMain.ONLINE_DB_URL +
// 'submit.php' via URLLoader. The PHP online service surface is Phase 8 (see
// AGENTS.md); submitdata() keeps the verification flow but does not send the
// request. Mochi achievement calls are omitted (MochiManager intentionally
// not ported). Text entry fields use DOM <input> overlays like TextWindow.

import TextWindow from './TextWindow.js';
import JumpDieCreateMenu from '../currentfunction/JumpDieCreateMenu.js';

export default class SubmitMenu {
    constructor(scene, leveleditor, time) {
        this.scene = scene;
        this.leveleditor = leveleditor;
        this.time = time;

        this.container = scene.add.container(0, 0);
        this.displayarea = scene.add.container(0, 0);
        this.container.add(this.displayarea);

        this.errordisplayarea = null;
        this.levelnameentry = null;
        this.nameentry = null;
        this.okbutton = null;
        this.httpstatus = 0;

        this.makebg();
        this.makeasksubmit();
    }

    destroy() {
        this.destroyEntry(this.levelnameentry);
        this.destroyEntry(this.nameentry);
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }

    destroyEntry(entry) {
        if (entry && entry.input && entry.input.parentNode) {
            entry.input.parentNode.removeChild(entry.input);
        }
    }

    makeEntryProxy(input) {
        return {
            input,
            get text() {
                return input.value;
            },
            set text(value) {
                input.value = value;
            },
        };
    }

    makeasksubmit() {
        this.displayarea.add(
            SubmitMenu.maketextdisplay(this.scene, 140, 150,
                'Level Complete! Submit to online database?', 10));

        const yesbutton = this.scene.add.container(188, 300);
        const yesImg = TextWindow.addButtonImage(
            this.scene, yesbutton, TextWindow.YES_BUTTON_KEY);
        if (yesImg) {
            yesbutton.setSize(yesImg.width, yesImg.height);
            yesbutton.setInteractive({ useHandCursor: true });
        }
        yesbutton.on('pointerdown', () => {
            this.cleardisplayarea();
            this.makeinfoentry();
        });
        this.displayarea.add(yesbutton);

        const nobutton = this.scene.add.container(288, 300);
        const noImg = TextWindow.addButtonImage(
            this.scene, nobutton, TextWindow.NO_BUTTON_KEY);
        if (noImg) {
            nobutton.setSize(noImg.width, noImg.height);
            nobutton.setInteractive({ useHandCursor: true });
        }
        nobutton.on('pointerdown', () => {
            this.leveleditor.clear();
            this.leveleditor.remake();
        });
        this.displayarea.add(nobutton);
    }

    makeinfoentry() {
        this.displayarea.add(SubmitMenu.maketextdisplay(this.scene, 155, 156,
            'Enter the name of your level.\n(3-16 characters long, A-Z and 0-9 only)',
            10, 195, 43));
        this.displayarea.add(SubmitMenu.maketextdisplay(this.scene, 155, 236,
            'Enter your name(optional, same rules as above)', 10, 195, 28));

        this.errordisplayarea = SubmitMenu.maketextdisplay(
            this.scene, 145, 305, '', 12, 165, 45);
        this.errordisplayarea.setColor('#ff0000');
        this.displayarea.add(this.errordisplayarea);

        this.levelnameentry = this.makeEntryProxy(
            TextWindow.makeEntryInput(this.scene, 155, 201, 195, 20));
        document.body.appendChild(this.levelnameentry.input);
        this.nameentry = this.makeEntryProxy(
            TextWindow.makeEntryInput(this.scene, 155, 268, 195, 20));
        document.body.appendChild(this.nameentry.input);

        this.okbutton = this.scene.add.container(309, 317);
        const okImg = TextWindow.addButtonImage(
            this.scene, this.okbutton, TextWindow.OK_BUTTON_KEY);
        if (okImg) {
            this.okbutton.setSize(okImg.width, okImg.height);
            this.okbutton.setInteractive({ useHandCursor: true });
        }
        this.okbutton.on('pointerdown', () => {
            this.okbutton.setVisible(false);
            this.errordisplayarea.setText('Verifying text');
            this.verifydata();
        });
        this.displayarea.add(this.okbutton);
    }

    verifydata() {
        let levelname = this.levelnameentry.text;
        let creatorname = this.nameentry.text;
        if (creatorname.length === 0) {
            creatorname = 'Anonymous';
        }
        const verify = /^[a-zA-Z0-9]{3,16}$/;

        const reject = (message) => {
            this.okbutton.setVisible(true);
            this.errordisplayarea.setText(message);
        };

        if (!verify.test(levelname)) {
            reject('Error with your level name.');
            return;
        } else if (!verify.test(creatorname)) {
            reject('Error with your user name.');
            return;
        } else if (this.time < 5000) {
            reject('Level is too short. Make it longer.');
            return;
        } else if (this.leveleditor.rectList.length > 150) {
            reject('Level is too big. Make it shorter.');
            return;
        } else if (this.leveleditor.rectList.length < 3) {
            reject('Level is too short. Make it longer.');
            return;
        }

        this.errordisplayarea.setText('Submitting...');
        this.submitdata(levelname, creatorname,
            this.leveleditor.outputXML(levelname));
    }

    submitdata(levelname, creatorname, levelcontents) {
        // Phase 8 stub. The original POSTed urlvars
        // (level_name, creator_name, level_data, pass='jumpdiecreatesubmit') to
        // ONLINE_DB_URL + 'submit.php' and handled HTTP 200/406 plus network
        // errors. The PHP online service is not part of the faithful port yet,
        // so the request is not sent.
        this.errordisplayarea.setText(
            'Online submission is not available in this build.');
        this.okbutton.setVisible(true);
    }

    // Kept for Phase 8, when submitdata() performs the real request.
    uploadcomplete(data) {
        this.cleardisplayarea();
        this.displayarea.add(
            SubmitMenu.maketextdisplay(this.scene, 140, 150, data, 10));
        const okbutton = this.scene.add.container(229, 300);
        const okImg = TextWindow.addButtonImage(
            this.scene, okbutton, TextWindow.OK_BUTTON_KEY);
        if (okImg) {
            okbutton.setSize(okImg.width, okImg.height);
            okbutton.setInteractive({ useHandCursor: true });
        }
        okbutton.on('pointerdown', () => {
            this.leveleditor.clear();
            this.leveleditor.main.curfunction =
                new JumpDieCreateMenu(this.leveleditor.main);
        });

        const localdata = this.leveleditor.main.localdata;
        if (localdata && localdata.data) {
            localdata.data['submitted_level'] = true;
        }
        // AS3 also called mochimanager.update_achievements_submit(); Mochi is
        // intentionally not ported.

        this.displayarea.add(okbutton);
    }

    errorhandle() {
        if (this.httpstatus !== 406) {
            this.errordisplayarea.setText('Network error: ' + this.httpstatus);
        }
        this.okbutton.setVisible(true);
    }

    cleardisplayarea() {
        this.displayarea.removeAll(true);
    }

    // Mirrors the static SubmitMenu.maketextdisplay. The AS3 signature has no
    // scene; the port takes it first (browser-safe adaptation).
    static maketextdisplay(scene, x, y, t, fontSize, width = 240, height = 400) {
        const main = window.jumpDieCreateMain;
        const style = main.getTextFormat(fontSize);
        const displaytext = scene.add.text(x, y, t, {
            ...style,
            wordWrap: { width },
        });
        displaytext.setSize(width, height);
        return displaytext;
    }

    makebg() {
        const bg = this.scene.add.container(0, 0);
        bg.add(this.scene.add.image(0, 0, 'menu_bg').setOrigin(0, 0));
        const spbubble = JumpDieCreateMenu.getTextBubble(this.scene);
        spbubble.setAlpha(0.8);
        bg.add(spbubble);

        const backbutton = this.scene.add.container(0, 503);
        if (this.scene.textures.exists('btn_back')) {
            const backImg = this.scene.add.image(0, 0, 'btn_back')
                .setOrigin(0, 0);
            backbutton.add(backImg);
            backbutton.setSize(backImg.width, backImg.height);
            backbutton.setInteractive({ useHandCursor: true });
        }
        backbutton.on('pointerdown', () => {
            this.leveleditor.clear();
            this.leveleditor.remake();
        });
        bg.add(backbutton);

        this.container.add(bg);
    }
}
