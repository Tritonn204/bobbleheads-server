export const gravity = 4000;
export const terminalVelocity = 1280;

const floorTiles = [1,2];
const ceilTiles = [1];

class TileResolver {
    constructor(matrix, tileSize = 64) {
        this.matrix = matrix;
        this.tileSize = tileSize;
    }

    toIndex(pos) {
        return Math.floor(pos / this.tileSize);
    }

    toIndexRange(pos1, pos2) {
        const pMax = Math.ceil(pos2 / this.tileSize) * this.tileSize;
        const range = [];
        let pos = pos1;
        do {
            range.push(this.toIndex(pos));
            pos += this.tileSize;
        } while (pos < pMax);
        return range;
    }

    getByIndex(xIndex, yIndex) {
        const tile = this.matrix.get(xIndex, yIndex);
        if (tile) {
            const x1 = xIndex * this.tileSize;
            const y1 = yIndex * this.tileSize;
            const x2 = x1 + this.tileSize;
            const y2 = y1 + this.tileSize;
            return {
                tile,
                x1,
                y1,
                x2,
                y2
            }
        }
    }

    matchByPosition(posX, posY) {
        return this.getByIndex(
            this.toIndex(posX),
            this.toIndex(posY)
        );
    }

    matchByRange(x1, x2, y1, y2) {
        const matches = [];
        this.toIndexRange(x1,x2).forEach(xIndex => {
            this.toIndexRange(y1,y2).forEach(yIndex => {
                const match = this.getByIndex(xIndex, yIndex);
                if (match) {
                    matches.push(match);
                }
            });
        });
        return matches;
    }
}

export class TileCollider {
    constructor(tileMatrix) {
        this.tiles = new TileResolver(tileMatrix);
    }

    checkY(entity) {
        const threshold = 16;
        const floorMatches = this.tiles.matchByRange(
            entity.pos.x + threshold,
            entity.pos.x + entity.width - threshold,
            entity.pos.y + entity.height,
            entity.pos.y + entity.height);

        const ceilMatches = this.tiles.matchByRange(
            entity.pos.x + threshold,
            entity.pos.x + entity.width - threshold,
            entity.pos.y,
            entity.pos.y);

        floorMatches.forEach(match => {
            if (match.tile != 1){
                const threshold = 16;
                if (entity.vel.y > 0 && floorTiles.includes(match.tile)) {
                    if (entity.pos.y + entity.height > match.y1 && entity.pos.y + entity.height < match.y1 + threshold ) {
                        entity.pos.y = match.y1 - entity.height;
                        entity.vel.y = 0;
                        entity.isGrounded = true;
                    } else {
                        entity.isGrounded = false;
                    }
                }
            } else {
                if (entity.vel.y > 0 && floorTiles.includes(match.tile)) {
                    if (entity.pos.y + entity.height > match.y1 && entity.pos.y + entity.height < match.y2 ) {
                        entity.pos.y = match.y1 - entity.height;
                        entity.vel.y = 0;
                        entity.isGrounded = true;
                    } else {
                        entity.isGrounded = false;
                    }
                }
            }
        });
        ceilMatches.forEach(match => {
            if (entity.vel.y < 0 && ceilTiles.includes(match.tile)) {
                if (entity.pos.y < match.y2) {
                    entity.pos.y = match.y2;
                    entity.vel.y = 0;
                    entity.jump.cancel();
                }
            }
        });
    }

    checkX(entity) {
        const threshold = 0;
        const matches = this.tiles.matchByRange(
            entity.pos.x + threshold,
            entity.pos.x + entity.width - threshold,
            entity.pos.y,
            entity.pos.y + entity.height);

        matches.forEach(match => {
            if (entity.vel.x > 0 && match.tile == 1) {
                if (entity.pos.x + entity.width - threshold > match.x1) {
                    entity.pos.x = match.x1 - entity.width + threshold;
                    entity.vel.x = 0;
                }
            } else if (entity.pos.x + threshold < match.x2 && match.tile == 1) {
                entity.pos.x = match.x2 - threshold;
                entity.vel.x = 0;
            }
        });
    }
}
