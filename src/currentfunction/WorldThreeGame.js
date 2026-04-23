import { MUSIC } from '../Constants.js';
import TutorialGame from './TutorialGame.js';

export default class WorldThreeGame extends TutorialGame {
    constructor(main) {
        super(main, { name: 'World 3', world: 3 });
    }

    getsong() {
        if (this.clvl === 5 || this.clvl === 9 || this.clvl === 11) {
            this.main.playSpecific(MUSIC.BOSSSONG);
        } else {
            this.main.playSpecific(MUSIC.SONG3);
        }
    }

    playWinSound() {
        if (this.clvl === 5 || this.clvl === 9 || this.clvl === 11) {
            this.main.playSpecific(MUSIC.BOSSENDSONG, false);
        } else {
            this.main.playSpecific(MUSIC.SONG3END, false);
        }
    }
}
