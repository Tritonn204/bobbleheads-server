import { Vec2 } from './util.js';
const physics = require('./physics.js');

export class Trait {
    constructor(name) {
        this.NAME = name;
    }

    update() {
        console.warn('Unhandled update call in Trait');
    }
}

export class Entity {
    constructor(width=0, height=0) {
        this.pos = new Vec2(0,0);
        this.spawnPoint = new Vec2(0,0);
        this.vel = new Vec2(0,0);

        this.width = width;
        this.height = height;

        this.skelWidth = width;
        this.skelHeight = height;

        this.turnTime = 0.05;

        this.skelDir = 1;
        this.facing = 1;

        this.flipX = false;

        this.traits = [];
        this.isGrounded = false;

        this.skeleton = null;
        this.currentAnimation = '';
    }

    addTrait(trait) {
        this.traits.push(trait);
        this[trait.NAME] = trait;
    }

    update(delta) {
        this.traits.forEach(trait => {
            trait.update(this, delta);
        });

        this.animate(delta);
        this.getDirection(delta);
    }

    getDirection(delta) {
        if (this.run && this.run.dir < 0){
            this.facing = -1;
        }
        if (this.run && this.run.dir > 0){
            this.facing = 1;
        }
        if (this.facing < 0)
            if (this.skelDir > -1){
                this.skelDir -= delta/ this.turnTime;
            }

        if (this.facing > 0)
            if (this.skelDir < 1){
                this.skelDir += delta/ this.turnTime;
            }
        this.skelDir = Math.min(Math.max(this.skelDir, -1), 1);
    }
}
