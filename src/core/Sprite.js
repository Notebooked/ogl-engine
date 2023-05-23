import { Plane } from '../extras/Plane.js';
import { Mesh } from './Mesh.js';
import { Program } from './Program.js';

const vertex = /* glsl */ `
    attribute vec2 uv;
    attribute vec3 position;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragment = /* glsl */ `
    precision highp float;

    uniform sampler2D tMap;

    varying vec2 vUv;

    void main() {
        gl_FragColor = texture2D(tMap, vUv);
    }
`;

export class Sprite extends Mesh {
    constructor({
            texture,
            program = new Program({
                vertex,
                fragment,
                uniforms: {
                    tMap: { value: texture },
                },
                cullFace: null,
                transparent: true,
            }),
            geometry = new Plane({width:1,height:1})
        } = {}) {
        super({ geometry, program });
    }   
}

/*
this.transparent = transparent;
        this.cullFace = cullFace;
        this.frontFace = frontFace;
        this.depthTest = depthTest;
        this.depthWrite = depthWrite;
        this.depthFunc = depthFunc;
        this.blendFunc = {};
        this.blendEquation = {};
*/