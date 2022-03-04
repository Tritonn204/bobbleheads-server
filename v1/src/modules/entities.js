import { Entity, Trait } from './entity.js';
import { loadPlayer } from './assets.js';
const physics = require("./physics.js");

class Velocity extends Trait {
    constructor() {
        super('velocity');
    }

    update(entity, delta) {
        entity.pos.x += entity.vel.x*delta
        entity.pos.y += entity.vel.y*delta;
    }
}

//Create a fighter entity, load it's visual assets, and initialize it's global physics properties
export function createChar(index) {
    return loadPlayer(index)
    .then(sprites => {
        const char = new Entity();

        char.addTrait(new Velocity());

        char.draw = function drawChar(context) {
            sprites.draw('idle',context,this.pos.x, this.pos.y);
        }

        return char;
    });
}
