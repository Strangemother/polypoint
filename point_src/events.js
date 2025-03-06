
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

/* Events should be a lot easier

// listen to this point.
point.event.mousedown(handler)

// Listen to the stage events.
stage.event.mousedown(handler)

//Autohook:
Stage {
    onMousedown(ev) {
        //...
    }
}
ev = new Events(stage)
ev.hook(stage)

We can embelesh the list or emit, with additonal params -
such as passive events on a mouse wheel (on listen)
or appending data to an event on emit.

*/

function getMethodsOf(obj){
    const methods = {}
    Object.getOwnPropertyNames( Object.getPrototypeOf(obj) ).forEach(methodName => {
        methods[methodName] = obj[methodName]
    })
    return methods
}

;addEventListener('stage:prepare', function(event){
    let {id, canvas, stage} = event.detail
    console.log('event', stage)
    if(stage.autoEvents !== false)  {
        /* default true for event.wake() */
        stage.events.wake()
    }
})


class StageEvents {
    /* StageEvents apply `.events` to the stage.
    If `autoListen=true` (default). any method matching `on[EventName]` is
    hooked.

        class MyStage extends Stage {
            autoListen = true

            onClick(ev){
                // raw ev event
            }
        }

    Standard `on` and `emit` (listen/dispatch) for events:

        stage.on('eventName', stage.handle)

    */
    autoListen = true

    constructor(stage=undefined) {
        this.stage = stage
        this._hooked = false
    }

    wake(){
        if(this.getAutoListen()) {
            (!this._hooked) && this.hook(this.stage)
        }
    }

    getAutoListen() {
        return this.autoListen !== false && this.stage.autoListen !== false
    }

    hook(entity) {
        // console.log('Auto listen.')
        const methods = getMethodsOf(entity);
        for(let k in methods){
            // console.log('Checking', k)
            if(k.toLowerCase().startsWith('on')) {
                let f = entity[k].bind(entity)
                let eventName = k.slice(2).toLowerCase()
                // console.log('Autohooking event', eventName)//, f)
                this.on(eventName,f)
            }
        }
        this._hooked = true
    }

    on(name, handler, props) {
        return this.getEventParent().addEventListener(name, handler, props)
    }

    emit(name, detail) {
        return this.getEventParent().dispatchEvent(new CustomEvent(name, {detail}))
    }

    getEventParent() {
        return this.stage.canvas
    }

    receiverFunction(prop) {
        return (handler, props) => {
            // console.log('prop', prop, handler)
            return this.on(prop, handler, props)
        }
    }
}


const stageHandler = function(parent) {

    const unknownAttrProxyHandler = {
        get(target, prop, receiver) {
            // debugger;
            if(target[prop] !== undefined) {
                // return target[prop].apply(target, arguments)
                return Reflect.get.apply(target,arguments);
            }
            // console.log('Return receiver')
            return target.receiverFunction(prop)
        }
    };

    const target = new StageEvents(parent)
    const eventNameHandlerProxy = new Proxy(target, unknownAttrProxyHandler);
    return eventNameHandlerProxy;
}


Polypoint.head.install(StageEvents)

Polypoint.head.lazierProp('Stage', function events(){
    return stageHandler(this)
})