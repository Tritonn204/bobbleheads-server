const { Trait } = require('./entity.js');
const physics = require("./physics.js");

class Velocity extends Trait {
    constructor() {
        super('velocity');
    }

    update() {

    }
}

class Run extends Trait {
    constructor() {
        super('run');

        this.dir = 0;
        this.acc = 450;
        this.speed = 650;
        this.walkSpeed = 128;
    }

    update(entity, delta) {
        if (entity.ragdoll)
            return;
        if (entity.crouching)
            entity.vel.x *= (entity.isGrounded ? 0.6 : 0.72) / (1-delta);
        else if (entity.run.dir != 0){
            const fullSpd = entity.guard && entity.vel.y == 0 ? this.walkSpeed : this.speed;
            let accSpd = entity.vel.x + this.acc * delta * entity.run.dir;

            if ((entity.run.dir > 0 && accSpd < 0) || (entity.run.dir < 0 && accSpd > 0))
                accSpd = entity.vel.x * (entity.isGrounded ? 0.6 : 0.85) / (1-delta);
            if (accSpd > fullSpd)
                accSpd = fullSpd;
            if (accSpd < -fullSpd)
                accSpd = -fullSpd;

            entity.vel.x = accSpd;
        } else {
            entity.vel.x *= (entity.isGrounded ? 0.6 : 0.925) / (1-delta);
        }
    }
}

class Punch extends Trait {
    constructor() {
        super('punch');

        this.duration = 0.5;
        this.comboPeriod = 0.3;
        this.engageTime = 0;

        this.delay = 0.1;
        this.punchPenalty = 0.5;
        this.hitWindow = 0.1;

        this.insetX = [80,80,80];
        this.insetY = [24,24,-40];
        this.width = [100,100,100];
        this.height = [80,80,136];

        this.cooldownDuration = 1.5;
        this.cooldownTimer = 0;

        this.animationNames = ["Punch A", "Punch B", "Punch C"];
        this.queued = false;

        this.index = 0;

        this.active = false;
    }

    advance() {
        if (this.cooldownTimer < this.cooldownDuration && this.index == 1)
            return;
        if (!this.active)
            this.start();
        else if (this.index < 2){
            if (this.engageTime < this.comboPeriod){
                this.engageTime = this.duration;
                this.index++;
                this.queued = true;

                this.cooldownTimer -= this.punchPenalty;
                this.cooldownTimer = Math.max(this.cooldownTimer, 0);
            }
            if (this.index == 2) {
                this.cooldownTimer = 0;
            }
        }
    }

    start() {
        this.engageTime = this.duration;
        this.active = true;
        this.queued = true;
    }

    cancel() {
        this.engageTime = 0;
    }

    hitbox(entity) {
        if (this.engageTime < this.duration - this.delay && this.engageTime > this.duration - this.delay - this.hitWindow){
            const factorX = (this.width[this.index] - entity.width)/2;
            entity.attackBounds.pos.set(entity.pos.x - factorX, entity.pos.y);
            entity.attackBounds.size.set(this.width[this.index], this.height[this.index]);
            entity.attackBounds.offset.set(this.insetX[this.index]*entity.facing, this.insetY[this.index]);

            entity.attackType = 'punch';
        }
    }

    update(entity, delta) {
        if (this.engageTime > 0) {
            this.hitbox(entity);
            this.engageTime -= delta;
        } else {
            this.active = false;
            this.index = 0;
        }
        this.cooldownTimer += delta;
    }
}

class FallingAttack extends Trait {
    constructor() {
        super('fallingAttack');

        this.active = false;

        this.duration = 3;
        this.engageTime = 0;

        this.delay = 0.1;
        this.hitWindow = 2.9;

        this.insetX = 40;
        this.insetY = -35;

        this.width = 70;
        this.height = 70;

        this.fallSpeed = 96;
        this.dashSpeed = 300;
        this.hoverX = 96;
        this.kickSpeed = 800;
    }

    start() {
        if (!this.active) {
            this.engageTime = this.duration;
            this.active = true;
        }
    }

    cancel() {
        this.engageTime = 0;
        this.active = false;
    }

    hitbox(entity) {
        if (this.engageTime < this.duration - this.delay && this.engageTime > this.duration - this.delay - this.hitWindow){
            const factorX = (this.width - entity.width)/2;
            entity.attackBounds.pos.set(entity.pos.x - factorX, entity.pos.y + entity.height);
            entity.attackBounds.size.set(this.width, this.height);
            entity.attackBounds.offset.set(this.insetX*entity.facing, this.insetY);

            entity.attackType = 'fallingAttack';
        }
    }

    dashVel(entity) {
        if (this.engageTime < this.duration - this.delay && this.engageTime > 0){
            const factor = 1-((this.duration - this.engageTime)/this.duration);
            entity.vel.x = this.dashSpeed*entity.facing*factor;
            entity.vel.y = Math.max(this.kickSpeed, entity.vel.y);
        } else if (this.engageTime >= this.duration - this.delay){
            entity.vel.x = Math.min(Math.abs(entity.vel.x), this.hoverX)*entity.facing;
            entity.vel.y = Math.min(entity.vel.y, this.fallSpeed);
        }
    }


