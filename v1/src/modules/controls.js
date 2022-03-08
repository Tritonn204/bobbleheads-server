const physics = require('./physics.js');

//Javascript key codes
const SPACE = 32;
const W = 87;
const A = 65;
const S = 83;
const D = 68;

export function bindKeys(player, keyboard, window) {
    keyboard.addMapping(SPACE, keyState => {
        if (keyState && player.isGrounded && player.vel.y < physics.jumpTolerance) {
            player.jump.start();
            player.isGrounded = false;
        } else {
            player.jump.cancel();
        }
    });

    keyboard.addMapping(W, keyState => {
        if (keyState) {
            player.pos.set(player.spawnPoint.x,player.spawnPoint.y);
            player.vel.set(0,0);
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
