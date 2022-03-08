import { Entity } from './entity.js';
import { Velocity, Jump, Run } from './gameTraits.js';
import { loadPlayer } from './assets.js';
const tileUtil = require("./tileutil.js");

//Create a fighter entity, load it's visual assets, and initialize it's global physics properties
export function createChar(index) {
    return loadPlayer(index)
    .then(sprites => {
        const char = new Entity(63,109);

        char.spawnPoint.set(640, 0);
        char.pos.set(char.spawnPoint.x, char.spawnPoint.y);

        char.addTrait(new Velocity());
        char.addTrait(new Jump());
        char.addTrait(new Run());

        char.draw = (scale, cam) => {
            return tileUtil.draw('idle', sprites, cam, char.pos.x, char.pos.y, scale);
        }

        return char;
    });
}
