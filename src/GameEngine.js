// GameEngine.js - First Phaser runtime skeleton.
// Mirrors core/GameEngine.as.

import LevelXmlParser from './LevelXmlParser.js';
import Wall from './blocks/Wall.js';
import Goal from './blocks/Goal.js';
import Textdisplay from './blocks/Textdisplay.js';
import Boost from './blocks/Boost.js';
import BoostFruit from './blocks/BoostFruit.js';
import Track from './blocks/Track.js';
import TrackWall from './blocks/TrackWall.js';
import ActivateTrackWall from './blocks/ActivateTrackWall.js';
import TrackBlade from './blocks/TrackBlade.js';
import RocketLauncher from './blocks/RocketLauncher.js';
import LaserLauncher from './blocks/LaserLauncher.js';
import BossActivate from './blocks/BossActivate.js';
import FlowerBoss from './blocks/FlowerBoss.js';
import CloudBoss from './blocks/CloudBoss.js';
import Guy from './core/Guy.js';

export default class GameEngine {
    static CLEAR_ABOVE_MARGIN = -400;
    static CLEAR_BELOW_MARGIN = 1000;
    static OFFSCREEN_LEFT = -64;
    static OFFSCREEN_RIGHT = 564;
    static OFFSCREEN_TOP = -220;
    static OFFSCREEN_BOTTOM = 620;
    static DEFAULT_PLAYER_X = 238;
    static DEFAULT_PLAYER_Y = 400;

    constructor(scene, options) {
        this.scene = scene;
        this.main = scene;
        this.curfunction = options.curfunction || null;
        this.clvlxml = options.clvlxml;
        this.displayname = options.name || 'Untitled Level';
        this.usebackbutton = Boolean(options.usebackbutton);
        this.useBg = options.useBg || 1;
        this.hasskip = options.hasskip !== false;
        this.deathcount = options.deathcount || 0;
        this.sceneData = options.sceneData || null;

        this.deathwall = [];
        this.boostlist = [];
        this.textdisplays = [];
        this.walls = [];
        this.goals = [];
        this.boostfruits = [];
        this.tracks = [];
        this.particles = [];
        this.particlesreuse = [];
        this.rocketparticlesreuse = [];
        this.bulletsreuse = [];
        this.otherblocks = [];
        this.blocksarrays = [
            this.walls,
            this.goals,
            this.deathwall,
            this.boostlist,
            this.textdisplays,
            this.boostfruits,
            this.tracks,
            this.particles,
            this.otherblocks,
        ];

        this.currenty = 0;
        this.bg_y = -940;
        this.game_time = 0;
        this.prev_time = 0;
        this.ispaused = false;
        this.kill = false;
        this.cleared = false;
        this.pendingReload = false;
        this.pendingLevelAdvance = false;
        this.pendingLevelAdvanceHitGoal = false;
        this.debugScrollSpeed = 0;
        this.justWallJumped = false;
        this.testguy = null;
        this.inputstack = [];
        this.currentInput = null;
        this.inputx = 0;
        this.inputy = 0;
        this.keyState = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false,
            Space: false,
        };
        this.keyDownHandler = this.onKeyPress.bind(this);
        this.keyUpHandler = this.onKeyUp.bind(this);
        this.parser = new LevelXmlParser();

        this.rootContainer = scene.add.container(0, 0);
        this.background = scene.add.image(0, this.bg_y, 'bg1').setOrigin(0, 0);
        this.worldContainer = scene.add.container(0, 0);
        this.rootContainer.add([this.background, this.worldContainer]);
        this.createScrollRectMask();

