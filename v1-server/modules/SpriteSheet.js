import * as PIXI from 'pixi.js';
import { Rectangle, Texture } from 'pixi.js';

class SpriteSheet {
    constructor(image, width, height, padding = 4) {
        this.image = image;
        this.width = width;
        this.height = height;
        this.tiles = new Map();
        this.padding = padding;
    }

    define(name, x, y) {
        const buffer = document.createElement('canvas');
        const baseTex = Texture.from(this.image);
        this.tiles.set(name, new Texture(baseTex, new Rectangle(x, y, this.width, this.height)));
    }

    getTileTexture(index, padding = 4, tileTextures){
        const xLength = this.image.width/this.width;

        const baseTex = Texture.from(tileTextures[index]);
        const tileTexture = new Texture(baseTex, new Rectangle(this.padding/2, this.padding/2, this.width, this.height));

        return tileTexture;
    }
}

export default SpriteSheet;
