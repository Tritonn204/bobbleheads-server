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

export function handleKeys(socket) {
    keyboard.addMapping(W, keyState => {
        socket.on('jump', data => {
            if (data == 'start'){
                player.jump.start();
                player.isGrounded = false;
            }
            if (data == 'end'){
                player.jump.cancel();
            }
        })
    });

    keyboard.addMapping(SPACE, keyState => {
        if (keyState) {
            player.pos.set(player.spawnPoint.x,player.spawnPoint.y);
            player.vel.set(0,0);
        }
    });

    keyboard.addMapping(S, keyState => {
        if (keyState == 1) {
            player.crouching = true;
        } else {
            player.crouching = false;
        }
    });

    keyboard.addMapping(RIGHT, keyState => {
        if (keyState) {
            player.punch.advance();
        }
    });

    keyboard.addMapping(DOWN, keyState => {
        if (keyState == 1) {
            player.guard = true;
        } else {
            player.guard = false;
        }
    });

    keyboard.addMapping(D, keyState => {
        player.run.dir += keyState ? 1 : -1;
    });

    keyboard.addMapping(A, keyState => {
        player.run.dir += keyState ? -1 : 1;
    });

    keyboard.listenTo(window);
}
