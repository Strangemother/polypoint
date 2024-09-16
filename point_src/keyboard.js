class StageKeyboard {
    autoListen = true

    constructor(stage=undefined) {
        this.stage = stage

        this.data = { keydown: [], keyup: [] }
        this.wake()
    }

    wake(){
        let p = this.getEventParent()
        p.addEventListener('keydown', this.stageKeydownHandler.bind(this))
        p.addEventListener('keyup', this.stageKeyupHandler.bind(this))

    }

    stageKeydownHandler(ev) {
        for(let item of this.data[ev.type]) {
            if(this.matchCode(ev, item)) {
                // console.log('YEY!')
                item.handler(ev)
            }
        }
    }

    matchCode(ev, item) {
        let code = ev.code.toLowerCase()

        for (var i = item.codes.length - 1; i >= 0; i--) {

            if(item.codes[i].toLowerCase() == code) {
                return true
            }
        }

        return false
    }

    stageKeyupHandler(ev) {
        console.log('stageKeyupHandler')
    }

    getEventParent() {
        return window //this.stage.canvas
    }

    receiverFunction(prop) {
        /* Unknoen prop call. */
        return (codes, func, props) => {
            // console.log('prop', prop, handler)
            return this.on(prop, func, props)
        }
    }

    onKeydown(codes, handler) {
        this.data['keydown'].push({codes, handler})
    }

    onKeyup(codes, handler) {
        this.data['keyup'].push({codes, handler})
    }
}



const keyboardHandler = function(parent) {

    const unknownAttrProxyHandler = {
        get(target, prop, receiver) {

            if(target[prop] !== undefined) {
                // return target[prop].apply(target, arguments)
                return Reflect.get.apply(target,arguments);
            }
            console.log('Return receiver')

            return target.receiverFunction(prop)
        }
    };

    const target = new StageKeyboard(parent)
    const eventNameHandlerProxy = new Proxy(target, unknownAttrProxyHandler);
    return eventNameHandlerProxy;
}



Polypoint.head.install(StageKeyboard)

Polypoint.head.lazierProp('Stage', function keyboard(){
    return keyboardHandler(this)
})
