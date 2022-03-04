export class GameLoop {
    constructor(delta = 1/60) {
        let accumulatedTime = 0;
        let lastTime = 0;

        this.updateProxy = (time) => {
            //Compares real elapsed time with desired logic/physics framerate to maintain consistency
            //accumulatedTime marks how many seconds have passed since the last logic update
            accumulatedTime += (time - lastTime)/1000;
            while (accumulatedTime > delta) {
                this.update(delta);
                this.render();
                accumulatedTime -= delta;
            }

            //equivaletnt to vsync
            //requestAnimationFrame automatically passes the timestamp to the next call as an argument
            lastTime = time;

            this.enqueue();
        }
    }

    enqueue() {
        requestAnimationFrame(this.updateProxy);
    }

    start() {
        this.enqueue();
    }
}
