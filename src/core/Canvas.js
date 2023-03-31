var canvas = null;
var gl = null;

function createCanvas() {
    canvas = document.createElement("canvas");

    // Attempt WebGL2 unless forced to 1, if not supported fallback to WebGL1
    if (webgl === 2) gl = getCanvas().getContext('webgl2', attributes);
    this.isWebgl2 = !!this.gl;
    if (!gl) gl = getCanvas().getContext('webgl', attributes);
    if (!gl) console.error('unable to create webgl context');
}

export function getCanvas() {
    if (canvas===null) {
        createCanvas();
    }
    return canvas;
}

export function getGlContext() {
    return gl;
}