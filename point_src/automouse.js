/*
    title: Auto Mouse
    tags: mouse

    Automouse provides a point at the mouse position.
    It's the _last known position_ of the mouse; updated upon mousemove.

        let point = Point.mouse.position

 */

const getLastMousePos = function(){
    return autoMouse.getMousePos(canvas)
}


class AutoMouse {
    /*
        installCanvas(canvas, stage){
            this.canvasMap.set(canvas, stage)
            Point.mouse?.listen(canvas)
        }
     */
    constructor(parentClass) {
        this.parentClass = parentClass
        this.mouseCache = {x: 0, y: 0}
        // a reference of clicks
        this.buttons = {}
        // A stash of the movement position, in relative forms.
        this.positions = {}
        // layer x,y selection - for position
        this.zIndex = 'bound'
        // this.zIndex = 'local'
        this.handlers = {}
        this._announce()

        this._peristentPoint = new Point

    }

    _announce() {

        /* Wait for a stage prep event. */

        events.on('stage:prepare', this.stagePrepareHandler.bind(this))
        // addEventListener('stage:prepare', this.stagePrepareHandler.bind(this))

        // Announce this module is mountable.
        let data = {
            target: this

        }

        events.emit('addon:announce', data)
        // dispatchEvent(new CustomEvent('addon:announce', {detail: data}))
    }

    /* The given event has a stage ready for mounting. Perform any changes,
    such as adding a reference to the mouse. */
    stagePrepareHandler(ev) {
        let d = ev.detail
        console.log('AutoMouse::stagePrepareHandler', d)
        return this.announcementResponse(ev, false)
    }

    announcementResponse(ev, log=true){
        let d = ev.detail
        if(log) {
            console.log('AutoMouse::announcementResponse', ev, d)
        }
        let stage = d.stage
        stage.addComponent('mouse', this)
    }

    getMousePos(canvas) {
        var rect = this.getBoundingClientRect();
        let mouseCache = this.mouseCache
        return {
            x: mouseCache.x - rect.left,
            y: mouseCache.y - rect.top
        };
    }

    get xy() {
        return this.mouseCache
    }

    get position() {
        /* The `this.position` method returns a new Point, with the mouse XY
        (from the last motion).
        Use `this.point` for a persisent single Point instence. */
        return new Point(this.mouseCache)
    }

    get point() {
        /*
        Return a persistent _point_, of which is updated rather than replaced
        when the mouse state changes.
         */
        return this._peristentPoint
    }
    // [Symbol.toPrimitive](hint) {

    //     if (hint === 'string') {
    //         return this.toString()
    //     }
    //     return Reflect.apply(...arguments)
    // }

    getBoundingClientRect(canvas) {
        if(canvas === undefined) {
            canvas = this.canvas;
        }
        return canvas.getBoundingClientRect();
    }

    getListenerMethods() {
        if(this._methods) {
            return this._methods
        }
        console.log('Setting up mouse events')
        const methods = {
            mousemove: this.mousemoveHandler.bind(this)
            , mousedown: this.mousedownHandler.bind(this)
            , mouseup: this.mouseupHandler.bind(this)
            , wheel: [this.wheelHandler.bind(this), {passive: true}]

        }
        this._methods = methods
        return this._methods;
    }

    mount(canvas) {
        /* Call upon `mount` to initate listening of all events on a canvas. */

        if(!this.canvas) {
            this.canvas = canvas
        }
        let methods = this.getListenerMethods()
        for(let k in methods) {
            let f = methods[k]
            if(isFunction(f)){
                this.listen(canvas, k, f)
                continue
            }
            // f is an array.
            this.listen(canvas, k, f[0], f[1])

        }
    }

    listen(canvas, eventName, handler, opts) {
        canvas.addEventListener(eventName, e => handler(canvas, event), opts);
        return this;
    }

