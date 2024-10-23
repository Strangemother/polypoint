
// Solution 2
Number.EPSILON = Math.pow(2, -52);
Math.sign = function(x) {
    return ((x > 0) - (x < 0)) || +x;
};

var DecimalPrecision = (function() {
    return {
        // Decimal round (half away from zero)
        round: function(num, decimalPlaces) {
            var p = Math.pow(10, decimalPlaces || 0);
            var n = (num * p) * (1 + Number.EPSILON);
            return Math.round(n) / p;
        },
        // Decimal ceil
        ceil: function(num, decimalPlaces) {
            var p = Math.pow(10, decimalPlaces || 0);
            var n = (num * p) * (1 - Math.sign(num) * Number.EPSILON);
            return Math.ceil(n) / p;
        },
        // Decimal floor
        floor: function(num, decimalPlaces) {
            var p = Math.pow(10, decimalPlaces || 0);
            var n = (num * p) * (1 + Math.sign(num) * Number.EPSILON);
            return Math.floor(n) / p;
        },
        // Decimal trunc
        trunc: function(num, decimalPlaces) {
            return (num < 0 ? this.ceil : this.floor)(num, decimalPlaces);
        },
        // Format using fixed-point notation
        toFixed: function(num, decimalPlaces) {
            return this.round(num, decimalPlaces).toFixed(decimalPlaces);
        }
    };
})();


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

        let node = document.getElementById(target)

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

    stickCanvasSize(canvas){
        let rect = canvas.getBoundingClientRect()
        canvas.width  = rect.width;
        canvas.height = rect.height;
        let center = this.dimensions?.center

        center = center || new Point()

        center.x = /*rect.x + */rect.width * .5
        center.y = /*rect.y + */rect.height * .5

        rect.center = center
        return rect;
    }

    get center() {
        return this.dimensions.center
    }

    _drawFunc
    _loopDraw = true

    debounceResize = true
    debounceResizeTimeout = 50

    constructor(canvas, drawFunc) {
        // super()

        drawFunc = drawFunc || this.draw
        if(drawFunc) {
            this._drawFunc = drawFunc
        }

        this._drawAfter = []
        if(canvas)  {
            this.prepare(canvas)
        }
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
        let canvas = stages.resolveNode(target, this)
        if(canvas == undefined) {
            console.warn('Stage canvas is undefined through Stage.canvas')
        }
        // this.setupClock()
        this.dispatch('stage:prepare', {target, id, canvas })
        this.canvas = canvas
        this.resize()
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
        this.dimensions = this.stickCanvasSize(this.canvas)
        return this.dimensions
    }

    mounted(canvas) {
        /* A Convenient place to perform initial work. */
    }

    stop(freeze=true) { this._loopDraw = !freeze }

    static go(additionalData={}) {
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
        return this._ctx || (this._ctx = this.canvas.getContext('2d'))
    }

    update() {
        /*
            inline update per draw
        */
        const ctx = this.ctx;
        this._drawFunc(ctx);

        for(let af of this._drawAfter) {
            af(ctx)
        }
    }

    onDrawAfter(func) {
        this._drawAfter.push(func)
    }

    offDrawAfter(func) {
        let i = this._drawAfter.indexOf(func)
        this._drawAfter.splice(i, 1)
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

    clear(ctx) {
        /* Perform a standard 'clearRect' using the cached dimensions of the
        canvas.

            stage.clear(ctx)

        Synonymous to:

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        */
        let dimensions = this.dimensions
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    }
}



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

