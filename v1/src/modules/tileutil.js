import { Sprite } from '@inlet/react-pixi';

export const draw = (name, tileset, x, y) => {
    const { width, height } = tileset;
    const texture = tileset.tiles.get(name);
    return (
        <Sprite
        texture={texture}
        x={x}
        y={y}
        width={width}
        height={height}
        />
    );

}

export const drawTile = (index, tileset, x, y) => {
    const { width, height } = tileset;
    const texture = tileset.getTileTexture(index);
    const sprite = (
        <Sprite
            texture={texture}
            x={x*width}
            y={y*height}
            width={width}
            height={height}
        />
    )

    return sprite;
}
