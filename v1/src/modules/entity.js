import { Vec2 } from './util.js';
const physics = require('./physics.js');

export class Trait {
    constructor(name) {
        this.NAME = name;
    }

    update() {
        console.warn('Unhandled update call in Trait');
    }
}

export class Entity {
    constructor(width=0, height=0) {
        this.pos = new Vec2(0,0);
        this.vel = new Vec2(0,0);

        this.width = width;
        this.height = height;

        this.traits = [];
        this.isGrounded = false;
    }

    addTrait(trait) {
        this.traits.push(trait);
        this[trait.NAME] = trait;
    }

    update(delta) {
        this.traits.forEach(trait => {
            trait.update(this, delta);
        });
    }
}
