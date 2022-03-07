import { Sprite } from '@inlet/react-pixi';

export const tilePadding = 4;

export const draw = (name, tileset, cam, x, y, scale) => {
    if (x < cam.pos.x - tileset.width || x > cam.pos.x + cam.width + tileset.width)
        return;
    if (y < cam.pos.y - tileset.height || y > cam.pos.y + cam.height + tileset.height)
        return;

    const { width, height } = tileset;
    const texture = tileset.tiles.get(name);
    return (
        <Sprite
        texture={texture}
        x={x*scale}
        y={y*scale}
        width={width*scale}
        height={height*scale}
        />
    );

}

export const drawTile = (index, level, cam, x, y, scale) => {
    if (x < cam.pos.x - level.tileSet.width || x > cam.pos.x + cam.width + level.tileSet.width)
        return;
    if (y < cam.pos.y - level.tileSet.height || y > cam.pos.y + cam.height + level.tileSet.height)
        return;

    const { width, height } = level.tileSet;
    const texture = level.tileSet.getTileTexture(index, 4, level);
    const sprite = (
        <Sprite
            texture={texture}
            x={x*width*scale}
            y={y*height*scale}
            width={width*scale}
            height={height*scale}
        />
    )
    return sprite;
}

export const tileBuffer = (index, level) => {
    const { width, height, padding } = level.tileSet;

    const xLength = level.tileSet.image.width/width;

    let X = (index % xLength) * width;
    let Y = Math.floor(index/xLength) * height;

    const buffer = document.createElement("canvas");
    buffer.width = width+padding;
    buffer.height = height+padding;

    buffer.getContext("2d").drawImage(
        level.tileSet.image,
        X,
        Y,
        width,
        height,
        padding/2,
        padding/2,
        width,
        height
    );

    return buffer;
}
