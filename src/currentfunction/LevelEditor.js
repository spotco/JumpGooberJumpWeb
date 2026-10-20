// LevelEditor.js - Full level editor port.
// Mirrors currentfunction/LevelEditor.as ("this is a monster").
//
// The editor runs inside the host scene (usually MenuScene's context via
// main.setScene). It draws a 500x520 canvas with a 50px grid + height labels,
// a bottom toolbar (y 500-540) with an 18-type block palette, and supports:
//   - drag to place box blocks (wall/death/boost/goal/track/trackwall/
//     activatetrackwall/bossactivate) with a ghost preview,
//   - click to place point blocks (fruit, trackblade, bosses, launchers, lasers),
//   - text blocks via a TextWindow dialog,
//   - delete and move tools,
//   - vertical scroll (Up/W, Down/S, PageUp, PageDown),
//   - undo (Z / undo button), playtest (P / play button),
//   - XML export (outputXML), quit-to-menu with confirmation.
//
// Differences from the AS3: Mouse/Keyboard stage events become Phaser scene
// input (pointer/keyboard); the 20ms ghost timers become pointermove redraws;
// playtest creates a GameEngine in the SAME scene (instead of a fresh stage
// child) and overrides its menu button to return via nextLevel(false).

import { MUSIC } from '../Constants.js';
import CurrentFunction from './CurrentFunction.js';
import JumpDieCreateMenu from './JumpDieCreateMenu.js';
import GameEngine from '../GameEngine.js';
import ButtonMessage from '../misc/ButtonMessage.js';
import TextWindow from '../misc/TextWindow.js';
import ConfirmationWindow from '../misc/ConfirmationWindow.js';
import SubmitMenu from '../misc/SubmitMenu.js';

import Wall from '../blocks/Wall.js';
import FalldownBlock from '../blocks/FalldownBlock.js';
import Boost from '../blocks/Boost.js';
import Goal from '../blocks/Goal.js';
import Textdisplay from '../blocks/Textdisplay.js';
import BoostFruit from '../blocks/BoostFruit.js';
import Track from '../blocks/Track.js';
import TrackWall from '../blocks/TrackWall.js';
import TrackBlade from '../blocks/TrackBlade.js';
import FlowerBoss from '../blocks/FlowerBoss.js';
import CloudBoss from '../blocks/CloudBoss.js';
import RocketLauncher from '../blocks/RocketLauncher.js';
import LaserLauncher from '../blocks/LaserLauncher.js';
import ActivateTrackWall from '../blocks/ActivateTrackWall.js';
import BossActivate from '../blocks/BossActivate.js';

const TOOLBAR_Y = 502;
const CANVAS_H = 500;

export default class LevelEditor extends CurrentFunction {
    constructor(main) {
        super(main);

        this.xmllist = [];
        this.rectList = [];
        this.currenty = 0;
        this.currenttype = LevelEditor.WALL;
        this.currentgame = null;
        this.ingame = false;
        this.bg = 1;
        this.keydown = false;
        this.cboxx = 0;
        this.cboxy = 0;
        this.ststo = 0;
        this.draggingBlock = null;
        this.draggingBlockIndex = -1;
        this.draggingBlockOffsetX = 0;
        this.draggingBlockOffsetY = 0;
        this.numdeath = -1;

        // Canvas background (500x520) + bottom bar (500x40).
        this.canvasbg = this.add(this.scene.add.rectangle(250, 260, 500, 520, 0x000000));
        this.bottombar = this.add(this.scene.add.rectangle(250, 510, 500, 40, 0x202020));

        // Grid layer.
        this.gridlayer = this.add(this.scene.add.container(0, 0));
        this.gridlines = this.scene.add.graphics();
        this.gridlayer.add(this.gridlines);
        this.drawGrid();

        // Layer for placed blocks (behind the spawn marker, above the grid).
        this.blocklayer = this.add(this.scene.add.container(0, 0));

        // Ghost preview (drag outline).
        this.previewgfx = this.add(this.scene.add.graphics());

        // Spawn marker (a simple guy glyph; the engine uses its own spawn).
        this.playerspawn = this.add(this.scene.add.image(250, 250, 'guy_stand').setOrigin(0, 0));

        this.makeui();
        this.editorKeyListeners();
        this.main.stop();
        this.main.playSpecific(MUSIC.LEVELEDITOR_MUSIC);
    }

