import * as Vec3Func from './functions/Vec3Func.js';
import { Signal } from '../core/Signal.js';

export class Vec3 extends Array {
    constructor(x = 0, y = x, z = x) {
        super(x, y, z);

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

    set(x, y = x, z = x) {
        if (x.length) return this.copy(x);
        Vec3Func.set(this, x, y, z);
        this.onChange.fire();
        return this;
    }

    copy(v) {
        Vec3Func.copy(this, v);
        this.onChange.fire();
        return this;
    }

    add(va, vb) {
        if (vb) Vec3Func.add(this, va, vb);
        else Vec3Func.add(this, this, va);
        this.onChange.fire();
        return this;
    }

    sub(va, vb) {
        if (vb) Vec3Func.subtract(this, va, vb);
        else Vec3Func.subtract(this, this, va);
        this.onChange.fire();
        return this;
    }

    multiply(v) {
        if (v.length) Vec3Func.multiply(this, this, v);
        else Vec3Func.scale(this, this, v);
        this.onChange.fire();
        return this;
    }

    divide(v) {
        if (v.length) Vec3Func.divide(this, this, v);
        else Vec3Func.scale(this, this, 1 / v);
        this.onChange.fire();
        return this;
    }

    inverse(v = this) {
        Vec3Func.inverse(this, v);
        this.onChange.fire();
        return this;
    }

    // Can't use 'length' as Array.prototype uses it
    len() {
        return Vec3Func.length(this);
    }

    distance(v) {
        if (v) return Vec3Func.distance(this, v);
        else return Vec3Func.length(this);
    }

    squaredLen() {
        return Vec3Func.squaredLength(this);
    }

    squaredDistance(v) {
        if (v) return Vec3Func.squaredDistance(this, v);
        else return Vec3Func.squaredLength(this);
    }

    negate(v = this) {
        Vec3Func.negate(this, v);
        this.onChange.fire();
        return this;
    }

    cross(va, vb) {
        if (vb) Vec3Func.cross(this, va, vb);
        else Vec3Func.cross(this, this, va);
        this.onChange.fire();
        return this;
    }

    scale(v) {
        Vec3Func.scale(this, this, v);
        this.onChange.fire();
        return this;
    }

    normalize() {
        Vec3Func.normalize(this, this);
        this.onChange.fire();
        return this;
    }

    dot(v) {
        return Vec3Func.dot(this, v);
    }

    equals(v) {
        return Vec3Func.exactEquals(this, v);
    }

    applyMatrix3(mat3) {
        Vec3Func.transformMat3(this, this, mat3);
        this.onChange.fire();
        return this;
    }

    applyMatrix4(mat4) {
        Vec3Func.transformMat4(this, this, mat4);
        this.onChange.fire();
        return this;
    }

    scaleRotateMatrix4(mat4) {
        Vec3Func.scaleRotateMat4(this, this, mat4);
        this.onChange.fire();
        return this;
    }

    applyQuaternion(q) {
        Vec3Func.transformQuat(this, this, q);
        this.onChange.fire();
        return this;
    }

    angle(v) {
        return Vec3Func.angle(this, v);
    }

    lerp(v, t) {
        Vec3Func.lerp(this, this, v, t);
        this.onChange.fire();
        return this;
    }

    clone() {
        return new Vec3(this[0], this[1], this[2]);
    }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        this.onChange.fire();
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        return a;
    }

    transformDirection(mat4) {
        const x = this[0];
        const y = this[1];
        const z = this[2];

        this[0] = mat4[0] * x + mat4[4] * y + mat4[8] * z;
        this[1] = mat4[1] * x + mat4[5] * y + mat4[9] * z;
        this[2] = mat4[2] * x + mat4[6] * y + mat4[10] * z;

        return this.normalize(); // dont need onchange to fire because normalize calls it
    }
}
