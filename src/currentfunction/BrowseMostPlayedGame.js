import RandomOnlineGame from './RandomOnlineGame.js';

export default class BrowseMostPlayedGame extends RandomOnlineGame {
    constructor(main, noload = false) {
        super(main);
        this.currentoffset = 0;
        this.selectionarray = [];
        this.KILL = false;
        if (!noload) {
            this.loaddisplay();
        }
    }

    loaddisplay() {
        this.clearObjects();
        this.makeloadbg('Most-played online browser is stubbed until local campaign parity is stable.');
    }

    addURLParam(a) {
        return a;
    }

    getXMLListURL() {
        return `${this.main.constructor.ONLINE_DB_URL}getmostplayed.php`;
    }

    getSelectionDisplayMode() {
        return false;
    }
}
