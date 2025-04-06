// interaction with HTML page happens HERE

import { Node } from "./Node.js";

let gl = null;
let _isWebgl2 = null;

export function getGlContext() {
    return gl;
}

export function isWebgl2() {
    return _isWebgl2;
}

export function createCanvas(renderer, { webgl, attributes }) {
    var canvas = document.getElementById("game-canvas");
    if (!canvas) {
        canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
    }

    // Attempt WebGL2 unless forced to 1, if not supported fallback to WebGL1
    if (webgl === 2) gl = canvas.getContext('webgl2', attributes);
    _isWebgl2 = !!gl;
    if (!gl) gl = canvas.getContext('webgl', attributes);
    if (!gl) console.error('unable to create webgl context');

    // Attach renderer to gl so that all classes have access to internal state functions
    gl.renderer = renderer;
}


export class PageElement extends Node {
    #element = null;
    constructor(name, parent = null, { type = "" } = {}) {
        super(name, parent)

        this.type = type;
    }
    enteredHierarchy() {
        this.#element = document.createElement(this.type);
    }
    exitedHierarchy() {
        this.#element.remove();
    }
    setStyleAttribute(property,value) {
        this.#element.style[property] = value;
    }
}