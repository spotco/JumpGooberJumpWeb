// GameEngine.js - First Phaser runtime skeleton.
// Mirrors core/GameEngine.as.

import LevelXmlParser from './LevelXmlParser.js';
import Wall from './blocks/Wall.js';
import Goal from './blocks/Goal.js';
import Textdisplay from './blocks/Textdisplay.js';

export default class GameEngine {
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
        this.blocksarrays = [
            this.walls,
            this.goals,
            this.deathwall,
            this.boostlist,
            this.textdisplays,
            this.boostfruits,
            this.tracks,
            this.particles,
        ];

        this.currenty = 0;
        this.bg_y = -940;
        this.game_time = 0;
        this.prev_time = 0;
        this.kill = false;
        this.debugScrollSpeed = 0;
        this.parser = new LevelXmlParser();

        this.rootContainer = scene.add.container(0, 0);
        this.background = scene.add.image(0, this.bg_y, 'bg1').setOrigin(0, 0);
        this.worldContainer = scene.add.container(0, 0);
        this.rootContainer.add([this.background, this.worldContainer]);

        this.loadfromXML(this.clvlxml);
        this.makeui();
    }

    loadfromXML(clvlxml) {
        const parsedLevel = this.parser.parse(clvlxml);
        this.levelData = parsedLevel;
        this.displayname = parsedLevel.name;

        if (parsedLevel.unsupported.length > 0) {
            console.warn('Unsupported level XML nodes:', parsedLevel.unsupported.map((record) => record.type));
        }

        for (const record of parsedLevel.objects) {
            if (record.type === 'wall') {
                const wall = new Wall(this.scene, this.worldContainer, record.x, record.y, record.width, record.height);
                this.walls.push(wall);
            }
        }

        for (const record of parsedLevel.objects) {
            if (record.type === 'goal') {
                const goal = new Goal(this.scene, this.worldContainer, record.x, record.y, record.width, record.height);
                this.goals.push(goal);
            }
        }

        for (const record of parsedLevel.objects) {
            if (record.type === 'textfield') {
                const textdisplay = new Textdisplay(this.scene, this.worldContainer, record.x, record.y, record.text);
                this.textdisplays.push(textdisplay);
            }
        }
    }

    makeui() {
        this.uiContainer = this.scene.add.container(0, 0);
        this.leveldisplay = this.scene.add.text(2, 504, this.displayname, {
            fontFamily: 'Bienvenu, Arial, sans-serif',
            fontSize: '10px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
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

        this.uiContainer.add([this.leveldisplay, this.toprighttext, this.helptext]);
    }

    update(_time, delta) {
        this.game_time += delta;
        this.toprighttext.text = `TIME: ${GameEngine.gettimet(this.game_time)}\nDEATHS:${this.deathcount}`;

        if (this.debugScrollSpeed !== 0) {
            this.gameScroll(this.debugScrollSpeed);
        }

        for (const blockArray of this.blocksarrays) {
            for (const block of blockArray) {
                if (block.activated) {
                    block.update(this);
                }
            }
        }
    }

    gameScroll(scroll_spd) {
        for (const blockArray of this.blocksarrays) {
            for (const block of blockArray) {
                block.gameScroll(scroll_spd);
            }
        }

        this.currenty += scroll_spd;
        this.bg_y = Math.min(0, this.bg_y + scroll_spd / 3);
        this.background.y = this.bg_y;
    }

    setDebugScrollSpeed(scrollSpeed) {
        this.debugScrollSpeed = scrollSpeed;
    }

    clear() {
        for (const blockArray of this.blocksarrays) {
            for (const block of blockArray) {
                block.destroy();
            }
            blockArray.length = 0;
        }

        if (this.uiContainer) {
            this.uiContainer.destroy();
        }
        if (this.rootContainer) {
            this.rootContainer.destroy();
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
