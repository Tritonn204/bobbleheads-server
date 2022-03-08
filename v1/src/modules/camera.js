import { Vec2, lerp } from './util.js';

export default class Camera {
    constructor(width = 1920, height = 1080, speed = 0.98) {
        this.pos = new Vec2(0,0);
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    update(entity, level, delta) {
        const { x, y } = this.pos;
        const { x: x2, y: y2 } = entity.pos;

        const offsetX = this.width/2 - entity.width/2;
        const offsetY = this.height/2 - entity.height/2;

        let destX = Math.max(x2, offsetX);
        let destY = Math.max(y2, offsetY);
        destX = Math.min(destX, level.width - offsetX - entity.width);
        destY = Math.min(destY, level.height - offsetY - entity.height);

        let newX = lerp(x + offsetX,destX,this.speed*delta);
        let newY = lerp(y + offsetY,destY,this.speed*delta);

        if (destX < level.width - offsetX - entity.width)
            newX = Math.max(newX, entity.pos.x - this.width/3);
        if (destX > offsetX)
            newX = Math.min(newX, entity.pos.x + this.width/3 + entity.width);

        if (destY < level.height - offsetY - entity.height)
            newY = Math.max(newY, entity.pos.y - this.height/3.6);
        if (destY > offsetY)
            newY = Math.min(newY, entity.pos.y + this.height/3.6 + entity.height);
        this.pos.set(newX - offsetX, newY - offsetY);
    }

    setSize(w, h) {
      this.width = w;
      this.height = h;
    }
}