    // ---- grid ------------------------------------------------------------
    drawGrid() {
        // Mirrors LevelEditor.as drawGrid(): horizontal lines every 50px with
        // height labels ("Npx"), vertical lines every 50px. Grid scrolls with
        // the editor via container y.
        this.gridlines.clear();
        for (const child of [...this.gridlayer.list]) {
            if (child !== this.gridlines) child.destroy();
        }
        this.gridlines.lineStyle(1, 0xFFFFFF, 0.3);
        const startY = Math.floor(this.currenty / 50) * 50 + 520;
        for (let i = startY; i >= this.currenty; i -= 50) {
            this.gridlines.moveTo(0, i);
            this.gridlines.lineTo(500, i);
            const label = this.scene.add.text(1, i, `${-(i - 520)}px`, {
                fontSize: '10px', color: '#ffffff',
            }).setAlpha(0.3);
            this.gridlayer.add(label);
        }
        for (let i = 0; i <= 500; i += 50) {
            this.gridlines.moveTo(i, this.currenty);
            this.gridlines.lineTo(i, this.currenty + 520);
        }
    }

    // ---- input -----------------------------------------------------------
    editorKeyListeners() {
        const si = this.scene.input;
        si.on('pointerdown', this.onPointerDown, this);
        si.on('pointerup', this.onPointerUp, this);
        si.on('pointermove', this.onPointerMove, this);
        const kb = si.keyboard;
        if (kb) {
            kb.on('keydown', this.onKeyPress, this);
            kb.on('keyup', this.onKeyUp, this);
        }
    }

    clearlisteners() {
        const si = this.scene.input;
        si.off('pointerdown', this.onPointerDown, this);
        si.off('pointerup', this.onPointerUp, this);
        si.off('pointermove', this.onPointerMove, this);
        const kb = si.keyboard;
        if (kb) {
            kb.off('keydown', this.onKeyPress, this);
            kb.off('keyup', this.onKeyUp, this);
        }
    }

    onPointerDown(pointer) {
        if (this.ingame) return;
        this.cboxx = pointer.x;
        this.cboxy = pointer.y;
        this.ststo = pointer.y + this.currenty;
        this.keydown = true;
        if (this.currenttype === LevelEditor.MOVE) {
            this.draggingBlock = this.getTopMouseOverBlock(pointer.x, pointer.y);
        }
        this.drawPreview(pointer.x, pointer.y);
    }

    onPointerMove(pointer) {
        if (this.ingame || !this.keydown) return;
        this.drawPreview(pointer.x, pointer.y);
    }

    onPointerUp(pointer) {
        if (this.ingame) return;
        this.previewgfx.clear();
        this.keydown = false;
        this.createAtPointer(pointer.x, pointer.y);
        // AS3 refreshes the ui after every placement.
        this.unmakeui();
        this.makeui();
    }

    drawPreview(px, py) {
        // Ghost rectangle while dragging to create a box block, or while
        // dragging with the move tool (AS3's mousePreviewCreate/Move).
        this.previewgfx.clear();
        if (py > CANVAS_H) return;
        if (this.currenttype === LevelEditor.MOVE) {
            if (!this.draggingBlock) return;
            this.previewgfx.lineStyle(2, LevelEditor.colorByType(LevelEditor.convertToType(this.draggingBlock.type())));
            this.previewgfx.strokeRect(
                px - this.draggingBlockOffsetX,
                py - this.draggingBlockOffsetY,
                this.draggingBlock.w, this.draggingBlock.h);
        } else if (LevelEditor.isBoxType(this.currenttype)) {
            this.previewgfx.lineStyle(2, LevelEditor.colorByType(this.currenttype));
            this.previewgfx.strokeRect(this.cboxx, this.cboxy, px - this.cboxx, py - this.cboxy);
        }
    }

