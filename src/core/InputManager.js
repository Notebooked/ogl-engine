import { Signal } from "./Signal.js";

export class InputManager {
    #keys = {};
    constructor() {
        document.addEventListener("keydown", (event) => {this.processKeyDown(event)});
        document.addEventListener("keyup", (event) => {this.processKeyUp(event)});
        document.addEventListener("keypress", (event) => {this.processKeyPress(event)});

        document.addEventListener("click", (event) => {this.processClick(event)});
        document.addEventListener("mousemove", (event) => {this.processMouseMove(event)});
        document.addEventListener("drag", (event) => {this.processMouseDrag(event)});
        document.addEventListener("mousedown", (event) => {this.processMouseDown(event)});
        document.addEventListener("mouseup", (event) => {this.processMouseUp(event)});

        this.keyDown = new Signal();
        this.keyUp = new Signal();
        this.keyPressed = new Signal();

        this.clicked = new Signal();
        this.mouseMoved = new Signal();
        this.mouseDragged = new Signal();
        this.mouseDown = new Signal();
        this.mouseUp = new Signal();

        this.mouseX = 0;
        this.mouseY = 0;
    }
    processKeyDown(event) {
        this.#keys[event.code] = true;
        this.keyDown.fire(event.code);
    }
    processKeyUp(event) {
        this.#keys[event.code] = false;
        this.keyUp.fire(event.code);
    }
    processKeyPress(event) {
        this.keyPressed.fire(event.code);
    }
    processClick(event) {
        this.clicked.fire(event);
    }
    processMouseMove(event) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;

        this.mouseMoved.fire(event);
    }
    processMouseDrag(event) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;

        this.mouseDragged.fire(event);
    }
    processMouseDown(event) {
        this.mouseDown.fire(event);
    }
    processMouseUp(event) {
        this.mouseUp.fire(event);
    }
    getInput(code) {
        return (this.#keys[code] === true);
    }
}