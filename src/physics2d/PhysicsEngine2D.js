import { Vec2 } from "../math/Vec2.js";

const scale = 1000;

class PhysicsEngine2D {
    #engine;

    constructor(game) {
        this.game = game;

        this.#engine = Matter.Engine.create();
        
        this.gravity = new Vec2(0, -0.01);
    }
    _update(dt) {
        this.game.scene.broadcast("_updateToBody2DProperties");
        Matter.Engine.update(this.#engine,dt * 1000);
        this.game.scene.broadcast("_updateFromBody2DProperties");
    }
    _addBody(body) {
        Matter.Composite.add(this.#engine.world, body);
    }
    _removeBody(body) {
        Matter.Composite.remove(this.#engine.world, body);
    }

    get gravity() {
        return new Vec2(this.#engine.gravity.x * this.#engine.gravity.scale / scale,this.#engine.gravity.y * this.#engine.gravity.scale / scale);
    }
    set gravity(value) {
        if (value.len() != 0) {
            this.#engine.gravity.x = value.x / value.len();
            this.#engine.gravity.y = value.y / value.len();
        }
        this.#engine.gravity.scale = value.len(); //doesnt matter if value has length of 0 (it will be that anyways)
    }
}

export { PhysicsEngine2D, scale };