    getTopMouseOverBlock(px, py) {
        for (let i = this.rectList.length - 1; i >= 0; i -= 1) {
            const b = this.rectList[i];
            if (b && px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
                this.draggingBlockOffsetX = px - b.x;
                this.draggingBlockOffsetY = py - b.y;
                this.draggingBlockIndex = i;
                return b;
            }
        }
        return null;
    }

    createAtPointer(px, py) {
        const t = this.currenttype;
        const xmlY = py + this.currenty;
        if (py <= CANVAS_H) {
            if (t === LevelEditor.TEXT) {
                this.promptForText(px, py);
                return;
            }
            if (t === LevelEditor.BOOSTFRUIT) {
                this.addBlock(new BoostFruit(this.scene, this.blocklayer, this.cboxx, this.cboxy),
                    `<boostfruit x="${this.cboxx}" y="${this.ststo}"></boostfruit>`);
            } else if (t === LevelEditor.TRACKBLADE) {
                this.addBlock(new TrackBlade(this.scene, this.blocklayer, this.cboxx, this.cboxy),
                    `<trackblade x="${this.cboxx}" y="${this.ststo}"></trackblade>`);
            } else if (t === LevelEditor.FLOWERBOSS) {
                this.addBlock(new FlowerBoss(this.scene, this.blocklayer, this.cboxy),
                    `<flowerboss y="${this.ststo}"></flowerboss>`);
            } else if (t === LevelEditor.CLOUDBOSS) {
                this.addBlock(new CloudBoss(this.scene, this.blocklayer),
                    `<cloudboss></cloudboss>`);
            } else if (t === LevelEditor.ROCKETLAUNCHER) {
                this.addBlock(new RocketLauncher(this.scene, this.blocklayer, this.cboxx, this.cboxy),
                    `<rocketlauncher x="${this.cboxx}" y="${this.ststo}"></rocketlauncher>`);
            } else if (t === LevelEditor.LASERCW) {
                const l = new LaserLauncher(this.scene, this.blocklayer, this.cboxx, this.cboxy, 0);
                this.addBlock(l, `<laserlauncher x="${this.cboxx}" y="${this.ststo}" dir="3"></laserlauncher>`);
            } else if (t === LevelEditor.LASERCCW) {
                const l = new LaserLauncher(this.scene, this.blocklayer, this.cboxx, this.cboxy, 0);
                this.addBlock(l, `<laserlauncher x="${this.cboxx}" y="${this.ststo}" dir="-3"></laserlauncher>`);
            } else if (t === LevelEditor.DELETE) {
                for (let i = 0; i < this.rectList.length; i += 1) {
                    const b = this.rectList[i];
                    if (b && px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
                        this.removeBlock(i);
                        i = 0;
                    }
                }
            } else if (t === LevelEditor.MOVE) {
                if (this.draggingBlock) {
                    this.draggingBlock.x = px - this.draggingBlockOffsetX;
                    this.draggingBlock.y = py - this.draggingBlockOffsetY;
                    this.draggingBlock.syncPosition && this.draggingBlock.syncPosition();
                    const idx = this.draggingBlockIndex;
                    const bt = this.draggingBlock.type();
                    if (bt === 'laserlauncher') {
                        this.xmllist[idx] = `<${bt} x="${this.draggingBlock.x}" y="${this.draggingBlock.y + this.currenty}" dir="3"></${bt}>`;
                    } else if (bt === 'bossactivate') {
                        this.xmllist[idx] = `<${bt} x="${this.draggingBlock.x}" y="${this.draggingBlock.y + this.currenty}" width="${this.draggingBlock.w}" height="${this.draggingBlock.h}" hp="6"></${bt}>`;
                    } else if (bt === 'textfield') {
                        this.xmllist[idx] = `<${bt} x="${this.draggingBlock.x}" y="${this.draggingBlock.y + this.currenty}" text="${this.draggingBlock.text || ''}"></${bt}>`;
                    } else {
                        this.xmllist[idx] = `<${bt} x="${this.draggingBlock.x}" y="${this.draggingBlock.y + this.currenty}" width="${this.draggingBlock.w}" height="${this.draggingBlock.h}"></${bt}>`;
                    }
                    this.draggingBlock = null;
                }
            } else if (Math.abs(px - this.cboxx) < 10 || Math.abs(xmlY - this.ststo) < 10) {
                // "too thin" — AS3 ignores the drag.
            } else if (LevelEditor.isBoxType(t)) {
                const dx = px - this.cboxx;
                const dy = py - this.cboxy;
                const xmlH = (py + this.currenty) - this.ststo;
                this.addBlock(this.makeBoxBlock(t, this.cboxx, this.cboxy, dx, dy),
                    `<${LevelEditor.typeTag(t)} x="${this.cboxx}" y="${this.ststo}" width="${dx}" height="${xmlH}"></${LevelEditor.typeTag(t)}>`);
            }
        }
        // Bring the spawn marker back to the front (AS3 does this after clicks).
        if (this.playerspawn && this.playerspawn.parentContainer) {
            this.playerspawn.parentContainer.bringToTop(this.playerspawn);
        }
    }

