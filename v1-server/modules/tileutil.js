import { Sprite } from '@inlet/react-pixi';
import * as PIXI from "pixi.js";


export const tilePadding = 4;

export const drawSpine = (entity, name, cam, x, y) => {
    const camX = cam.pos.x*cam.scale;
    const camY = cam.pos.y*cam.scale;

    let dir = entity.flipX ? -entity.skelDir : entity.skelDir;

    entity.skeleton.position.set(x*cam.scale - camX + (entity.width*cam.scale/2),y*cam.scale - camY + entity.height*cam.scale);
    entity.skeleton.scale.set(cam.scale*(entity.skelHeight/1600));
    entity.skeleton.width = entity.skeleton.width*dir;
}

export const drawTile = (index, tileset, cam, x, y, scale) => {
    const { width, height } = tileset;

    const X = x*width;
    const Y = y*height;

    const camX = cam.pos.x*scale;
    const camY = cam.pos.y*scale;

    const sx = X*scale - camX;
    const sy = Y*scale - camY;
    const sw = width*scale;
    const sh = height*scale;

    return {sX: sx, sY: sy, sW: sw, sH: sh};
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
