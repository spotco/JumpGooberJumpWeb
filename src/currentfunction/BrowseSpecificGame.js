import BrowseMostPlayedGame from './BrowseMostPlayedGame.js';

export default class BrowseSpecificGame extends BrowseMostPlayedGame {
    constructor(main) {
        super(main, true);
        this.searchquery = '';
        this.prompt();
    }

    prompt() {
        this.clearObjects();
        this.makeloadbg('Please enter a name or partial name to search for.');
        this.entryfield = this.add(this.scene.add.text(120, 190, '[text input stub]', this.main.getTextFormat(18)));
    }

    getXMLListURL() {
        return `${this.main.constructor.ONLINE_DB_URL}getbyname.php`;
    }

    addURLParam(a) {
        a.targetname = this.searchquery;
        return a;
    }

    getSelectionDisplayMode() {
        return true;
    }
}
