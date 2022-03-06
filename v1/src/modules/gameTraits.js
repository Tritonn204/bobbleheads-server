import { Trait } from './entity.js';
const physics = require("./physics.js");

export class Velocity extends Trait {
    constructor() {
        super('velocity');
    }

    update() {

    }
}

export class Run extends Trait {
    constructor() {
        super('run');

        this.dir = 0;
        this.acc = 3000;
        this.speed = 650;
    }

    update(entity, delta) {
        if (entity.run.dir != 0){
            if (Math.abs(entity.vel.x) < this.speed){
                 entity.vel.x += this.acc * delta * entity.run.dir;
            }
            else
                entity.vel.x = this.speed*entity.run.dir;
        } else {
            entity.vel.x *= 0.6 / (1-delta);
        }
    }
}

export class Jump extends Trait {
    constructor() {
        super('jump');

        this.duration = 0.15;
        this.velocity = 720;
        this.engageTime = 0;
    }

    start() {
        this.engageTime = this.duration;
    }

    cancel() {
        this.engageTime = 0;
    }

    update(entity, delta) {
        if (this.engageTime > 0) {
            entity.vel.y = -this.velocity;
            this.engageTime -= delta;
        }
    }
}
