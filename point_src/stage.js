/*
files:
    stage-resize.js
    functions/resolve.js
---

A Stage acts as a convenience tool to hoist a canvas and begin drawing however
it's not fundamental.

The Stage helps manage _loading_ and _looping_ of draw functions
Extend with your own custom functionality and run the `go()` method:

    class MainStage extends Stage {
        // canvas = document.getElementById('playspace');
        canvas = 'playspace'
    }

    stage = MainStage.go({
        loop: true
    })

This will execute the canvas name. It provides some free tools:

1. `mount()` and `draw(ctx)` functions
2. _load_ capture events
3. size locking and auto resizing
4. optional request frame loop
5. builtin measurement tools; `center` and `dimensions`

*/

class StageBase {

    /* an addon instance has anounced itself. Perform the addComponent */
    addonAnnounceHandler(ev) {
        let data = ev.detail
        let instance = data.target
        // this.dispatch('stage:prepare', {target, id, canvas })
        let response = {
            target: this.target
            , id: this.id
            , canvas: this.canvas
        }

        let detail = this._dispatchPrepare(response)
        /* mimic an event object detail. */
        this.log('Stage::addonAnnounceHandler', ev, d)
        instance.announcementResponse(detail)
    }

    dispatch(name, data) {
        // this.dispatch('prepare', { target, id, stage: this, canvas })
        this.log('Dispatch', name)
        let detail = this._dispatchPrepare(data)
        let event = new CustomEvent(name, detail);
        dispatchEvent(event)
        // this.events.emit(event)
    }

    /* Given a dictionary, return a finished dictionary, ready for event
    dispatch */
    _dispatchPrepare(data) {
        data['stage'] = this
        return {detail: data}
    }

    /* a given object is mounted on _this_ - such as the `mouse`.
    This may be called in response to a 'stage:prepare' event.  */
    addComponent(name, instance) {
        this.log('Installing', name, 'to', this)
        Object.defineProperty(this, name, {value: instance})
    }

    log() {
        console.log.apply(console, arguments)
        // console.log.apply(console, Array.from(arguments))
    }

}

class StageRender extends StageBase {
    _drawFunc
    _loopDraw = true

    debounceResize = true
    debounceResizeTimeout = 100

    constructor(canvas, drawFunc) {
        /*
            Accept a `canvas` node and an optional `draw` function, prepare
            the stage draw routine. If the `canvas` is given, immediately call
            `this.prepare(canvas)` to initiate the layer.

                new StageRender(canvas, ()=>{})

            Any given `drawFunc` overrides the existing `this.stageStartDraw` method
            and expects the _next_ method to call once complete:

            The default `this.draw(ctx)` method is given`

                this.stageStartDraw(this.draw)

         */
        super()

        drawFunc = drawFunc || ( ()=>this.stageStartDraw(this.draw))
        if(drawFunc) {
            this._drawFunc = drawFunc
        }

        this._nextTick = new Set;
        this._drawAfter = []
        this._drawBefore = []
        if(canvas)  {
            this.prepare(canvas)
        }
    }

    stickCanvasSize(canvas, size){
        let rect = size
        /* Return the result of the bounding box function, else resort
        to the object w/h */
        if(size == undefined) {
            rect = (canvas.getBoundingClientRect
                    && canvas.getBoundingClientRect()
                    ) || { width: canvas.width, height: canvas.height }
            /*if(rect == undefined) {
                rect = { width: canvas.width , height: canvas.height }
            }*/
        }

        if(rect.width) { canvas.width  = rect.width; }
        if(rect.height) { canvas.height = rect.height; }

        const newPoint = function(){
            /* Generate a new point if the point class exists,
            else return an object. */
            try{ return new Point(); } catch {}
            return {}
        }

        let center = rect.center = this.dimensions?.center || newPoint()

        center.x = /*rect.x + */rect.width * .5
        center.y = /*rect.y + */rect.height * .5

        return rect;
    }

    get center() {
        return this.dimensions.center
    }

