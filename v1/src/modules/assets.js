import SpriteSheet from './SpriteSheet.js';
import { Level } from './level.js';

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
        const sprites = new SpriteSheet(image, 100, 160, 0);
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

export function loadLevel(index) {
    return Promise.all([
        fetch('res/levels/' + index + '/' + index + '.txt')
        .then(r => r.json()),

        loadLevelAssets(index)
    ])
    .then(([data, sprites]) => {
        const level = new Level();
        level.tileSet = sprites;

        //Store level data in memory
        level.loadTileData(data);
        level.loadCollisionData(data);
        level.loadTextureData(data);

        //Create map layer
        const mapLayer = (scale = 1, cam) => layerManager.createBG(level, scale, cam);
        level.comp.layers.push(mapLayer);

        //Create entity layer
        level.comp.layers.push((scale = 1, cam) => layerManager.createCharLayer(level.entities, scale, cam));
        //Load collision data

        return level;
    });
}
