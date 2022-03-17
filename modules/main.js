export class GameLoop {
    constructor(delta = 1/60) {
        const time = performance.now();
        //Compares real elapsed time with desired logic/physics framerate to maintain consistency
        //accumulatedTime marks how many seconds have passed since the last logic update
        accumulatedTime += (time - this.lastTime)/1000;
        while (accumulatedTime > delta) {
            this.update(delta);
            accumulatedTime -= delta;
        }
        this.lastTime = 0;

        this.updateProxy = () => {

            const time = performance.now();
            //Compares real elapsed time with desired logic/physics framerate to maintain consistency
            //accumulatedTime marks how many seconds have passed since the last logic update
            accumulatedTime += (time - this.lastTime)/1000;
            while (accumulatedTime > delta) {
                this.update(delta);
                accumulatedTime -= delta;
            }

            //equivaletnt to vsync
            //requestAnimationFrame automatically passes the timestamp to the next call as an argument

            this.enqueue();
        }
    }

    enqueue() {
        this.updateProxy();
    }

    start() {
        this.enqueue();
    }
}
