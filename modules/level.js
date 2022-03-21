const { Matrix } = require('./util.js');
const { TileCollider, EntityCollider } = require('./physics.js');

const physics = require('./physics.js');

class Level {
    constructor() {
        this.entities = new Set();
        this.bgTiles = new Matrix();
        this.tiles = new Matrix()
        this.collisionData = new Matrix();
        this.tileSet = null;
        this.data = null;
        this.tileTextures = [];
        this.data = null;

        this.xCount = 1;
        this.yCount = 1;
        this.width = 0;
        this.height = 0;

        this.entityCollision = new EntityCollider(this.entities);
        this.tileCollision = new TileCollider(this.collisionData);
    }

    addInteractiveEntity(entity) {
        this.entityCollision.entities.add(entity);
    }

    update(delta) {
        this.entities.forEach((entity) => {
            entity.update(delta);
            entity.vel.y += physics.gravity*delta;

            entity.pos.x += entity.vel.x*delta
            this.tileCollision.checkX(entity);

            entity.pos.y += entity.vel.y*delta;
            this.tileCollision.checkY(entity);

            this.entityCollision.check(entity);
            this.entityCollision.checkAttack(entity);

            if (entity.vel.y > physics.terminalVelocity)
                entity.vel.y = physics.terminalVelocity;
        });
    }

    loadCollisionData() {
        this.data.layers.forEach(layer => {
            if (layer.name.includes('collision')){
                layer.positions.forEach(tile => {
                    this.collisionData.set(tile.x, tile.y,parseInt(layer.name.split("_").pop()));
                });
            }
        });
    }
}

module.exports = Level;
