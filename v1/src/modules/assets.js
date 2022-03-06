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
        const sprites = new SpriteSheet(image, 100, 160);
        sprites.define('idle',0,0);
        return sprites;
    });
}

export function loadLevelAssets(index) {
    return loadImage('res/levels/' + index + '/' + index + '.png')
    .then(image => {
        const sprites = new SpriteSheet(image, 64, 64);
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

        //Store level data in memory
        level.loadTileData(data);
        level.loadCollisionData(data);
        level.tileSet = sprites;

        //Create map layer
        const mapLayer = layerManager.createBG(level, sprites);
        level.comp.layers.push(() => layerManager.createBG(level, sprites));

        //Create entity layer
        const charLayer = layerManager.createCharLayer(level.entities);
        level.comp.layers.push(() => layerManager.createCharLayer(level.entities));
        //Load collision data

        return level;
    });
}
