import CurrentFunction from './CurrentFunction.js';
import JumpDieCreateMenu from './JumpDieCreateMenu.js';

export default class SimpleGame extends CurrentFunction {
    constructor(main, xml, name) {
        super(main);
        this.currentgame = null;
        this.xml = xml;
        this.lname = name;
    }

    destroy() {
        this.currentgame = null;
        if (!this.main.suppressMenuRecreate) {
            this.main.curfunction = new JumpDieCreateMenu(this.main);
        }
    }

    startLevel() {
        this.scene.scene.start('GameScene', {
            mode: null,
            world: -1,
            level: 1,
            clvlxml: this.xml,
            name: this.lname,
            currentfunction: 'SimpleGame',
        });
    }

    nextLevel(hitgoal) {
        this.destroy();
    }
}
