import * as PIXI from "pixi.js";
import { lerp } from './util.js';

export default class PerformanceOverlay {
    constructor() {
        this.container = new PIXI.Container();
        this.container.zIndex = 100;

        this.lines = [];
        this.fps = 0;

        this.fpsText = new PIXI.Text('FPS:',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'left'});
        this.latency = new PIXI.Text('PING: N/A' ,{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'left'});

        this.lines.push(this.fpsText);
        this.lines.push(this.latency);

        this.lines.forEach((item, index) => {
            item.x = 16;
            item.y = index*28 + 16;
            this.container.addChild(item);
        })
    }

    update(delta) {
        this.fps = Math.max(lerp(this.fps, 1/delta, delta),0);
        this.fpsText.text = "FPS: " + Math.round(this.fps);
    }

    show() {
        this.container.visible = true;
    }

    hide() {
        this.container.visible = false;
    }
}
