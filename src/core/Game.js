import { getGlContext, Renderer } from './Renderer.js';
import { Camera } from './Camera.js';
import { Transform } from './Transform.js';

var then = 0;
var dt = 0;

export class Game extends Transform {
    #time = 0.0;
    constructor() {
        super();

        this.canvas = document.createElement("canvas");

        this.renderer = new Renderer({canvas: this.canvas});
    }

    get time() {
        return this.#time;
    }

    addCanvasToPage() {
        document.body.appendChild(this.canvas);
    }
    resize() {
        const gl = getGlContext();

        var camera = this.findFirstDescendant(null,Camera);
        if (camera === null) {
            throw new Error("There is no Camera in the scene");
        }

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    }
    render() {
        var camera = this.findFirstDescendant(null,Camera);
        if (camera === null) {
            throw new Error("There is no Camera in the scene");
        }

        this.resize();

        this.renderer.render({ scene: this, camera });
    }
    mainloop() {
        this.broadcast('start');

        requestAnimationFrame((now) => {this.loop(now);})
    }
    loop(now) {
        now *= 0.001;
        dt = now - then;
        then = now;

        this.#time += dt;

        this.broadcast('update',dt);

        this.render();

        requestAnimationFrame((now) => {this.loop(now);})
    }
}