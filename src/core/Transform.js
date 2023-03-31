import { Vec3 } from '../math/Vec3.js';
import { Quat } from '../math/Quat.js';
import { Mat4 } from '../math/Mat4.js';
import { Euler } from '../math/Euler.js';

//TODO: add directions, clean up visible

export class Transform {
    constructor(name) {
        this.name = name;

        this._parent = null;
        this._children = [];
        this.visible = true;

        this.matrix = new Mat4();
        this.worldMatrix = new Mat4();
        this.matrixAutoUpdate = true;

        this.position = new Vec3();
        this.quaternion = new Quat();
        this.scale = new Vec3(1);
        this.rotation = new Euler();
        this.up = new Vec3(0, 1, 0);

        this.rotation.onChange = () => this.quaternion.fromEuler(this.rotation);
        this.quaternion.onChange = () => this.rotation.fromQuaternion(this.quaternion);
    }

    get parent() {
        return this._parent;
    }
    setParent(parent, notifyParent = true) {
        if (this._parent && parent !== this._parent) this._parent.removeChild(this, false);
        this._parent = parent;
        if (notifyParent && parent) parent.addChild(this, false);
    }

    get children() {
        return this._children;
    }
    addChild(child, notifyChild = true) {
        if (!~this._children.indexOf(child)) this._children.push(child);
        if (notifyChild) child.setParent(this, false);
    }
    removeChild(child, notifyChild = true) {
        if (!!~this.children.indexOf(child)) this.children.splice(this.children.indexOf(child), 1);
        if (notifyChild) child.setParent(null, false);
    }

    get root() {
        var current = this;
        while (current.parent !== null) {
            current = current.parent;
        }
        return current;
    }
    findFirstDescendant(name = null, type = null) {
        var res;
        this._children.every((child) => {
            var isChild = true;
            if (name !== null && child.name !== name) {
                isChild = false;
            }
            if (type !== null && !(child instanceof type)) {
                isChild = false;
            }
            if (isChild === true) { res = child }
            return false;
        })
        if (res !== null) {return res;}
        this._children.forEach((child) => {
            var res = child.findFirstDescendant(name, type);
            if ( res !== null) {
                return res;
            }
        })
        return null;
    }

    updateMatrixWorld(force) {
        if (this.matrixAutoUpdate) this.updateMatrix();
        if (this.worldMatrixNeedsUpdate || force) {
            if (this.parent === null) this.worldMatrix.copy(this.matrix);
            else this.worldMatrix.multiply(this.parent.worldMatrix, this.matrix);
            this.worldMatrixNeedsUpdate = false;
            force = true;
        }

        for (let i = 0, l = this.children.length; i < l; i++) {
            this.children[i].updateMatrixWorld(force);
        }
    }

    updateMatrix() {
        this.matrix.compose(this.quaternion, this.position, this.scale);
        this.worldMatrixNeedsUpdate = true;
    }

    traverse(callback) {
        // Return true in callback to stop traversing children
        if (callback(this)) return;
        for (let i = 0, l = this.children.length; i < l; i++) {
            this.children[i].traverse(callback);
        }
    }

    decompose() {
        this.matrix.getTranslation(this.position);
        this.matrix.getRotation(this.quaternion);
        this.matrix.getScaling(this.scale);
        this.rotation.fromQuaternion(this.quaternion);
    }

    lookAt(target, invert = false) {
        if (invert) this.matrix.lookAt(this.position, target, this.up);
        else this.matrix.lookAt(target, this.position, this.up);
        this.matrix.getRotation(this.quaternion);
        this.rotation.fromQuaternion(this.quaternion);
    }

    broadcast(func,...args) {
        if (func in this) {
            this[func](...args);
        }
        this._children.forEach((child) => {
            child.broadcast(func,...args);
        });
    }
}
