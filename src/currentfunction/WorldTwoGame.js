import { MUSIC } from '../Constants.js';
import TutorialGame from './TutorialGame.js';

export default class WorldTwoGame extends TutorialGame {
    constructor(main) {
        super(main, { name: 'World 2', world: 2 });
    }

    getsong() {
        if (this.clvl === 7 || this.clvl === 11) {
            this.main.playSpecific(MUSIC.BOSSSONG);
        } else {
            this.main.playSpecific(MUSIC.SONG2);
        }
    }

    playWinSound() {
        if (this.clvl === 7 || this.clvl === 11) {
            this.main.playSpecific(MUSIC.BOSSENDSONG, false);
        } else {
            this.main.playSpecific(MUSIC.SONG2END, false);
        }
    }
}
