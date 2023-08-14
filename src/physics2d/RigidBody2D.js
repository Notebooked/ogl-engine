import { Transform } from "../core/Transform.js";
import { Vec3 } from "../math/Vec3.js";
import { Vec2 } from "../math/Vec2.js";
import { scale } from "./PhysicsEngine2D.js";

export class Rigidbody2D extends Transform {
    constructor(name, parent = null) {
        super(name, parent);

        this._body = Matter.Body.create();

        this.velocity = new Vec2();

        this.gameTreeChanged.add((oldGame) => {
            if (oldGame !== null) this.game.physicsEngine2D._removeBody(this._body);
            if (this.game !== null) this.game.physicsEngine2D._addBody(this._body);
        });
    }
    _updateToBody2DProperties() {
        Matter.Body.setPosition(this._body, Matter.Vector.create(this.position.x * scale, this.position.y * scale));
        Matter.Body.setAngle(this._body, this.rotation.z);
        Matter.Body.setVelocity(this._body, Matter.Vector.create(this.velocity.x * scale, this.velocity.y * scale));
    }
    _updateFromBody2DProperties() {
        this.position = new Vec3(this._body.position.x / scale, this._body.position.y / scale, this.position.z);
        this.rotation.z = this._body.angle;
        this.velocity = new Vec2(this._body.velocity.x / scale, this._body.velocity.y / scale);
    }

    get isStatic() {
        return this._body.isStatic;
    }
    set isStatic(value) {
        Matter.Body.setStatic(this._body, value);
    }

    //TODO: angular velocity and linear speed
    get angularVelocity() {
        return this._body.angularVelocity;
    }
    set angularVelocity(value) {
        Matter.Body.setAngularVelocity(this._body, value);
    }

    get friction() {
        return this._body.friction;
    }
    set friction(value) {
        this._body.friction = value;
    }

    setCircleShape(radius) {
        var temp = Matter.Bodies.circle(0,0,radius * scale, {}, 100);
        Matter.Body.setVertices(this._body, temp.vertices);
    }
    setRectangleShape(width,height) {
        var temp = Matter.Bodies.rectangle(0,0,width * scale, height * scale);
        Matter.Body.setVertices(this._body, temp.vertices);
    }

    applyForce(force,position) {
        Matter.Body.applyForce(this._body, Matter.Vector.create(position.x * scale, position.y * scale), force);
    }
}