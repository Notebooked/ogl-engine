import { Node } from "./Node.js";

export class InputManager extends Node {
    #keys = {};
    constructor(name,parent=null) {
        super(name,parent)
        document.addEventListener("keydown", (event) => {this.processKeyDown(event)});
        document.addEventListener("keyup", (event) => {this.processKeyUp(event)});
    }
    processKeyDown(event) {
        this.#keys[event.code] = true;
    }
    processKeyUp(event) {
        this.#keys[event.code] = false;
    }
    getInput(code) {
        return (this.#keys[code] === true);
    }
}