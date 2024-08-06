/*

Automouse provides a point at the mouse position.
It's the _last known position_ of the mouse; updated upon mousemove.

HTML:

    <script src="point_src/automouse.js"></script>

JS:

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
        this.zIndex = 'local'
        this.handlers = {}
        this._announce()
    }

    _announce() {

        /* Wait for a stage prep event. */
        addEventListener('stage:prepare', this.stagePrepareHandler.bind(this))

        // Announce this module is mountable.
        let data = {
            target: this

        }

        dispatchEvent(new CustomEvent('addon:announce', {detail: data}))
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
        return new Point(this.mouseCache)
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
            , vector: {
                x: event.movementX
                , y: event.movementY
            }
        }

        this.positions = positions;
        this.mouseCache = positions[this.zIndex] //{x,y}
        this.callHandlers('mousemove', canvas, event)
        return this;
    }

    callHandlers(name, canvas, event) {
        for (let func in this.handlers[name]) {
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
        let sq = (v * v)
        if(abs==true) { return sq }
        return v < 0? -sq: sq
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


const autoMouse = (new AutoMouse(Point))

Point.mouse = autoMouse
Point.pointArray = pointArray