    prepare(target) {
        /* Perform any preparations for this stage instance to run the
          canvas tools. This includes resolving and measuring the canvas.

            class MainStage extends Stage {
                canvas = playspace
                prepare(target){
                    super.prepare(target)
                    // ...
                }
            }

        This will run automatically if the canvas is given in the constructor

            new MainStage(canvas)
            // _prepared == true

        Once prepared the stage is essentially ready-to-go.

            stage = new MainStage()
            stage.prepare(canvas)
            stage.update()

        */
        let id = this.id = Math.random().toString(32)
        this.target = target

        /*if(this.resolveCanvas) {
            canvas = this.resolveCanvas(target, this)
        } else {
            canvas = resolveCanvas(target, this)
        }*/
        let canvas = (this.resolveCanvas || resolveCanvas)(target, this)
        if(canvas == undefined) {
            console.warn('Stage canvas is undefined through Stage.canvas')
        }

        this.canvas = canvas

        this.dispatch('stage:prepare', {target, id, canvas })

        if(canvas) { /* Stick the shape with stage-resize.js */ this.resize() }
        /* ensure the stage is ready to be used. */
        this.loopDraw = this.loopDraw.bind(this)
        this._prepared = true;

        this.mounted(canvas)
        /* late components did not receive `stage:prepare`.
        As such, they will _announce_ */
        addEventListener('addon:announce', (e)=>this.addonAnnounceHandler(e));
    }

    mounted(canvas) {
        /* A Convenient place to perform initial work. */
    }

    stop(freeze=true) {
        this._loopDraw = !freeze
        if(!this._loopDraw) {
            this.stopDraw()
        }
    }

    static go(additionalData={}) {
        /* Make a copy of a new Stage.
        Call prepare() if required. If `additionalData.loop` is `true` (default)
        start the update loopDraw
        */

        /* First we ensure prepare has occured */
        let _stage = new this;
        if(_stage._prepared != true) {
            _stage.prepare()
        }
        /* Grab the look function - */
        let loop = additionalData.loop !== undefined? additionalData.loop: true

        /* Perform the update loop we get _one extra_ update here before the
        request animation occurs. Useful for ensuring _draws_ occur before
        the first frame is required, and also the loop function
        may not be active. */
        _stage.update()
        if(loop) {
            /* 1ms delay for a next tick. */
            setTimeout(()=>_stage.loopDraw(), 1)
        }

        return _stage
    }

    stageStartDraw(drawFunc){
        /* When using the internal loop drawing the first draw call occurs
        through this method, calling `firstDraw` once, then
        changing the internal draw function to the typical `this.draw`

        If `this.draw` is not a method, `this.update()` is called and the
        `stopDraw` method is called.
        */
        this.firstDraw(this.ctx)
        let _drawFunc = drawFunc  || this.draw
        if(drawFunc) {
            this._drawFunc = _drawFunc
            this.update()
            return
        }

        this.stopDraw()
    }

    loopDraw() {
        /* A helper function to apply this stage to the animation frame,
        calling `update()` for every frame.

        Call once to start the loop.

                stage = new MainStage()
                stage.prepare(canvas)
                stage.loopDraw()
        */
        this.update()
        this._loopDraw && requestAnimationFrame(this.loopDraw);
    }

    get ctx() {
        /* Return the cached context object of the current canvas.
        */
        return this._ctx || (this._ctx = this.getContext(this.canvas))
    }

    getContext(canvas, type='2d') {
        /*
        + `alpha`:
                A boolean value that indicates if the canvas contains an alpha
                channel. If set to false, the browser now knows that the
                backdrop is always opaque, which can speed up drawing of
                transparent content and images.

        + `colorSpace` Optional:
                Specifies the color space of the rendering context.
                Possible values are:

                    "srgb" selects the sRGB color space. (default value)
                    "display-p3" selects the display-p3 color space.

        + `desynchronized`:
                A boolean value that hints the user agent to reduce the
                latency by desynchronizing the canvas paint cycle from the
                event loop.

        + `willReadFrequently`:
                A boolean value that indicates whether or not a lot of
                read-back operations are planned. This will force the use of
                a software (instead of hardware accelerated) 2D canvas and
                can save memory when calling getImageData() frequently.
         */

        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
        let options = this.contextOptions || {
            alpha: true
            , colorSpace: 'srgb'
            , desynchronized: true
            , willReadFrequently: false
        }

        return this.canvas.getContext(type, options)
    }

