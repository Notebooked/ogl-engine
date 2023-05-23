export class Signal {
    #funcs;
    constructor(funcs = []) {
        this.#funcs = funcs;
    }
    add(func) {
        this.#funcs.push(func);
    }
    fire(...args) {
        this.#funcs.forEach((func) => {
            func(...args);
        })
    }
}