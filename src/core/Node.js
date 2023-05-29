import { Signal } from '../core/Signal.js';

export class Node {
    constructor(name, parent = null) {
        this.name = name;

        this._parent = parent;
        this._children = [];

        this._game = null;

        this.parentChanged = new Signal(); //doesnt even work
        this.gameTreeChanging = new Signal(); //put this in setgame
        this.gameTreeChanged = new Signal(); //and this
    }

    get game() {
        return this._game;
    }
    setGame(game) {
        this._game = game;
    }

    get parent() {
        return this._parent;
    }
    set parent(value) {
        this.setParent(value);
    }
    setParent(parent, notifyParent = true) {
        if (this._parent !== parent) {
            if (this._parent) this._parent.removeChild(this, false);

            this._parent = parent;
            if (this._parent instanceof Node) {
                var oldGame = this._game;
                this._game = parent.game;
                this.gameTreeChanged.fire(oldGame = oldGame);
            }
            else this._game = null;

            if (notifyParent && parent instanceof Node) parent.addChild(this, false);
        }
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

    getNode(name = null, type = null) {
        var res;
        this.traverse((child) => {
            var isChild = true;
            if (name !== null && child.name !== name) {
                isChild = false;
            }
            if (type !== null && !(child instanceof type)) {
                isChild = false;
            }
            if (isChild === true) { res = child; }
            return false;
        })
        return res;
    }

    findFirstDescendant(name = null, type = null) {
        var res;
        this.traverse((child) => {
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
        if (res !== null) { return res; }
        this._children.forEach((child) => {
            var res = child.findFirstDescendant(name, type);
            if (res !== null) {
                return res;
            }
        })
        return null;
    }

    findDescendants(name = null, type = null) {
        var res = [];
        this.traverse((child) => {
            var isChild = true;
            if (name !== null && child.name !== name) {
                isChild = false;
            }
            if (type !== null && !(child instanceof type)) {
                isChild = false;
            }
            if (isChild === true) { res.push(child) }
            return false;
        })
        this._children.forEach((child) => {
            var childRes = child.findDescendants(name, type);
            res.push(...childRes);
        })
        return res;
    }

    traverse(callback) {
        // Return true in callback to stop traversing children
        if (callback(this)) return;
        for (let i = 0, l = this.children.length; i < l; i++) {
            this.children[i].traverse(callback);
        }
    }

    broadcast(func, ...args) {
        if (func in this) {
            this[func](...args);
        }
        this._children.forEach((child) => {
            child.broadcast(func, ...args);
        });
    }
}