import { Renderer } from './Renderer.js';
import { Camera } from './Camera.js';
import { Transform } from './Transform.js';
import { getGlContext } from './Canvas.js';
import { PhysicsEngine2D } from '../physics2d/PhysicsEngine2D.js';
import { InputManager } from './InputManager.js';

var then = 0;
var dt = 0;

export class Game {
    #time = 0.0;
    #scene = null;

    constructor(scene = new Transform()) {
        this.setScene(scene);

        this.renderer = new Renderer();
        this.physicsEngine2D = new PhysicsEngine2D(this);
        this.inputManager = new InputManager();
    }

    get time() {
        return this.#time;
    }

    addCanvasToPage() {
        document.body.appendChild(getGlContext().canvas);
    }

    resize() {
        const gl = getGlContext();

        var camera = this.scene.findFirstDescendant(null,Camera);
        if (camera === null) {
            throw new Error("There is no Camera in the scene");
        }

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    }

    render() {
        var camera = this.scene.findFirstDescendant(null,Camera);
        if (camera === null) {
            throw new Error("There is no Camera in the scene");
        }

        this.resize();

        this.renderer.render({ scene: this.scene, camera });
    }

    mainloop() {
        this.scene.broadcast('start');

        requestAnimationFrame((now) => {this.loop(now);})
    }

    loop(now) {
        now *= 0.001;
        dt = now - then;
        then = now;

        this.#time += dt;

        this.scene.broadcast('update',dt);

        this.physicsEngine2D._update(dt);

        this.render();
        
        requestAnimationFrame((now) => {this.loop(now);})
    }

    get scene() {
        return this.#scene;
    }
    setScene(scene) {
        this.#scene = scene;
        this.#scene.setGame(this);
    }
}