    update(entity, delta) {
        if (this.engageTime > 0) {
            this.hitbox(entity);
            this.dashVel(entity);
            this.engageTime -= delta;
        } else {
            this.active = false;
        }
        if (entity.isGrounded) {
            this.cancel();
        }
    }
}

class DashAttack extends Trait {
    constructor() {
        super('dashAttack');

        this.active = false;

        this.dir = 0;

        this.width = 105;
        this.height = 120;

        this.duration = 0.65;
        this.engageTime = 0;

        this.delay = 0.3;
        this.hitWindow = 0.2;

        this.insetX = 85;
        this.insetY = 8;

        this.fallSpeed = 96;
        this.dashSpeed = 600;
        this.hoverX = 96;
    }

    start(dir) {
        if (!this.active) {
            this.dir = dir.valueOf();
            this.engageTime = this.duration;
            this.active = true;
        }
    }

    hitbox(entity) {
        if (this.engageTime < this.duration - this.delay && this.engageTime > this.duration - this.delay - this.hitWindow){
            const factorX = (this.width - entity.width)/2;
            entity.attackBounds.pos.set(entity.pos.x - factorX, entity.pos.y);
            entity.attackBounds.size.set(this.width, this.height);
            entity.attackBounds.offset.set(this.insetX*entity.facing, this.insetY);

            entity.attackType = 'dashAttack';
        }
    }

    dashVel(entity) {
        entity.vel.y = Math.min(entity.vel.y, this.fallSpeed);
        if (this.engageTime < this.duration - this.delay && this.engageTime > this.duration - this.delay - this.hitWindow){
            entity.vel.x = this.dashSpeed*this.dir;
        } else if (this.engageTime >= this.duration - this.delay){
            entity.vel.x = Math.min(Math.abs(entity.vel.x), this.hoverX)*entity.facing;
        }
    }

    update(entity, delta) {
        if (this.engageTime > 0) {
            this.dashVel(entity);
            this.hitbox(entity);
            this.engageTime -= delta;
        } else {
            this.active = false;
        }
        if (entity.isGrounded) {
            this.hitsLeft = this.maxHits;
        }
    }
}

class RisingAttack extends Trait {
    constructor() {
        super('risingAttack');

        this.active = false;

        this.width = 140;
        this.height = 100;

        this.duration = 0.65;
        this.engageTime = 0;

        this.delay = 0.3;
        this.hitWindow = 0.2;

        this.insetX = 0;
        this.insetY = -105;

        this.hitsLeft = 1;
        this.maxHits = 1;

        this.fallSpeed = 0;
        this.dashSpeed = 700;
    }

    start() {
        if (this.hitsLeft > 0) {
            this.hitsLeft--;
            this.engageTime = this.duration;
            this.active = true;
        }
    }

    hitbox(entity) {
        if (this.engageTime < this.duration - this.delay && this.engageTime > this.duration - this.delay - this.hitWindow){
            const factorX = (this.width - entity.width)/2;
            entity.attackBounds.pos.set(entity.pos.x - factorX, entity.pos.y);
            entity.attackBounds.size.set(this.width, this.height);
            entity.attackBounds.offset.set(this.insetX*entity.facing, this.insetY);

            entity.attackType = 'risingAttack';
        }
    }

    dashVel(entity) {
        entity.vel.y = Math.min(entity.vel.y, this.fallSpeed);
        if (this.engageTime < this.duration - this.delay && this.engageTime > this.duration - this.delay - this.hitWindow){
            entity.vel.y = Math.min(entity.vel.y, -this.dashSpeed);
        }
    }

    update(entity, delta) {
        if (this.engageTime > 0) {
            this.hitbox(entity);
            this.dashVel(entity);
            this.engageTime -= delta;
        } else {
            this.active = false;
        }
        if (entity.isGrounded) {
            this.hitsLeft = this.maxHits;
        }
    }
}


class Jump extends Trait {
    constructor() {
        super('jump');

        this.jumpAllowance = 2;
        this.jumpsLeft = 2;

        this.duration = 0.25;
        this.velocity = 580;
        this.engageTime = 0;
    }

    start() {
        if (this.jumpsLeft > 0) {
            this.engageTime = this.duration;
            this.jumpsLeft--;
        }
    }

    cancel() {
        this.engageTime = 0;
    }

    update(entity, delta) {
        if (this.engageTime > 0) {
            entity.vel.y = -this.velocity;
            this.engageTime -= delta;
        } else if (entity.isGrounded) {
            this.jumpsLeft = this.jumpAllowance;
        }
    }
}


module.exports = { Velocity, Jump, Run, Punch, RisingAttack, FallingAttack, DashAttack };
