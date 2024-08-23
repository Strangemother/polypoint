
class Events {
    constructor(parent=undefined) {
        this.parent = parent
    }

    emit(name, detail) {
        return this.getParent().dispatchEvent(new CustomEvent(name, {detail}))
    }

    on(name, handler, props) {
        return this.getParent().addEventListener(name, handler, props)
    }

    getParent() {
        return this.parent == undefined? window: this.parent;
    }
}


const events = new Events(this)