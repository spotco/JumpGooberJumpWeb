import BrowseMostPlayedGame from './BrowseMostPlayedGame.js';

export default class BrowseMostRecentGame extends BrowseMostPlayedGame {
    getXMLListURL() {
        return `${this.main.constructor.ONLINE_DB_URL}getrecent.php`;
    }

    getSelectionDisplayMode() {
        return true;
    }
}
