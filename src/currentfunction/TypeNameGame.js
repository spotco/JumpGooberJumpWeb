import RandomOnlineGame from './RandomOnlineGame.js';

export default class TypeNameGame extends RandomOnlineGame {
    constructor(main) {
        super(main);
        this.promptnew();
    }

    promptnew() {
        this.clearObjects();
        this.makeloadbg('Specific level lookup is stubbed until online service behavior is ported.');
    }
}