    makeBoxBlock(t, x, y, w, h) {
        const s = this.scene, l = this.blocklayer;
        switch (t) {
            case LevelEditor.WALL: return new Wall(s, l, x, y, w, h);
            case LevelEditor.DEATHBLOCK: return new FalldownBlock(s, l, x, y, w, h);
            case LevelEditor.BOOST: return new Boost(s, l, x, y, w, h);
            case LevelEditor.GOAL: return new Goal(s, l, x, y, w, h);
            case LevelEditor.TRACK: return new Track(s, l, x, y, w, h);
            case LevelEditor.TRACKWALL: return new TrackWall(s, l, x, y, w, h);
            case LevelEditor.ACTIVATETRACKWALL: return new ActivateTrackWall(s, l, x, y, w, h);
            case LevelEditor.ROCKETBOSS: return new BossActivate(s, l, x, y, w, h, 6);
            default: return new Wall(s, l, x, y, w, h);
        }
    }

    addBlock(block, xml) {
        this.rectList.push(block);
        this.xmllist.push(xml);
    }

    removeBlock(i) {
        const b = this.rectList[i];
        if (b && b.container) {
            b.container.destroy();
        }
        this.rectList.splice(i, 1);
        this.xmllist.splice(i, 1);
    }

    promptForText(px, py) {
        // Mirrors the AS3 TEXT flow: a TextWindow asks for the text, then a
        // Textdisplay is placed at the click position.
        const win = new TextWindow(this.scene, 'What text would you like to be displayed?', this, () => {
            this.editorKeyListeners();
            if (win.container) win.container.destroy();
            if (win.entryText && win.entryText.length > 0) {
                const sanitized = String(win.entryText).replace(/[<>"\/]/g, '?');
                this.xmllist.push(`<textfield x="${this.cboxx}" y="${this.ststo}" text="${sanitized}"></textfield>`);
                const td = new Textdisplay(this.scene, this.blocklayer, this.cboxx, py, sanitized);
                this.rectList.push(td);
            }
        }, true);
        this.clearlisteners();
    }

    // ---- keyboard --------------------------------------------------------
    onKeyPress(e) {
        // Up/W +5, Down/S -5, PageUp +25, PageDown -25 (AS3 levelEditorScroll).
        if (this.ingame || this.keydown) return;
        const c = e.code;
        if (c === 'ArrowUp' || c === 'KeyW') this.levelEditorScroll(5);
        else if (c === 'ArrowDown' || c === 'KeyS') this.levelEditorScroll(-5);
        else if (c === 'PageUp') this.levelEditorScroll(25);
        else if (c === 'PageDown') this.levelEditorScroll(-25);
    }

    onKeyUp(e) {
        if (this.ingame) return;
        if (e.code === 'KeyZ') this.undo();
        else if (e.code === 'KeyP') this.startLevel();
    }

    levelEditorScroll(n) {
        this.currenty -= n;
        for (const b of this.rectList) {
            if (b) {
                b.y += n;
                if (b.syncPosition) b.syncPosition();
            }
        }
        this.playerspawn.y += n;
        this.drawGrid();
    }

    undo() {
        if (this.rectList.length <= 0) return;
        this.removeBlock(this.rectList.length - 1);
    }

    // ---- XML -------------------------------------------------------------
    outputXML(name) {
        // Mirrors LevelEditor.as outputXML(): <level name bg> + xmllist.
        let textout = `<level name="${name}" bg="${this.bg}">`;
        for (const s of this.xmllist) {
            textout += s;
        }
        textout += '</level>';
        return textout;
    }

    // ---- playtest --------------------------------------------------------
    startLevel() {
        // Mirrors LevelEditor.as startLevel(): builds the XML and runs a
        // GameEngine in the SAME scene. The engine's menu button is rerouted
        // to nextLevel(false) so playtesting returns to the editor (remake).
        this.clearEditorDisplay();
        this.numdeath += 1;
        this.ingame = true;
        this.main.stop();
        this.main.playSpecific(this.main.onlineMusic ? this.main.onlineMusic : MUSIC.SONG1);
        this.currentgame = new GameEngine(this.scene, {
            clvlxml: this.outputXML('new_level'),
            name: 'new level',
            usebackbutton: true,
            useBg: -1,
            hasskip: true,
            deathcount: Math.max(0, this.numdeath),
            curfunction: this,
            sceneData: {},
        });
        this.currentgame.handleMenuButton = () => {
            this.currentgame.loadnextlevel(false);
        };
    }

    clearEditorDisplay() {
        // Hide the editor layers for the playtest (AS3 clears the display).
        for (const o of this.objects) {
            if (o && typeof o.setVisible === 'function') o.setVisible(false);
        }
        this.clearlisteners();
    }

    remake() {
        // Mirrors LevelEditor.as remake(): called after playtest ends; shows
        // the editor again.
        this.ingame = false;
        for (const o of this.objects) {
            if (o && typeof o.setVisible === 'function') o.setVisible(true);
        }
        this.drawGrid();
        this.unmakeui();
        this.makeui();
        this.editorKeyListeners();
        this.main.stop();
        this.main.playSpecific(MUSIC.LEVELEDITOR_MUSIC);
    }

    nextLevel(hitgoal) {
        this.numdeath = -1;
        if (!hitgoal) {
            this.remake();
        } else {
            const time = Date.now() - (this.starttime || Date.now());
            new SubmitMenu(this.scene, this, time);
        }
    }

    // ---- toolbar ---------------------------------------------------------
    makeui() {
        // Mirrors LevelEditor.as makeui(): menu/play/undo, type selector,
        // info, help, bg buttons, and the move-place indicator.
        const btn = (key, x, onclick) => {
            const b = this.add(this.scene.add.image(x, TOOLBAR_Y, key).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true }));
            b.on('pointerdown', onclick);
            return b;
        };
        this.menubutton = btn('btn_menu', 458, () => this.destroy());
        this.playbutton = btn('btn_play', 410, () => this.startLevel());
        this.undobutton = btn('btn_undo', 362, () => this.undo());

        this.selectorbutton = this.add(this.scene.add.container(0, TOOLBAR_Y));
        const selbg = this.scene.add.image(0, 0, 'btn_blank').setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
        const selicon = this.scene.add.image(16, 4, LevelEditor.iconKey(this.currenttype)).setOrigin(0.5, 0.5);
        this.selectorbutton.add([selbg, selicon]);
        this.selectorIcon = selicon;
        selbg.on('pointerdown', () => {
            this.clearButtonMessage();
            const msg = new ButtonMessage(this.scene, 'selector', this);
            this.selectorbutton.add(msg.container);
            this.selectorMessage = msg;
        });

        this.infobutton = btn('btn_info', 48, () => {
            this.clearButtonMessage();
            const msg = new ButtonMessage(this.scene, 'info', this);
            this.infobutton.parentContainer.add(msg.container);
            msg.container.setPosition(1, TOOLBAR_Y - 113);
        });
        this.helpbutton = btn('btn_help', 96, () => {
            this.clearButtonMessage();
            const msg = new ButtonMessage(this.scene, 'help', this, 0);
            this.helpbutton.parentContainer.add(msg.container);
            msg.container.setPosition(1, TOOLBAR_Y - 113);
        });
        this.bgbutton = btn('btn_bg', 144, () => {
            this.clearButtonMessage();
            const msg = new ButtonMessage(this.scene, 'bg', this);
            this.bgbutton.parentContainer.add(msg.container);
            msg.container.setPosition(96, TOOLBAR_Y - 113);
        });
    }

