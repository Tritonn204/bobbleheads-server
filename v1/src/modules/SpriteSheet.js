import { Rectangle, Texture } from 'pixi.js';


class SpriteSheet {
    constructor(image, width, height) {
        this.image = image;
        this.width = width;
        this.height = height;
        this.tiles = new Map();
    }

    define(name, x, y) {
        const buffer = document.createElement('canvas');
        const baseTex = Texture.from(this.image);
        this.tiles.set(name, new Texture(baseTex, new Rectangle(x, y, this.width, this.height)));
    }

    getTileTexture(index){
        const xLength = this.image.width/this.width;

        let X = (index % xLength) * this.width;
        let Y = Math.floor(index/xLength) * this.height;

        const baseTex = Texture.from(this.image);

        return new Texture(baseTex, new Rectangle(X, Y, this.width, this.height));
    }
}

export default SpriteSheet;
