import { Vec2 } from './util.js';

export class Trait {
    constructor(name) {
        this.NAME = name;
    }

    update() {
        console.warn('Unhandled update call in Trait');
    }
}

export class Entity {
    constructor() {
        this.pos = new Vec2(0,0);
        this.vel = new Vec2(0,0);

        this.traits = [];
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
