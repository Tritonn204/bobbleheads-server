const { Vec2, angleFromPoints, angleToVel } = require('./util.js');
const physics = require('./physics.js');

class Trait {
    constructor(name) {
        this.NAME = name;
    }

    update() {
        console.warn('Unhandled update call in Trait');
    }
}

class Entity {
    constructor(width=0, height=0) {
        this.walletID = Math.floor(Math.random()*16777215).toString(16);
        this.pos = new Vec2(0,0);
        this.spawnPoint = new Vec2(0,0);
        this.vel = new Vec2(0,0);

        this.bounds = new physics.BoundingBox(this.pos, new Vec2(width, height), new Vec2(0,0));
        this.attackBounds = new physics.BoundingBox(new Vec2(-width,-height), new Vec2(width*1.25, height), new Vec2(width*1.25,0));

        this.width = width;
        this.height = height;

        this.skelWidth = width;
        this.skelHeight = height;

        this.baseHP = 1000;
        this.hp = this.baseHP;

        this.hurtTime = 0;

        this.turnTime = 0.05;

        this.skelDir = 1;
        this.facing = 1;
        this.hitSource = 1;

        this.guard = false;
        this.ragdoll = false;

        this.flipX = false;
        this.crouching = false;

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
        if (this.isGrounded && this.vel.y == 0)
            this.ragdoll = false;

        this.bounds.pos = this.pos;
        this.hurtTime += delta;

        this.attackBounds.pos.set(-1000,0);
        this.traits.forEach(trait => {
            trait.update(this, delta);
        });

        this.getDirection(delta);
        this.hp = Math.max(this.hp,0);

        if (this.hp == 0) {
            this.respawn();
        }
    }

    collides(cantidate) {

    }

    hit(cantidate) {
        switch(this.attackType) {
            case 'punch':
                const dir = cantidate.pos.x > this.pos.x ? 1 : -1;
                this.hitSource = dir;
                if (this.punch.index == 2) {
                    this.ragdoll = true;
                    this.isGrounded = false;
                    this.vel.x = this.getImpactVelocity()*dir/2;
                    this.vel.y = -500;
                }
                break;
        }
    }

    hurt(cantidate) {
        if (this.hurtTime >= physics.hitCooldown){
            var newVel;
            switch (cantidate.attackType) {
                case 'punch':
                    this.hp -= 10;
                    const dir = cantidate.pos.x < this.pos.x ? 1 : -1;
                    this.hitSource = dir;
                    if (cantidate.punch.index == 2) {
                        this.hp -= 50;
                        this.ragdoll = true;
                        this.isGrounded = false;
                        this.vel.x = this.getImpactVelocity()*cantidate.facing;
                        this.vel.y = -800;
                    } else {
                        this.ragdoll = true;
                        this.isGrounded = false;
                        this.vel.x = cantidate.facing*this.getImpactVelocity()/2;
                        this.vel.y = -250;
                    }
                    break;

                case 'dashAttack':
                    this.hp -= 50;
                    this.ragdoll = true;
                    var angle = angleFromPoints(cantidate.pos.x, cantidate.pos.y+(cantidate.height*0.75), this.pos.x, this.pos.y);
                    newVel = angleToVel(angle);
                    this.vel.x = this.getImpactVelocity()*newVel.x*1.75;
                    this.vel.y = this.getImpactVelocity()*newVel.y*1.25;

                    this.ragdoll = true;
                    if (newVel.y < 0) this.isGrounded = false;
                    break;

                case 'fallingAttack':
                    this.hp -= 50;
                    break;

                case 'risingAttack':
                    this.hp -= 50;
                    this.ragdoll = true;
                    var angle2 = angleFromPoints(cantidate.pos.x, cantidate.pos.y+(cantidate.height), this.pos.x, this.pos.y);
                    newVel = angleToVel(angle2);
                    this.vel.x = this.getImpactVelocity()*newVel.x*0.5;
                    this.vel.y = this.getImpactVelocity()*newVel.y*2.12;

                    this.ragdoll = true;
                    if (newVel.y < 0) this.isGrounded = false;
                    break;
            }

            this.hurtTime = 0;
        }
    }

    getImpactVelocity() {
        return 500;
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

module.exports = { Trait, Entity };
