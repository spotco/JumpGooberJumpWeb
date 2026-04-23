// SaveManager.js - SharedObject-compatible localStorage wrapper.

export default class SaveManager {
    constructor(key) {
        this.key = key;
        this.data = this._load();
    }

    verifysave(levelsUnlocked = false) {
        const defaultLevel = levelsUnlocked ? 12 : 1;
        if (this.data.world1 == null) {
            this.data.world1 = defaultLevel;
        }
        if (this.data.world2 == null) {
            this.data.world2 = defaultLevel;
        }
        if (this.data.world3 == null) {
            this.data.world3 = defaultLevel;
        }
        this.flush();
    }

    flush() {
        try {
            window.localStorage.setItem(this.key, JSON.stringify(this.data));
        } catch (error) {
            console.warn('Unable to persist Jump Goober Jump save data.', error);
        }
    }

    _load() {
        try {
            const raw = window.localStorage.getItem(this.key);
            if (!raw) {
                return {};
            }
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (error) {
            console.warn('Unable to read Jump Goober Jump save data.', error);
            return {};
        }
    }
}
