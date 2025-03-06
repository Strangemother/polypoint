/* A Stage acts as a convenience tool to hoist a canvas and begin drawing.
It's not fundamental to the drawing tools and a start requestAnimationFrame will
work.

The Stage helps manage loading and looping of content. Extend with custom functionality and run:

    class MainStage extends Stage {
        // canvas = document.getElementById('playspace');
        canvas = 'playspace'
    }

    stage = MainStage.go({
        loop: true
    })

This will execute the canvas name. It provides some free tools:

+ `mount()` and `draw(ctx)` functions
+ _load_ capture events
+ size locking and auto resizing
+ optional request frame loop
+ builtin measurement tools; `center` and `dimensions`

*/

// Solution 2
Number.EPSILON = Math.pow(2, -52);
Math.sign = function(x) {
    return ((x > 0) - (x < 0)) || +x;
};

class Stages {
    /* A Singleton to manage global functions and data */
    loaded = false
    canvas = undefined

    constructor() {
        this.stages = new Map
        this.canvasMap = new Map
    }

    add(stage) {
        this.stages.set(stage.id, stage);
        if(!this.loaded) {
            this.load(stage)
            this.loaded = true
        }
    }

    resolveNode(target, stage) {
        /* Given a target as a string or entity, return the resolved
        html entity.

            resolveNode('myId')
            resolveNode('#querySelector canvas')
            resolveNode(canvas)
        */

       if(target === undefined && stage.canvas !== undefined) {
            target = stage.canvas
       }
        if(target instanceof HTMLElement) {
            return target;
        }

        let node = target
        if(typeof(target) == "string") {

            node = document.getElementById(target)
            if(node == null) {
                let nodes = document.querySelectorAll(target)
                if(nodes.length == 0) {
                    // Cannot find node;
                    console.warn('Cannot resolve node', target)
                    return undefined
                }

                if(nodes.length > 1) {
                    console.warn('One canvas per stage.', target)
                    return nodes[0]
                }
            }

        }


        return node;
    }

    load(stage){
        let canvas = stage.canvas

        if(!this.canvasMap.has(canvas)) {
            //install a new canvas.
            this.installCanvas(canvas, stage)
        }

    }

    installCanvas(canvas, stage){
        this.canvasMap.set(canvas, stage)
        Point.mouse?.mount(canvas)
    }
}

stages = new Stages;



class StageRender {
    _drawFunc
    _loopDraw = true

    debounceResize = true
    debounceResizeTimeout = 100

    constructor(canvas, drawFunc) {
        // super()

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

    stickCanvasSize(canvas){
        let rect = canvas.getBoundingClientRect && canvas.getBoundingClientRect()
        if(rect == undefined) {
            rect = {
                width: canvas.width
                , height: canvas.height
            }
        }
        canvas.width  = rect.width;
        canvas.height = rect.height;
        let center = this.dimensions?.center

        const newPoint = function(){
            try{
                return new Point();
            } catch {}

            return {}
        }

        center = center || newPoint()

        center.x = /*rect.x + */rect.width * .5
        center.y = /*rect.y + */rect.height * .5

        rect.center = center
        return rect;
    }

    get center() {
        return this.dimensions.center
    }

    prepare(target) {
        /* Perform any preparations for this stage instance to run the
          canvas tools. This includes resolving and measuring the canvas.

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
        let canvas;
        if(this.resolveCanvas) {
            canvas = this.resolveCanvas(target, this)
        } else {
            canvas = stages.resolveNode(target, this)
        }

        if(canvas == undefined) {
            console.warn('Stage canvas is undefined through Stage.canvas')
        }
        // this.setupClock()
        this.canvas = canvas
        this.dispatch('stage:prepare', {target, id, canvas })

        /* Stick the shape */
        if(canvas) {
            this.resize()
        }
        this.loopDraw = this.loopDraw.bind(this)
        this._prepared = true;
        this.compass = Compass.degrees()
        this.mounted(canvas)
        addEventListener('resize', (e)=>this.resizeHandler(e));

        /* late components did not receive `stage:prepare`.
        As such, they will _announce_ */
        addEventListener('addon:announce', (e)=>this.addonAnnounceHandler(e));
    }

    /* a given object is mounted on _this_ - such as the `mouse`.
    This may be called in response to a 'stage:prepare' event.  */
    addComponent(name, instance) {
        console.log('Installing', name, 'to', this)
        Object.defineProperty(this, name, {value: instance})
    }

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
        console.log('Stage::addonAnnounceHandler', ev, d)
        instance.announcementResponse(detail)
    }

    dispatch(name, data) {
        // this.dispatch('prepare', { target, id, stage: this, canvas })
        console.log('Dispatch', name)
        let detail = this._dispatchPrepare(data)
        dispatchEvent(new CustomEvent(name, detail))
    }

    /* Given a dictionary, return a finished dictionary, ready for event
    dispatch */
    _dispatchPrepare(data) {
        data['stage'] = this
        return {detail: data}
    }

    /* The stage naturally listens to the resize event, with a debouncer.
    Upon resize, call stickCanvasSize, recaching the internal dimensions for
    relative meaurements.
    */
    resizeHandler(event) {

        if(!this.debounceResize) { return this.resize() }

        if(this.resizeTimer != undefined) { clearTimeout(this.resizeTimer) }
        this.resizeTimer = setTimeout(this.resize.bind(this), this.debounceResizeTimeout)
    }

    resize() {
        let dimensions = this.dimensions = this.stickCanvasSize(this.canvas)
        console.log('dimensions resize')
        this.events && this.events.emit('resize', dimensions)
        return this.dimensions
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
        let _stage = new this;
        if(_stage._prepared != true) {
            _stage.prepare()
        }
        let loop = additionalData.loop !== undefined? additionalData.loop: true

        _stage.update()
        if(loop) {
            setTimeout(()=>_stage.loopDraw(), 1)
        }

        return _stage
    }

    stageStartDraw(drawFunc){
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
        let options = {
            alpha: true
            , colorSpace: 'srgb'
            , desynchronized: true
            , willReadFrequently: false
        }

        return this.canvas.getContext(type, options)
    }

    update() {
        /*
            inline update per draw
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
                console.log('doneHandler')
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

        console.log('Stage Prepared')
    }

    load() {
        /* Called once by the prepare() method, to act as a first-time
         loader for the stage.

         Apply global hooks here.
        */
        stages.add(this)
    }
}


Polypoint.head.install(Stage)