    unmakeui() {
        // Mirrors LevelEditor.as unmakeui(): removes the toolbar buttons.
        for (const k of ['menubutton', 'playbutton', 'undobutton', 'selectorbutton', 'infobutton', 'helpbutton', 'bgbutton']) {
            const b = this[k];
            if (b) {
                const i = this.objects.indexOf(b);
                if (i >= 0) this.objects.splice(i, 1);
                b.destroy();
                this[k] = null;
            }
        }
    }

    clearButtonMessage() {
        for (const k of ['selectorbutton', 'infobutton', 'helpbutton']) {
            const s = this[k];
            if (s && s.list && s.list.length > 1) {
                const msg = s.list[s.list.length - 1];
                if (msg !== s.list[0]) {
                    s.remove(msg);
                    msg.destroy();
                }
            }
        }
        if (this.selectorMessage) {
            this.selectorMessage = null;
        }
    }

    hitButtonMessage(px, py) {
        // True if the pointer is over an open ButtonMessage popup.
        for (const k of ['selectorbutton', 'infobutton', 'helpbutton']) {
            const s = this[k];
            if (s && s.list) {
                for (const child of s.list) {
                    if (child.getBounds && child.getBounds().contains(px, py)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    makeBitmapWrapper(key) {
        // Mirrors LevelEditor.as makeBitmapWrapper(): returns an image (or a
        // colored box if the texture is missing) for ButtonMessage icons.
        if (this.scene.textures.exists(key)) {
            return this.scene.add.image(0, 0, key).setOrigin(0, 0);
        }
        return this.scene.add.rectangle(0, 0, 24, 24, 0xff00ff);
    }

    setType(t) {
        this.currenttype = t;
        if (this.selectorIcon && this.scene.textures.exists(LevelEditor.iconKey(t))) {
            this.selectorIcon.setTexture(LevelEditor.iconKey(t));
        }
    }

    setBg(n) {
        this.bg = n;
    }

    static iconKey(t) {
        const keys = ['editor_blue', 'editor_red', 'editor_yellow', 'editor_green',
            'editor_text', 'editor_delete', 'editor_move', 'editor_boostfruit',
            'editor_track', 'editor_trackwall', 'editor_trackblade',
            'editor_bossplant', 'editor_bosscloud', 'editor_rocketlauncher',
            'editor_lasercw', 'editor_laserccw', 'editor_activatetrackwall',
            'editor_rocketboss'];
        return keys[t] || 'editor_blue';
    }

    static typeTag(t) {
        const tags = ['wall', 'deathwall', 'boost', 'goal', 'textfield', 'deathwall',
            'deathwall', 'boostfruit', 'track', 'trackwall', 'trackblade',
            'flowerboss', 'cloudboss', 'rocketlauncher', 'laserlauncher',
            'laserlauncher', 'activatetrackwall', 'bossactivate'];
        return tags[t] || 'wall';
    }

    static isBoxType(t) {
        return t === LevelEditor.WALL || t === LevelEditor.DEATHBLOCK ||
            t === LevelEditor.BOOST || t === LevelEditor.GOAL ||
            t === LevelEditor.TRACK || t === LevelEditor.TRACKWALL ||
            t === LevelEditor.ACTIVATETRACKWALL || t === LevelEditor.ROCKETBOSS;
    }

    static colorByType(t) {
        if (t === LevelEditor.WALL || t === LevelEditor.TRACK ||
            t === LevelEditor.TRACKWALL || t === LevelEditor.ACTIVATETRACKWALL) {
            return 0x0000ff;
        }
        if (t === LevelEditor.DEATHBLOCK || t === LevelEditor.TRACKBLADE ||
            t === LevelEditor.FLOWERBOSS || t === LevelEditor.ROCKETBOSS ||
            t === LevelEditor.ROCKETLAUNCHER || t === LevelEditor.LASERCCW ||
            t === LevelEditor.LASERCW) {
            return 0xff0000;
        }
        if (t === LevelEditor.BOOST || t === LevelEditor.BOOSTFRUIT) {
            return 0xffff00;
        }
        if (t === LevelEditor.GOAL) {
            return 0x008000;
        }
        return 0xffffff;
    }

    static convertToType(tag) {
        const map = {
            wall: LevelEditor.WALL, boost: LevelEditor.BOOST,
            deathwall: LevelEditor.DEATHBLOCK, goal: LevelEditor.GOAL,
            textfield: LevelEditor.TEXT, boostfruit: LevelEditor.BOOSTFRUIT,
            track: LevelEditor.TRACK, trackwall: LevelEditor.TRACKWALL,
            trackblade: LevelEditor.TRACKBLADE, flowerboss: LevelEditor.FLOWERBOSS,
            bossactivate: LevelEditor.ROCKETBOSS, activatetrackwall: LevelEditor.ACTIVATETRACKWALL,
            rocketlauncher: LevelEditor.ROCKETLAUNCHER, laserlauncher: LevelEditor.LASERCW,
        };
        return map[tag] !== undefined ? map[tag] : -999;
    }

    // ---- lifecycle -------------------------------------------------------
    clear() {
        // Mirrors LevelEditor.as clear(): hides everything, drops listeners.
        this.clearlisteners();
    }

    destroy() {
        // Mirrors LevelEditor.as destroy(): confirm quit, then back to menu.
        const win = new ConfirmationWindow(this.scene,
            'Are you sure you want to quit and erase all your work?',
            () => {
                this.clearlisteners();
                this.clearObjects();
                this.main.stop();
                this.main.curfunction = new JumpDieCreateMenu(this.main);
            },
            () => {
                this.remake();
            });
    }
}

LevelEditor.WALL = 0;
LevelEditor.DEATHBLOCK = 1;
LevelEditor.BOOST = 2;
LevelEditor.GOAL = 3;
LevelEditor.TEXT = 4;
LevelEditor.DELETE = 5;
LevelEditor.MOVE = 6;
LevelEditor.BOOSTFRUIT = 7;
LevelEditor.TRACK = 8;
LevelEditor.TRACKWALL = 9;
LevelEditor.TRACKBLADE = 10;
LevelEditor.FLOWERBOSS = 11;
LevelEditor.CLOUDBOSS = 12;
LevelEditor.ROCKETLAUNCHER = 13;
LevelEditor.LASERCW = 14;
LevelEditor.LASERCCW = 15;
LevelEditor.ACTIVATETRACKWALL = 16;
LevelEditor.ROCKETBOSS = 17;
