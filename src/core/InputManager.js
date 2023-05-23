import { Signal } from "./Signal.js";

export class InputManager {
    #keys = {};
    constructor() {
        document.addEventListener("keydown", (event) => {this.processKeyDown(event)});
        document.addEventListener("keyup", (event) => {this.processKeyUp(event)});

        this.keyPressed = new Signal();
    }
    processKeyDown(event) {
        this.#keys[event.code] = true;
    }
    processKeyUp(event) {
        var previousValue = this.#keys[event.code];
        this.#keys[event.code] = false;
        if (previousValue === true) {
            this.keyPressed.fire(event.code);
        }
    }
    getInput(code) {
        return (this.#keys[code] === true);
    }
}