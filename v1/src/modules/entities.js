import { Entity } from './entity.js';
import { Velocity, Jump, Run } from './gameTraits.js';
import { loadPlayer } from './assets.js';
const tileUtil = require("./tileutil.js");

//Create a fighter entity, load it's visual assets, and initialize it's global physics properties
export function createChar(index) {
    return loadPlayer(index)
    .then(sprites => {
        const char = new Entity(100,160);

        char.addTrait(new Velocity());
        char.addTrait(new Jump());
        char.addTrait(new Run());

        char.draw = () => {
            return tileUtil.draw('idle', sprites, char.pos.x, char.pos.y);
        }

        return char;
    });
}
