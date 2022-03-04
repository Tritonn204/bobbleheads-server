class SpriteSheet {
    constructor(image, width, height) {
        this.image = image;
        this.width = width;
        this.height = height;
        this.tiles = new Map();
    }

    define(name, x, y) {
        const buffer = document.createElement('canvas');
        buffer.width = this.width;
        buffer.height = this.height;
        buffer
        .getContext("2d")
        .drawImage(
            this.image,
            x*this.width,
            y*this.height,
            this.width,
            this.height,
            0,
            0,
            this.width,
            this.height
        );
        this.tiles.set(name, buffer);
    }

    draw(name, context, x, y) {
        const buffer = this.tiles.get(name);
        context.drawImage(buffer,x,y);
    }

    drawTile(index, context, x, y) {
        const xLength = this.image.width/this.width - 1;
        const yLength = this.image.height/this.height - 1;

        let X = index;
        let Y = 0;

        if (index > xLength){
            X = index - (xLength%index) - 1;
            Y = Math.floor(index/xLength);
        }

        const buffer = document.createElement('canvas');
        buffer.width = this.width;
        buffer.height = this.height;
        buffer
        .getContext("2d")
        .drawImage(this.image, X * this.width, Y * this.height, this.width, this.height, 0, 0, this.width, this.height);

        context.drawImage(buffer,x*this.width,y*this.height);
    }
}

export default SpriteSheet;