        this.attachToCurrentFunction();
        this.loadfromXML(this.clvlxml);
        this.createPlayer();
        this.makeui();
        this.registerInputListeners();
    }

    loadfromXML(clvlxml) {
        // GameEngine continues to consume the original level XML directly.
        const sourceName = this.displayname || 'unknown';
        const parsedLevel = this.parser.parse(clvlxml, sourceName);
        this.levelData = parsedLevel;
        this.displayname = parsedLevel.name;

        if (parsedLevel.unsupported.length > 0) {
            console.warn(`[LevelXmlParser] Unsupported nodes in ${parsedLevel.sourceName}:`, parsedLevel.unsupportedCounts);
        }

        for (const record of parsedLevel.objects) {
            const block = this._createBlockFromRecord(record);
            if (!block) {
                continue;
            }
        }
    }

    _createBlockFromRecord(record) {
        switch (record.type) {
        case 'wall': {
            const wall = new Wall(this.scene, this.worldContainer, record.x, record.y, record.width, record.height);
            this.walls.push(wall);
            return wall;
        }
        case 'deathwall': {
            const deathwall = new Wall(this.scene, this.worldContainer, record.x, record.y, record.width, record.height);
            deathwall.container.iterate((child) => {
                if (child && typeof child.setTintFill === 'function') {
                    child.setTintFill(0xff7777);
                }
            });
            this.deathwall.push(deathwall);
            return deathwall;
        }
        case 'goal': {
            const goal = new Goal(this.scene, this.worldContainer, record.x, record.y, record.width, record.height);
            this.goals.push(goal);
            return goal;
        }
        case 'textfield': {
            const textdisplay = new Textdisplay(this.scene, this.worldContainer, record.x, record.y, record.text);
            this.textdisplays.push(textdisplay);
            return textdisplay;
        }
        case 'boost': {
            const boost = new Boost(this.scene, this.worldContainer, record.x, record.y, record.width, record.height);
            this.boostlist.push(boost);
            return boost;
        }
        case 'boostfruit': {
            const boostfruit = new BoostFruit(this.scene, this.worldContainer, record.x, record.y, record.width, record.height);
            this.boostfruits.push(boostfruit);
            return boostfruit;
        }
        case 'track': {
            const track = new Track(this.scene, this.worldContainer, record.x, record.y, record.width, record.height);
            this.tracks.push(track);
            return track;
        }
        case 'trackwall': {
            const trackwall = new TrackWall(this.scene, this.worldContainer, record.x, record.y, record.width, record.height);
            this.tracks.push(trackwall);
            return trackwall;
        }
        case 'activatetrackwall': {
            const activator = new ActivateTrackWall(this.scene, this.worldContainer, record.x, record.y, record.width, record.height);
            this.tracks.push(activator);
            return activator;
        }
        case 'trackblade': {
            const trackblade = new TrackBlade(this.scene, this.worldContainer, record.x, record.y, record.width || 50, record.height || 55);
            this.tracks.push(trackblade);
            return trackblade;
        }
        case 'rocketlauncher': {
            const rocketlauncher = new RocketLauncher(this.scene, this.worldContainer, record.x, record.y);
            this.otherblocks.push(rocketlauncher);
            return rocketlauncher;
        }
        case 'laserlauncher': {
            const laserlauncher = new LaserLauncher(this.scene, this.worldContainer, record.x, record.y, record.dir);
            this.otherblocks.push(laserlauncher);
            return laserlauncher;
        }
        case 'bossactivate': {
            const bossactivate = new BossActivate(this.scene, this.worldContainer, record.x, record.y, record.width, record.height, record.hp, record.explode);
            this.otherblocks.push(bossactivate);
            return bossactivate;
        }
        case 'flowerboss': {
            const flowerboss = new FlowerBoss(this.scene, this.worldContainer, record.x, record.y);
            this.otherblocks.push(flowerboss);
            return flowerboss;
        }
        case 'cloudboss': {
            const cloudboss = new CloudBoss(this.scene, this.worldContainer, record.x, record.y);
            this.otherblocks.push(cloudboss);
            return cloudboss;
        }
        default:
            return null;
        }
    }

    makeui() {
        this.uiContainer = this.scene.add.container(0, 0);
        this.leveldisplaybg = this.scene.add.image(0, 498, 'btn_leveldisplay').setOrigin(0, 0);
        this.leveldisplay = this.scene.add.text(7, 504, this.displayname, {
            fontFamily: 'Bienvenu, Arial, sans-serif',
            fontSize: '10px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
        });

        this.menubutton = this.makeUiButton(this.usebackbutton ? 'btn_back' : 'btn_menu', 322, 498, () => {
            this.handleMenuButton();
        });
        this.skipbutton = null;
        if (this.hasskip) {
            this.skipbutton = this.makeUiButton('btn_skip', 366, 498, () => {
                this.handleSkipButton();
            });
        }
        this.mutebutton = this.makeUiButton(this.getMuteButtonTexture(), 410, 498, () => {
            this.handleMuteButton();
        });
        this.pausebutton = this.makeUiButton('btn_pause', 454, 498, () => {
            this.togglePause();
        });

        this.toprighttext = this.scene.add.text(488, 4, 'TIME: 0:00:000\nDEATHS:0', {
            fontFamily: 'Bienvenu, Arial, sans-serif',
            fontSize: '10px',
            color: '#ffffff',
            align: 'right',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(1, 0);

        this.helptext = this.scene.add.text(250, 505, 'PAGE UP / PAGE DOWN: SCROLL   ESC: MENU', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5, 0);

        this.pausedcover = this.scene.add.container(0, 0);
        this.pausedcoverbg = this.scene.add.rectangle(250, 260, 500, 520, 0x000000, 0.6);
        this.pausedcovertext = this.scene.add.text(250, 237, 'PAUSED', {
            fontFamily: 'Bienvenu, Arial, sans-serif',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5, 0.5);
        this.pausedcoverhelp = this.scene.add.text(250, 283, 'Press pause to continue', {
            fontFamily: 'Bienvenu, Arial, sans-serif',
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5, 0.5);
        this.pausedcover.add([this.pausedcoverbg, this.pausedcovertext, this.pausedcoverhelp]);
        this.pausedcover.setVisible(false);

        this.uiContainer.add([
            this.leveldisplaybg,
            this.leveldisplay,
            this.menubutton,
            this.mutebutton,
            this.pausebutton,
            this.toprighttext,
            this.helptext,
            this.pausedcover,
        ]);
        if (this.skipbutton) {
            this.uiContainer.add(this.skipbutton);
        }
        this.uiContainer.setDepth(1000);
    }

    update(_time, delta) {
        if (this.cleared) {
            return;
        }

        this.attachToCurrentFunction();

        if (this.prev_time === 0) {
            this.prev_time = _time;
        }
        const frameDelta = Math.max(0, Math.min(100, delta || (_time - this.prev_time)));
        this.frameDeltaSeconds = frameDelta / 1000;
        this.prev_time = _time;

        if (this.ispaused) {
            this.updateUiText();
            this.moveUiToFront();
            return;
        }

        this.game_time += frameDelta;
        this.updateUiText();

        if (this.pendingReload || this.kill) {
            this.reload();
            return;
        }

        if (this.pendingLevelAdvance) {
            this.loadnextlevel(this.pendingLevelAdvanceHitGoal);
            return;
        }

        if (this.testguy && this.testguy.activated !== false && typeof this.testguy.update === 'function') {
            const playerHandled = this.testguy.update(this.walls, this.justWallJumped);
            this.justWallJumped = false;
            if (playerHandled === true || this.pendingReload || this.pendingLevelAdvance || this.kill) {
                if (this.pendingReload || this.kill) {
                    this.reload();
                } else if (this.pendingLevelAdvance) {
                    this.loadnextlevel(this.pendingLevelAdvanceHitGoal);
                }
                return;
            }
        }

        for (const blockArray of this.blocksarrays) {
            for (const block of blockArray) {
                if (!block || block.memRemoved || block.activated === false) {
                    continue;
                }

                if (typeof block.simpleupdate === 'function') {
                    block.simpleupdate(this);
                }

                if (typeof block.update === 'function') {
                    const shouldReturn = block.update(this);
                    if (shouldReturn === true || this.pendingReload || this.pendingLevelAdvance || this.kill) {
                        if (this.pendingReload || this.kill) {
                            this.reload();
                        } else if (this.pendingLevelAdvance) {
                            this.loadnextlevel(this.pendingLevelAdvanceHitGoal);
                        }
                        return;
                    }
                }
            }
        }

        if (this.debugScrollSpeed !== 0) {
            this.gameScroll(this.debugScrollSpeed);
        }

        this.checkOffScreenDeath();
        if (this.pendingReload || this.kill) {
            this.reload();
            return;
        }

        this.clearAbove();
        this.clearBelow();
        this.moveUiToFront();
    }

    gameScroll(scroll_spd) {
        if (this.testguy && !this.testguy.memRemoved && this.testguy.activated !== false) {
            this.testguy.gameScroll(scroll_spd);
        }

        for (const blockArray of this.blocksarrays) {
            for (const block of blockArray) {
                block.gameScroll(scroll_spd);
            }
        }

        this.currenty += scroll_spd;
        this.bg_y = Math.min(0, this.bg_y + scroll_spd / 3);
        this.background.y = this.bg_y;
    }

    createScrollRectMask() {
        this.scrollRectGraphics = this.scene.add.graphics();
        this.scrollRectGraphics.fillStyle(0xffffff, 1);
        this.scrollRectGraphics.fillRect(0, 0, 500, 520);
        this.scrollRectMask = this.scrollRectGraphics.createGeometryMask();
        this.rootContainer.setMask(this.scrollRectMask);
        this.scrollRectGraphics.setVisible(false);
    }

    createPlayer() {
        const spawn = this.getPlayerSpawnPosition();
        this.testguy = new Guy(this.scene, this.worldContainer, spawn.x, spawn.y);
    }

    getPlayerSpawnPosition() {
        const spawnX = GameEngine.DEFAULT_PLAYER_X;
        let spawnY = GameEngine.DEFAULT_PLAYER_Y;
        const hitboxLeft = spawnX + Guy.HITBOX_OFFSET_X;
        const hitboxRight = hitboxLeft + Guy.HITBOX_WIDTH;
        let bestFloor = null;

        for (const wall of this.walls) {
            if (!wall || wall.memRemoved || wall.activated === false) {
                continue;
            }

            const wallLeft = wall.x;
            const wallRight = wall.x + wall.w;
            if (hitboxRight <= wallLeft || hitboxLeft >= wallRight) {
                continue;
            }

            if (wall.y > 500) {
                continue;
            }

            if (!bestFloor || wall.y > bestFloor.y) {
                bestFloor = wall;
            }
        }

        if (bestFloor) {
            spawnY = bestFloor.y - Guy.HITBOX_OFFSET_Y - Guy.HITBOX_HEIGHT;
        }

        return { x: spawnX, y: spawnY };
    }

    registerInputListeners() {
        if (!this.scene || !this.scene.input || !this.scene.input.keyboard) {
            return;
        }

        this.scene.input.keyboard.on('keydown', this.keyDownHandler);
        this.scene.input.keyboard.on('keyup', this.keyUpHandler);
    }

    setDebugScrollSpeed(scrollSpeed) {
        this.debugScrollSpeed = scrollSpeed;
    }

    attachToCurrentFunction() {
        if (!this.curfunction || typeof this.curfunction !== 'object') {
            return;
        }

        this.curfunction.currentGame = this;
        this.curfunction.currentgame = this;
    }

    updateUiText() {
        if (!this.toprighttext) {
            return;
        }

        this.toprighttext.text = `TIME: ${GameEngine.gettimet(this.game_time)}\nDEATHS:${this.deathcount}`;
    }

    makeUiButton(texture, x, y, callback) {
        const button = this.scene.add.image(x, y, texture)
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true });
        button.on('pointerdown', callback);
        return button;
    }

    getMuteButtonTexture() {
        const main = window.jumpDieCreateMain;
        return main && main.mute ? 'btn_soundoff' : 'btn_soundon';
    }

    handleMenuButton() {
        if (this.curfunction && this.usebackbutton && typeof this.curfunction.destroy === 'function') {
            this.clear();
            this.curfunction.destroy();
            return;
        }

        this.clear();
        this.scene.scene.start('MenuScene');
    }

    handleSkipButton() {
        this.pendingLevelAdvance = true;
        this.pendingLevelAdvanceHitGoal = false;
    }

    handleMuteButton() {
        const main = window.jumpDieCreateMain;
        if (!main) {
            return;
        }

        main.setMute(!main.mute);
        this.mutebutton.setTexture(this.getMuteButtonTexture());
    }

    togglePause(forceState = null) {
        const nextState = forceState == null ? !this.ispaused : Boolean(forceState);
        if (this.ispaused === nextState) {
            return;
        }

        this.ispaused = nextState;
        this.pausedcover.setVisible(this.ispaused);
        this.pausebutton.setTexture(this.ispaused ? 'btn_unpause' : 'btn_pause');
        if (window.jumpDieCreateMain) {
            window.jumpDieCreateMain.playsfx(this.ispaused ? 'pause' : 'unpause');
        }
    }

    checkOffScreenDeath() {
        if (!this.testguy || this.testguy.memRemoved || this.testguy.activated === false) {
            return false;
        }

        if (this.testguy.exploded) {
            return false;
        }

        const px = typeof this.testguy.x === 'number' ? this.testguy.x : 0;
        const py = typeof this.testguy.y === 'number' ? this.testguy.y : 0;
        const pw = typeof this.testguy.w === 'number' ? this.testguy.w : 0;
        const ph = typeof this.testguy.h === 'number' ? this.testguy.h : 0;

        if (
            (px + pw) < GameEngine.OFFSCREEN_LEFT
            || px > GameEngine.OFFSCREEN_RIGHT
            || (py + ph) < GameEngine.OFFSCREEN_TOP
            || py > GameEngine.OFFSCREEN_BOTTOM
        ) {
            if (typeof this.testguy.explode === 'function') {
                this.testguy.explode();
            } else {
                this.queueReload();
            }
            return true;
        }

        return false;
    }

    moveUiToFront() {
        if (!this.uiContainer || !this.scene || !this.scene.children) {
            return;
        }

        this.scene.children.bringToTop(this.uiContainer);
    }

    onKeyPress(event) {
        if (this.cleared || !event || !event.code) {
            return;
        }

        switch (event.code) {
        case 'Escape':
            this.handleMenuButton();
            return;
        case 'KeyP':
            if (!event.repeat) {
                this.togglePause();
            }
            return;
        case 'PageUp':
            this.setDebugScrollSpeed(8);
            return;
        case 'PageDown':
            this.setDebugScrollSpeed(-8);
            return;
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown':
        case 'Space':
            this.keyState[event.code] = true;
            this.inputStackMove(event.code, true);
            if (event.code === 'Space' && !event.repeat) {
                this.playjumpsound();
            }
            return;
        default:
            return;
        }
    }

    onKeyUp(event) {
        if (this.cleared || !event || !event.code) {
            return;
        }

        switch (event.code) {
        case 'PageUp':
            this.setDebugScrollSpeed(this.keyState.PageDown ? -8 : 0);
            return;
        case 'PageDown':
            this.setDebugScrollSpeed(this.keyState.PageUp ? 8 : 0);
            return;
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown':
        case 'Space':
            this.keyState[event.code] = false;
            this.inputStackMove(event.code, false);
            return;
        default:
            return;
        }
    }

    inputStackMove(inputCode, pressed) {
        const existingIndex = this.inputstack.indexOf(inputCode);

        if (pressed) {
            if (existingIndex !== -1) {
                this.inputstack.splice(existingIndex, 1);
            }
            this.inputstack.push(inputCode);
        } else if (existingIndex !== -1) {
            this.inputstack.splice(existingIndex, 1);
        }

        this.currentInput = this.inputstack.length > 0 ? this.inputstack[this.inputstack.length - 1] : null;

        this.inputx = 0;
        if (this.keyState.ArrowLeft && !this.keyState.ArrowRight) {
            this.inputx = -1;
        } else if (this.keyState.ArrowRight && !this.keyState.ArrowLeft) {
            this.inputx = 1;
        }

        this.inputy = 0;
        if (this.keyState.ArrowUp && !this.keyState.ArrowDown) {
            this.inputy = -1;
        } else if (this.keyState.ArrowDown && !this.keyState.ArrowUp) {
            this.inputy = 1;
        }

        return this.currentInput;
    }

    clearAbove(clearLine = GameEngine.CLEAR_ABOVE_MARGIN) {
        this._clearByBounds((block) => (block.y + this.getBlockHeight(block)) < clearLine);
    }

    clearBelow(clearLine = GameEngine.CLEAR_BELOW_MARGIN) {
        this._clearByBounds((block) => block.y > clearLine);
    }

    _clearByBounds(shouldClear) {
        for (const blockArray of this.blocksarrays) {
            for (const block of blockArray) {
                if (!block || block.memRemoved || block === this.testguy) {
                    continue;
                }

                if (shouldClear(block)) {
                    this.removeBlockFromMemory(block);
                }
            }
        }
    }

    removeBlockFromMemory(block) {
        if (!block || block.memRemoved) {
            return;
        }

        if (typeof block.removeFromMemory === 'function') {
            block.removeFromMemory();
            return;
        }

        block.memRemoved = true;
        block.activated = false;
        if (block.container && typeof block.container.destroy === 'function') {
            block.container.destroy();
            block.container = null;
        }
    }

    getBlockHeight(block) {
        if (typeof block.h === 'number') {
            return block.h;
        }
        if (block.container && block.container.height) {
            return block.container.height;
        }
        return 0;
    }

    queueReload() {
        this.pendingReload = true;
        this.kill = true;
    }

    playjumpsound() {
        const main = window.jumpDieCreateMain;
        if (!main || !main.soundManager || typeof main.soundManager.playJumpSound !== 'function') {
            if (main && typeof main.playsfx === 'function') {
                main.playsfx('jump1', 0.5);
            }
            return null;
        }

        return main.soundManager.playJumpSound();
    }

    reload() {
        if (this.cleared) {
            return;
        }

        this.pendingReload = false;
        this.kill = false;
        this.ispaused = false;
        this.incrementDeathCounters();

        const restartData = this.sceneData ? { ...this.sceneData, deathcount: this.deathcount } : null;
        const currentFunction = this.curfunction;
        if (currentFunction && typeof currentFunction === 'object') {
            currentFunction.currentGame = null;
            currentFunction.currentgame = null;
        }
        this.clear();

        if (restartData) {
            this.scene.scene.restart(restartData);
        }
    }

    loadnextlevel(hitgoal) {
        if (this.cleared) {
            return;
        }

        this.pendingLevelAdvance = false;
        this.pendingLevelAdvanceHitGoal = false;
        this.ispaused = false;
        this.attachToCurrentFunction();

        const currentFunction = this.curfunction;
        if (currentFunction && typeof currentFunction === 'object') {
            currentFunction.currentGame = null;
            currentFunction.currentgame = null;
        }
        this.clear();

        if (currentFunction && typeof currentFunction.nextLevel === 'function') {
            currentFunction.nextLevel(hitgoal);
        }
    }

    incrementDeathCounters() {
        this.deathcount += 1;

        if (this.curfunction && typeof this.curfunction === 'object') {
            if (typeof this.curfunction.numDeath === 'number') {
                this.curfunction.numDeath += 1;
            }
            if (typeof this.curfunction.deathcount === 'number') {
                this.curfunction.deathcount += 1;
            }
        }
    }

    clear() {
        if (this.scene && this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.off('keydown', this.keyDownHandler);
            this.scene.input.keyboard.off('keyup', this.keyUpHandler);
        }

        this.cleared = true;

        for (const blockArray of this.blocksarrays) {
            for (const block of blockArray) {
                block.destroy();
            }
            blockArray.length = 0;
        }

        if (this.testguy && typeof this.testguy.destroy === 'function' && !this.testguy.memRemoved) {
            this.testguy.destroy();
        }
        this.testguy = null;
        this.inputstack.length = 0;
        this.currentInput = null;
        this.inputx = 0;
        this.inputy = 0;
        this.keyState.ArrowLeft = false;
        this.keyState.ArrowRight = false;
        this.keyState.ArrowUp = false;
        this.keyState.ArrowDown = false;
        this.keyState.Space = false;
        this.setDebugScrollSpeed(0);

        if (this.uiContainer) {
            this.uiContainer.destroy();
        }
        if (this.rootContainer) {
            this.rootContainer.clearMask(true);
            this.rootContainer.destroy();
        }
        if (this.scrollRectGraphics) {
            this.scrollRectGraphics.destroy();
            this.scrollRectGraphics = null;
        }
        this.scrollRectMask = null;
        this.uiContainer = null;
        this.rootContainer = null;
        this.worldContainer = null;
        this.background = null;
        if (this.scene && this.scene.gameEngine === this) {
            this.scene.gameEngine = null;
        }
    }

    static gettimet(n) {
        const min = Math.floor(n / (60 * 1000));
        const sectotal = Math.floor(n / 1000);
        const seconds = sectotal % 60;
        const ms = Math.floor(n % 1000);
        const secondText = seconds < 10 ? `0${seconds}` : `${seconds}`;
        let msText;

        if (ms < 10) {
            msText = `00${ms}`;
        } else if (ms < 100) {
            msText = `0${ms}`;
        } else {
            msText = `${ms}`;
        }

        return `${min}:${secondText}:${msText}`;
    }
}
