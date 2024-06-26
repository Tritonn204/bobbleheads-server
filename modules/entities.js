const { Entity } = require ('./entity.js');
const { Velocity, Jump, Run, Punch, RisingAttack, FallingAttack, DashAttack } = require ('./gameTraits.js');

const physics = require("./physics.js");

//Create a fighter and initialize it's global physics properties
function createChar(socket) {
    const char = new Entity(63,109);

    char.id = socket.id;
    char.socket = socket;
    char.skelWidth=180;
    char.skelHeight=180;
    char.flipX = true;

    char.isPlayer = true;

    char.spawnPoint.set(640, 0);
    char.pos.set(char.spawnPoint.x, char.spawnPoint.y);

    char.addTrait(new Velocity());
    char.addTrait(new Jump());
    char.addTrait(new Run());
    char.addTrait(new RisingAttack());
    char.addTrait(new FallingAttack());
    char.addTrait(new Punch());
    char.addTrait(new DashAttack());

    char.respawn = () => {
        const xOptions = [640,1000,1400];
        char.pos.x = xOptions[Math.floor(Math.random() * 3)];
        char.pos.y = 0;
        char.hp = char.baseHP;
    }

    return char;
}

module.exports = { createChar };
