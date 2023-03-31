export class Signal {
    #funcs;
    constructor(funcs = []) {
        this.#funcs = funcs;
    }
    add(func) {
        this.#funcs.add(func);
    }
    fire() {
        for (func in this.#funcs) {
            func();
        }
    }
}