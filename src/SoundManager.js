// SoundManager.js - Source-mapped audio IDs and SFX helpers.

import { MUSIC } from './Constants.js';

export const MUSIC_KEYS = {
    [MUSIC.LEVELEDITOR_MUSIC]: 'leveleditor_music',
    [MUSIC.MENU_MUSIC]: 'menu_music',
    [MUSIC.SONG1]: 'song1',
    [MUSIC.SONG1END]: 'song1end',
    [MUSIC.SONG2]: 'song2',
    [MUSIC.SONG2END]: 'song2end',
    [MUSIC.SONG3]: 'song3',
    [MUSIC.SONG3END]: 'song3end',
    [MUSIC.SONG4]: null,
    [MUSIC.BOSSSONG]: 'boss',
    [MUSIC.BOSSENDSONG]: 'bossend',
    [MUSIC.ONLINE]: 'online',
    [MUSIC.ONLINEEND]: 'onlineend',
};

export const SFX_KEYS = {
    explode: 'explode',
    cheer: 'cheer',
    wow: 'wow',
    fruit: 'fruit',
    thunder: 'thunder',
    jump1: 'jump1',
    jump2: 'jump2',
    jump3: 'jump3',
    jump4: 'jump4',
    fall: 'fall',
    rocketexplode: 'rocketexplode',
    shoot: 'shoot',
    boost: 'boost',
    rocketboss: 'rocketboss',
    rocketbossdie: 'rocketbossdie',
    pause: 'pause',
    unpause: 'unpause',
};

export default class SoundManager {
    constructor(scene = null) {
        this.scene = scene;
        this.currentMusic = null;
        this.currentMusicId = null;
        this.soundcount = 1;
        this.prevJumpTime = 0;
        this.muted = false;
    }

    setScene(scene) {
        this.scene = scene;
    }

    setMute(muted) {
        this.muted = muted;
        if (this.currentMusic) {
            this.currentMusic.setMute(muted);
        }
    }

    playSpecific(tar, repeat = true) {
        this.stop();
        const key = MUSIC_KEYS[tar];
        this.currentMusicId = tar;
        if (!key) {
            console.warn(`No Phaser audio key mapped for music id ${tar}.`);
            return null;
        }
        if (!this._canPlay(key)) {
            return null;
        }
        this.currentMusic = this.scene.sound.add(key, {
            loop: repeat,
            volume: this.muted ? 0 : 1,
        });
        this.currentMusic.play();
        return this.currentMusic;
    }

    stop() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic.destroy();
            this.currentMusic = null;
        }
    }

    playsfx(s, t = 1) {
        if (this.muted) {
            return null;
        }
        const key = SFX_KEYS[s] || s;
        if (!this._canPlay(key)) {
            return null;
        }
        const volume = typeof t === 'object' && t !== null ? t.volume : t;
        return this.scene.sound.play(key, { volume });
    }

    playJumpSound() {
        const now = Date.now();
        const diftime = now - this.prevJumpTime;
        this.prevJumpTime = now;
        if (diftime < 600) {
            this.soundcount += 1;
        } else {
            this.soundcount = 1;
        }
        const key = `jump${Math.min(this.soundcount, 4)}`;
        return this.playsfx(key, { volume: 0.5 });
    }

    soundfadein() {
        if (!this.currentMusic || this.muted) {
            return;
        }
        const nextVolume = Math.min(1, this.currentMusic.volume + 0.03);
        this.currentMusic.setVolume(nextVolume);
    }

    _canPlay(key) {
        if (!this.scene || !this.scene.sound || !this.scene.cache) {
            return false;
        }
        if (!this.scene.cache.audio || !this.scene.cache.audio.exists(key)) {
            console.warn(`Audio asset "${key}" is not loaded.`);
            return false;
        }
        return true;
    }
}
