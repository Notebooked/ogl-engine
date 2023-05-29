import { Node } from './Node.js';
import { Vec3 } from '../math/Vec3.js';
import { Quat } from '../math/Quat.js';
import { Mat4 } from '../math/Mat4.js';
import { Euler } from '../math/Euler.js';

//TODO: add directions, clean up visible

export class Transform extends Node {
    constructor(name, parent = null) {
        super(name, parent)

        this.visible = true;

        //to prevent circular signals from existing
        //this happened with original ogl, where rotation properties updated off eachother
        //and there was no onchange being called on fromquaternion or fromeuler (thats stupid)
        this._shouldUpdateFromSignal = true;

        this._matrix = new Mat4();
        this._matrix.onChange.add(() => {
            if (this._shouldUpdateFromSignal) {
                this._shouldUpdateFromSignal = false;

                this.decompose();

                this._shouldUpdateFromSignal = true;
            }
        });

        this._worldMatrix = new Mat4();

        this._position = new Vec3();
        this._position.onChange.add(() => {
            if (this._shouldUpdateFromSignal) {
                this._shouldUpdateFromSignal = false;

                this.updateMatrix();

                this._shouldUpdateFromSignal = true;
            }
        });

        this._rotation = new Euler();
        this._quaternion = new Quat();
        this._rotation.onChange.add(() => {
            if (this._shouldUpdateFromSignal) {
                this._shouldUpdateFromSignal = false;

                this._quaternion.fromEuler(this._rotation);
                this.updateMatrix();

                this._shouldUpdateFromSignal = true;
            }
        });
        this._quaternion.onChange.add(() => {
            if (this._shouldUpdateFromSignal) {
                this._shouldUpdateFromSignal = false;

                this._rotation.fromQuaternion(this._quaternion); //yeah i dont know about this one (what is a full rotation)
                this.updateMatrix();

                this._shouldUpdateFromSignal = true;
            }
        });

        this._scale = new Vec3(1);
        this._scale.onChange.add(() => {
            if (this._shouldUpdateFromSignal) {
                this._shouldUpdateFromSignal = false;

                this.updateMatrix();

                this._shouldUpdateFromSignal = true;
            }
        });
    }

    updateWorldMatrix() { // fix stupid name
        if (this.parent instanceof Transform) this._worldMatrix.multiply(this.parent.worldMatrix, this._matrix);
        else this._worldMatrix.copy(this._matrix);
    }

    updateMatrix() {
        this.matrix.compose(this.quaternion, this.position, this.scale);
    }

    decompose() {
        this.matrix.getTranslation(this._position); // set up onChange for these functions
        this.matrix.getRotation(this._quaternion);
        this.matrix.getScaling(this._scale);
        this.rotation.fromQuaternion(this._quaternion);
    }

    lookAt(target, up = new Vec3(0, 1, 0), invert = false) { //should lookAt be using globalmatrix or not???
        if (invert) this.matrix.lookAt(this.position, target, up);
        else this.matrix.lookAt(target, this.position, up);
        this.matrix.getRotation(this.quaternion);
        this.rotation.fromQuaternion(this.quaternion); // this line necessary?
    }

    get matrix() {
        return this._matrix;
    }
    set matrix(value) {
        this._matrix.set(value);
    }

    get position() {
        return this._position;
    }
    set position(value) {
        this._position.set(value);
    }

    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        this._rotation.set(value);
    }

    get quaternion() {
        return this._quaternion;
    }
    set quaternion(value) {
        this._quaternion.set(value);
    }

    get scale() {
        return this._scale;
    }
    set scale(value) {
        this._scale.set(value);
    }

    get worldMatrix() {
        this.updateWorldMatrix();
        return this._worldMatrix;
    }
    set worldMatrix(value) {
        //this.updateWorldMatrix(); dont think you need this becayse your setting the whole thing
        this._worldMatrix.set(value);
    }

    // set global variables as underscore properties
    get globalPosition() { //using standard naming, maybe change worldmatrix to globalmtx
        var res = new Vec3();

        this._worldMatrix.getTranslation(res);

        return res;
    }
}
