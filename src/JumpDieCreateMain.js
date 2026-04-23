// JumpDieCreateMain.js - Runtime owner port of JumpDieCreateMain.as.

import { FLAGS, MODES, MUSIC, SAVE_KEY, TEXT_FORMAT_TYPES } from './Constants.js';
import SaveManager from './SaveManager.js';
import SoundManager from './SoundManager.js';
import RankData from './misc/RankData.js';
import JumpDieCreateMenu from './currentfunction/JumpDieCreateMenu.js';
import TutorialGame from './currentfunction/TutorialGame.js';
import WorldTwoGame from './currentfunction/WorldTwoGame.js';
import WorldThreeGame from './currentfunction/WorldThreeGame.js';
import SpecialGame from './currentfunction/SpecialGame.js';
import LevelEditor from './currentfunction/LevelEditor.js';
import RandomOnlineGame from './currentfunction/RandomOnlineGame.js';
import BrowseMostPlayedGame from './currentfunction/BrowseMostPlayedGame.js';
import BrowseMostRecentGame from './currentfunction/BrowseMostRecentGame.js';
import BrowseSpecificGame from './currentfunction/BrowseSpecificGame.js';

const ROUTES = {
    [MODES.WORLD1]: TutorialGame,
    [MODES.LEVELEDITOR]: LevelEditor,
    [MODES.RANDOMONLINE]: RandomOnlineGame,
    [MODES.WORLD2]: WorldTwoGame,
    [MODES.WORLD3]: WorldThreeGame,
    [MODES.MOSTPLAYEDONLINE]: BrowseMostPlayedGame,
    [MODES.NEWESTONLINE]: BrowseMostRecentGame,
    [MODES.SPECIFICONLINE]: BrowseSpecificGame,
    [MODES.WORLD_SPECIAL]: SpecialGame,
};

export default class JumpDieCreateMain {
    constructor(scene = null) {
        this.sc = null;
        this.scene = scene;
        this.curfunction = null;
        this.mute = FLAGS.IS_MUTED;
        this.cstage = scene;
        this.localdata = new SaveManager(SAVE_KEY);
        this.rankdata = null;
        this.soundManager = new SoundManager(scene);
        this.mochimanager = null;
        this.pmenufix = false;

        this.initrankdata();
        this.verifysave();
        this.soundManager.setMute(this.mute);
    }

    setScene(scene) {
        this.scene = scene;
        this.cstage = scene;
        this.soundManager.setScene(scene);
    }

    verifysave() {
        this.localdata.verifysave(FLAGS.LEVELS_UNLOCKED);
    }

    menuStart(menupos) {
        if (this.curfunction && typeof this.curfunction.destroy === 'function') {
            this.curfunction.destroy();
        }
        this.currentMode = menupos;

        if (
            menupos !== MODES.WORLD1
            && menupos !== MODES.WORLD2
            && menupos !== MODES.WORLD3
            && menupos !== MODES.RANDOMONLINE
            && menupos !== MODES.SPECIFICONLINE
            && menupos !== MODES.WORLD_SPECIAL
        ) {
            this.stop();
        }

        const route = ROUTES[menupos];
        if (!route) {
            return null;
        }

        this.curfunction = new route(this);
        return this.curfunction;
    }

    showMenu() {
        if (this.curfunction && typeof this.curfunction.destroy === 'function') {
            this.suppressMenuRecreate = true;
            this.curfunction.destroy();
            this.suppressMenuRecreate = false;
            this.curfunction = null;
        }
        this.curfunction = new JumpDieCreateMenu(this);
        return this.curfunction;
    }

    clearDisplay(target = this.scene) {
        if (!target) {
            return;
        }
        if (target.children && typeof target.children.removeAll === 'function') {
            target.children.removeAll(true);
            return;
        }
        if (target.list && Array.isArray(target.list)) {
            for (const child of [...target.list]) {
                if (child && typeof child.destroy === 'function') {
                    child.destroy();
                }
            }
        }
    }

    getChecksum(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i += 1) {
            sum += a.charCodeAt(i);
        }
        return sum % b;
    }

    playSpecific(tar, repeat = true) {
        if (tar === MUSIC.MENU_MUSIC) {
            if (this.pmenufix) {
                return null;
            }
            this.pmenufix = true;
        } else {
            this.pmenufix = false;
        }
        this.soundManager.setMute(this.mute);
        return this.soundManager.playSpecific(tar, repeat);
    }

    stop() {
        this.soundManager.stop();
    }

    playsfx(s, t = 1) {
        this.soundManager.setMute(this.mute);
        return this.soundManager.playsfx(s, t);
    }

    getTextFormat(size, type = TEXT_FORMAT_TYPES.GAME) {
        return {
            fontFamily: type === TEXT_FORMAT_TYPES.MENU ? 'Menu' : 'Game',
            fontSize: `${size}px`,
            color: '#000000',
        };
    }

    initrankdata() {
        this.rankdata = RankData.initrankdata();
        return this.rankdata;
    }

    setMute(muted) {
        this.mute = muted;
        FLAGS.IS_MUTED = muted;
        JumpDieCreateMain.IS_MUTED = muted;
        this.soundManager.setMute(muted);
    }
}

Object.assign(JumpDieCreateMain, MODES, MUSIC, {
    MOCHI_ENABLED: FLAGS.MOCHI_ENABLED,
    ONLINE_DB_URL: FLAGS.ONLINE_DB_URL,
    HAS_CHALLENGE_LEVELS: FLAGS.HAS_CHALLENGE_LEVELS,
    IS_MUTED: FLAGS.IS_MUTED,
    CONTEST_MODE: FLAGS.CONTEST_MODE,
    LEVELS_UNLOCKED: FLAGS.LEVELS_UNLOCKED,
    explodesound: 'explode',
    cheersound: 'cheer',
    wowsound: 'wow',
    fruitsound: 'fruit',
    thundersound: 'thunder',
    jump1sound: 'jump1',
    jump2sound: 'jump2',
    jump3sound: 'jump3',
    jump4sound: 'jump4',
    fallsound: 'fall',
    rocketexplodesound: 'rocketexplode',
    shootsound: 'shoot',
    boostsound: 'boost',
    rocketbosssound: 'rocketboss',
    rocketbossdiesound: 'rocketbossdie',
    pausesound: 'pause',
    unpausesound: 'unpause',
});
