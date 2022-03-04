const drawLayer = (layer, context, sprites) => {
    layer.positions.forEach((item, i) => {
        sprites.drawTile(item.id,context,item.x,item.y);
    });
}

export function createBG(layers, sprites) {
    return function drawMap(context) {
        layers.forEach((item, i) => {
            drawLayer(item, context, sprites);
        });
    }
}

export function createCharLayer(entity) {
    return function drawSpriteLayer(context) {
        entity.draw(context);
    }
}
