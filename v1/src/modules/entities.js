import { Entity } from './entity.js';
import { Velocity, Jump, Run } from './gameTraits.js';
import { Spine } from 'pixi-spine';
import { loadPlayer } from './assets.js';
const tileUtil = require("./tileutil.js");

//Create a fighter entity, load it's visual assets, and initialize it's global physics properties
export function createChar(index) {
    return loadPlayer(index)
    .then(sprites => {
        const char = new Entity(63,109);

        char.skelWidth=180;
        char.skelHeight=180;
        char.flipX = true;

        char.spawnPoint.set(640, 0);
        char.pos.set(char.spawnPoint.x, char.spawnPoint.y);

        char.addTrait(new Velocity());
        char.addTrait(new Jump());
        char.addTrait(new Run());

        char.render = (cam) => {
            return tileUtil.drawSpine(char, 'Idle Left', cam, char.pos.x, char.pos.y);
        }

        char.animate = () => {
            const movementX = Math.abs(char.vel.x);
            const playing = char.currentAnimation;
            const running = char.run.speed*0.98;

            if (movementX <= 10 && playing != "Idle Left"){
                char.skeleton.state.setAnimation(0,"Idle Left",true);
                char.currentAnimation = "Idle Left";
            }
            else if(char.run){
                if (movementX > 10 && movementX < running && playing != "Walk Left"){
                    char.skeleton.state.setAnimation(0,"Walk Left",true);
                    char.currentAnimation = "Walk Left";
                }
                if (movementX >= running && playing != "Run Left"){
                    char.skeleton.state.setAnimation(0,"Run Left",true);
                    char.currentAnimation = "Run Left";
                }
            }
        }

        return char;
    });
}