    update() {
        /*
            inline update per draw. For each call:

            + all _drawBefore_ methods
            + all _nextTick_ methods
            + the `draw` method (mapped through `this._drawFunc`)
            + all _drawAfter_ methods
        */
        const ctx = this.ctx;

        for(let af of this._drawBefore) {
            af(ctx)
        }

        let nt = this._nextTick;
        nt.forEach(f=>f(ctx, this))
        nt.size && (this._nextTick = new Set)

        this._drawFunc(ctx);

        for(let af of this._drawAfter) {
            af(ctx)
        }
    }

    nextTick(func) {
        /* Run the given function (with context) on the next draw call.
        This function is very similar to `onDrawBefore`, but only runs _once_.

            stage.nextTick(function(ctx){
                // run next time.
                stage.runCustomRender(ctx)
            })

        This is useful for performing clearups, or running routines on
        single action:

            let v = this.v = new Value(this.p.radius, width, easing)
            v.doneHandler = ()=>{
                // st.switchOut()
                this.nextTick(this.switchOut.bind(this))
            }

            switchOut() {
                this.log('doneHandler')
                this.v = undefined;
            }
        */
        this._nextTick.add(func)
    }

    onDrawAfter(func) {
        this._drawAfter.push(func)
    }

    offDrawAfter(func) {
        let i = this._drawAfter.indexOf(func)
        this._drawAfter.splice(i, 1)
    }

    onDrawBefore(func) {
        this._drawBefore.push(func)
    }

    offDrawBefore(func) {
        let i = this._drawBefore.indexOf(func)
        this._drawBefore.splice(i, 1)
    }

    firstDraw(ctx) {
        /* The `firstDraw(ctx)` method us used _once_ when drawing starts.
        This occurs before the first `update()` call is performed.

        This is useful if you're setting context arguments - but only need to
        set them once.

            class Main extends Stage {
                firstDraw(ctx) {
                    ctx.fillStyle = '#ccc'
                    ctx.font = 'normal 1em arial'
                }
            }

        */
    }

    draw(ctx) {
        /* The primary rendering function to override.
        Called by the `update()` method, given the context `ctx` of the
        target canvas.

        Functionally this is essentially the same as running the update function
        manually:


            const ctx = canvas.getContext('2d');
            const stage = new MainStage()

            stage.prepare(canvas)

            function draw() {

                // or: stage.clear(ctx)
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Run the draw routines
                stage.draw(ctx)

                // And rinse repeat.
                requestAnimationFrame(draw);

            }

            draw()
        */
        this.clear(ctx)
    }

    clear(ctx, fillStyle=null) {
        /* Perform a standard 'clearRect' using the cached dimensions of the
        canvas.

            stage.clear(ctx)

        Synonymous to:

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

        Apply an optional flood fillStyle:

            stage.clear(ctx, '#000')
        */
        let dimensions = this.dimensions
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        if(fillStyle === null) { return }
        ctx.rect(0, 0, dimensions.width, dimensions.height);
        ctx.fillStyle = fillStyle
        ctx.fill();
    }
}



class Stage extends StageRender {

    loaded = false

    prepare(target) {
        super.prepare(target)

        if(!this.loaded) {
            this.load()
            this.loaded = true
        }

        this.log('Stage Prepared')
    }

    load() {
        /* Called once by the prepare() method, to act as a first-time
         loader for the stage.

         Apply global hooks here.
        */
        // stages.add(this)
        this.dispatch('stage:load', {stage:this})
    }
}


Polypoint.head.install(Stage)

