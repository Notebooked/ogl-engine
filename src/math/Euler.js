import * as EulerFunc from './functions/EulerFunc.js';
import { Mat4 } from './Mat4.js';
import { Signal } from '../core/Signal.js';

const tmpMat4 = new Mat4();

export class Euler extends Array { // WHY CANT EURLER BE SUBCLAS VEC3 
    constructor(x = 0, y = x, z = x, order = 'YXZ') {
        super(x, y, z);
        this.order = order;
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
        this[0] = x;
        this[1] = y;
        this[2] = z;
        this.onChange.fire();
        return this;
    }

    copy(v) {
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        this.onChange.fire();
        return this;
    }

    reorder(order) {
        this.order = order;
        this.onChange.fire();
        return this;
    }

    fromRotationMatrix(m, order = this.order) {
        EulerFunc.fromRotationMatrix(this, m, order);
        this.onChange.fire();
        return this;
    }

    fromQuaternion(q, order = this.order) {
        tmpMat4.fromQuaternion(q);
        //this.onChange.fire(); //LITERALLY JUST FIRE IT YOU MORON atually no we dont havbe to fire it becayse fromRotationMatrix does itc
        return this.fromRotationMatrix(tmpMat4, order); // this should fire onchange because it actually affects this matrix
    }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2]; // SHOUDL ONGANGE!?????
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        return a;
    }
}
