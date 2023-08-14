import { Node } from './Node.js';
import { Vec3 } from '../math/Vec3.js';
import { Quat } from '../math/Quat.js';
import { Mat4 } from '../math/Mat4.js';
import { Euler } from '../math/Euler.js';

//TODO: add directions, clean up visible, naming of functions and variables

export class Transform extends Node {
    constructor(name, parent = null) {
        super(name, parent)

        this.visible = true;

        //to prevent circular signals from existing
        //this happened with original ogl, where rotation properties updated off eachother
        //and there was no onchange being called on fromquaternion or fromeuler (thats stupid)
        this.shouldUpdateFromSignal = true;

        //LOCAL MATRIX
        this._matrix = new Mat4();
        this._matrix.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                this.decomposeLocal();
                this.updateWorldMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });

        this._position = new Vec3();
        this._position.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                this.composeMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });

        this._rotation = new Euler();
        this._quaternion = new Quat();
        this._rotation.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                this._quaternion.fromEuler(this._rotation);
                this.composeMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });
        this._quaternion.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                this._rotation.fromQuaternion(this._quaternion); //yeah i dont know about this one (what is a full rotation) 2pi you idiot
                this.composeMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });

        this._scale = new Vec3(1);
        this._scale.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                this.composeMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });

        // WORLD MATRIX
        this._worldMatrix = new Mat4();
        this._worldMatrix.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                //if (this.name == "test") debugger;
                this.decomposeWorld();
                this.updateLocalMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });

        this._globalPosition = new Vec3();
        this._globalPosition.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                this.composeWorldMatrix();
                this.updateLocalMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });

        this._globalRotation = new Euler();
        this._globalQuaternion = new Quat();
        this._globalRotation.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                this._globalQuaternion.fromEuler(this._rotation);
                this.composeWorldMatrix();
                this.updateLocalMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });
        this._globalQuaternion.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                this._globalRotation.fromQuaternion(this._quaternion); //yeah i dont know about this one (what is a full rotation) 2pi you idiot
                this.composeWorldMatrix();
                this.updateLocalMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });

        this._globalScale = new Vec3(1);
        this._globalScale.onChange.add(() => {
            if (this.shouldUpdateFromSignal) {
                this.shouldUpdateFromSignal = false;

                this.composeWorldMatrix();
                this.updateLocalMatrix();

                this.shouldUpdateFromSignal = true;
            }
        });
    }

    composeMatrix() {
        this._matrix.compose(this._quaternion, this._position, this._scale);
    }

    decomposeLocal() {
        this._matrix.getTranslation(this._position); // set up onChange for these functions
        this._matrix.getRotation(this._quaternion);
        this._matrix.getScaling(this._scale);
        this._rotation.fromQuaternion(this._quaternion);
    }

    updateWorldMatrix() {
        this.worldFromLocal();
        this.decomposeWorld();
    }

    updateLocalMatrix() {
        this.localFromWorld();
        this.decomposeLocal();
    }

    composeWorldMatrix() {
        this._worldMatrix.compose(this._globalQuaternion, this._globalPosition, this._globalScale);
    }

    decomposeWorld() {
        //if (this.name == "test") debugger;
        this._worldMatrix.getTranslation(this._globalPosition); // set up onChange for these functions
        //if (this.name == "test") debugger;
        this._worldMatrix.getRotation(this._globalQuaternion);
        //if (this.name == "test") debugger;
        this._worldMatrix.getScaling(this._globalScale);
        //if (this.name == "test") debugger;
        this._globalRotation.fromQuaternion(this._globalQuaternion);
        //if (this.name == "test") debugger;
    }

    worldFromLocal() { // fix stupid name
        if (this.parent instanceof Transform) this._worldMatrix.multiply(this.parent.worldMatrix, this._matrix);
        else this._worldMatrix.copy(this._matrix);
    }

    //this basically takes the current world matrix and makes the local matrix mirror that (inverse of updateWorldMatrix)
    localFromWorld() { //fix stupid name
        if (this.parent instanceof Transform) {
            var tempMat4 = new Mat4(); //IDK MAKE THIS A VAR AT START LIKE EVERYWHERE ELSE???
            tempMat4.copy(this.parent.worldMatrix);
            tempMat4.inverse();
            this._matrix.multiply(tempMat4, this._worldMatrix);
        }
        else this._matrix.copy(this._worldMatrix);
    }

    lookAt(target, up = new Vec3(0, 1, 0), invert = false) { //should lookAt be using globalmatrix or not???
        if (invert) this.matrix.lookAt(this.position, target, up);
        else this.matrix.lookAt(target, this.position, up);
        this.matrix.getRotation(this.quaternion);
        this.rotation.fromQuaternion(this.quaternion); // is this line necessary
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
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }
        
        return this._worldMatrix;
    }
    set worldMatrix(value) {
        this._worldMatrix.set(value);
    }

    get globalPosition() { //using standard naming, maybe change worldmatrix to globalmatrix
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        return this._globalPosition;
    }
    set globalPosition(value) {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        this._globalPosition.set(value);
    }

    get globalRotation() { //using standard naming, maybe change worldmatrix to globalmtx
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        return this._globalRotation;
    }
    set globalRotation(value) {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        this._globalRotation.set(value);
    }

    get globalQuaternion() { //using standard naming, maybe change worldmatrix to globalmtx
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        return this._globalQuaternion;
    }
    set globalQuaternion(value) {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        this._globalQuaternion.set(value);
    }

    get globalScale() { //using standard naming, maybe change worldmatrix to globalmtx
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        return this._globalScale;
    }
    set globalScale(value) {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        this._globalScale.set(value);
    }

    get forward() {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        var forward = new Vec3(0, 0, 1);
        forward.applyQuaternion(this._globalQuaternion);
        return forward;
    }

    get rightd() {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        var right = new Vec3(1, 0, 0);
        right.applyQuaternion(this._globalQuaternion);
        return right;
    }

    get up() {
        if (this.shouldUpdateFromSignal) {
            this.shouldUpdateFromSignal = false;

            this.updateWorldMatrix();

            this.shouldUpdateFromSignal = true;
        }

        var up = new Vec3(0, 1, 0);
        up.applyQuaternion(this._globalQuaternion);
        return up;
    }
}
