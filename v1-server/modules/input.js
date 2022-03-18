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

function input(player, socket) {
    socket.on('jump', keyState => {
        if (keyState && player.isGrounded && player.vel.y < physics.jumpTolerance) {
            player.jump.start();
            player.isGrounded = false;
        } else {
            player.jump.cancel();
        }
    });

    socket.on('respawn', keyState => {
         if (keyState) {
             player.pos.x = 640;
             player.pos.y = 0;
             player.vel.x = 0;
             player.vel.y = 0;
         }
    });

    socket.on('crouch', keyState => {
        if (keyState == 1) {
            player.crouching = true;
        } else {
            player.crouching = false;
        }
    });

    socket.on('punch', keyState => {
        if (keyState) {
            player.punch.advance();
        }
    });

    socket.on('guard', keyState => {
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

module.exports = input;
