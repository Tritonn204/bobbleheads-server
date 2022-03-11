
import SpriteSheet from './SpriteSheet.js';
import { Level } from './level.js';
import { Spine } from 'pixi-spine';

const layerManager = require('./layers.js');
const assetManager = require("./assets.js");

export function loadImage(url) {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => {
            resolve(image);
        });
        image.src = url;
    });
}

export function loadPlayer(index) {
    return loadImage('res/avatars/' + index + '.png')
    .then(image => {
        const sprites = new SpriteSheet(image, 63, 109, 0);
        sprites.define('idle',0,0);
        return sprites;
    });
}

export function loadLevelAssets(index) {
    return loadImage('res/levels/' + index + '/' + index + '.png')
    .then(image => {
        const sprites = new SpriteSheet(image, 64, 64, 0);
        return sprites;
    });
}

export function loadLevel(app, index) {
    return Promise.all([
        fetch('res/levels/' + index + '/' + index + '.txt')
        .then(r => r.json()),

        loadLevelAssets(index)
    ])
    .then(([data, sprites]) => {
        const level = new Level();
        level.data = data;
        level.tileSet = sprites;

        level.xCount = data.map_width;
        level.width = level.xCount*data.tile_size;

        level.yCount = data.map_height;
        level.height = level.yCount*data.tile_size;

        //Store level data in memory
        level.loadTextureData();
        level.loadTileData(app.stage);
        level.loadCollisionData();

        //Create entity layer
        level.comp.layers.push((app, scale = 1, cam) => layerManager.createCharLayer(level.entities, scale, cam));
        //Load collision data

        return level;
    });
}
