
class Stages {
    /* A Singleton to manage global functions and data */
    loaded = false

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

    resolveNode(target) {
        /* Given a target as a string or entity, return the resolved
        html entity.

            resolveNode('myId')
            resolveNode('#querySelector canvas')
            resolveNode(canvas)
        */
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
        Point.mouse.listen(canvas)
    }
}

stages = new Stages;


class StageTools {

    stickCanvasSize(canvas){
        let rect = canvas.getBoundingClientRect()
        canvas.width  = rect.width;
        canvas.height = rect.height;
        return rect;
    }
}


class StageRender extends StageTools {

    prepare(target) {
        /* Perform any preparations for this stage instance to run the
          canvas tools. This includes resolving and measuring the canvas.

         Once prepared the stage is essentially ready-to-go.

                stage = new MainStage()
                stage.prepare(canvas)
                stage.update()
         */
        this.id = Math.random().toString(32)
        let canvas = stages.resolveNode(target, this)
        this.dimensions = this.stickCanvasSize(canvas)
        this.canvas = canvas
        this.loopDraw = this.loopDraw.bind(this)
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
        requestAnimationFrame(this.loopDraw);
    }

    get ctx() {
        return this._ctx || (this._ctx = this.canvas.getContext('2d'))
    }

    update() {
        /*
            inline update per draw
        */
        const ctx = this.ctx;
        this.draw(ctx)
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
