import { Entity } from './entity.js';
import { Velocity, Jump, Run, Punch, HPBar } from './gameTraits.js';
import { Spine } from 'pixi-spine';
import { loadPlayer } from './assets.js';

const tileUtil = require("./tileutil.js");
const physics = require("./physics.js");

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
        char.addTrait(new Punch());
        char.addTrait(new HPBar());

        char.render = (cam) => {
            char.hpBar.render(char, cam);
            return tileUtil.drawSpine(char, 'Idle Left', cam, char.pos.x, char.pos.y);
        }

        char.animate = () => {
            const movementX = Math.abs(char.vel.x);
            const playing = char.currentAnimation;
            const running = char.run.speed*0.99;

            if (char.hurtTime < physics.hitCooldown ){
                const anim = (char.hitSource == char.facing ? "Hurt B" : "Hurt A");
                if (playing != anim){
                    char.skeleton.state.setAnimation(0, anim, false);
                    char.currentAnimation = anim;
                }
                return;
            }
            if (char.punch) {
                if (char.punch.active) {
                    if (char.punch.queued){
                        char.punch.queued = false;
                        const anim = char.punch.animationNames[char.punch.index];
                        if (playing != anim){
                            char.skeleton.state.setAnimation(0,anim,false);
                            char.currentAnimation = anim;
                        }
                    }
                    return;
                }
            }
            if (char.guard && Math.abs(char.vel.x) <= 10) {
                if (playing != "Guard"){
                    char.skeleton.state.setAnimation(0,"Guard",false);
                    char.currentAnimation = "Guard";
                }
            }else if (char.isGrounded && char.vel.y == 0){
                if (char.crouching){
                    if (playing != "Crouch"){
                        char.skeleton.state.setAnimation(0,"Crouch",true);
                        char.currentAnimation = "Crouch";
                    }
                } else {
                    if (movementX <= 10 && playing != "Idle"){
                        char.skeleton.state.setAnimation(0,"Idle",true);
                        char.currentAnimation = "Idle";
                    }
                    else if(char.run){
                        if (char.guard){
                            if (movementX > 10 && playing != "Walk Guard"){
                                char.skeleton.state.setAnimation(0,"Walk Guard",true);
                                char.currentAnimation = "Walk Guard";
                            }
                        }
                        else if (movementX > 10 && movementX < running && playing != "Walk"){
                            char.skeleton.state.setAnimation(0,"Walk",true);
                            char.currentAnimation = "Walk";
                        }
                        else if (movementX >= running && playing != "Run"){
                            char.skeleton.state.setAnimation(0,"Run",true);
                            char.currentAnimation = "Run";
                        }
                    }
                }
            } else {
                if (playing != "Jump"){
                    char.skeleton.state.setAnimation(0,"Jump",false);
                    char.currentAnimation = "Jump";
                }
            }
        }

        return char;
    });
}
