const PRESSED = 1;
const RELEASED = 0;

const SPACE = 32;

export class Keyboard {
    constructor() {
        // Stores the current state of any key
        this.keyStates = new Map();

        // Stores the callback event for a given key code
        this.keyMap = new Map();
    }

    addMapping(keyCode, callback) {
        this.keyMap.set(keyCode, callback);
    }

    handleEvent(e) {
        const {keyCode} = e;
        if (!this.keyMap.has(keyCode)) {
            //Key has no binding
            return false;
        }

        e.preventDefault();

        const keyState = e.type === 'keydown' ? PRESSED : RELEASED;

        if (this.keyStates.get(keyCode) === keyState) {
            return;
        }

        this.keyStates.set(keyCode, keyState);

        this.keyMap.get(keyCode)(keyState);
    }

    listenTo(client) {
        ['keydown', 'keyup'].forEach(eventName => {
            client.addEventListener(eventName, e => {
                this.handleEvent(e);
            });
        });
    }
}
