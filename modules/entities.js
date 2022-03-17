const { Entity } = require ('./entity.js');
const { Velocity, Jump, Run, Punch } = require ('./gameTraits.js');

const physics = require("./physics.js");

//Create a fighter and initialize it's global physics properties
function createChar(id) {
    const char = new Entity(63,109);

    char.id = id;
    char.skelWidth=180;
    char.skelHeight=180;
    char.flipX = true;

    char.spawnPoint.set(640, 0);
    char.pos.set(char.spawnPoint.x, char.spawnPoint.y);

    char.addTrait(new Velocity());
    char.addTrait(new Jump());
    char.addTrait(new Run());
    char.addTrait(new Punch());

    return char;
}

module.exports = { createChar };
