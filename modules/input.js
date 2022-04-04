const physics = require('./physics.js');

//Javascript key codes
const SPACE = 32;
const W = 87;
const A = 65;
const S = 83;
const D = 68;
const RIGHT = 39;
const LEFT = 37;
const DOWN = 40;
const UP = 38;

const playerInputs = {};

function input(player, socket) {
    playerInputs[socket.userData.wallet] = {};

    socket.on('jump', keyState => {
        playerInputs[socket.userData.wallet]['jump'] = keyState;
        if (keyState) {
            player.jump.start();
            player.isGrounded = false;
        } else {
            player.jump.cancel();
        }
    });

    socket.on('respawn', keyState => {
        playerInputs[socket.userData.wallet]['respawn'] = keyState;
         if (keyState) {
             // player.pos.x = 640;
             // player.pos.y = 0;
             // player.vel.x = 0;
             // player.vel.y = 0;
         }
    });

    socket.on('crouch', keyState => {
        playerInputs[socket.userData.wallet]['crouch'] = keyState;
        if (keyState == 1) {
            player.crouching = true;
        } else {
            player.crouching = false;
        }
    });

    socket.on('dashAttack', keyState => {
        if (keyState) {
            if (player.run.dir != 0) {
                player.dashAttack.start(player.run.dir);
            }
        }
    });

    socket.on('fallingAttack', keyState => {
        if (keyState) {
            player.fallingAttack.start();
        }
    });

    socket.on('risingAttack', keyState => {
        if (keyState) {
            player.risingAttack.start();
        }
    });

    socket.on('punch', keyState => {
        playerInputs[socket.userData.wallet]['punch'] = keyState;
        if (keyState) {
            if (player.run.dir != 0) {
                player.dashAttack.start(player.run.dir);
            } else if (playerInputs[socket.userData.wallet]['jump'] == 1) {
                player.risingAttack.start();
            } else if (playerInputs[socket.userData.wallet]['crouch'] == 1) {
                player.fallingAttack.start();
            } else {
                player.punch.advance();
            }
        }
    });

    socket.on('guard', keyState => {
        playerInputs[socket.userData.wallet]['guard'] = keyState;
        if (keyState == 1) {
            player.guard = true;
        } else {
            player.guard = false;
        }
    });

    socket.on('move right', keyState => {
        player.run.dir += keyState ? 1 : -1;
    });
    socket.on('move left', keyState => {
        player.run.dir += keyState ? -1 : 1;
    });
}

function clear(player, socket) {
    player.run.dir = 0;
    player.jump.cancel();
}

module.exports = {input, clear};
