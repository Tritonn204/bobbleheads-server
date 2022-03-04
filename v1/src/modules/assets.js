import SpriteSheet from './SpriteSheet.js';

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

export function loadLevelData(index) {
    return fetch('res/levels/' + index + '/' + index + '.txt')
    .then(r => r.json())
}
