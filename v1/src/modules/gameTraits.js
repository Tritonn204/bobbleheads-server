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
        this.acc = 450;
        this.speed = 650;
    }

    update(entity, delta) {
        if (entity.run.dir != 0){
            let accSpd = entity.vel.x + this.acc * delta * entity.run.dir;

            if ((entity.run.dir > 0 && accSpd < 0) || (entity.run.dir < 0 && accSpd > 0))
                accSpd = entity.vel.x * (entity.isGrounded ? 0.6 : 0.85) / (1-delta);
            if (accSpd > this.speed)
                accSpd = this.speed;
            if (accSpd < -this.speed)
                accSpd = -this.speed;

            entity.vel.x = accSpd;
        } else {
            entity.vel.x *= (entity.isGrounded ? 0.6 : 0.925) / (1-delta);
        }
    }
}

export class Jump extends Trait {
    constructor() {
        super('jump');

        this.duration = 0.25;
        this.velocity = 580;
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