    mousemoveHandler(canvas, event) {
        // let bound = this.getBoundingClientRect();
        // let x = event.clientX - bound.left - canvas.clientLeft; // same as _local_
        // let y = event.clientY - bound.top - canvas.clientTop; // same as _local_

        // console.log('Mousemove', event)
        // Relative to the stage 0,0
        this._lastEvent = event
        var rect = canvas.getBoundingClientRect();
        let positions = {
            local: {
                x: event.offsetX
                , y: event.offsetY
            }
            // relative to the page, including canvas offset (e.g 10, 490)
            , page: {
                x: event.pageX
                , y: event.pageY
            }
            // global; where on the display (e.g. 500, 500)
            , screen: {
                x: event.screenX
                , y: event.screenY
            }
            , client: {
                x: event.clientX
                , y: event.clientY
            }
            , layer: {
                x: event.layerX
                , y: event.layerY
            }
            , vector: {
                x: event.movementX
                , y: event.movementY
            }
            , absolute: {
                x: event.x
                , y: event.y
            }
            , custom: {
                x: event.clientX - rect.left - canvas.clientLeft
                , y: event.clientY - rect.top - canvas.clientTop

                // x:  event.pageX - event.target.offsetLeft
                // , y:  event.pageY - event.target.offsetTop

                // x: event.target.offsetLeft + event.layerX
                // , y: event.target.offsetTop + event.layerY
            }

            , bound: {
                x: event.clientX - rect.left
                , y: event.clientY - rect.top
            }

        }

        this.positions = positions;
        let state = positions[this.zIndex] //{x,y}
        this.mouseCache = state
        this._peristentPoint.x = state.x
        this._peristentPoint.y = state.y
        this.callHandlers('mousemove', canvas, event)
        return this;
    }

    callHandlers(name, canvas, event) {
        let handlers = this.handlers[name]
        for (let key in handlers) {
            let func = handlers[key]
            func(canvas, event)
        }
    }

    mousedownHandler(canvas, event) {
        let space = this.getActionSpace(event.button)
        space.down = true
        this.applyPositionIncrement(space, event)
        this.callHandlers('mousedown', canvas, event)
        return this;
    }

    mouseupHandler(canvas, event) {
        this.callHandlers('mouseup', canvas, event)
        let space = this.getActionSpace(event.button)
        space.down = false
        this.applyPositionIncrement(space, event)
        return this;
    }

    applyPositionIncrement(space, event) {
        space.count += 1
        space.position = {
                x: event.offsetX
                , y: event.offsetY
            }
            return space
    }

    wheelHandler(canvas, event) {
        let space = this.getActionSpace('wheel', { value: 0 })
        this.applyPositionIncrement(space, event)
        let delta = {
            x: event.deltaX
            , y: event.deltaY
            , mode: event.deltaMode
        }
        let direction = event.wheelDelta > 0
        space.value += direction? 1: -1
        space.delta = delta
        let rel = space.relative
        if(rel == undefined) {
            rel = { x: 0, y: 0 }
        }
        rel.x += delta.x
        rel.y += delta.y

        space.relative = rel
        this.callHandlers('wheel', canvas, event)
        return this;
    }

    isDown(index) {
        let d = this.buttons[index]?.down
        return d == undefined? false: d

    }

    wheelSize(abs=false) {
        let v = (this.buttons.wheel?.value) || 1
        let sq = isFunction(abs) ? abs(v): v//(v * v)
        if(abs==true) { return sq }
        return v < 0? -sq: sq
    }

    /*
    A function to help clamp the wheel scroll within a range. By using this
    function, the wheel value doesn't exceed the clamp.


        let size = mouse.clampWheelSize(5, 20)

    The same can be done with the clamp function

        let size = clamp(mouse.wheelSize(), 30, 300)

    but when the wheel exceeds the clamp, it'll scroll into an unused range.

     */
    clampWheelSize(min, max, abs=false) {
        let ws = this.wheelSize(abs);
        let v =  clamp(ws, min, max)
        if(this.buttons.wheel!=undefined){
            this.buttons.wheel.value = v
        }

        return v
    }


    on(canvas, name, handler, opts) {
        let hs = this.handlers[name] || []
        hs.push(handler)
        this.handlers[name] = hs;
        let methods = this.getListenerMethods()

        if(methods[name] == undefined) {
            console.warn('Installing generic handler', name)
            this.listen(canvas, name, handler, opts)
        }
    }

    getActionSpace(name, defaults={}) {
        let space = this.buttons[name]
        if(space == undefined) {
            space = { count: 0 }
            Object.assign(space, defaults)
            this.buttons[name] = space
        }

        return space
    }

}

Polypoint.head.install(AutoMouse)

const autoMouse = (new AutoMouse(Point))

/*
Install the `Point.mouse` static method.
*/
Polypoint.head.static('Point', {
    mouse: {
        value: autoMouse
        // , writable: true
        // , enumerable: false
        // , configurable: true
    }
})



addEventListener('stage:prepare', (e)=>{
    /* Upon the event `stage:prepare`, create a listener to monitor
    the system resize event. Call the stage `resizeHandler` when an event
    occurs.
    */

    Point.mouse?.mount(e.detail.stage.canvas)
    // this.stage.resizeHandler(e)
});


try{

    // Point.mouse = autoMouse
    Point.pointArray = pointArray
} catch {
    console.warn('pointArray is not defined')
}
