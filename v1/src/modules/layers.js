const drawLayer = (layer, context, sprites) => {
    layer.positions.forEach((item, i) => {
        sprites.drawTile(item.id,context,item.x,item.y);
    });
}

export function createBG(layers, sprites, gWidth, gHeight) {
    const buffer = document.createElement('canvas');
    buffer.width = gWidth;
    buffer.height = gHeight;

    buffer.getContext('2d').clearRect(0, 0, buffer.width, buffer.height);
    buffer.getContext('2d').fillStyle = "#24b4ed";
    buffer.getContext('2d').fillRect(0, 0, buffer.width, buffer.height);

    layers.forEach((item, i) => {
        drawLayer(item, buffer.getContext('2d'), sprites);
    });

    return function drawMap(context) {
        context.drawImage(buffer, 0, 0);
    }
}

export function createCharLayer(sprite, pos) {
    return function drawSpriteLayer(context) {
        sprite.draw('idle',context,pos.x, pos.y);
    }
}
