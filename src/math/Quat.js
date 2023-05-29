import * as QuatFunc from './functions/QuatFunc.js';
import { Signal } from '../core/Signal.js';

export class Quat extends Array {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        super(x, y, z, w);
        this.onChange = new Signal();
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    get w() {
        return this[3];
    }

    set x(v) {
        this[0] = v;
        this.onChange.fire();
    }

    set y(v) {
        this[1] = v;
        this.onChange.fire();
    }

    set z(v) {
        this[2] = v;
        this.onChange.fire();
    }

    set w(v) {
        this[3] = v;
        this.onChange.fire();
    }

    identity() {
        QuatFunc.identity(this);
        this.onChange.fire();
        return this;
    }

    set(x, y, z, w) {
        if (x.length) return this.copy(x);
        QuatFunc.set(this, x, y, z, w);
        this.onChange.fire();
        return this;
    }

    rotateX(a) {
        QuatFunc.rotateX(this, this, a);
        this.onChange.fire();
        return this;
    }

    rotateY(a) {
        QuatFunc.rotateY(this, this, a);
        this.onChange.fire();
        return this;
    }

    rotateZ(a) {
        QuatFunc.rotateZ(this, this, a);
        this.onChange.fire();
        return this;
    }

    inverse(q = this) {
        QuatFunc.invert(this, q);
        this.onChange.fire();
        return this;
    }

    conjugate(q = this) {
        QuatFunc.conjugate(this, q);
        this.onChange.fire();
        return this;
    }

    copy(q) {
        QuatFunc.copy(this, q);
        this.onChange.fire();
        return this;
    }

    normalize(q = this) {
        QuatFunc.normalize(this, q);
        this.onChange.fire();
        return this;
    }

    multiply(qA, qB) {
        if (qB) {
            QuatFunc.multiply(this, qA, qB);
        } else {
            QuatFunc.multiply(this, this, qA);
        }
        this.onChange.fire();
        return this;
    }

    dot(v) {
        return QuatFunc.dot(this, v);
    }

    fromMatrix3(matrix3) {
        QuatFunc.fromMat3(this, matrix3);
        this.onChange.fire();
        return this;
    }

    fromEuler(euler) {
        QuatFunc.fromEuler(this, euler, euler.order);
        this.onChange.fire(); //LITERALLY JUST FIRE IT YOU MORON
        return this;
    }

    fromAxisAngle(axis, a) {
        QuatFunc.setAxisAngle(this, axis, a);
        this.onChange.fire();
        return this;
    }

    slerp(q, t) {
        QuatFunc.slerp(this, this, q, t);
        this.onChange.fire();
        return this;
    }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        this[3] = a[o + 3];
        this.onChange.fire();
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        a[o + 3] = this[3];
        return a;
    }
}
