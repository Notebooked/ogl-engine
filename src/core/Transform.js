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

        this.matrix = new Mat4();
        this.worldMatrix = new Mat4();
        this.matrixAutoUpdate = true;

        this.position = new Vec3();
        this.scale = new Vec3(1);

        this._rotation = new Euler();
        this._quaternion = new Quat();
        this._rotation.onChange.add(() => this._quaternion.fromEuler(this._rotation));
        this._quaternion.onChange.add(() => this._rotation.fromQuaternion(this._quaternion));
    }

    updateMatrixWorld(force) {
        if (this.matrixAutoUpdate) this.updateMatrix();
        if (this.worldMatrixNeedsUpdate || force) {
            if (this.parent instanceof Transform) this.worldMatrix.multiply(this.parent.worldMatrix, this.matrix)
            else this.worldMatrix.copy(this.matrix);
            this.worldMatrixNeedsUpdate = false;
            force = true;
        }

        for (let i = 0, l = this.children.length; i < l; i++) {
            if (this.children[i] instanceof Transform) {
                this.children[i].updateMatrixWorld(force);
            }
        }
    }

    updateMatrix() {
        this.matrix.compose(this.quaternion, this.position, this.scale);
        this.worldMatrixNeedsUpdate = true;
    }

    decompose() {
        this.matrix.getTranslation(this.position);
        this.matrix.getRotation(this.quaternion);
        this.matrix.getScaling(this.scale);
        this.rotation.fromQuaternion(this.quaternion);
    }

    lookAt(target, up = new Vec3(0, 1, 0), invert = false) {
        if (invert) this.matrix.lookAt(this.position, target, up);
        else this.matrix.lookAt(target, this.position, up);
        this.matrix.getRotation(this.quaternion);
        this.rotation.fromQuaternion(this.quaternion);
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

    get globalPosition() {
        var res = new Vec3();
        this.worldMatrix.getTranslation(res);
        return res;
    }
    get globalRotation() {
        var res = new Vec3();
        this.matrix.getRotation(res);
        return res;
    }
    get globalScale() {
        var res = new Vec3();
        this.matrix.getScaling(res);
        return res;
    }

    setGlobalTransform(m) {
        this.matrix.multiply(this.worldMatrix.inverse(), m);
    }
}
