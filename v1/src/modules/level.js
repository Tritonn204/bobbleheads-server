import Compositor from '../Compositor.js';
import { Matrix } from './util.js';
import { TileCollider } from './physics.js';

const physics = require('./physics.js');

export class Level {
    constructor() {
        this.comp = new Compositor();
        this.entities = new Set();
        this.bgTiles = new Matrix();
        this.tiles = new Matrix();
        this.collisionData = new Matrix();
        this.tileSet = null;

        this.tileCollision = new TileCollider(this.collisionData);
    }

    update(delta) {
        this.entities.forEach((entity) => {
            entity.update(delta);

            entity.pos.x += entity.vel.x*delta
            this.tileCollision.checkX(entity);

            entity.pos.y += entity.vel.y*delta;
            this.tileCollision.checkY(entity);

            entity.vel.y += physics.gravity*delta;
            if (entity.vel.y > physics.terminalVelocity)
                entity.vel.y = physics.terminalVelocity;
        });
    }

    loadTileData(data) {
        data.layers.forEach(layer => {
            if (!layer.name.includes('collision')){
                layer.positions.forEach(tile => {
                    if (this.tiles.get(tile.x,tile.y)){
                        this.bgTiles.set(tile.x, tile.y, this.tiles.get(tile.x,tile.y));
                    }
                    this.tiles.set(tile.x, tile.y, tile.id);
                });
            }
        });
    }

    loadCollisionData(data) {
        data.layers.forEach(layer => {
            if (layer.name.includes('collision')){
                    layer.positions.forEach(tile => {
                        this.collisionData.set(tile.x, tile.y,parseInt(layer.name.split("_").pop()));
                    });
            }
        });
    }
}
