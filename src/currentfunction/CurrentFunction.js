// CurrentFunction.js - Base class port of currentfunction/CurrentFunction.as.

export default class CurrentFunction {
    constructor(main) {
        this.main = main;
        this.scene = main ? main.scene : null;
        this.numDeath = 0;
        this.starttime = null;
        this.overallstarttime = null;
        this.objects = [];
    }

    destroy() {}

    startLevel() {}

    nextLevel(hitgoal) {}

    add(object) {
        this.objects.push(object);
        return object;
    }

    clearObjects() {
        for (const object of this.objects) {
            if (object && typeof object.destroy === 'function') {
                object.destroy();
            }
        }
        this.objects = [];
    }
}
